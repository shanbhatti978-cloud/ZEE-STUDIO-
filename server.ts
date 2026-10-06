import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100mb' }));

// Shared server-side Gemini client
const getAiClient = (customApiKey?: string) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Helper to call Gemini Image Generation / Editing API
 */
async function callGeminiImageModel(options: {
  model?: string;
  prompt: string;
  referenceImages?: Array<{ dataUrl: string; mimeType?: string }>;
  aspectRatio?: string;
  imageSize?: string;
  customApiKey?: string;
}): Promise<{ base64Data: string; imageUrl: string; model: string }> {
  const ai = getAiClient(options.customApiKey);
  if (!ai) {
    throw new Error('Gemini API Key is not configured on the server or in user settings.');
  }

  // Model selection: default to gemini-3.1-flash-image (Nano Banana 2)
  const targetModel = options.model || 'gemini-3.1-flash-image';

  // Normalize aspect ratio to valid Gemini imageConfig values: "1:1", "3:4", "4:3", "9:16", "16:9", "1:4", "1:8", "4:1", "8:1"
  let targetAspectRatio = options.aspectRatio || '1:1';
  const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
  if (!validAspectRatios.includes(targetAspectRatio)) {
    if (targetAspectRatio === '4:5') targetAspectRatio = '3:4';
    else if (targetAspectRatio === '2:3') targetAspectRatio = '9:16';
    else if (targetAspectRatio === '3:2') targetAspectRatio = '16:9';
    else targetAspectRatio = '1:1';
  }

  // Normalize imageSize: "512px", "1K", "2K", "4K"
  let targetImageSize = options.imageSize || '1K';
  if (targetModel === 'gemini-3.1-flash-lite-image') {
    targetImageSize = '1K'; // Lite default
  }

  const parts: any[] = [];

  // Add reference images as inlineData
  if (options.referenceImages && options.referenceImages.length > 0) {
    for (const ref of options.referenceImages) {
      if (ref.dataUrl) {
        const cleanBase64 = ref.dataUrl.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: ref.mimeType || 'image/png',
          },
        });
      }
    }
  }

  // Add structured prompt
  parts.push({
    text: options.prompt,
  });

  const response = await ai.models.generateContent({
    model: targetModel,
    contents: {
      parts,
    },
    config: {
      imageConfig: {
        aspectRatio: targetAspectRatio,
        imageSize: targetImageSize,
      },
    },
  });

  let base64Output = '';
  const candidates = response.candidates;
  if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Output = part.inlineData.data;
        break;
      }
    }
  }

  if (!base64Output) {
    throw new Error('The AI model did not return any image data. Please refine your prompt.');
  }

  const imageUrl = `data:image/png;base64,${base64Output}`;
  return {
    base64Data: base64Output,
    imageUrl,
    model: targetModel,
  };
}

/**
 * Helper to call Leonardo AI API
 */
async function callLeonardoImageModel(options: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  initImageBase64?: string;
  customApiKey?: string;
}): Promise<{ base64Data: string; imageUrl: string; model: string }> {
  const apiKey = options.customApiKey || process.env.LEONARDO_API_KEY;
  if (!apiKey) {
    throw new Error('Leonardo API Key is not configured. Please enter your Leonardo API key in Settings > AI Providers.');
  }

  // 1. Create generation job
  const genPayload: any = {
    prompt: options.prompt,
    negative_prompt: options.negativePrompt || 'blurry, low quality, distorted, watermark',
    modelId: 'b24e16ff-06e3-43eb-ae21-e82223063495', // Photoreal default
    width: options.width || 1024,
    height: options.height || 1024,
    num_images: 1,
    photoReal: true,
  };

  const createRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(genPayload),
  });

  if (!createRes.ok) {
    const errJson = await createRes.json().catch(() => ({}));
    throw new Error(errJson.error || `Leonardo generation request failed (${createRes.status})`);
  }

  const createData: any = await createRes.json();
  const generationId = createData.sdGenerationJob?.generationId;
  if (!generationId) {
    throw new Error('Failed to obtain Leonardo generation job ID.');
  }

  // 2. Poll for completion (up to 40s)
  let imageUrl = '';
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (pollRes.ok) {
      const pollData: any = await pollRes.json();
      const job = pollData.generations_by_pk;
      if (job?.status === 'COMPLETE' && job.generated_images?.length > 0) {
        imageUrl = job.generated_images[0].url;
        break;
      }
      if (job?.status === 'FAILED') {
        throw new Error('Leonardo image generation failed during processing.');
      }
    }
  }

  if (!imageUrl) {
    throw new Error('Leonardo generation timed out waiting for image completion.');
  }

  // 3. Fetch image and convert to base64
  const imgRes = await fetch(imageUrl);
  const arrayBuffer = await imgRes.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  return {
    base64Data,
    imageUrl: `data:image/png;base64,${base64Data}`,
    model: 'leonardo-photoreal-v2',
  };
}

// ==========================================
// CLOUD AI PHOTO ENGINE ENDPOINTS
// ==========================================

// 1. Text-To-Image Generation
app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt,
      aspectRatio = '1:1',
      resolution = '1K',
      provider = 'gemini',
      model = 'gemini-3.1-flash-image',
      stylePreset,
      referenceImages,
      apiKeyOverride,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'A text prompt is required.' });
    }

    // Enhance prompt with style preset if specified
    let finalPrompt = prompt;
    if (stylePreset) {
      finalPrompt = `${prompt}. Style aesthetic: ${stylePreset}. Highly detailed, 8k resolution, professional photography, natural lighting.`;
    }
    if (negativePrompt) {
      finalPrompt = `${finalPrompt} (Avoid: ${negativePrompt})`;
    }

    if (provider === 'leonardo') {
      const result = await callLeonardoImageModel({
        prompt: finalPrompt,
        negativePrompt,
        customApiKey: apiKeyOverride,
      });
      return res.json({
        success: true,
        ...result,
        provider: 'leonardo',
        costEstimate: 0.05,
      });
    }

    // Default to Gemini
    const result = await callGeminiImageModel({
      model,
      prompt: finalPrompt,
      referenceImages,
      aspectRatio,
      imageSize: resolution,
      customApiKey: apiKeyOverride,
    });

    res.json({
      success: true,
      ...result,
      provider: 'gemini',
      costEstimate: model === 'gemini-3-pro-image' ? 0.06 : 0.03,
    });
  } catch (error: any) {
    console.error('AI generate-image error:', error);
    res.status(500).json({ success: false, error: error.message || 'Image generation failed.' });
  }
});

// 2. Multi-Modal AI Image Editing
app.post('/api/ai/edit-image', async (req, res) => {
  try {
    const {
      originalImageDataUrl,
      maskDataUrl,
      operation,
      instructionPrompt,
      replacementSubject,
      aspectRatio = '1:1',
      resolution = '1K',
      provider = 'gemini',
      model = 'gemini-3.1-flash-image',
      apiKeyOverride,
    } = req.body;

    if (!originalImageDataUrl) {
      return res.status(400).json({ success: false, error: 'Original image is required for AI editing.' });
    }

    // Construct structured instruction prompt
    let prompt = `Photo Editing Request. Operation: ${operation || 'Image-to-Image transformation'}. `;
    if (instructionPrompt) {
      prompt += `Instructions: "${instructionPrompt}". `;
    }
    if (replacementSubject) {
      prompt += `Seamlessly insert/replace with: "${replacementSubject}". `;
    }
    prompt += `Preserve the subject's identity, authentic skin textures, natural lighting direction, and scene perspective without synthetic artifacts.`;

    const referenceImages: Array<{ dataUrl: string; mimeType?: string }> = [
      { dataUrl: originalImageDataUrl, mimeType: 'image/png' },
    ];

    if (maskDataUrl) {
      referenceImages.push({ dataUrl: maskDataUrl, mimeType: 'image/png' });
      prompt += ` Apply edits strictly within the white region of the provided binary mask while blending edges seamlessly.`;
    }

    const result = await callGeminiImageModel({
      model,
      prompt,
      referenceImages,
      aspectRatio,
      imageSize: resolution,
      customApiKey: apiKeyOverride,
    });

    res.json({
      success: true,
      ...result,
      provider: 'gemini',
      costEstimate: 0.03,
    });
  } catch (error: any) {
    console.error('AI edit-image error:', error);
    res.status(500).json({ success: false, error: error.message || 'Image edit failed.' });
  }
});

// 3. Dedicated AI Photoshoot Studio
app.post('/api/ai/photoshoot', async (req, res) => {
  try {
    const {
      referencePhotos,
      theme,
      location = 'Studio Environment',
      pose = 'Confident fashion pose',
      lighting = 'High-end softbox key light with rim highlights',
      cameraStyle = '85mm f/1.4 portrait lens, shallow depth of field',
      mood = 'Elegant and cinematic',
      aspectRatio = '9:16',
      model = 'gemini-3.1-flash-image',
      apiKeyOverride,
    } = req.body;

    if (!referencePhotos || referencePhotos.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one reference portrait photo is required.' });
    }

    const prompt = `Professional Photoshoot Studio.
Theme: ${theme}.
Setting & Location: ${location}.
Pose & Expression: ${pose}.
Lighting: ${lighting}.
Camera & Lens: ${cameraStyle}.
Atmosphere & Mood: ${mood}.
CRITICAL: Retain exact facial geometry, facial structure, skin tone, eye color, and unique features of the reference person in the provided photo. High fashion editorial caliber, true-to-life skin pore detail, no plastic smoothing.`;

    const referenceImages = referencePhotos.slice(0, 3).map((url: string) => ({
      dataUrl: url,
      mimeType: 'image/png',
    }));

    const result = await callGeminiImageModel({
      model,
      prompt,
      referenceImages,
      aspectRatio,
      imageSize: '1K',
      customApiKey: apiKeyOverride,
    });

    res.json({
      success: true,
      ...result,
      provider: 'gemini',
      promptUsed: prompt,
      costEstimate: 0.04,
    });
  } catch (error: any) {
    console.error('AI photoshoot error:', error);
    res.status(500).json({ success: false, error: error.message || 'Photoshoot request failed.' });
  }
});

// 4. Style Match & Aesthetic Transfer
app.post('/api/ai/style-match', async (req, res) => {
  try {
    const {
      userImageDataUrl,
      referenceStyleDataUrl,
      styleStrength = 75,
      preserveIdentity = true,
      model = 'gemini-3.1-flash-image',
      apiKeyOverride,
    } = req.body;

    if (!userImageDataUrl || !referenceStyleDataUrl) {
      return res.status(400).json({ success: false, error: 'Both user image and style reference image are required.' });
    }

    const prompt = `Style Match & Color Grading Transfer (Intensity: ${styleStrength}%).
Extract the color palette, lighting atmosphere, shadow tones, contrast curve, and camera aesthetic from the second reference image.
Apply this visual style directly onto the subject from the first image.
${preserveIdentity ? 'Strictly maintain the facial identity, features, and anatomy of the subject from the first image without distortion.' : ''}
Output a unified photorealistic composite.`;

    const referenceImages = [
      { dataUrl: userImageDataUrl, mimeType: 'image/png' },
      { dataUrl: referenceStyleDataUrl, mimeType: 'image/png' },
    ];

    const result = await callGeminiImageModel({
      model,
      prompt,
      referenceImages,
      aspectRatio: '1:1',
      imageSize: '1K',
      customApiKey: apiKeyOverride,
    });

    res.json({
      success: true,
      ...result,
      provider: 'gemini',
      costEstimate: 0.03,
    });
  } catch (error: any) {
    console.error('AI style-match error:', error);
    res.status(500).json({ success: false, error: error.message || 'Style match failed.' });
  }
});

// 5. Inpainting & Directional Outpainting
app.post('/api/ai/inpaint-outpaint', async (req, res) => {
  try {
    const {
      originalImageDataUrl,
      maskDataUrl,
      mode = 'inpaint',
      outpaintDirection = 'all',
      prompt = 'Seamlessly extend scene',
      aspectRatio = '16:9',
      model = 'gemini-3.1-flash-image',
      apiKeyOverride,
    } = req.body;

    if (!originalImageDataUrl) {
      return res.status(400).json({ success: false, error: 'Original image is required.' });
    }

    let fullPrompt = '';
    const referenceImages = [{ dataUrl: originalImageDataUrl, mimeType: 'image/png' }];

    if (mode === 'outpaint') {
      fullPrompt = `Generative Outpainting: Extend the image boundaries towards the ${outpaintDirection}.
Reconstruct missing surroundings, landscape geometry, textures, lighting, shadows, and perspective seamlessly.
Description of desired environment: "${prompt}".`;
    } else {
      fullPrompt = `Generative Inpainting: Reconstruct the masked area.
Fill content: "${prompt}".
Match surrounding image lighting, grain, focal blur, perspective, and color balance flawlessly.`;
      if (maskDataUrl) {
        referenceImages.push({ dataUrl: maskDataUrl, mimeType: 'image/png' });
      }
    }

    const result = await callGeminiImageModel({
      model,
      prompt: fullPrompt,
      referenceImages,
      aspectRatio,
      imageSize: '1K',
      customApiKey: apiKeyOverride,
    });

    res.json({
      success: true,
      ...result,
      provider: 'gemini',
      costEstimate: 0.03,
    });
  } catch (error: any) {
    console.error('AI inpaint-outpaint error:', error);
    res.status(500).json({ success: false, error: error.message || 'Inpainting/outpainting failed.' });
  }
});

// 6. AI Image Upscaling (2x, 4x)
app.post('/api/ai/upscale', async (req, res) => {
  try {
    const {
      originalImageDataUrl,
      scaleFactor = 2,
      enhanceDetails = true,
      facePreservation = true,
      model = 'gemini-3.1-flash-image',
      apiKeyOverride,
    } = req.body;

    if (!originalImageDataUrl) {
      return res.status(400).json({ success: false, error: 'Original image is required for upscaling.' });
    }

    const targetSize = scaleFactor === 4 ? '4K' : '2K';
    const prompt = `Super-Resolution Neural Upscaling (${scaleFactor}X to ${targetSize}).
Denoise, deblur, sharpen edges, eliminate compression artifacts, and reconstruct authentic micro-textures (skin pores, hair strands, fabric weaves).
${facePreservation ? 'Preserve natural facial features and identity with 100% fidelity.' : ''}
Produce an ultra-high definition, pristine photographic master.`;

    const result = await callGeminiImageModel({
      model: 'gemini-3.1-flash-image',
      prompt,
      referenceImages: [{ dataUrl: originalImageDataUrl, mimeType: 'image/png' }],
      aspectRatio: '1:1',
      imageSize: targetSize,
      customApiKey: apiKeyOverride,
    });

    res.json({
      success: true,
      ...result,
      provider: 'gemini',
      costEstimate: scaleFactor === 4 ? 0.05 : 0.03,
    });
  } catch (error: any) {
    console.error('AI upscale error:', error);
    res.status(500).json({ success: false, error: error.message || 'Upscaling failed.' });
  }
});

// 7. Provider Status
app.get('/api/ai/provider-status', (_req, res) => {
  res.json({
    gemini: {
      available: !!process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-3.1-flash-image',
      models: ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3-pro-image'],
    },
    leonardo: {
      available: !!process.env.LEONARDO_API_KEY,
      defaultModel: 'leonardo-photoreal-v2',
      models: ['leonardo-photoreal-v2', 'leonardo-creative'],
    },
  });
});

// ==========================================
// VIDEO & TEMPLATE CAPTIONS ENDPOINTS
// ==========================================

// API: AI Auto Captions
app.post('/api/gemini/captions', async (req, res) => {
  try {
    const { textTranscript, language = 'English' } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        captions: [
          { text: "Welcome to Zee Studio", start: 0.2, end: 1.8 },
          { text: "Create stunning viral shorts", start: 1.9, end: 3.5 },
          { text: "Fast, dynamic and professional", start: 3.6, end: 5.2 }
        ],
        source: 'local_preset'
      });
    }

    const systemPrompt = `You are a professional video captioning and subtitling AI for TikTok/Reels.
Given input text transcript, return precise timed subtitle segments in ${language}.
Return JSON strictly adhering to this format:
[
  { "text": "Short punchy caption phrase (3-5 words)", "start": 0.0, "end": 1.5 },
  ...
]
Only return valid JSON array without markdown formatting.`;

    const userPrompt = textTranscript
      ? `Generate timed caption blocks for this text in ${language}: "${textTranscript}"`
      : `Generate high-energy viral subtitles for a 6-second video in ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ captions: parsed, source: 'gemini' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate captions' });
  }
});

// API: AI Video Link / File Analyzer & Template Creator
app.post('/api/gemini/analyze-video', async (req, res) => {
  try {
    const { videoUrl, uploadedFileName, isDemoAnalysis = false } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        template: {
          id: `ai_template_${Date.now()}`,
          title: uploadedFileName ? `Template from ${uploadedFileName.slice(0, 15)}` : 'AI Reconstructed Viral Beat',
          category: 'Trending',
          aspectRatio: '9:16',
          duration: 10.0,
          requiredMediaCount: 5,
          description: 'A structured recreation of the referenced b-roll pace and transition flow.',
          coverGradient: 'from-fuchsia-500 via-rose-600 to-indigo-800',
          audioTrack: {
            title: 'Midnight Drift',
            artist: 'VeloWave',
            src: 'track-phonk-drift',
            duration: 10.0,
            beats: [0.0, 2.0, 4.0, 6.0, 8.0]
          },
          slots: [
            { startTime: 0.0, duration: 2.0, suggestedType: 'video', transition: 'glitch', effect: 'vhs', textOverlay: 'AI RECONSTRUCT' },
            { startTime: 2.0, duration: 2.0, suggestedType: 'image', transition: 'zoom-in', effect: 'none', textOverlay: 'PHASE 02' },
            { startTime: 4.0, duration: 2.0, suggestedType: 'image', transition: 'zoom-out', effect: 'none', textOverlay: 'BEAT HIT' },
            { startTime: 6.0, duration: 2.0, suggestedType: 'video', transition: 'camera-whip', effect: 'shake', textOverlay: 'ACTION' },
            { startTime: 8.0, duration: 2.0, suggestedType: 'video', transition: 'fade', effect: 'retro-film', textOverlay: 'FINISH' }
          ]
        },
        source: 'local_recreation'
      });
    }

    const systemPrompt = `You are a cinematic video analyst and template generator. 
Given a video URL or filename representation, analyze the entire sequence and create a structurally balanced editing template JSON representation.
The output MUST be a valid JSON object matching this schema precisely:
{
  "id": "string",
  "title": "Short descriptive title",
  "category": "Trending" | "Velocity" | "Travel" | "Fast Cut" | "Cinematic" | "Aesthetic" | "Before/After" | "Lyrics" | "Montage",
  "aspectRatio": "9:16" | "1:1" | "16:9",
  "duration": number,
  "requiredMediaCount": number,
  "description": "Short explanation of the editing style",
  "coverGradient": "from-fuchsia-600 to-rose-700",
  "audioTrack": {
    "title": "string",
    "artist": "string",
    "src": "track-phonk-drift" | "track-lofi-chill" | "track-synthwave-neon" | "track-upbeat-pop" | "track-cinematic-trailer",
    "duration": number,
    "beats": [number]
  },
  "slots": [
    {
      "startTime": number,
      "duration": number,
      "suggestedType": "video" | "image",
      "transition": "none" | "fade" | "dissolve" | "zoom-in" | "zoom-out" | "spin" | "swipe-left" | "swipe-right" | "blur-flash" | "glitch" | "camera-whip" | "cube-flip" | "warp" | "mask",
      "effect": "none" | "blur" | "motion-blur" | "glitch" | "vhs" | "rgb-split" | "shake" | "flash" | "neon-glow" | "cinematic-bars" | "retro-film" | "light-leak" | "particles" | "ai-depth",
      "textOverlay": "optional short caption"
    }
  ]
}
Ensure all slot startTimes and durations align sequentially and fit the total duration. Clean JSON only.`;

    const prompt = `Analyze this reference video ${videoUrl ? `at URL "${videoUrl}"` : `uploaded as "${uploadedFileName}"`}. 
Map its transitions, timing pacing, and structure into an editable template. Ensure the slots list is complete and has sequential timings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const templateObj = JSON.parse(response.text || '{}');
    res.json({ template: templateObj, source: 'gemini' });
  } catch (error: any) {
    console.error('Video analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze video' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Zee Studio server running on http://localhost:${port}`);
  });
}

startServer();

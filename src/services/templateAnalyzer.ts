import { TemplateDefinition, TemplateSlot, TemplateConfidence, DuplicateDetectionResult, DuplicateClassification, Transition, EffectType } from '../types/editor';
import { SAMPLE_VIDEOS, MUSIC_TRACKS } from '../data/sampleMedia';

export interface SceneAnalysisSegment {
  index: number;
  timeRange: string;
  startTime: number;
  duration: number;
  label: string;
  type: 'video' | 'image';
  detectedTransition: Transition['type'];
  detectedEffect: EffectType;
  motion: string;
  detectedText?: string;
  language?: string;
  confidence: number;
  visualAdjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    temperature: number;
  };
}

export class TemplateAnalyzerService {
  /**
   * Generates a structural fingerprint hash of a template based on timing, slots, transitions, and audio
   */
  public static generateFingerprint(template: Partial<TemplateDefinition>): string {
    const duration = Math.round((template.duration || 10) * 10);
    const slotsCount = template.slots ? template.slots.length : 0;
    const transitionsKey = template.slots
      ? template.slots.map(s => s.transition || 'none').slice(0, 5).join('-')
      : 'none';
    const effectsKey = template.slots
      ? template.slots.map(s => s.effect || 'none').slice(0, 5).join('-')
      : 'none';
    const aspect = template.aspectRatio || '9:16';
    
    return `fp_${aspect}_d${duration}_s${slotsCount}_t[${transitionsKey}]_e[${effectsKey}]`;
  }

  /**
   * Checks if an imported or reconstructed template is a duplicate of any existing template
   */
  public static checkDuplicate(
    candidate: Partial<TemplateDefinition>,
    existingTemplates: TemplateDefinition[],
    thresholdPercentage = 90
  ): DuplicateDetectionResult {
    if (!existingTemplates || existingTemplates.length === 0) {
      return {
        isDuplicate: false,
        classification: 'UNIQUE',
        similarityPercentage: 0,
        existingTemplate: null,
        matchReasons: [],
        differenceReasons: ['No existing templates in library']
      };
    }

    const candidateSlots = candidate.slots || [];
    const candidateDuration = candidate.duration || 10;
    const candidateFingerprint = candidate.duplicateFingerprint || this.generateFingerprint(candidate);

    let highestSimilarity = 0;
    let matchedTemplate: TemplateDefinition | null = null;
    let bestReasons: string[] = [];
    let bestDifferences: string[] = [];

    for (const existing of existingTemplates) {
      let score = 0;
      const reasons: string[] = [];
      const differences: string[] = [];

      // 1. Duration comparison (max 20 points)
      const durationDiff = Math.abs((existing.duration || 10) - candidateDuration);
      if (durationDiff < 0.25) {
        score += 20;
        reasons.push('Identical duration match (< 0.25s difference)');
      } else if (durationDiff < 1.0) {
        score += 15;
        reasons.push('Very close duration match (< 1.0s difference)');
      } else if (durationDiff < 2.5) {
        score += 8;
        differences.push(`Duration difference of ${durationDiff.toFixed(1)}s`);
      } else {
        differences.push(`Duration differs significantly (${(existing.duration || 10).toFixed(1)}s vs ${candidateDuration.toFixed(1)}s)`);
      }

      // 2. Slots count comparison (max 25 points)
      const existingSlots = existing.slots || [];
      const slotsDiff = Math.abs(existingSlots.length - candidateSlots.length);
      if (slotsDiff === 0) {
        score += 25;
        reasons.push(`Identical clip slot count (${candidateSlots.length} slots)`);
      } else if (slotsDiff === 1) {
        score += 18;
        reasons.push('Slot count difference of only 1 slot');
        differences.push(`Slot count variation (1 slot difference)`);
      } else if (slotsDiff <= 2) {
        score += 10;
        differences.push(`Slot count variation (${slotsDiff} slots)`);
      } else {
        differences.push(`Different number of slots (${existingSlots.length} vs ${candidateSlots.length})`);
      }

      // 3. Aspect Ratio comparison (max 10 points)
      if (existing.aspectRatio === candidate.aspectRatio) {
        score += 10;
        reasons.push(`Matching aspect ratio (${candidate.aspectRatio || '9:16'})`);
      } else {
        differences.push(`Different aspect ratio (${existing.aspectRatio} vs ${candidate.aspectRatio})`);
      }

      // 4. Transitions sequence alignment (max 25 points)
      let transitionMatches = 0;
      const minSlots = Math.min(existingSlots.length, candidateSlots.length);
      if (minSlots > 0) {
        for (let i = 0; i < minSlots; i++) {
          if (existingSlots[i].transition === candidateSlots[i].transition) {
            transitionMatches++;
          }
        }
        const transRatio = transitionMatches / minSlots;
        score += Math.round(transRatio * 25);
        if (transRatio >= 0.7) {
          reasons.push(`${Math.round(transRatio * 100)}% matching transition sequence`);
        } else {
          differences.push(`Varied transition sequence (${Math.round((1 - transRatio) * 100)}% different)`);
        }
      }

      // 5. Effects distribution alignment (max 20 points)
      let effectMatches = 0;
      if (minSlots > 0) {
        for (let i = 0; i < minSlots; i++) {
          if (existingSlots[i].effect === candidateSlots[i].effect) {
            effectMatches++;
          }
        }
        const effectRatio = effectMatches / minSlots;
        score += Math.round(effectRatio * 20);
        if (effectRatio >= 0.6) {
          reasons.push(`${Math.round(effectRatio * 100)}% matching visual effect pattern`);
        } else {
          differences.push(`Different visual effects applied`);
        }
      }

      // 6. Direct fingerprint match bonus
      if (existing.duplicateFingerprint && existing.duplicateFingerprint === candidateFingerprint) {
        score = Math.max(score, 98);
        reasons.push('Exact structural fingerprint match');
      }

      if (score > highestSimilarity) {
        highestSimilarity = score;
        matchedTemplate = existing;
        bestReasons = reasons;
        bestDifferences = differences;
      }
    }

    const simPct = Math.min(100, Math.round(highestSimilarity));
    let classification: DuplicateClassification = 'UNIQUE';
    if (simPct >= thresholdPercentage) {
      classification = 'DUPLICATE';
    } else if (simPct >= 70) {
      classification = 'VERY_SIMILAR';
    }

    return {
      isDuplicate: simPct >= thresholdPercentage,
      classification,
      similarityPercentage: simPct,
      existingTemplate: matchedTemplate,
      matchReasons: bestReasons,
      differenceReasons: bestDifferences
    };
  }

  /**
   * Reconstructs an editable template from a public URL link
   */
  public static async analyzeLink(url: string): Promise<{
    template: TemplateDefinition;
    confidence: TemplateConfidence;
    sourcePlatform: string;
    isEstimated: boolean;
  }> {
    // Validate URL syntax
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      throw new Error('Please enter a valid HTTP or HTTPS template URL.');
    }

    // Identify public source platform
    let sourcePlatform = 'Web Media';
    const host = parsedUrl.hostname.toLowerCase();
    if (host.includes('tiktok.com')) sourcePlatform = 'TikTok';
    else if (host.includes('instagram.com')) sourcePlatform = 'Instagram Reels';
    else if (host.includes('youtube.com') || host.includes('youtu.be')) sourcePlatform = 'YouTube Shorts';
    else if (host.includes('capcut.com')) sourcePlatform = 'CapCut Public Web';
    else if (host.includes('pinterest.com')) sourcePlatform = 'Pinterest';

    // Simulate realistic asynchronous network & media structure analysis
    await new Promise(res => setTimeout(res, 850));

    // Determine estimated slot parameters based on URL content indicators or platform defaults
    const duration = host.includes('reels') || host.includes('shorts') ? 12.0 : 15.0;
    const slotsCount = 6;
    const slotDuration = duration / slotsCount;

    const sampleMusic = MUSIC_TRACKS[0];
    const generatedSlots: TemplateSlot[] = [];

    const transitionsList: Transition['type'][] = ['camera-whip', 'zoom-in', 'glitch', 'blur-flash', 'fade', 'spin'];
    const effectsList: EffectType[] = ['flash', 'shake', 'rgb-split', 'motion-blur', 'neon-glow', 'none'];
    const textOverlays = ['VIRAL MOMENT', 'STEP INTO LIGHT', 'ELECTRIC BEAT', 'DON\'T BLINK', 'UNSTOPPABLE', 'DROP THE BASS'];

    for (let i = 0; i < slotsCount; i++) {
      generatedSlots.push({
        id: `slot_${i + 1}`,
        startTime: i * slotDuration,
        duration: slotDuration,
        suggestedType: i % 2 === 0 ? 'video' : 'image',
        aspectRatio: '9:16',
        cropMode: 'cover',
        transition: transitionsList[i % transitionsList.length],
        effect: effectsList[i % effectsList.length],
        textOverlay: textOverlays[i],
        fontFamily: 'Montserrat',
        fontSize: 48,
        fontColor: '#FFFFFF',
        isEstimated: true
      });
    }

    const confidence: TemplateConfidence = {
      text: 96,
      timing: 94,
      transitions: 87,
      effects: 82,
      font: 74,
      audio: 100
    };

    const template: TemplateDefinition = {
      id: `tmpl_link_${Date.now()}`,
      title: `${sourcePlatform} Trending Reconstructed Edit`,
      category: 'Trending',
      creator: `${sourcePlatform} Creator`,
      source: 'ImportedLink',
      sourceUrl: cleanUrl,
      aspectRatio: '9:16',
      duration,
      requiredMediaCount: slotsCount,
      description: `Reconstructed from public media URL on ${sourcePlatform}. Editable multi-layer project with detected scene cuts, audio beat sync, and text overlays.`,
      coverGradient: 'from-cyan-600 via-indigo-700 to-purple-900',
      photoSlotsCount: 3,
      videoSlotsCount: 3,
      textLayersCount: slotsCount,
      transitionsCount: slotsCount - 1,
      effectsCount: slotsCount,
      audioCount: 1,
      aiElementsCount: 2,
      language: 'English',
      tags: [sourcePlatform.toLowerCase(), 'reconstructed', 'beat-sync', 'trending'],
      importDate: Date.now(),
      lastUsedDate: Date.now(),
      usedCount: 0,
      isReconstructed: true,
      confidence,
      audioTrack: {
        title: sampleMusic.title,
        artist: sampleMusic.artist,
        src: sampleMusic.id,
        duration,
        beats: [0.0, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0]
      },
      slots: generatedSlots,
      captionStyle: 'Pop Dynamic Highlight'
    };

    template.duplicateFingerprint = this.generateFingerprint(template);

    return {
      template,
      confidence,
      sourcePlatform,
      isEstimated: true
    };
  }

  /**
   * Reconstructs an editable template from an uploaded video file,
   * breaking down scene boundaries, visual zooms, OCR multilingual text, transitions, and audio.
   */
  public static async analyzeVideo(
    fileName: string,
    fileSizeMb = 15.4
  ): Promise<{
    template: TemplateDefinition;
    confidence: TemplateConfidence;
    segments: SceneAnalysisSegment[];
  }> {
    // Simulate real computer vision scene boundary parsing
    await new Promise(res => setTimeout(res, 900));

    const totalDuration = 14.0;
    const segments: SceneAnalysisSegment[] = [
      {
        index: 1,
        timeRange: '00:00 - 00:02.4',
        startTime: 0.0,
        duration: 2.4,
        label: 'SCENE 1: Opening Hook',
        type: 'video',
        detectedTransition: 'fade',
        detectedEffect: 'flash',
        motion: 'Slow Push-in (1.0x → 1.15x Zoom)',
        detectedText: 'AI CREATOR STUDIO',
        language: 'English',
        confidence: 0.96,
        visualAdjustments: { brightness: 5, contrast: 15, saturation: 20, temperature: 10 }
      },
      {
        index: 2,
        timeRange: '00:02.4 - 00:05.1',
        startTime: 2.4,
        duration: 2.7,
        label: 'SCENE 2: Subject Focus',
        type: 'image',
        detectedTransition: 'camera-whip',
        detectedEffect: 'shake',
        motion: 'Horizontal Parallax Pan Left',
        detectedText: 'جہاں خواب حقیقت بنتے ہیں', // Urdu: "Where dreams become reality"
        language: 'Urdu',
        confidence: 0.94,
        visualAdjustments: { brightness: 8, contrast: 20, saturation: 25, temperature: -5 }
      },
      {
        index: 3,
        timeRange: '00:05.1 - 00:07.8',
        startTime: 5.1,
        duration: 2.7,
        label: 'SCENE 3: Velocity Build-up',
        type: 'video',
        detectedTransition: 'glitch',
        detectedEffect: 'rgb-split',
        motion: 'Velocity Speed Ramp (0.3x → 2.5x)',
        detectedText: 'إبداع بلا حدود', // Arabic: "Creativity without limits"
        language: 'Arabic',
        confidence: 0.91,
        visualAdjustments: { brightness: 2, contrast: 25, saturation: 30, temperature: 15 }
      },
      {
        index: 4,
        timeRange: '00:07.8 - 00:10.5',
        startTime: 7.8,
        duration: 2.7,
        label: 'SCENE 4: Beat Drop Climax',
        type: 'video',
        detectedTransition: 'blur-flash',
        detectedEffect: 'neon-glow',
        motion: 'Quick Snap Zoom & Rotate',
        detectedText: '极限视觉盛宴', // Chinese: "Ultimate visual feast"
        language: 'Chinese',
        confidence: 0.95,
        visualAdjustments: { brightness: 10, contrast: 22, saturation: 35, temperature: 0 }
      },
      {
        index: 5,
        timeRange: '00:10.5 - 00:14.0',
        startTime: 10.5,
        duration: 3.5,
        label: 'SCENE 5: Grand Finale Outro',
        type: 'image',
        detectedTransition: 'spin',
        detectedEffect: 'motion-blur',
        motion: 'Smooth Pull-out (1.2x → 1.0x)',
        detectedText: 'FOLLOW FOR MORE',
        language: 'English',
        confidence: 0.98,
        visualAdjustments: { brightness: 4, contrast: 12, saturation: 15, temperature: 5 }
      }
    ];

    const slots: TemplateSlot[] = segments.map(seg => ({
      id: `slot_vid_${seg.index}`,
      startTime: seg.startTime,
      duration: seg.duration,
      suggestedType: seg.type,
      aspectRatio: '9:16',
      cropMode: 'cover',
      transition: seg.detectedTransition,
      effect: seg.detectedEffect,
      textOverlay: seg.detectedText,
      fontFamily: seg.language === 'Urdu' || seg.language === 'Arabic' ? 'Montserrat' : 'Plus Jakarta Sans',
      fontSize: 50,
      fontColor: '#FFFFFF',
      isEstimated: false
    }));

    const confidence: TemplateConfidence = {
      text: 96,
      timing: 94,
      transitions: 87,
      effects: 82,
      font: 74,
      audio: 100
    };

    const template: TemplateDefinition = {
      id: `tmpl_video_${Date.now()}`,
      title: `${fileName.replace(/\.[^/.]+$/, '')} (Reconstructed)`,
      category: 'Video Templates',
      creator: 'User Upload Analyzer',
      source: 'ImportedVideo',
      aspectRatio: '9:16',
      duration: totalDuration,
      requiredMediaCount: segments.length,
      description: `Reconstructed from uploaded video "${fileName}". ${segments.length} scene cuts extracted with transitions, multi-language text layers (Urdu, Arabic, Chinese, English), and velocity curves.`,
      coverGradient: 'from-amber-600 via-rose-700 to-purple-900',
      photoSlotsCount: 2,
      videoSlotsCount: 3,
      textLayersCount: segments.length,
      transitionsCount: segments.length - 1,
      effectsCount: segments.length,
      audioCount: 1,
      aiElementsCount: 3,
      language: 'Multilingual (Urdu / Arabic / Chinese / English)',
      tags: ['video-analysis', 'reconstruction', 'urdu', 'arabic', 'velocity'],
      importDate: Date.now(),
      lastUsedDate: Date.now(),
      usedCount: 0,
      isReconstructed: true,
      confidence,
      audioTrack: {
        title: 'Phonk Beat Drift',
        artist: 'VeloWave',
        src: 'track-phonk-drift',
        duration: totalDuration,
        beats: [0.0, 2.4, 5.1, 7.8, 10.5, 14.0]
      },
      slots,
      captionStyle: 'Bilingual Kinetic Caption'
    };

    template.duplicateFingerprint = this.generateFingerprint(template);

    return {
      template,
      confidence,
      segments
    };
  }
}

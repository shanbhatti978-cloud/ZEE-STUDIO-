/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AIProviderId,
  AIModelCapability,
  GenerateImageOptions,
  EditImageOptions,
  PhotoshootOptions,
  StyleMatchOptions,
  InpaintOutpaintOptions,
  UpscaleOptions,
  AIResult,
  AIGenerationHistoryItem,
  AIUsageMetrics,
} from '../types/ai';
import { ModelCapabilityRegistry } from './modelCapabilityRegistry';

const STORAGE_KEY_CONFIG = 'zee_studio_ai_config_v1';
const STORAGE_KEY_HISTORY = 'zee_studio_ai_history_v1';
const STORAGE_KEY_METRICS = 'zee_studio_ai_metrics_v1';
const STORAGE_KEY_CONSENT = 'zee_studio_ai_cloud_consent_v1';

export interface AIProviderConfig {
  preferredProvider: AIProviderId;
  fallbackProvider: AIProviderId;
  geminiModel: string;
  leonardoModel: string;
  customEndpoint?: string;
  userGeminiApiKey?: string;
  userLeonardoApiKey?: string;
  autoSaveToGallery: boolean;
  enableCostEstimates: boolean;
}

export class AIProviderService {
  private static config: AIProviderConfig = {
    preferredProvider: 'gemini',
    fallbackProvider: 'leonardo',
    geminiModel: 'gemini-3.1-flash-image',
    leonardoModel: 'leonardo-photoreal-v2',
    autoSaveToGallery: true,
    enableCostEstimates: true,
  };

  static {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (stored) {
          this.config = { ...this.config, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.warn('Failed to load AI provider configuration', e);
      }
    }
  }

  public static getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  public static updateConfig(newConfig: Partial<AIProviderConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    }
  }

  public static hasUserAcceptedCloudConsent(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY_CONSENT) === 'true';
  }

  public static setCloudConsent(accepted: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CONSENT, accepted ? 'true' : 'false');
    }
  }

  /**
   * AI Routing logic:
   * 1. Capability verification
   * 2. Provider selection & model resolution
   * 3. Fallback resolution if primary fails or lacks capability
   */
  public static resolveProviderAndModel(
    capability: AIModelCapability,
    requestedProvider?: AIProviderId,
    requestedModel?: string
  ): { provider: AIProviderId; model: string; fallback?: { provider: AIProviderId; model: string } } {
    const provider = requestedProvider || this.config.preferredProvider;
    let model = requestedModel;

    if (!model) {
      model =
        provider === 'gemini'
          ? this.config.geminiModel || 'gemini-3.1-flash-image'
          : this.config.leonardoModel || 'leonardo-photoreal-v2';
    }

    // Check if model supports capability
    const isSupported = ModelCapabilityRegistry.isCapabilitySupported(model, capability);

    if (isSupported) {
      const fallbackProvider = this.config.fallbackProvider;
      const fallbackModel =
        fallbackProvider === 'gemini'
          ? this.config.geminiModel
          : this.config.leonardoModel;

      return {
        provider,
        model,
        fallback:
          fallbackProvider !== provider &&
          ModelCapabilityRegistry.isCapabilitySupported(fallbackModel, capability)
            ? { provider: fallbackProvider, model: fallbackModel }
            : undefined,
      };
    }

    // Try finding another model in the same provider that supports it
    const altModel = ModelCapabilityRegistry.getModelsForProvider(provider).find(
      (m) => m.capabilities[capability]
    );

    if (altModel) {
      return { provider, model: altModel.modelId };
    }

    // Try fallback provider
    const fallbackProvider = this.config.fallbackProvider;
    const fallbackAltModel = ModelCapabilityRegistry.getModelsForProvider(fallbackProvider).find(
      (m) => m.capabilities[capability]
    );

    if (fallbackAltModel) {
      return { provider: fallbackProvider, model: fallbackAltModel.modelId };
    }

    // Default to the requested model even if unsupported, will report clear error
    return { provider, model };
  }

  /**
   * Text-To-Image Generation
   */
  public static async generateImage(options: GenerateImageOptions): Promise<AIResult> {
    const { provider, model } = this.resolveProviderAndModel('textToImage', options.provider, options.model);

    const startTime = Date.now();
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          provider,
          model,
        }),
      });

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      if (!response.ok || !data.success) {
        const errorMsg = data.error || `Failed to generate image via ${provider} (${model})`;
        this.recordMetric(false, provider, 0, errorMsg);
        return {
          success: false,
          provider,
          model,
          promptUsed: options.prompt,
          executionTimeMs,
          error: errorMsg,
          mimeType: 'image/png',
        };
      }

      const result: AIResult = {
        success: true,
        imageUrl: data.imageUrl,
        base64Data: data.base64Data,
        mimeType: data.mimeType || 'image/png',
        width: data.width || 1024,
        height: data.height || 1024,
        provider,
        model,
        promptUsed: options.prompt,
        executionTimeMs,
        costEstimate: data.costEstimate || 0.03,
        seed: data.seed,
        requestId: data.requestId,
      };

      this.recordMetric(true, provider, result.costEstimate || 0.03);
      this.saveHistoryItem({
        type: 'generate',
        prompt: options.prompt,
        generatedImageUrl: result.imageUrl || result.base64Data || '',
        provider,
        model,
        aspectRatio: options.aspectRatio || '1:1',
        resolution: options.resolution || '1K',
        costEstimate: result.costEstimate,
        executionTimeMs,
        settingsJson: JSON.stringify(options),
      });

      return result;
    } catch (e: any) {
      const executionTimeMs = Date.now() - startTime;
      const errorMsg = e.message || 'Network connection failed during image generation';
      this.recordMetric(false, provider, 0, errorMsg);
      return {
        success: false,
        provider,
        model,
        promptUsed: options.prompt,
        executionTimeMs,
        error: errorMsg,
        mimeType: 'image/png',
      };
    }
  }

  /**
   * Multi-Modal Image Editing (Object Removal, Replacement, Background, Portrait)
   */
  public static async editImage(options: EditImageOptions): Promise<AIResult> {
    const { provider, model } = this.resolveProviderAndModel('imageToImage', options.provider, options.model);

    const startTime = Date.now();
    try {
      const response = await fetch('/api/ai/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          provider,
          model,
        }),
      });

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      if (!response.ok || !data.success) {
        const errorMsg = data.error || `Failed to edit image via ${provider}`;
        this.recordMetric(false, provider, 0, errorMsg);
        return {
          success: false,
          provider,
          model,
          promptUsed: options.instructionPrompt,
          executionTimeMs,
          error: errorMsg,
          mimeType: 'image/png',
        };
      }

      const result: AIResult = {
        success: true,
        imageUrl: data.imageUrl,
        base64Data: data.base64Data,
        mimeType: data.mimeType || 'image/png',
        width: data.width,
        height: data.height,
        provider,
        model,
        promptUsed: options.instructionPrompt,
        executionTimeMs,
        costEstimate: data.costEstimate || 0.03,
        requestId: data.requestId,
      };

      this.recordMetric(true, provider, result.costEstimate || 0.03);
      this.saveHistoryItem({
        type: 'edit',
        prompt: options.instructionPrompt,
        originalImageUrl: options.originalImageDataUrl,
        generatedImageUrl: result.imageUrl || result.base64Data || '',
        provider,
        model,
        aspectRatio: options.aspectRatio || '1:1',
        resolution: options.resolution || '1K',
        costEstimate: result.costEstimate,
        executionTimeMs,
        settingsJson: JSON.stringify(options),
      });

      return result;
    } catch (e: any) {
      const executionTimeMs = Date.now() - startTime;
      const errorMsg = e.message || 'Network connection failed during AI image edit';
      this.recordMetric(false, provider, 0, errorMsg);
      return {
        success: false,
        provider,
        model,
        promptUsed: options.instructionPrompt,
        executionTimeMs,
        error: errorMsg,
        mimeType: 'image/png',
      };
    }
  }

  /**
   * Dedicated AI Photoshoot Studio
   */
  public static async photoshoot(options: PhotoshootOptions): Promise<AIResult> {
    const { provider, model } = this.resolveProviderAndModel('portraitGeneration', options.provider, options.model);

    const startTime = Date.now();
    try {
      const response = await fetch('/api/ai/photoshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          provider,
          model,
        }),
      });

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      if (!response.ok || !data.success) {
        const errorMsg = data.error || `Photoshoot generation failed on ${provider}`;
        this.recordMetric(false, provider, 0, errorMsg);
        return {
          success: false,
          provider,
          model,
          promptUsed: `Photoshoot theme: ${options.theme}`,
          executionTimeMs,
          error: errorMsg,
          mimeType: 'image/png',
        };
      }

      const result: AIResult = {
        success: true,
        imageUrl: data.imageUrl,
        base64Data: data.base64Data,
        mimeType: 'image/png',
        provider,
        model,
        promptUsed: data.promptUsed || `Photoshoot theme: ${options.theme}`,
        executionTimeMs,
        costEstimate: data.costEstimate || 0.04,
      };

      this.recordMetric(true, provider, result.costEstimate || 0.04);
      this.saveHistoryItem({
        type: 'photoshoot',
        prompt: `Theme: ${options.theme} (${options.pose || 'Natural Pose'})`,
        originalImageUrl: options.referencePhotos[0],
        generatedImageUrl: result.imageUrl || result.base64Data || '',
        provider,
        model,
        aspectRatio: options.aspectRatio || '9:16',
        resolution: '1K',
        costEstimate: result.costEstimate,
        executionTimeMs,
        settingsJson: JSON.stringify(options),
      });

      return result;
    } catch (e: any) {
      const executionTimeMs = Date.now() - startTime;
      const errorMsg = e.message || 'Photoshoot request failed';
      this.recordMetric(false, provider, 0, errorMsg);
      return {
        success: false,
        provider,
        model,
        promptUsed: `Theme: ${options.theme}`,
        executionTimeMs,
        error: errorMsg,
        mimeType: 'image/png',
      };
    }
  }

  /**
   * Style Match & Aesthetic Transfer
   */
  public static async styleMatch(options: StyleMatchOptions): Promise<AIResult> {
    const { provider, model } = this.resolveProviderAndModel('styleTransfer', options.provider, options.model);

    const startTime = Date.now();
    try {
      const response = await fetch('/api/ai/style-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          provider,
          model,
        }),
      });

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      if (!response.ok || !data.success) {
        const errorMsg = data.error || `Style match failed on ${provider}`;
        this.recordMetric(false, provider, 0, errorMsg);
        return {
          success: false,
          provider,
          model,
          promptUsed: `Style Transfer (Strength: ${options.styleStrength}%)`,
          executionTimeMs,
          error: errorMsg,
          mimeType: 'image/png',
        };
      }

      const result: AIResult = {
        success: true,
        imageUrl: data.imageUrl,
        base64Data: data.base64Data,
        mimeType: 'image/png',
        provider,
        model,
        promptUsed: `Style Transfer (Strength: ${options.styleStrength}%)`,
        executionTimeMs,
        costEstimate: data.costEstimate || 0.03,
      };

      this.recordMetric(true, provider, result.costEstimate || 0.03);
      this.saveHistoryItem({
        type: 'style_match',
        prompt: `Style Match (Strength: ${options.styleStrength}%)`,
        originalImageUrl: options.userImageDataUrl,
        generatedImageUrl: result.imageUrl || result.base64Data || '',
        provider,
        model,
        aspectRatio: '1:1',
        resolution: '1K',
        costEstimate: result.costEstimate,
        executionTimeMs,
        settingsJson: JSON.stringify(options),
      });

      return result;
    } catch (e: any) {
      const executionTimeMs = Date.now() - startTime;
      const errorMsg = e.message || 'Style match connection error';
      this.recordMetric(false, provider, 0, errorMsg);
      return {
        success: false,
        provider,
        model,
        promptUsed: 'Style Transfer',
        executionTimeMs,
        error: errorMsg,
        mimeType: 'image/png',
      };
    }
  }

  /**
   * Generative Inpainting & Directional Outpainting
   */
  public static async inpaintOutpaint(options: InpaintOutpaintOptions): Promise<AIResult> {
    const cap = options.mode === 'inpaint' ? 'inpainting' : 'outpainting';
    const { provider, model } = this.resolveProviderAndModel(cap, options.provider, options.model);

    const startTime = Date.now();
    try {
      const response = await fetch('/api/ai/inpaint-outpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          provider,
          model,
        }),
      });

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      if (!response.ok || !data.success) {
        const errorMsg = data.error || `${options.mode} failed on ${provider}`;
        this.recordMetric(false, provider, 0, errorMsg);
        return {
          success: false,
          provider,
          model,
          promptUsed: options.prompt,
          executionTimeMs,
          error: errorMsg,
          mimeType: 'image/png',
        };
      }

      const result: AIResult = {
        success: true,
        imageUrl: data.imageUrl,
        base64Data: data.base64Data,
        mimeType: 'image/png',
        provider,
        model,
        promptUsed: options.prompt,
        executionTimeMs,
        costEstimate: data.costEstimate || 0.03,
      };

      this.recordMetric(true, provider, result.costEstimate || 0.03);
      this.saveHistoryItem({
        type: 'inpaint_outpaint',
        prompt: `${options.mode.toUpperCase()}: ${options.prompt}`,
        originalImageUrl: options.originalImageDataUrl,
        generatedImageUrl: result.imageUrl || result.base64Data || '',
        provider,
        model,
        aspectRatio: options.aspectRatio || '1:1',
        resolution: '1K',
        costEstimate: result.costEstimate,
        executionTimeMs,
        settingsJson: JSON.stringify(options),
      });

      return result;
    } catch (e: any) {
      const executionTimeMs = Date.now() - startTime;
      const errorMsg = e.message || 'Inpaint/outpaint connection failed';
      this.recordMetric(false, provider, 0, errorMsg);
      return {
        success: false,
        provider,
        model,
        promptUsed: options.prompt,
        executionTimeMs,
        error: errorMsg,
        mimeType: 'image/png',
      };
    }
  }

  /**
   * AI Upscaling (2x, 4x)
   */
  public static async upscale(options: UpscaleOptions): Promise<AIResult> {
    const { provider, model } = this.resolveProviderAndModel('upscaling', options.provider, options.model);

    const startTime = Date.now();
    try {
      const response = await fetch('/api/ai/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          provider,
          model,
        }),
      });

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      if (!response.ok || !data.success) {
        const errorMsg = data.error || `Upscaling failed on ${provider}`;
        this.recordMetric(false, provider, 0, errorMsg);
        return {
          success: false,
          provider,
          model,
          promptUsed: `AI Upscale ${options.scaleFactor}X`,
          executionTimeMs,
          error: errorMsg,
          mimeType: 'image/png',
        };
      }

      const result: AIResult = {
        success: true,
        imageUrl: data.imageUrl,
        base64Data: data.base64Data,
        mimeType: 'image/png',
        provider,
        model,
        promptUsed: `AI Enhanced & Upscaled (${options.scaleFactor}X)`,
        executionTimeMs,
        costEstimate: data.costEstimate || 0.04,
      };

      this.recordMetric(true, provider, result.costEstimate || 0.04);
      this.saveHistoryItem({
        type: 'upscale',
        prompt: `AI Upscale ${options.scaleFactor}X (Detail Enhanced)`,
        originalImageUrl: options.originalImageDataUrl,
        generatedImageUrl: result.imageUrl || result.base64Data || '',
        provider,
        model,
        aspectRatio: '1:1',
        resolution: options.scaleFactor === 4 ? '4K' : '2K',
        costEstimate: result.costEstimate,
        executionTimeMs,
        settingsJson: JSON.stringify(options),
      });

      return result;
    } catch (e: any) {
      const executionTimeMs = Date.now() - startTime;
      const errorMsg = e.message || 'Upscaling failed';
      this.recordMetric(false, provider, 0, errorMsg);
      return {
        success: false,
        provider,
        model,
        promptUsed: `AI Upscale ${options.scaleFactor}X`,
        executionTimeMs,
        error: errorMsg,
        mimeType: 'image/png',
      };
    }
  }

  // --- Generation History Management ---
  public static getHistory(): AIGenerationHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static saveHistoryItem(item: Omit<AIGenerationHistoryItem, 'id' | 'timestamp'>) {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getHistory();
      const newItem: AIGenerationHistoryItem = {
        ...item,
        id: `ai_gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      };
      const updated = [newItem, ...list].slice(0, 100); // Keep latest 100
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history item', e);
    }
  }

  public static deleteHistoryItem(id: string) {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getHistory().filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to delete history item', e);
    }
  }

  public static clearHistory() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
  }

  // --- Metrics & Quota Tracking ---
  public static getMetrics(): AIUsageMetrics {
    const defaultMetrics: AIUsageMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCostEstimate: 0,
      providerBreakdown: {
        gemini: { requests: 0, cost: 0 },
        leonardo: { requests: 0, cost: 0 },
        custom: { requests: 0, cost: 0 },
      },
    };

    if (typeof window === 'undefined') return defaultMetrics;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_METRICS);
      return raw ? JSON.parse(raw) : defaultMetrics;
    } catch {
      return defaultMetrics;
    }
  }

  private static recordMetric(success: boolean, provider: AIProviderId, cost: number, errorReason?: string) {
    if (typeof window === 'undefined') return;
    try {
      const m = this.getMetrics();
      m.totalRequests++;
      if (success) {
        m.successfulRequests++;
        m.totalCostEstimate += cost;
        m.lastSuccessfulTimestamp = Date.now();
        if (!m.providerBreakdown[provider]) {
          m.providerBreakdown[provider] = { requests: 0, cost: 0 };
        }
        m.providerBreakdown[provider].requests++;
        m.providerBreakdown[provider].cost += cost;
      } else {
        m.failedRequests++;
        m.lastFailedTimestamp = Date.now();
        m.lastErrorReason = errorReason;
      }
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(m));
    } catch (e) {
      console.warn('Failed to record metric', e);
    }
  }
}

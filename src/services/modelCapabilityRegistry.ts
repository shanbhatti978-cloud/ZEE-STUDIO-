/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AIProviderId,
  AIModelCapability,
  ModelCapabilityInfo,
  ImageAspectRatio,
  ImageResolution,
} from '../types/ai';

export class ModelCapabilityRegistry {
  private static models: Map<string, ModelCapabilityInfo> = new Map();

  static {
    // 1. Google Gemini 3.1 Flash Image (Nano Banana 2 - Current Flagship Image Gen & Edit)
    this.registerModel({
      modelId: 'gemini-3.1-flash-image',
      providerId: 'gemini',
      displayName: 'Gemini 3.1 Flash Image (Nano Banana 2)',
      description: 'High-speed, high-resolution generative image creation, multi-modal editing, and 4K upscaling.',
      capabilities: {
        textToImage: true,
        imageToImage: true,
        multiReference: true,
        inpainting: true,
        outpainting: true,
        upscaling: true,
        backgroundEditing: true,
        objectRemoval: true,
        objectReplacement: true,
        styleTransfer: true,
        portraitGeneration: true,
        templateComposition: true,
        highResolution: true,
      },
      supportedAspectRatios: ['1:1', '9:16', '16:9', '4:5', '3:4', '2:3', '3:2', '1:4', '4:1'],
      supportedResolutions: ['512px', '1K', '2K', '4K'],
      estimatedCostPerImage: 0.03,
      maxReferenceImages: 3,
      requiresPaidKey: true,
    });

    // 2. Google Gemini 3.1 Flash Lite Image (Fast, Cost-Effective Standard Model)
    this.registerModel({
      modelId: 'gemini-3.1-flash-lite-image',
      providerId: 'gemini',
      displayName: 'Gemini 3.1 Flash Lite Image',
      description: 'Ultra-fast, lightweight image synthesis and quick edits.',
      capabilities: {
        textToImage: true,
        imageToImage: true,
        multiReference: true,
        inpainting: true,
        outpainting: false,
        upscaling: false,
        backgroundEditing: true,
        objectRemoval: true,
        objectReplacement: true,
        styleTransfer: true,
        portraitGeneration: true,
        templateComposition: true,
        highResolution: false,
      },
      supportedAspectRatios: ['1:1', '9:16', '16:9', '4:5', '3:4'],
      supportedResolutions: ['512px', '1K'],
      estimatedCostPerImage: 0.015,
      maxReferenceImages: 2,
      requiresPaidKey: true,
    });

    // 3. Google Gemini 3 Pro Image (Ultra Detail & Reasoning)
    this.registerModel({
      modelId: 'gemini-3-pro-image',
      providerId: 'gemini',
      displayName: 'Gemini 3 Pro Image (Nano Banana Pro)',
      description: 'Pro-grade visual reasoning, complex prompt adherence, high-fidelity textures, and cinematic lighting.',
      capabilities: {
        textToImage: true,
        imageToImage: true,
        multiReference: true,
        inpainting: true,
        outpainting: true,
        upscaling: true,
        backgroundEditing: true,
        objectRemoval: true,
        objectReplacement: true,
        styleTransfer: true,
        portraitGeneration: true,
        templateComposition: true,
        highResolution: true,
      },
      supportedAspectRatios: ['1:1', '9:16', '16:9', '4:5', '3:4', '2:3', '3:2'],
      supportedResolutions: ['1K', '2K', '4K'],
      estimatedCostPerImage: 0.06,
      maxReferenceImages: 4,
      requiresPaidKey: true,
    });

    // 4. Leonardo AI Photoreal v2 Adapter
    this.registerModel({
      modelId: 'leonardo-photoreal-v2',
      providerId: 'leonardo',
      displayName: 'Leonardo PhotoReal v2',
      description: 'DSLR-grade hyper-realistic portraits, studio lighting, and texture fidelity.',
      capabilities: {
        textToImage: true,
        imageToImage: true,
        multiReference: false,
        inpainting: true,
        outpainting: false,
        upscaling: true,
        backgroundEditing: true,
        objectRemoval: false,
        objectReplacement: false,
        styleTransfer: true,
        portraitGeneration: true,
        templateComposition: false,
        highResolution: true,
      },
      supportedAspectRatios: ['1:1', '9:16', '16:9', '4:5', '3:4'],
      supportedResolutions: ['1K', '2K'],
      estimatedCostPerImage: 0.05,
      maxReferenceImages: 1,
      requiresPaidKey: true,
    });

    // 5. Leonardo AI Creative
    this.registerModel({
      modelId: 'leonardo-creative',
      providerId: 'leonardo',
      displayName: 'Leonardo Creative',
      description: 'Artistic stylized generation, fantasy, vibrant colors, and illustration aesthetics.',
      capabilities: {
        textToImage: true,
        imageToImage: true,
        multiReference: false,
        inpainting: false,
        outpainting: false,
        upscaling: true,
        backgroundEditing: false,
        objectRemoval: false,
        objectReplacement: false,
        styleTransfer: true,
        portraitGeneration: true,
        templateComposition: false,
        highResolution: true,
      },
      supportedAspectRatios: ['1:1', '9:16', '16:9', '3:4'],
      supportedResolutions: ['1K'],
      estimatedCostPerImage: 0.04,
      maxReferenceImages: 1,
      requiresPaidKey: true,
    });
  }

  public static registerModel(info: ModelCapabilityInfo) {
    this.models.set(info.modelId, info);
  }

  public static getModel(modelId: string): ModelCapabilityInfo | undefined {
    return this.models.get(modelId);
  }

  public static getAllModels(): ModelCapabilityInfo[] {
    return Array.from(this.models.values());
  }

  public static getModelsForProvider(providerId: AIProviderId): ModelCapabilityInfo[] {
    return Array.from(this.models.values()).filter((m) => m.providerId === providerId);
  }

  public static getDefaultModelForProvider(providerId: AIProviderId): string {
    if (providerId === 'gemini') return 'gemini-3.1-flash-image';
    if (providerId === 'leonardo') return 'leonardo-photoreal-v2';
    return 'gemini-3.1-flash-image';
  }

  public static isCapabilitySupported(modelId: string, capability: AIModelCapability): boolean {
    const model = this.models.get(modelId);
    if (!model) return false;
    return !!model.capabilities[capability];
  }

  public static getSupportedModelsForCapability(capability: AIModelCapability): ModelCapabilityInfo[] {
    return Array.from(this.models.values()).filter((m) => m.capabilities[capability]);
  }
}

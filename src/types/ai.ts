/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AIProviderId = 'gemini' | 'leonardo' | 'custom';

export type AIModelCapability =
  | 'textToImage'
  | 'imageToImage'
  | 'multiReference'
  | 'inpainting'
  | 'outpainting'
  | 'upscaling'
  | 'backgroundEditing'
  | 'objectRemoval'
  | 'objectReplacement'
  | 'styleTransfer'
  | 'portraitGeneration'
  | 'templateComposition'
  | 'highResolution';

export type ImageAspectRatio =
  | '1:1'
  | '9:16'
  | '16:9'
  | '4:5'
  | '3:4'
  | '2:3'
  | '3:2'
  | '1:4'
  | '4:1';

export type ImageResolution = '512px' | '1K' | '2K' | '4K' | 'Original';

export interface ModelCapabilityInfo {
  modelId: string;
  providerId: AIProviderId;
  displayName: string;
  description: string;
  capabilities: Record<AIModelCapability, boolean>;
  supportedAspectRatios: ImageAspectRatio[];
  supportedResolutions: ImageResolution[];
  estimatedCostPerImage?: number; // USD estimate where available
  maxReferenceImages: number;
  requiresPaidKey: boolean;
}

export interface AIImageReference {
  dataUrl: string; // base64 or blob URL
  mimeType?: string;
  type?: 'subject' | 'style' | 'pose' | 'background';
}

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: ImageAspectRatio;
  resolution?: ImageResolution;
  stylePreset?: string;
  provider?: AIProviderId;
  model?: string;
  seed?: number;
  guidanceScale?: number;
  referenceImages?: AIImageReference[];
  apiKeyOverride?: string;
}

export type AIEditOperationType =
  | 'remove_object'
  | 'replace_object'
  | 'change_background'
  | 'extend_image'
  | 'change_clothing'
  | 'change_environment'
  | 'change_lighting'
  | 'change_weather'
  | 'change_color'
  | 'restore_photo'
  | 'enhance_portrait'
  | 'fix_damaged_areas'
  | 'creative_transform';

export interface EditImageOptions {
  originalImageDataUrl: string;
  maskDataUrl?: string; // base64 mask for inpainting / selective edits
  operation: AIEditOperationType;
  instructionPrompt: string;
  replacementSubject?: string;
  aspectRatio?: ImageAspectRatio;
  resolution?: ImageResolution;
  provider?: AIProviderId;
  model?: string;
  apiKeyOverride?: string;
}

export interface PhotoshootOptions {
  referencePhotos: string[]; // base64 user images
  theme:
    | 'Portrait'
    | 'Full body'
    | 'Half body'
    | 'Studio'
    | 'Outdoor'
    | 'Fashion'
    | 'Corporate'
    | 'Wedding'
    | 'Cinematic'
    | 'Travel'
    | 'Pakistani / Desi'
    | 'Luxury';
  location?: string;
  pose?: string;
  lighting?: string;
  cameraStyle?: string;
  mood?: string;
  aspectRatio?: ImageAspectRatio;
  provider?: AIProviderId;
  model?: string;
}

export interface StyleMatchOptions {
  userImageDataUrl: string;
  referenceStyleDataUrl: string;
  styleStrength: number; // 0 to 100
  preserveIdentity: boolean;
  transferLighting?: boolean;
  transferColor?: boolean;
  transferEnvironment?: boolean;
  provider?: AIProviderId;
  model?: string;
}

export interface InpaintOutpaintOptions {
  originalImageDataUrl: string;
  maskDataUrl?: string;
  mode: 'inpaint' | 'outpaint';
  outpaintDirection?: 'left' | 'right' | 'top' | 'bottom' | 'all';
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  provider?: AIProviderId;
  model?: string;
}

export interface UpscaleOptions {
  originalImageDataUrl: string;
  scaleFactor: 2 | 4;
  enhanceDetails?: boolean;
  facePreservation?: boolean;
  provider?: AIProviderId;
  model?: string;
}

export interface AIResult {
  success: boolean;
  imageUrl?: string;
  base64Data?: string;
  mimeType: string;
  width?: number;
  height?: number;
  provider: AIProviderId;
  model: string;
  promptUsed: string;
  executionTimeMs: number;
  costEstimate?: number;
  requestId?: string;
  seed?: number;
  error?: string;
  errorCode?: 'UNAUTHORIZED' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'UNSUPPORTED_CAPABILITY' | 'INVALID_IMAGE' | 'SERVER_ERROR';
}

export interface AIGenerationHistoryItem {
  id: string;
  timestamp: number;
  type: 'generate' | 'edit' | 'photoshoot' | 'style_match' | 'inpaint_outpaint' | 'upscale';
  prompt: string;
  originalImageUrl?: string;
  generatedImageUrl: string;
  provider: AIProviderId;
  model: string;
  aspectRatio: ImageAspectRatio;
  resolution: ImageResolution;
  costEstimate?: number;
  executionTimeMs: number;
  isFavorite?: boolean;
  settingsJson: string;
}

export interface AIUsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCostEstimate: number;
  providerBreakdown: Record<AIProviderId, { requests: number; cost: number }>;
  lastSuccessfulTimestamp?: number;
  lastFailedTimestamp?: number;
  lastErrorReason?: string;
}

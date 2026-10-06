/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types/editor';
import { TimelinePreviewThumbnailService, TimelineThumbnail } from './timelinePreviewThumbnailService';

export interface ThumbnailSequenceOptions {
  intervalSeconds?: number;
  maxDimension?: number;
}

export class ThumbnailGeneratorService {
  /**
   * Generates low-resolution frame thumbnails at fixed intervals along the timeline
   * to support the 'quick-preview' verification step in the export process.
   */
  public static async generateThumbnailSequence(
    project: Project,
    options?: ThumbnailSequenceOptions,
    onProgress?: (progress: number) => void
  ): Promise<TimelineThumbnail[]> {
    const interval = options?.intervalSeconds || 0.5;
    return TimelinePreviewThumbnailService.generateThumbnails(project, interval, onProgress);
  }
}

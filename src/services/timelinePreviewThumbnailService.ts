/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types/editor';
import { VideoCompositor } from '../engine/VideoCompositor';

export interface TimelineThumbnail {
  timeSeconds: number;
  dataUrl: string;
}

export class TimelinePreviewThumbnailService {
  /**
   * Generates low-resolution frame thumbnails at fixed intervals along the project timeline.
   * Useful for quick-preview verification before full-resolution export.
   */
  public static async generateThumbnails(
    project: Project,
    intervalSeconds: number = 0.5,
    onProgress?: (progress: number) => void
  ): Promise<TimelineThumbnail[]> {
    const duration = Math.max(0.5, project.duration || 1);
    const times: number[] = [];
    for (let t = 0; t <= duration; t += intervalSeconds) {
      times.push(parseFloat(t.toFixed(2)));
    }
    // Ensure last frame is included if not exact
    if (times[times.length - 1] < duration) {
      times.push(duration);
    }

    const thumbnails: TimelineThumbnail[] = [];
    const total = times.length;

    for (let i = 0; i < total; i++) {
      const time = times[i];
      try {
        // Render low-res frame using VideoCompositor helper or canvas
        const dataUrl = await VideoCompositor.renderFrameThumbnail(project, time, 320);
        thumbnails.push({
          timeSeconds: time,
          dataUrl,
        });
      } catch (err) {
        console.warn(`Failed to generate thumbnail at time ${time}s`, err);
        // Fallback placeholder
        thumbnails.push({
          timeSeconds: time,
          dataUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiB2aWV3Qm94PSIwIDAgMzIwIDE4MCI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMxZTI5M2IiLz48dGV4dCB4PSI1MCUiIHkyPSI1MCUiIGZpbGw9IiM5NDRhMGIiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSpzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5QcmV2aWV3PC90ZXh0Pjwvc3ZnPg==',
        });
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    return thumbnails;
  }
}

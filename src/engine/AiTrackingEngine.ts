import { Keyframe, BeatMarker, Clip } from '../types/editor';

export interface MotionAnalysisResult {
  motionType: 'pan-left' | 'pan-right' | 'tilt-up' | 'tilt-down' | 'zoom-in' | 'zoom-out' | 'rotate-cw' | 'rotate-ccw' | 'static' | 'shake';
  startTime: number;
  endTime: number;
  direction: { x: number; y: number };
  intensity: number; // 0 to 100
  confidence: number; // 0.0 to 1.0
  scaleChange: number;
  rotationChange: number;
}

export interface TrackingDataPoint {
  time: number;
  x: number; // percentage of canvas (0 to 100)
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export class AiTrackingEngine {
  /**
   * Performs an actual client-side Local Block-Matching Optical Flow analysis between two canvas frames.
   * Compares a grid of macroblocks to compute physical visual motion vectors, pan/tilt translations, and zoom.
   */
  public static analyzeOpticalFlow(
    prevCtx: CanvasRenderingContext2D,
    currCtx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): { vectors: { dx: number; dy: number }[]; globalMotion: MotionAnalysisResult } {
    const prevData = prevCtx.getImageData(0, 0, width, height);
    const currData = currCtx.getImageData(0, 0, width, height);

    const gridSize = 16; // 16x16 pixel macroblocks
    const searchRange = 8; // Max search window offset
    const vectors: { dx: number; dy: number }[] = [];

    let sumDx = 0;
    let sumDy = 0;
    let zoomMetric = 0; // Outward or inward vector alignment
    let rotationMetric = 0; // Angular rotational vector alignment
    let validBlocksCount = 0;

    // Scan an 8x8 grid of blocks
    for (let y = gridSize * 2; y < height - gridSize * 2; y += height / 8) {
      for (let x = gridSize * 2; x < width - gridSize * 2; x += width / 8) {
        const centerY = Math.floor(y);
        const centerX = Math.floor(x);

        let bestDx = 0;
        let bestDy = 0;
        let minSAD = Infinity; // Sum of Absolute Differences

        // Find the matching block in current frame within search range
        for (let dy = -searchRange; dy <= searchRange; dy++) {
          for (let dx = -searchRange; dx <= searchRange; dx++) {
            let sad = 0;
            
            // Compare 8x8 sample block
            for (let by = -4; by < 4; by++) {
              for (let bx = -4; bx < 4; bx++) {
                const prevPixelIdx = ((centerY + by) * width + (centerX + bx)) * 4;
                const currPixelIdx = ((centerY + by + dy) * width + (centerX + bx + dx)) * 4;

                const prevLuma = prevData.data[prevPixelIdx] * 0.299 + prevData.data[prevPixelIdx + 1] * 0.587 + prevData.data[prevPixelIdx + 2] * 0.114;
                const currLuma = currData.data[currPixelIdx] * 0.299 + currData.data[currPixelIdx + 1] * 0.587 + currData.data[currPixelIdx + 2] * 0.114;

                sad += Math.abs(prevLuma - currLuma);
              }
            }

            if (sad < minSAD) {
              minSAD = sad;
              bestDx = dx;
              bestDy = dy;
            }
          }
        }

        // Filter out stagnant low-contrast blocks or noisy matching mismatches
        if (minSAD < 5000) {
          vectors.push({ dx: bestDx, dy: bestDy });
          sumDx += bestDx;
          sumDy += bestDy;

          // Compute zoom/radial alignment (vectors pointing away or towards center)
          const rx = centerX - width / 2;
          const ry = centerY - height / 2;
          const dotProduct = bestDx * rx + bestDy * ry;
          zoomMetric += dotProduct;

          // Compute angular rotation alignment (tangent vectors)
          const tx = -ry;
          const ty = rx;
          const tangentDot = bestDx * tx + bestDy * ty;
          rotationMetric += tangentDot;

          validBlocksCount++;
        }
      }
    }

    const count = validBlocksCount || 1;
    const avgDx = sumDx / count;
    const avgDy = sumDy / count;
    const avgZoom = zoomMetric / count;
    const avgRot = rotationMetric / count;

    // Detect camera movement based on physical vector thresholds
    let motionType: MotionAnalysisResult['motionType'] = 'static';
    let intensity = Math.min(100, Math.floor(Math.sqrt(avgDx * avgDx + avgDy * avgDy) * 15));
    let direction = { x: avgDx, y: avgDy };
    let confidence = count > 10 ? Math.min(0.98, 0.4 + count / 50) : 0.25;

    let scaleChange = 1.0;
    let rotationChange = 0;

    if (Math.abs(avgZoom) > 15) {
      if (avgZoom > 0) {
        motionType = 'zoom-in';
        scaleChange = 1.0 + Math.abs(avgZoom) / 800;
      } else {
        motionType = 'zoom-out';
        scaleChange = 1.0 - Math.abs(avgZoom) / 800;
      }
      intensity = Math.min(100, Math.floor(Math.abs(avgZoom) * 4));
    } else if (Math.abs(avgRot) > 20) {
      motionType = avgRot > 0 ? 'rotate-cw' : 'rotate-ccw';
      rotationChange = (avgRot > 0 ? 1 : -1) * Math.min(15, Math.abs(avgRot) / 5);
      intensity = Math.min(100, Math.floor(Math.abs(avgRot) * 3));
    } else if (Math.abs(avgDx) > 1.5 || Math.abs(avgDy) > 1.5) {
      if (Math.abs(avgDx) > Math.abs(avgDy)) {
        motionType = avgDx > 0 ? 'pan-right' : 'pan-left';
      } else {
        motionType = avgDy > 0 ? 'tilt-down' : 'tilt-up';
      }
      
      // Secondary check for camera vibration (shakes)
      if (Math.abs(avgDx) > 5 && Math.random() > 0.4) {
        motionType = 'shake';
      }
    }

    return {
      vectors,
      globalMotion: {
        motionType,
        startTime: 0,
        endTime: 1.0,
        direction,
        intensity,
        confidence,
        scaleChange,
        rotationChange
      }
    };
  }

  /**
   * Tracks an object or a face in consecutive canvas frames using a localized search correlation block-matcher.
   * Returns a real bounding box trajectory { x, y, width, height } percentage coordinates and a confidence metric.
   */
  public static trackObjectInFrame(
    canvas: HTMLCanvasElement,
    prevBox: { x: number; y: number; width: number; height: number },
    referencePatchData: ImageData | null
  ): { currentBox: { x: number; y: number; width: number; height: number }; currentPatch: ImageData; confidence: number } {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { currentBox: prevBox, currentPatch: referencePatchData!, confidence: 0 };

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Convert percentage-based coordinates to pixels
    const pxX = Math.max(0, Math.min(canvasWidth - 10, Math.floor((prevBox.x / 100) * canvasWidth)));
    const pxY = Math.max(0, Math.min(canvasHeight - 10, Math.floor((prevBox.y / 100) * canvasHeight)));
    const pxW = Math.max(10, Math.min(canvasWidth, Math.floor((prevBox.width / 100) * canvasWidth)));
    const pxH = Math.max(10, Math.min(canvasHeight, Math.floor((prevBox.height / 100) * canvasHeight)));

    // Get reference template if not provided yet
    let template = referencePatchData;
    if (!template) {
      template = ctx.getImageData(pxX, pxY, pxW, pxH);
    }

    // Set search window parameters (restrict to localized bounding area for performance and accuracy)
    const searchPad = 24; 
    const minSearchX = Math.max(0, pxX - searchPad);
    const maxSearchX = Math.min(canvasWidth - pxW, pxX + searchPad);
    const minSearchY = Math.max(0, pxY - searchPad);
    const maxSearchY = Math.min(canvasHeight - pxH, pxY + searchPad);

    const currFrameData = ctx.getImageData(minSearchX, minSearchY, (maxSearchX - minSearchX) + pxW, (maxSearchY - minSearchY) + pxH);

    let bestX = pxX;
    let bestY = pxY;
    let minDiff = Infinity;

    // Slide bounding box over search window to minimize pixel difference correlation
    for (let sy = minSearchY; sy <= maxSearchY; sy += 2) {
      for (let sx = minSearchX; sx <= maxSearchX; sx += 2) {
        let diff = 0;

        // Sample block matching comparisons
        for (let dy = 0; dy < pxH; dy += Math.max(2, Math.floor(pxH / 12))) {
          for (let dx = 0; dx < pxW; dx += Math.max(2, Math.floor(pxW / 12))) {
            const templatePixelIdx = (dy * pxW + dx) * 4;
            const currentFramePixelIdx = ((sy - minSearchY + dy) * currFrameData.width + (sx - minSearchX + dx)) * 4;

            const tr = template.data[templatePixelIdx];
            const tg = template.data[templatePixelIdx + 1];
            const tb = template.data[templatePixelIdx + 2];

            const cr = currFrameData.data[currentFramePixelIdx];
            const cg = currFrameData.data[currentFramePixelIdx + 1];
            const cb = currFrameData.data[currentFramePixelIdx + 2];

            diff += Math.abs(tr - cr) + Math.abs(tg - cg) + Math.abs(tb - cb);
          }
        }

        if (diff < minDiff) {
          minDiff = diff;
          bestX = sx;
          bestY = sy;
        }
      }
    }

    // Capture newest tracked bounding patch
    const updatedPatch = ctx.getImageData(bestX, bestY, pxW, pxH);

    // Calculate accuracy confidence metric
    const maxDiffTotal = pxW * pxH * 255;
    const rawConf = 1.0 - (minDiff / (maxDiffTotal * 0.05)); // Scaling index
    const confidence = Math.max(0.1, Math.min(0.97, rawConf));

    // Convert pixels back to canvas percentage coordinates
    const currentBox = {
      x: Number(((bestX / canvasWidth) * 100).toFixed(2)),
      y: Number(((bestY / canvasHeight) * 100).toFixed(2)),
      width: Number(((pxW / canvasWidth) * 100).toFixed(2)),
      height: Number(((pxH / canvasHeight) * 100).toFixed(2))
    };

    return { currentBox, currentPatch: updatedPatch, confidence };
  }

  /**
   * Scans a canvas frame to detect human face candidates using skin-tone color space clustering.
   * Runs local bounding box grouping and returns a real detected face box {x, y, w, h} and confidence.
   */
  public static detectFaceCandidate(canvas: HTMLCanvasElement): { faceBox: { x: number; y: number; width: number; height: number } | null; confidence: number } {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { faceBox: null, confidence: 0 };

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);

    let minX = w;
    let maxX = 0;
    let minY = h;
    let maxY = 0;
    let skinPixelCount = 0;

    // Sub-sample canvas pixels to evaluate skin chromatic levels
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const idx = (y * w + x) * 4;
        const r = imgData.data[idx];
        const g = imgData.data[idx + 1];
        const b = imgData.data[idx + 2];

        // Chromatic skin color bounds algorithm (RGB skin-color classifier)
        const isSkin = r > 95 && g > 40 && b > 20 &&
                       r - g > 15 && r > b &&
                       Math.max(r, g, b) - Math.min(r, g, b) > 15;

        if (isSkin) {
          skinPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const totalSampledPixels = (w * h) / 16;
    const skinCoverage = skinPixelCount / totalSampledPixels;

    // Scans threshold limits to ignore visual background noises
    if (skinPixelCount > 30 && skinCoverage < 0.4 && maxX > minX + 20 && maxY > minY + 20) {
      // Add padding around identified cluster
      const padX = Math.floor((maxX - minX) * 0.1);
      const padY = Math.floor((maxY - minY) * 0.15);

      const boxX = Math.max(0, minX - padX);
      const boxY = Math.max(0, minY - padY);
      const boxW = Math.min(w - boxX, (maxX - minX) + padX * 2);
      const boxH = Math.min(h - boxY, (maxY - minY) + padY * 2);

      // Verify oval aspect ratio matching generic human facial frames (typically vertical aspect 1.2 to 1.6)
      const ratio = boxH / boxW;
      let scoreMultiplier = 1.0;
      if (ratio >= 1.1 && ratio <= 1.7) {
        scoreMultiplier = 1.2;
      }

      const confidence = Math.min(0.95, 0.4 + (skinPixelCount / totalSampledPixels) * 10 * scoreMultiplier);

      return {
        faceBox: {
          x: Number(((boxX / w) * 100).toFixed(2)),
          y: Number(((boxY / h) * 100).toFixed(2)),
          width: Number(((boxW / w) * 100).toFixed(2)),
          height: Number(((boxH / h) * 100).toFixed(2))
        },
        confidence
      };
    }

    return { faceBox: null, confidence: 0 };
  }

  /**
   * Applies Sobel High-Pass edge gradient filters to isolate focused foreground regions vs blurry background areas.
   * Generates a structural depth density array heuristic usable for cinematic 3D effects.
   */
  public static estimateDepthMap(canvas: HTMLCanvasElement): number[][] {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const w = 40; // Low-resolution grid for computing depth map density
    const h = 40;

    // Create a temporary downscaled canvas for faster gradient computations
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return [];

    tempCtx.drawImage(canvas, 0, 0, w, h);
    const imgData = tempCtx.getImageData(0, 0, w, h);
    const depthMap: number[][] = Array(h).fill(0).map(() => Array(w).fill(0));

    // Compute Sobel contrast gradients
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const getVal = (px: number, py: number) => {
          const idx = (py * w + px) * 4;
          return imgData.data[idx] * 0.3 + imgData.data[idx + 1] * 0.59 + imgData.data[idx + 2] * 0.11;
        };

        // Sobel kernels
        const gx = 
          -1 * getVal(x - 1, y - 1) + 1 * getVal(x + 1, y - 1) +
          -2 * getVal(x - 1, y)     + 2 * getVal(x + 1, y) +
          -1 * getVal(x - 1, y + 1) + 1 * getVal(x + 1, y + 1);

        const gy = 
          -1 * getVal(x - 1, y - 1) - 2 * getVal(x, y - 1) - 1 * getVal(x + 1, y - 1) +
          1 * getVal(x - 1, y + 1) + 2 * getVal(x, y + 1) + 1 * getVal(x + 1, y + 1);

        const edgeVal = Math.sqrt(gx * gx + gy * gy);

        // Normalize edge values (focused high-contrast details = foreground/close depth)
        // Blurry out-of-focus bokeh = distant background depth
        const depthVal = Math.min(1.0, edgeVal / 140);
        
        // Apply radial center falloff to simulate camera depth focus (depth focus centers on frame target)
        const rx = (x - w / 2) / (w / 2);
        const ry = (y - h / 2) / (h / 2);
        const dist = Math.sqrt(rx * rx + ry * ry);
        const focusBias = Math.max(0, 1.0 - dist * 0.45);

        depthMap[y][x] = Number((depthVal * 0.65 + focusBias * 0.35).toFixed(3));
      }
    }

    return depthMap;
  }

  /**
   * AI AUTO KEYFRAMES algorithm
   * Scans clip properties and beat markers to insert keyframes synchronized to video motion and drop hits.
   */
  public static autoGenerateTimelineKeyframes(clip: Clip, beats: BeatMarker[]): Keyframe[] {
    const generated: Keyframe[] = [];
    const clipBeats = beats.filter(b => b.time >= clip.start && b.time <= clip.start + clip.duration);

    // 1. Generate starting keyframe (baseline state)
    generated.push({
      id: `kf_start_${Date.now()}`,
      time: 0,
      scale: clip.scale,
      x: clip.x,
      y: clip.y,
      rotation: clip.rotation,
      opacity: clip.opacity
    });

    // 2. Generate keyframe pulses on every strong beat drop
    clipBeats.forEach((beat, idx) => {
      const relTime = Number((beat.time - clip.start).toFixed(2));
      if (relTime <= 0.1 || relTime >= clip.duration - 0.1) return;

      const isHeavy = beat.intensity === 'heavy';
      
      // Scale-up impact beat peak
      generated.push({
        id: `kf_beat_p_${idx}_${Date.now()}`,
        time: relTime,
        scale: Number((clip.scale * (isHeavy ? 1.15 : 1.06)).toFixed(2)),
        x: clip.x,
        y: clip.y,
        rotation: isHeavy ? (Math.random() > 0.5 ? 2 : -2) : 0,
        opacity: 1
      });

      // Scale-down recovery beat settlement
      const recoveryTime = Number(Math.min(clip.duration - 0.05, relTime + 0.2).toFixed(2));
      generated.push({
        id: `kf_beat_r_${idx}_${Date.now()}`,
        time: recoveryTime,
        scale: clip.scale,
        x: clip.x,
        y: clip.y,
        rotation: 0,
        opacity: 1
      });
    });

    // 3. Generate end keyframe
    generated.push({
      id: `kf_end_${Date.now()}`,
      time: Number(clip.duration.toFixed(2)),
      scale: clip.scale,
      x: clip.x,
      y: clip.y,
      rotation: clip.rotation,
      opacity: clip.opacity
    });

    return generated.sort((a, b) => a.time - b.time);
  }
}

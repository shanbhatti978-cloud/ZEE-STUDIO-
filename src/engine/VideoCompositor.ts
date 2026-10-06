import { Project, Clip, AspectRatio, Transition, Keyframe } from '../types/editor';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  time: number; // playhead time in seconds
  project: Project;
  selectedClipId?: string | null;
  interactiveMode?: boolean; // draws bounding box for dragging text/stickers
}

export class VideoCompositor {
  private static imageCache: Map<string, HTMLImageElement> = new Map();
  private static videoElementCache: Map<string, HTMLVideoElement> = new Map();

  // Get canvas dimension based on aspect ratio
  public static getDimensions(ratio: AspectRatio, maxDimension = 1080): { width: number; height: number } {
    switch (ratio) {
      case '9:16':
        return { width: Math.round(maxDimension * (9 / 16)), height: maxDimension }; // e.g. 608x1080
      case '1:1':
        return { width: maxDimension, height: maxDimension };
      case '4:5':
        return { width: Math.round(maxDimension * (4 / 5)), height: maxDimension };
      case '16:9':
        return { width: maxDimension, height: Math.round(maxDimension * (9 / 16)) };
      case '3:4':
        return { width: Math.round(maxDimension * (3 / 4)), height: maxDimension };
      default:
        return { width: 608, height: 1080 };
    }
  }

  // Pre-load an image
  public static preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return Promise.resolve(this.imageCache.get(url)!);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        resolve(img);
      };
      img.src = url;
    });
  }

  // Main composite render method
  public static render(rc: RenderContext) {
    const { canvas, ctx, time, project } = rc;
    const { width, height } = canvas;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    this.renderCanvasBackground(ctx, project, width, height);

    // 2. Separate tracks by type to preserve z-index hierarchy
    const videoTracks = project.tracks.filter(t => t.type === 'video');
    const effectTracks = project.tracks.filter(t => t.type === 'effect');
    const stickerTracks = project.tracks.filter(t => t.type === 'sticker');
    const textTracks = project.tracks.filter(t => t.type === 'text');

    // 3. Render video/image tracks
    for (const track of videoTracks) {
      if (track.visible === false) continue;
      // Find active clips at current time
      const activeClip = track.clips.find(c => time >= c.start && time < c.start + c.duration);
      if (activeClip) {
        this.renderVisualClip(ctx, activeClip, time, width, height);
      }
    }

    // 4. Render Global / Track Effects
    for (const track of effectTracks) {
      if (track.visible === false) continue;
      const activeEffectClip = track.clips.find(c => time >= c.start && time < c.start + c.duration);
      if (activeEffectClip && activeEffectClip.effect.type !== 'none') {
        this.applyEffect(ctx, activeEffectClip.effect.type, activeEffectClip.effect.intensity, time, width, height);
      }
    }

    // 5. Render Stickers & Graphics
    for (const track of stickerTracks) {
      if (track.visible === false) continue;
      const activeSticker = track.clips.find(c => time >= c.start && time < c.start + c.duration);
      if (activeSticker) {
        this.renderStickerClip(ctx, activeSticker, time, width, height, rc.selectedClipId === activeSticker.id);
      }
    }

    // 6. Render Text & Dynamic Captions
    for (const track of textTracks) {
      if (track.visible === false) continue;
      const activeText = track.clips.find(c => time >= c.start && time < c.start + c.duration);
      if (activeText && activeText.textConfig) {
        this.renderTextClip(ctx, activeText, time, width, height, rc.selectedClipId === activeText.id);
      }
    }

    ctx.restore();
  }

  // Canvas background (pure color, pattern, or blur)
  private static renderCanvasBackground(ctx: CanvasRenderingContext2D, project: Project, width: number, height: number) {
    const bg = project.canvasBackground;
    ctx.fillStyle = bg.color || '#000000';
    ctx.fillRect(0, 0, width, height);

    if (bg.type === 'pattern') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      const step = 40;
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Interpolate keyframes for transform properties
  private static getInterpolatedTransform(clip: Clip, localTime: number) {
    let scale = clip.scale;
    let x = clip.x;
    let y = clip.y;
    let rotation = clip.rotation;
    let opacity = clip.opacity;

    if (clip.keyframes && clip.keyframes.length > 0) {
      const sorted = [...clip.keyframes].sort((a, b) => a.time - b.time);
      if (localTime <= sorted[0].time) {
        const k = sorted[0];
        scale = k.scale ?? scale;
        x = k.x ?? x;
        y = k.y ?? y;
        rotation = k.rotation ?? rotation;
        opacity = k.opacity ?? opacity;
      } else if (localTime >= sorted[sorted.length - 1].time) {
        const k = sorted[sorted.length - 1];
        scale = k.scale ?? scale;
        x = k.x ?? x;
        y = k.y ?? y;
        rotation = k.rotation ?? rotation;
        opacity = k.opacity ?? opacity;
      } else {
        // Find segment
        for (let i = 0; i < sorted.length - 1; i++) {
          const k1 = sorted[i];
          const k2 = sorted[i + 1];
          if (localTime >= k1.time && localTime <= k2.time) {
            const t = (localTime - k1.time) / (k2.time - k1.time);
            const ease = t * t * (3 - 2 * t); // smoothstep
            scale = (k1.scale ?? scale) + ((k2.scale ?? scale) - (k1.scale ?? scale)) * ease;
            x = (k1.x ?? x) + ((k2.x ?? x) - (k1.x ?? x)) * ease;
            y = (k1.y ?? y) + ((k2.y ?? y) - (k1.y ?? y)) * ease;
            rotation = (k1.rotation ?? rotation) + ((k2.rotation ?? rotation) - (k1.rotation ?? rotation)) * ease;
            opacity = (k1.opacity ?? opacity) + ((k2.opacity ?? opacity) - (k1.opacity ?? opacity)) * ease;
            break;
          }
        }
      }
    }

    return { scale, x, y, rotation, opacity };
  }

  // Render a visual clip (Video or Photo)
  private static renderVisualClip(
    ctx: CanvasRenderingContext2D,
    clip: Clip,
    timelineTime: number,
    canvasW: number,
    canvasH: number
  ) {
    const localTime = (timelineTime - clip.start) * (clip.speed || 1);
    const progress = localTime / clip.duration;

    const transform = this.getInterpolatedTransform(clip, localTime);

    // Calculate transition in progress
    let transitionScale = 1;
    let transitionAlpha = 1;
    let transitionOffsetX = 0;
    let transitionOffsetY = 0;
    let transitionRotation = 0;

    if (clip.transitionIn && clip.transitionIn.type !== 'none') {
      const transDur = clip.transitionIn.duration || 0.4;
      const transProgress = Math.min(1, Math.max(0, localTime / transDur));
      if (transProgress < 1) {
        const ease = 1 - Math.pow(1 - transProgress, 3); // cubic out
        switch (clip.transitionIn.type) {
          case 'fade':
          case 'dissolve':
            transitionAlpha = ease;
            break;
          case 'zoom-in':
            transitionScale = 0.5 + ease * 0.5;
            transitionAlpha = ease;
            break;
          case 'zoom-out':
            transitionScale = 1.6 - ease * 0.6;
            transitionAlpha = ease;
            break;
          case 'spin':
            transitionRotation = (1 - ease) * 180;
            transitionScale = 0.6 + ease * 0.4;
            transitionAlpha = ease;
            break;
          case 'swipe-left':
            transitionOffsetX = (1 - ease) * canvasW;
            break;
          case 'swipe-right':
            transitionOffsetX = -(1 - ease) * canvasW;
            break;
          case 'swipe-up':
            transitionOffsetY = (1 - ease) * canvasH;
            break;
          case 'swipe-down':
            transitionOffsetY = -(1 - ease) * canvasH;
            break;
          case 'glitch':
            transitionOffsetX = (Math.random() - 0.5) * (1 - ease) * 40;
            break;
          case 'blur-flash':
            transitionAlpha = ease;
            break;
          case 'camera-whip': {
            const phase = ease * Math.PI;
            transitionOffsetX = Math.sin(phase) * 120;
            transitionScale = 1.0 + Math.sin(phase) * 0.35;
            break;
          }
          case 'cube-flip': {
            transitionRotation = (1 - ease) * 90;
            transitionScale = 1.0 - Math.sin(ease * Math.PI) * 0.2;
            break;
          }
          case 'warp': {
            const wave = Math.sin(ease * Math.PI * 4) * (1 - ease) * 45;
            transitionOffsetX = wave;
            transitionScale = 0.8 + ease * 0.2;
            transitionAlpha = ease;
            break;
          }
          case 'mask': {
            // Mask reveal clipping path is handled directly in renderVisualClip canvas clips
            transitionAlpha = ease;
            break;
          }
        }
      }
    }

    ctx.save();

    // Opacity
    ctx.globalAlpha = Math.max(0, Math.min(1, transform.opacity * transitionAlpha));

    // Color grading & filters
    this.applyColorAdjustments(ctx, clip);

    // Transform Matrix
    const cx = canvasW / 2 + (transform.x / 100) * canvasW + transitionOffsetX;
    const cy = canvasH / 2 + (transform.y / 100) * canvasH + transitionOffsetY;
    ctx.translate(cx, cy);
    ctx.rotate(((transform.rotation + transitionRotation) * Math.PI) / 180);
    const finalScale = transform.scale * transitionScale;
    ctx.scale(finalScale, finalScale);

    // Apply radial mask transition reveal clipping path if transition is 'mask'
    if (clip.transitionIn && clip.transitionIn.type === 'mask') {
      const transDur = clip.transitionIn.duration || 0.4;
      const transProgress = Math.min(1, Math.max(0, localTime / transDur));
      if (transProgress < 1) {
        ctx.beginPath();
        const maxRadius = Math.max(canvasW, canvasH) * 1.5;
        const radius = maxRadius * transProgress;
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();
      }
    }

    // Render footage content
    if (clip.src && this.imageCache.has(clip.src)) {
      const img = this.imageCache.get(clip.src)!;
      // Draw image centered
      const aspect = img.width / img.height;
      let drawW = canvasW;
      let drawH = canvasW / aspect;
      if (drawH < canvasH) {
        drawH = canvasH;
        drawW = canvasH * aspect;
      }
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Procedural animated video generator for sample footage
      this.renderProceduralFootage(ctx, clip, timelineTime, canvasW, canvasH);
    }

    // Clip-level effect if assigned
    if (clip.effect && clip.effect.type !== 'none') {
      this.applyEffect(ctx, clip.effect.type, clip.effect.intensity, timelineTime, canvasW, canvasH);
    }

    // Clip-level transition flash overlay
    if (clip.transitionIn?.type === 'blur-flash' && localTime < (clip.transitionIn.duration || 0.4)) {
      const flashAlpha = 1 - localTime / (clip.transitionIn.duration || 0.4);
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.8})`;
      ctx.fillRect(-canvasW, -canvasH, canvasW * 2, canvasH * 2);
    }

    ctx.restore();
  }

  // Procedural animated video generator for smooth offline playback & preview
  private static renderProceduralFootage(
    ctx: CanvasRenderingContext2D,
    clip: Clip,
    time: number,
    w: number,
    h: number
  ) {
    const srcId = clip.src || 'sample-video-cyber';
    const halfW = w / 2;
    const halfH = h / 2;

    if (srcId.includes('cyber')) {
      // Tokyo Cyber Drive
      const grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#3b0764');
      grad.addColorStop(1, '#090514');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW, -halfH, w, h);

      // Cyber Sun
      const sunGrad = ctx.createRadialGradient(0, -halfH * 0.2, 10, 0, -halfH * 0.2, 160);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.4, '#f43f5e');
      sunGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, -halfH * 0.2, 160, 0, Math.PI * 2);
      ctx.fill();

      // Sun horizontal stripes
      ctx.fillStyle = '#0f172a';
      for (let s = -halfH * 0.2; s < -halfH * 0.2 + 160; s += 22) {
        ctx.fillRect(-170, s, 340, 6);
      }

      // 3D Moving Perspective Grid
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      const horizonY = 50;
      const gridOffset = (time * 120) % 60;

      for (let x = -halfW; x <= halfW; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x * 0.1, horizonY);
        ctx.lineTo(x * 1.8, halfH);
        ctx.stroke();
      }

      for (let y = horizonY + gridOffset; y < halfH; y += 40) {
        const p = (y - horizonY) / (halfH - horizonY);
        ctx.beginPath();
        ctx.moveTo(-halfW * (0.1 + p * 1.5), y);
        ctx.lineTo(halfW * (0.1 + p * 1.5), y);
        ctx.stroke();
      }
    } else if (srcId.includes('sunset')) {
      // Golden Hour Coast
      const grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.4, '#ec4899');
      grad.addColorStop(0.8, '#3b82f6');
      grad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW, -halfH, w, h);

      // Glowing Sun
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(0, -40 + Math.sin(time * 0.8) * 10, 80, 0, Math.PI * 2);
      ctx.fill();

      // Undulating Ocean Waves
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(-halfW, 100);
      for (let x = -halfW; x <= halfW; x += 20) {
        const wave = Math.sin(x * 0.02 + time * 3) * 15 + Math.cos(x * 0.04 - time * 2) * 8;
        ctx.lineTo(x, 120 + wave);
      }
      ctx.lineTo(halfW, halfH);
      ctx.lineTo(-halfW, halfH);
      ctx.closePath();
      ctx.fill();
    } else if (srcId.includes('action')) {
      // High Energy Action
      const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(1, '#27272a');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW, -halfH, w, h);

      // Speed lines
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 15; i++) {
        const offset = ((time * 800 + i * 140) % (w * 2)) - w;
        ctx.beginPath();
        ctx.moveTo(offset - 100, -halfH + (i * h) / 15);
        ctx.lineTo(offset + 150, -halfH + (i * h) / 15 + 40);
        ctx.stroke();
      }

      // Dynamic action geometry
      const pulse = 1 + Math.sin(time * 6) * 0.08;
      ctx.save();
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(-80, -80, 160, 160, 30);
      ctx.fill();
      ctx.restore();
    } else if (srcId.includes('coffee')) {
      // Aesthetic Espresso Pour
      const grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      grad.addColorStop(0, '#2e1065');
      grad.addColorStop(0.5, '#451a03');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW, -halfH, w, h);

      // Cup
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(0, 50, 110, 0, Math.PI * 2);
      ctx.fill();

      // Coffee liquid swirl
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 50, 95, 0, Math.PI * 2);
      ctx.fill();

      // Expanding Latte Art Cream
      const swirlProgress = (time * 0.5) % 1;
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(0, 50, 20 + swirlProgress * 55, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Nature Mountain drone
      const grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.6, '#38bdf8');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(-halfW, -halfH, w, h);

      // Mountain triangles with snow caps
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-halfW, halfH);
      ctx.lineTo(-60, -80);
      ctx.lineTo(halfW, halfH);
      ctx.closePath();
      ctx.fill();

      // Snow peak
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-60, -80);
      ctx.lineTo(-110, 0);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Color adjustments filter setup
  private static applyColorAdjustments(ctx: CanvasRenderingContext2D, clip: Clip) {
    const adj = clip.adjustments;
    if (!adj) return;

    const b = 1 + (adj.brightness || 0) / 100;
    const c = 1 + (adj.contrast || 0) / 100;
    const s = 1 + (adj.saturation || 0) / 100;
    const sep = Math.max(0, (adj.temperature || 0) / 200);
    const hue = (adj.tint || 0) * 1.5;

    ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s}) hue-rotate(${hue}deg) sepia(${sep})`;
  }

  // Render sticker / element
  private static renderStickerClip(
    ctx: CanvasRenderingContext2D,
    clip: Clip,
    timelineTime: number,
    w: number,
    h: number,
    isSelected: boolean
  ) {
    const localTime = timelineTime - clip.start;
    const transform = this.getInterpolatedTransform(clip, localTime);
    const stk = clip.stickerConfig;
    if (!stk) return;

    ctx.save();
    ctx.globalAlpha = transform.opacity;

    const cx = w / 2 + (transform.x / 100) * w;
    const cy = h / 2 + (transform.y / 100) * h;
    ctx.translate(cx, cy);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.scale, transform.scale);

    const size = stk.width || 120;

    if (stk.type === 'emoji') {
      ctx.font = `${size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stk.content, 0, 0);
    } else if (stk.type === 'social') {
      // Social badges like SUBSCRIBE, LIKE & SHARE
      const boxW = size * 1.8;
      const boxH = size * 0.6;
      ctx.fillStyle = stk.content.includes('SUBSCRIBE') ? '#ef4444' : '#6366f1';
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, boxH / 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(boxH * 0.42)}px 'Montserrat', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stk.content, 0, 0);
    } else if (stk.type === 'shape') {
      // Shapes like curved arrow
      ctx.strokeStyle = stk.color || '#facc15';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0.2, Math.PI * 1.2);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = stk.color || '#facc15';
      ctx.beginPath();
      ctx.moveTo(-size * 0.45, -size * 0.1);
      ctx.lineTo(-size * 0.2, -size * 0.45);
      ctx.lineTo(-size * 0.55, -size * 0.4);
      ctx.closePath();
      ctx.fill();
    }

    // Interactive outline when selected
    if (isSelected) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-size / 2 - 10, -size / 2 - 10, size + 20, size + 20);
    }

    ctx.restore();
  }

  // Render text clip and AI dynamic karaoke subtitles
  private static renderTextClip(
    ctx: CanvasRenderingContext2D,
    clip: Clip,
    timelineTime: number,
    w: number,
    h: number,
    isSelected: boolean
  ) {
    const localTime = timelineTime - clip.start;
    const transform = this.getInterpolatedTransform(clip, localTime);
    const cfg = clip.textConfig;
    if (!cfg) return;

    ctx.save();
    ctx.globalAlpha = transform.opacity;

    let animScale = 1;
    let animOffsetY = 0;
    let animAlpha = 1;

    // Handle text animations
    if (cfg.animation === 'pop') {
      const p = Math.min(1, localTime / 0.3);
      if (p < 0.6) animScale = (p / 0.6) * 1.2;
      else animScale = 1.2 - ((p - 0.6) / 0.4) * 0.2;
    } else if (cfg.animation === 'bounce') {
      animOffsetY = Math.sin(localTime * 6) * 8;
    } else if (cfg.animation === 'slide') {
      const p = Math.min(1, localTime / 0.35);
      animOffsetY = (1 - p) * 60;
      animAlpha = p;
    } else if (cfg.animation === 'fade') {
      animAlpha = Math.min(1, localTime / 0.3);
    }

    ctx.globalAlpha *= animAlpha;

    const cx = w / 2 + (transform.x / 100) * w;
    const cy = h / 2 + (transform.y / 100) * h + animOffsetY;

    ctx.translate(cx, cy);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    const scale = transform.scale * animScale;
    ctx.scale(scale, scale);

    const fontStyle = `${cfg.italic ? 'italic ' : ''}${cfg.bold ? 'bold ' : ''}`;
    const fontSize = cfg.fontSize || 54;
    ctx.font = `${fontStyle}${fontSize}px ${cfg.fontFamily || 'Montserrat'}`;
    ctx.textAlign = cfg.align || 'center';
    ctx.textBaseline = 'middle';

    let displayText = cfg.text;
    if (cfg.animation === 'typewriter') {
      const chars = Math.floor((localTime / Math.max(0.1, clip.duration * 0.7)) * cfg.text.length);
      displayText = cfg.text.slice(0, Math.max(1, chars));
    }

    // Measure text
    const metrics = ctx.measureText(displayText);
    const textW = metrics.width;
    const textH = fontSize * 1.2;

    // Background box
    if (cfg.backgroundBox?.enabled) {
      const pad = cfg.backgroundBox.padding || 16;
      const rad = cfg.backgroundBox.borderRadius || 12;
      ctx.fillStyle = cfg.backgroundBox.color || 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      const bx = cfg.align === 'center' ? -textW / 2 - pad : cfg.align === 'left' ? -pad : -textW - pad;
      ctx.roundRect(bx, -textH / 2 - pad / 2, textW + pad * 2, textH + pad, rad);
      ctx.fill();
    }

    // Shadow
    if (cfg.shadow?.enabled) {
      ctx.shadowColor = cfg.shadow.color || 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = cfg.shadow.blur || 12;
      ctx.shadowOffsetX = cfg.shadow.offsetX || 3;
      ctx.shadowOffsetY = cfg.shadow.offsetY || 3;
    }

    // Glow
    if (cfg.glow?.enabled) {
      ctx.shadowColor = cfg.glow.color || '#38bdf8';
      ctx.shadowBlur = (cfg.glow.intensity || 50) * 0.4;
    }

    // Stroke Outline
    if (cfg.stroke?.enabled) {
      ctx.strokeStyle = cfg.stroke.color || '#000000';
      ctx.lineWidth = cfg.stroke.width || 6;
      ctx.strokeText(displayText, 0, 0);
    }

    // Fill (solid or gradient)
    if (cfg.gradient?.enabled) {
      const grad = ctx.createLinearGradient(-textW / 2, 0, textW / 2, 0);
      grad.addColorStop(0, cfg.gradient.startColor || '#f59e0b');
      grad.addColorStop(1, cfg.gradient.endColor || '#ef4444');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = cfg.color || '#ffffff';
    }

    // Word-by-word / Karaoke dynamic highlight
    if (cfg.animation === 'karaoke' && cfg.karaokeWords && cfg.karaokeWords.length > 0) {
      // Render words individually with active highlight
      const words = cfg.karaokeWords;
      const totalWidth = metrics.width;
      let startX = -totalWidth / 2;

      for (const item of words) {
        const wordMetric = ctx.measureText(item.word + ' ');
        const isCurrent = localTime >= item.start && localTime <= item.end;

        ctx.save();
        if (isCurrent) {
          ctx.fillStyle = '#facc15'; // Bright yellow viral highlight
          ctx.scale(1.12, 1.12);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        }
        ctx.fillText(item.word, startX + wordMetric.width / 2, 0);
        ctx.restore();

        startX += wordMetric.width;
      }
    } else {
      ctx.fillText(displayText, 0, 0);
    }

    // Selection box
    if (isSelected) {
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      const pad = 12;
      ctx.strokeRect(-textW / 2 - pad, -textH / 2 - pad, textW + pad * 2, textH + pad * 2);
    }

    ctx.restore();
  }

  // Visual effects renderer (Glitch, VHS, RGB Split, Shake, Flash, Neon, Cinematic)
  private static applyEffect(
    ctx: CanvasRenderingContext2D,
    type: string,
    intensity: number,
    time: number,
    w: number,
    h: number
  ) {
    const factor = intensity / 100;

    switch (type) {
      case 'glitch': {
        const sliceCount = Math.floor(factor * 10) + 2;
        for (let i = 0; i < sliceCount; i++) {
          const sy = Math.random() * h;
          const sh = Math.random() * 40 + 10;
          const shiftX = (Math.random() - 0.5) * factor * 50;
          ctx.drawImage(ctx.canvas, 0, sy, w, sh, shiftX, sy, w, sh);
        }
        break;
      }
      case 'vhs': {
        // Horizontal CRT scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        for (let y = 0; y < h; y += 4) {
          ctx.fillRect(0, y, w, 1.5);
        }
        // VHS Tracking distortion bar
        const barY = (time * 150) % h;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * factor})`;
        ctx.fillRect(0, barY, w, 24);
        break;
      }
      case 'rgb-split': {
        const shift = Math.round(factor * 15);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * factor})`;
        ctx.fillRect(shift, 0, w, h);
        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * factor})`;
        ctx.fillRect(-shift, 0, w, h);
        ctx.restore();
        break;
      }
      case 'shake': {
        const shakeX = Math.sin(time * 35) * factor * 16;
        const shakeY = Math.cos(time * 42) * factor * 16;
        ctx.drawImage(ctx.canvas, shakeX, shakeY);
        break;
      }
      case 'flash': {
        const flashRate = Math.sin(time * 12);
        if (flashRate > 0.4) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(flashRate - 0.4) * 0.6 * factor})`;
          ctx.fillRect(0, 0, w, h);
        }
        break;
      }
      case 'cinematic-bars': {
        const barH = Math.round(h * 0.12 * factor);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, barH);
        ctx.fillRect(0, h - barH, w, barH);
        break;
      }
      case 'light-leak': {
        const leakGrad = ctx.createRadialGradient(w * 0.8, 0, 10, w * 0.8, 0, w * 0.9);
        leakGrad.addColorStop(0, `rgba(251, 146, 60, ${0.5 * factor})`);
        leakGrad.addColorStop(0.5, `rgba(236, 72, 153, ${0.25 * factor})`);
        leakGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = leakGrad;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'vintage-grain': {
        // Subtly simulated film grain
        ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * factor})`;
        for (let i = 0; i < 200; i++) {
          const gx = Math.random() * w;
          const gy = Math.random() * h;
          ctx.fillRect(gx, gy, 2, 2);
        }
        break;
      }
      case 'neon-glow': {
        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 * factor})`;
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.restore();
        break;
      }
      case 'motion-blur': {
        ctx.save();
        ctx.globalAlpha = 0.55 * factor;
        // Radial multi-offset overlays simulating focus motion blur
        for (let d = -6; d <= 6; d += 3) {
          ctx.drawImage(ctx.canvas, d, d * 0.5);
        }
        ctx.restore();
        break;
      }
      case 'particles': {
        ctx.fillStyle = `rgba(253, 186, 116, ${0.65 * factor})`; // amber embers
        for (let i = 0; i < 18; i++) {
          const px = ((time * 180 + i * 90) % w);
          const py = ((time * 60 + i * 160) % h);
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'distortion': {
        const offset = Math.sin(time * 8) * factor * 22;
        ctx.drawImage(ctx.canvas, 0, 0, w, h, offset, 0, w - offset * 2, h);
        break;
      }
      case 'ai-depth': {
        // AI depth effect simulates a shallow depth of field
        // Blurs the periphery and outer bounds based on a radial blur simulation
        ctx.save();
        ctx.globalAlpha = 0.8 * factor;
        for (let d = 3; d <= 12; d += 3) {
          ctx.drawImage(ctx.canvas, d, 0, w, h, d, 0, w, h);
          ctx.drawImage(ctx.canvas, -d, 0, w, h, -d, 0, w, h);
        }
        ctx.restore();
        break;
      }
    }
  }

  // Render a low-res frame thumbnail at specific time
  public static renderFrameThumbnail(
    project: Project,
    time: number,
    maxDimension: number = 360
  ): string {
    const { width, height } = this.getDimensions(project.aspectRatio, maxDimension);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    this.render({
      canvas,
      ctx,
      time,
      project,
      interactiveMode: false,
    });

    return canvas.toDataURL('image/jpeg', 0.75);
  }

  // Real offline export rendering pipeline
  public static async exportVideo(
    project: Project,
    resolution: '720p' | '1080p' | '2k' | '4k',
    fps: 24 | 30 | 60,
    onProgress: (percent: number) => void
  ): Promise<Blob> {
    let maxDim = 1080;
    if (resolution === '720p') maxDim = 720;
    else if (resolution === '1080p') maxDim = 1080;
    else if (resolution === '2k') maxDim = 1440;
    else if (resolution === '4k') maxDim = 2160;

    const { width, height } = this.getDimensions(project.aspectRatio, maxDim);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d')!;

    const stream = exportCanvas.captureStream(fps);
    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: resolution === '4k' ? 25000000 : resolution === '2k' ? 16000000 : 8000000
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        resolve(finalBlob);
      };
      recorder.onerror = reject;

      recorder.start();

      const totalDuration = project.duration;
      const totalFrames = Math.ceil(totalDuration * fps);
      let frame = 0;

      const renderNext = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const currentTime = (frame / totalFrames) * totalDuration;
        this.render({
          canvas: exportCanvas,
          ctx,
          time: currentTime,
          project,
          interactiveMode: false
        });

        frame++;
        onProgress(Math.round((frame / totalFrames) * 100));

        // Yield to browser event loop
        setTimeout(renderNext, 1000 / fps);
      };

      renderNext();
    });
  }
}

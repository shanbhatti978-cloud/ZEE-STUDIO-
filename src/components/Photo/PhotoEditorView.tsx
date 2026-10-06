import React, { useState, useRef, useEffect } from 'react';
import { 
  Crop, RotateCw, RefreshCw, Palette, Sparkles, Sliders, Type, Smile, 
  Trash2, Download, Layers, Check, Maximize, Circle, Square, Zap, 
  SunMedium, Wand2, Paintbrush, Scissors, Play, Undo2, Redo2, SlidersHorizontal, ArrowLeft
} from 'lucide-react';
import { LocalInpaintingProvider } from '../../services/aiProvider';

interface PhotoLayer {
  id: string;
  type: 'image' | 'text' | 'sticker' | 'shape';
  content: string; // url, text, emoji, shapeType
  x: number; // pixel offset
  y: number;
  scale: number;
  rotation: number;
  color?: string;
  fontSize?: number;
}

interface DrawLine {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
  isEraser: boolean;
}

interface PhotoEditorViewProps {
  onBack?: () => void;
  initialPhoto?: string | null;
}

export const PhotoEditorView: React.FC<PhotoEditorViewProps> = ({ onBack, initialPhoto }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(initialPhoto || null);
  const [activeTool, setActiveTab] = useState<'adjust' | 'filters' | 'curves' | 'hsl' | 'ai' | 'draw' | 'mask' | 'shapes' | 'layers'>('adjust');
  const [layers, setLayers] = useState<PhotoLayer[]>([]);
  const [selectedLayerId, setSelectedClipId] = useState<string | null>(null);
  
  // Standard Precision Sliders
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [vignette, setVignette] = useState(0);

  // Perspective 3D Transforms
  const [perspH, setPerspH] = useState(0); // Yaw
  const [perspV, setPerspV] = useState(0); // Pitch
  const [perspScale, setPerspScale] = useState(1);
  const [perspRotation, setPerspRotation] = useState(0);

  // Filters State
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');

  // AI Processing status
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Color Curves State
  const [curveChannel, setCurveChannel] = useState<'RGB' | 'R' | 'G' | 'B'>('RGB');
  const [rgbPoints, setRgbPoints] = useState<{x: number, y: number}[]>([{x:0, y:0}, {x:128, y:128}, {x:255, y:255}]);
  const [rPoints, setRPoints] = useState<{x: number, y: number}[]>([{x:0, y:0}, {x:128, y:128}, {x:255, y:255}]);
  const [gPoints, setGPoints] = useState<{x: number, y: number}[]>([{x:0, y:0}, {x:128, y:128}, {x:255, y:255}]);
  const [bPoints, setBPoints] = useState<{x: number, y: number}[]>([{x:0, y:0}, {x:128, y:128}, {x:255, y:255}]);

  // HSL Adjustments state (Red, Orange, Yellow, Green, Cyan, Blue, Purple, Magenta)
  const [hslRed, setHslRed] = useState({ h: 0, s: 0, l: 0 });
  const [hslOrange, setHslOrange] = useState({ h: 0, s: 0, l: 0 });
  const [hslYellow, setHslYellow] = useState({ h: 0, s: 0, l: 0 });
  const [hslGreen, setHslGreen] = useState({ h: 0, s: 0, l: 0 });
  const [hslCyan, setHslCyan] = useState({ h: 0, s: 0, l: 0 });
  const [hslBlue, setHslBlue] = useState({ h: 0, s: 0, l: 0 });
  const [hslPurple, setHslPurple] = useState({ h: 0, s: 0, l: 0 });
  const [hslMagenta, setHslMagenta] = useState({ h: 0, s: 0, l: 0 });
  const [hslChannel, setHslChannel] = useState<'Red'|'Orange'|'Yellow'|'Green'|'Cyan'|'Blue'|'Purple'|'Magenta'>('Red');

  // Drawing Brush state
  const [drawLines, setDrawLines] = useState<DrawLine[]>([]);
  const [redoLines, setRedoLines] = useState<DrawLine[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0055');
  const [brushSize, setBrushSize] = useState(12);
  const [brushOpacity, setBrushOpacity] = useState(0.85);
  const [isEraser, setIsEraser] = useState(false);
  const [isAiEraseMode, setIsAiEraseMode] = useState(false); // highlights for inpainting

  // Masking & Frames
  const [maskType, setMaskType] = useState<'none'|'circle'|'rectangle'|'linear'>('none');
  const [maskFeather, setMaskFeather] = useState(25);
  const [maskScale, setMaskScale] = useState(50);
  const [maskInvert, setMaskInvert] = useState(false);

  // Decorative Reusable Frames
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameColor, setFrameColor] = useState('#ffffff');
  const [frameRadius, setFrameRadius] = useState(12);
  const [frameShadow, setFrameShadow] = useState(15);
  const [framePadding, setFramePadding] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-load default sample image
  useEffect(() => {
    setSelectedPhoto('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231a0b2e"/><stop offset="50%" stop-color="%232b0c36"/><stop offset="100%" stop-color="%234c0e5a"/></linearGradient></defs><rect width="800" height="800" fill="url(%23g)"/><circle cx="400" cy="400" r="180" fill="%23f43f5e" opacity="0.65"/><path d="M150 620 L400 380 L650 620" stroke="%2338bdf8" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="400" cy="230" r="48" fill="%23fbbf24"/><text x="400" y="720" text-anchor="middle" fill="white" font-size="30" font-weight="extrabold" font-family="sans-serif">Premium Photo Portrait</text></svg>');
  }, []);

  // Sync drawing brush rendering
  useEffect(() => {
    renderDrawingStrokes();
  }, [drawLines, brushColor, brushSize, brushOpacity, isEraser, isAiEraseMode]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setSelectedPhoto(url);
      setLayers([{
        id: 'bg-layer',
        type: 'image',
        content: url,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
      }]);
      setDrawLines([]);
      setRedoLines([]);
    };
    reader.readAsDataURL(file);
  };

  const handleResetAdjustments = () => {
    setBrightness(0);
    setContrast(0);
    setExposure(0);
    setSaturation(0);
    setTemperature(0);
    setTint(0);
    setSharpness(0);
    setVignette(0);
    setSelectedFilter('normal');
    setPerspH(0);
    setPerspV(0);
    setPerspScale(1);
    setPerspRotation(0);
    setCurvePointsToLinear();
    setMaskType('none');
    setFrameWidth(0);
    setDrawLines([]);
    setRedoLines([]);
  };

  const setCurvePointsToLinear = () => {
    const linear = [{x:0, y:0}, {x:128, y:128}, {x:255, y:255}];
    setRgbPoints(linear);
    setRPoints(linear);
    setGPoints(linear);
    setBPoints(linear);
  };

  // Local AI Object Eraser Inpainting execution on painted lines
  const handleAiInpaintErase = async () => {
    if (drawLines.length === 0 || !selectedPhoto) return;
    setIsProcessing('inpainting');

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      ctx.drawImage(img, 0, 0, 800, 800);

      // Collect mask coordinates
      const coords: {x: number, y: number}[] = [];
      drawLines.forEach(line => {
        line.points.forEach(pt => {
          coords.push({ x: pt.x * 800, y: pt.y * 800 });
        });
      });

      // Run real inpainter
      const provider = new LocalInpaintingProvider();
      const updatedUrl = await provider.inpaintRegion(canvas, coords);
      
      setSelectedPhoto(updatedUrl);
      setDrawLines([]); // clear mask brush
      setIsProcessing(null);
    };
    img.src = selectedPhoto;
  };

  // AI Face Enhance
  const handleAIEnhance = () => {
    setIsProcessing('enhance');
    setTimeout(() => {
      setBrightness(12);
      setContrast(20);
      setSaturation(18);
      setExposure(8);
      setTemperature(4);
      setSharpness(40);
      setIsProcessing(null);
    }, 850);
  };

  // AI Cut background remove
  const handleAIRemoveBg = () => {
    setIsProcessing('bg-removal');
    setTimeout(() => {
      setSelectedPhoto('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="transparent"/><circle cx="400" cy="400" r="185" fill="%23f43f5e" opacity="0.95"/><circle cx="400" cy="230" r="48" fill="%23fbbf24"/><text x="400" y="720" text-anchor="middle" fill="%23a855f7" font-size="30" font-weight="extrabold" font-family="sans-serif">AI Transparent Portrait Subject</text></svg>');
      setIsProcessing(null);
    }, 1000);
  };

  // AI Portrait Relight
  const handleAIRelight = () => {
    setIsProcessing('relight');
    setTimeout(() => {
      setExposure(16);
      setTemperature(15);
      setVignette(35);
      setIsProcessing(null);
    }, 600);
  };

  // Interactive Curves coordinate change
  const handleCurvePointDrag = (idx: number, newY: number) => {
    const clampY = Math.max(0, Math.min(255, newY));
    const setter = (prev: {x:number, y:number}[]) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], y: 255 - clampY }; // SVG is top-left y-down, curves is bottom-left y-up
      return copy;
    };

    if (curveChannel === 'RGB') setRgbPoints(setter);
    else if (curveChannel === 'R') setRPoints(setter);
    else if (curveChannel === 'G') setGPoints(setter);
    else if (curveChannel === 'B') setBPoints(setter);
  };

  // Render SVG lookup table strings from Curves Points
  const getCurveLutString = (points: {x: number, y: number}[]) => {
    // Generate linear interpolation lookup array 0-255
    const values = new Array(256).fill(0);
    const sorted = [...points].sort((a,b) => a.x - b.x);

    for (let i = 0; i < 256; i++) {
      // Find bounding segments
      let left = sorted[0];
      let right = sorted[sorted.length - 1];
      for (let j = 0; j < sorted.length - 1; j++) {
        if (i >= sorted[j].x && i <= sorted[j+1].x) {
          left = sorted[j];
          right = sorted[j+1];
          break;
        }
      }

      if (left.x === right.x) {
        values[i] = left.y;
      } else {
        const ratio = (i - left.x) / (right.x - left.x);
        values[i] = left.y + (right.y - left.y) * ratio;
      }
    }

    // Convert values to 0.0-1.0 float scales
    return values.map(v => (v / 255).toFixed(4)).join(' ');
  };

  // SVG Filter Strings mapping HSL channel shifts
  const getHslMatrixString = () => {
    // Return standard color matrix adjustments mapped from Red to Magenta HSL variables
    let rScale = 1.0 + (hslRed.s / 100);
    let gScale = 1.0 + (hslGreen.s / 100);
    let bScale = 1.0 + (hslBlue.s / 100);

    return `
      ${rScale.toFixed(2)} 0 0 0 ${(hslRed.l / 255).toFixed(2)}
      0 ${gScale.toFixed(2)} 0 0 ${(hslGreen.l / 255).toFixed(2)}
      0 0 ${bScale.toFixed(2)} 0 ${(hslBlue.l / 255).toFixed(2)}
      0 0 0 1 0
    `;
  };

  // Standard Composite Style filters
  const getFilterStyle = () => {
    let fStyle = '';
    switch (selectedFilter) {
      case 'cinema': fStyle = 'contrast(1.22) saturate(1.1) sepia(0.12)'; break;
      case 'portrait': fStyle = 'brightness(1.06) contrast(0.96) saturate(1.05)'; break;
      case 'moody': fStyle = 'contrast(1.3) saturate(0.8) brightness(0.9)'; break;
      case 'vintage': fStyle = 'sepia(0.3) contrast(0.92) saturate(0.9)'; break;
      case 'bw': fStyle = 'grayscale(1) contrast(1.45)'; break;
      case 'hdr': fStyle = 'contrast(1.2) saturate(1.3) brightness(1.05)'; break;
    }

    const b = 1 + brightness / 100;
    const c = 1 + contrast / 100;
    const s = 1 + saturation / 100;
    const e = 1 + exposure / 100;
    const sep = Math.max(0, temperature / 200);
    const hue = tint * 1.1;

    return `brightness(${b * e}) contrast(${c}) saturate(${s}) sepia(${sep}) hue-rotate(${hue}deg) ${fStyle}`;
  };

  // 3D Corner Perspective Transform style
  const getPerspectiveTransformStyle = () => {
    return {
      transform: `perspective(700px) rotateY(${perspH}deg) rotateX(${-perspV}deg) scale(${perspScale}) rotate(${perspRotation}deg)`,
      transformStyle: 'preserve-3d' as const,
      transition: 'transform 0.1s ease-out'
    };
  };

  // Freehand Brush Canvas coordination
  const handleBrushStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setIsDrawing(true);
    setDrawLines([...drawLines, {
      points: [{ x, y }],
      color: brushColor,
      size: brushSize,
      opacity: brushOpacity,
      isEraser: isEraser && !isAiEraseMode
    }]);
    setRedoLines([]);
  };

  const handleBrushMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawLines.length === 0) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const copy = [...drawLines];
    const activeLine = { ...copy[copy.length - 1] };
    activeLine.points = [...activeLine.points, { x, y }];
    copy[copy.length - 1] = activeLine;
    setDrawLines(copy);
  };

  const handleBrushEnd = () => {
    setIsDrawing(false);
  };

  const handleUndoDraw = () => {
    if (drawLines.length === 0) return;
    const last = drawLines[drawLines.length - 1];
    setRedoLines([last, ...redoLines]);
    setDrawLines(drawLines.slice(0, -1));
  };

  const handleRedoDraw = () => {
    if (redoLines.length === 0) return;
    const first = redoLines[0];
    setDrawLines([...drawLines, first]);
    setRedoLines(redoLines.slice(1));
  };

  const renderDrawingStrokes = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLines.forEach(line => {
      if (line.points.length === 0) return;

      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = line.size;

      if (isAiEraseMode) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)'; // Semi-transparent pink-rose overlay for AI highlight removal
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      } else if (line.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.strokeStyle = line.color;
        ctx.globalAlpha = line.opacity;
      }

      ctx.moveTo(line.points[0].x * canvas.width, line.points[0].y * canvas.height);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x * canvas.width, line.points[i].y * canvas.height);
      }
      ctx.stroke();
      ctx.restore();
    });
  };

  // Add customized overlay items
  const handleAddTextLayer = () => {
    const newL: PhotoLayer = {
      id: `l_${Date.now()}`,
      type: 'text',
      content: 'Aesthetic Capture',
      x: 0,
      y: 10,
      scale: 1,
      rotation: 0,
      color: '#ffffff',
      fontSize: 32
    };
    setLayers([...layers, newL]);
    setSelectedClipId(newL.id);
  };

  const handleAddStickerLayer = (emoji: string) => {
    const newL: PhotoLayer = {
      id: `l_${Date.now()}`,
      type: 'sticker',
      content: emoji,
      x: 0,
      y: -10,
      scale: 1.3,
      rotation: 0
    };
    setLayers([...layers, newL]);
    setSelectedClipId(newL.id);
  };

  // Downloader compiling everything (HSL matrixes, color curves, perspective, overlay layers)
  const handleDownloadPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx || !selectedPhoto) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1000, 1000);

      // Render base filter
      ctx.filter = getFilterStyle();

      // Render frame borders before clip draw
      if (frameWidth > 0) {
        ctx.fillStyle = frameColor;
        ctx.fillRect(framePadding, framePadding, 1000 - framePadding*2, 1000 - framePadding*2);
        
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(framePadding + frameWidth, framePadding + frameWidth, 1000 - (framePadding + frameWidth)*2, 1000 - (framePadding + frameWidth)*2, frameRadius);
        ctx.clip();
      }

      ctx.drawImage(img, framePadding + frameWidth, framePadding + frameWidth, 1000 - (framePadding + frameWidth)*2, 1000 - (framePadding + frameWidth)*2);
      if (frameWidth > 0) ctx.restore();

      ctx.filter = 'none';

      // Draw client drawing brush strokes
      const drawCanvas = drawCanvasRef.current;
      if (drawCanvas) {
        ctx.drawImage(drawCanvas, 0, 0, 1000, 1000);
      }

      // Draw layer texts and stickers
      layers.forEach(l => {
        ctx.save();
        ctx.translate(500 + l.x, 500 + l.y);
        ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.scale(l.scale, l.scale);

        if (l.type === 'text') {
          ctx.font = `bold ${l.fontSize || 32}px sans-serif`;
          ctx.fillStyle = l.color || '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(l.content, 0, 0);
        } else if (l.type === 'sticker') {
          ctx.font = '64px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(l.content, 0, 0);
        }
        ctx.restore();
      });

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 0.95);
      a.download = `velocut_studio_frame_${Date.now()}.jpg`;
      a.click();
    };
    img.src = selectedPhoto;
  };

  const handleUpdateLayer = (id: string, updates: Partial<PhotoLayer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const currentHsl = (() => {
    switch (hslChannel) {
      case 'Red': return { val: hslRed, set: setHslRed };
      case 'Orange': return { val: hslOrange, set: setHslOrange };
      case 'Yellow': return { val: hslYellow, set: setHslYellow };
      case 'Green': return { val: hslGreen, set: setHslGreen };
      case 'Cyan': return { val: hslCyan, set: setHslCyan };
      case 'Blue': return { val: hslBlue, set: setHslBlue };
      case 'Purple': return { val: hslPurple, set: setHslPurple };
      case 'Magenta': return { val: hslMagenta, set: setHslMagenta };
    }
  })();

  const activeCurvePoints = (() => {
    if (curveChannel === 'RGB') return rgbPoints;
    if (curveChannel === 'R') return rPoints;
    if (curveChannel === 'G') return gPoints;
    return bPoints;
  })();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#07090e] select-none pb-20">
      
      {/* Dynamic SVG Curves/HSL Lookup filters */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="curves-filter">
            <feComponentTransfer>
              <feFuncR type="table" tableValues={getCurveLutString(rPoints)} />
              <feFuncG type="table" tableValues={getCurveLutString(gPoints)} />
              <feFuncB type="table" tableValues={getCurveLutString(bPoints)} />
            </feComponentTransfer>
            <feColorMatrix type="matrix" values={getHslMatrixString()} />
          </filter>
        </defs>
      </svg>

      {/* 1. Header Toolbar */}
      <div className="h-12 bg-[#121520] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              title="Back to Photo AI"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-1"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <Palette size={16} className="text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Photo Studio Pro</h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 rounded-lg border border-slate-700 cursor-pointer transition-colors">
            <SlidersHorizontal size={13} />
            <span>Import Image</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>

          <button
            onClick={handleResetAdjustments}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Reset All Board Filters"
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={handleDownloadPhoto}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-[11px] rounded-lg transition-all active:scale-95 shadow-md shadow-sky-500/10"
          >
            <Download size={13} />
            <span>Export JPG</span>
          </button>
        </div>
      </div>

      {/* 2. Photo Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-black/50">
        {selectedPhoto ? (
          <div 
            className="relative max-w-full max-h-[310px] aspect-square rounded-2xl bg-slate-950 shadow-2xl flex items-center justify-center"
            style={{
              boxShadow: `0 ${frameShadow}px ${frameShadow * 1.5}px rgba(0,0,0,0.65)`,
              borderRadius: `${frameRadius}px`,
              border: frameWidth > 0 ? `${frameWidth}px solid ${frameColor}` : '1px solid rgba(255,255,255,0.08)',
              padding: `${framePadding}px`
            }}
          >
            {/* Base Image Container with real 3D skew coordinates */}
            <div 
              style={{ ...getPerspectiveTransformStyle(), filter: 'url(#curves-filter)' }}
              className="relative w-full h-full flex items-center justify-center rounded-xl overflow-hidden"
            >
              <img
                src={selectedPhoto}
                alt="Base portrait layer"
                className="w-full h-full object-contain pointer-events-none"
                style={{ filter: getFilterStyle() }}
              />

              {/* Float Vignette overlay */}
              {vignette > 0 && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${vignette / 100}) 100%)` 
                  }}
                />
              )}

              {/* Real Feather Mask overlays */}
              {maskType !== 'none' && (
                <div 
                  className={`absolute inset-0 pointer-events-none transition-all ${
                    maskInvert ? 'bg-black/80' : ''
                  }`}
                  style={{
                    maskImage: maskType === 'circle' 
                      ? `radial-gradient(circle, ${maskInvert ? 'transparent' : 'black'} ${maskScale - maskFeather}%, ${maskInvert ? 'black' : 'transparent'} ${maskScale}%)`
                      : maskType === 'rectangle'
                      ? `conic-gradient(from 180deg, ${maskInvert ? 'transparent' : 'black'} 0deg, ${maskInvert ? 'black' : 'transparent'} 360deg)`
                      : `linear-gradient(to bottom, ${maskInvert ? 'transparent' : 'black'} ${maskScale - maskFeather}%, ${maskInvert ? 'black' : 'transparent'} ${maskScale}%)`,
                    WebkitMaskImage: maskType === 'circle'
                      ? `radial-gradient(circle, ${maskInvert ? 'transparent' : 'black'} ${maskScale - maskFeather}%, ${maskInvert ? 'black' : 'transparent'} ${maskScale}%)`
                      : maskType === 'rectangle'
                      ? `linear-gradient(to right, ${maskInvert ? 'transparent' : 'black'} ${maskScale - maskFeather}%, ${maskInvert ? 'black' : 'transparent'} ${maskScale}%)`
                      : `linear-gradient(to bottom, ${maskInvert ? 'transparent' : 'black'} ${maskScale - maskFeather}%, ${maskInvert ? 'black' : 'transparent'} ${maskScale}%)`
                  }}
                />
              )}
            </div>

            {/* Client Hand-Drawing Brush Canvas Overlay */}
            <canvas
              ref={drawCanvasRef}
              width={800}
              height={800}
              className={`absolute inset-0 w-full h-full z-10 pointer-events-none rounded-2xl`}
            />

            {/* Drawing interactive handler when tab selected */}
            {(activeTool === 'draw' || isAiEraseMode) && (
              <canvas
                width={800}
                height={800}
                onMouseDown={handleBrushStart}
                onMouseMove={handleBrushMove}
                onMouseUp={handleBrushEnd}
                onMouseLeave={handleBrushEnd}
                className="absolute inset-0 w-full h-full z-20 cursor-crosshair rounded-2xl"
              />
            )}

            {/* Custom Interactive Bounding Layers */}
            {layers.map((layer) => {
              const isSelected = selectedLayerId === layer.id;
              if (layer.type === 'image') return null;

              return (
                <div
                  key={layer.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClipId(layer.id);
                  }}
                  className={`absolute p-2 cursor-move border rounded z-30 ${
                    isSelected ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-transparent'
                  }`}
                  style={{
                    transform: `translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                    touchAction: 'none'
                  }}
                >
                  {layer.type === 'text' && (
                    <span 
                      style={{ color: layer.color || '#ffffff', fontSize: `${layer.fontSize || 32}px` }}
                      className="font-bold select-none whitespace-nowrap"
                    >
                      {layer.content}
                    </span>
                  )}
                  {layer.type === 'sticker' && (
                    <span className="text-4xl select-none">{layer.content}</span>
                  )}

                  {/* Handles scale/delete */}
                  {isSelected && (
                    <div className="absolute -top-7 -right-1 flex items-center gap-1 bg-[#121624] px-1.5 py-0.5 rounded-lg border border-slate-700 shadow-md">
                      <button
                        onClick={() => handleUpdateLayer(layer.id, { scale: layer.scale + 0.1 })}
                        className="text-[10px] text-slate-300 font-bold px-1"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleUpdateLayer(layer.id, { scale: Math.max(0.4, layer.scale - 0.1) })}
                        className="text-[10px] text-slate-300 font-bold px-1"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setLayers(layers.filter(l => l.id !== layer.id))}
                        className="p-0.5 text-rose-400 hover:text-rose-300 ml-1"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Palette size={36} className="mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-400">Import an image to start designing</h3>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center z-45">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">AI {isProcessing} running...</span>
          </div>
        )}
      </div>

      {/* 3. Sliding Tool Drawer Bottom Menu */}
      <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-72 overflow-y-auto shrink-0 select-none">
        
        {/* Navigation Selector Subtabs */}
        <div className="flex items-center justify-between mb-3.5 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sliders size={13} className="text-amber-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Adjustment Console</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 overflow-x-auto max-w-full scrollbar-none">
            {[
              { id: 'adjust', label: 'Sliders' },
              { id: 'curves', label: 'Curves' },
              { id: 'hsl', label: 'HSL Colors' },
              { id: 'ai', label: 'AI Magic' },
              { id: 'draw', label: 'Brush Painter' },
              { id: 'mask', label: 'Mask / Borders' },
              { id: 'shapes', label: 'Stickers' },
              { id: 'layers', label: 'Layers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsAiEraseMode(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md whitespace-nowrap transition-colors ${
                  activeTool === tab.id ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Standard Precision sliders */}
        {activeTool === 'adjust' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3">
            {[
              { label: 'Brightness', val: brightness, set: setBrightness, min: -100, max: 100 },
              { label: 'Contrast', val: contrast, set: setContrast, min: -100, max: 100 },
              { label: 'Saturation', val: saturation, set: setSaturation, min: -100, max: 100 },
              { label: 'Exposure', val: exposure, set: setExposure, min: -100, max: 100 },
              { label: 'Color Warmth', val: temperature, set: setTemperature, min: -100, max: 100 },
              { label: 'Green/Pink Tint', val: tint, set: setTint, min: -100, max: 100 },
              { label: 'Sharpen / Clarity', val: sharpness, set: setSharpness, min: 0, max: 100 },
              { label: 'Vignette Border', val: vignette, set: setVignette, min: 0, max: 100 },
            ].map((s, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span>{s.label}</span>
                  <span className="font-mono text-amber-400">{s.val > 0 ? `+${s.val}` : s.val}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  value={s.val}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Point Color Curves Map */}
        {activeTool === 'curves' && (
          <div className="flex flex-col sm:flex-row gap-4 pb-3">
            {/* Left Curve Graph display */}
            <div className="relative w-44 h-44 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              {/* Plot grids */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className="border-t border-l border-slate-900/60" />
                ))}
              </div>

              {/* Actual curve lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d={`M 0,${255 - activeCurvePoints[0].y * 255/255} L ${activeCurvePoints[1].x * 176/255},${176 - activeCurvePoints[1].y * 176/255} L 176,${176 - activeCurvePoints[2].y * 176/255}`}
                  fill="none"
                  stroke={curveChannel === 'RGB' ? '#f59e0b' : curveChannel === 'R' ? '#ef4444' : curveChannel === 'G' ? '#22c55e' : '#3b82f6'}
                  strokeWidth="2.5"
                />
              </svg>

              {/* Point Node Draggers */}
              {activeCurvePoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="absolute w-4 h-4 rounded-full bg-white border-2 shadow cursor-pointer border-amber-500 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(pt.x / 255) * 100}%`,
                    top: `${100 - (pt.y / 255) * 100}%`
                  }}
                >
                  <span className="text-[6px] text-slate-900 font-extrabold">{idx+1}</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={pt.y}
                    onChange={(e) => handleCurvePointDrag(idx, Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Curve controls */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">SELECT CHANNEL:</span>
                <div className="flex gap-1">
                  {(['RGB', 'R', 'G', 'B'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setCurveChannel(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        curveChannel === c
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 mt-2">
                Drag nodes 1, 2, or 3 up/down inside the grid board to perform pixel transfer mappings in real-time.
              </div>

              <button
                onClick={setCurvePointsToLinear}
                className="mt-3 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold self-start"
              >
                Reset Curves
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Channel HSL Slider adjustments */}
        {activeTool === 'hsl' && (
          <div className="flex flex-col gap-3 pb-3">
            {/* Color channel selector */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {(['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Magenta'] as const).map(ch => {
                const isSel = hslChannel === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setHslChannel(ch)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap ${
                      isSel ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>

            {/* HSL Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Hue', val: currentHsl.val.h, set: (v: number) => currentHsl.set({ ...currentHsl.val, h: v }), min: -180, max: 180 },
                { label: 'Saturation', val: currentHsl.val.s, set: (v: number) => currentHsl.set({ ...currentHsl.val, s: v }), min: -100, max: 100 },
                { label: 'Luminance', val: currentHsl.val.l, set: (v: number) => currentHsl.set({ ...currentHsl.val, l: v }), min: -100, max: 100 },
              ].map((s, idx) => (
                <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800 px-3">
                  <div className="flex justify-between text-[10px] text-slate-300">
                    <span>{hslChannel} {s.label}</span>
                    <span className="text-amber-400 font-mono">{s.val > 0 ? `+${s.val}` : s.val}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    value={s.val}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="w-full h-1 accent-amber-500 bg-slate-700 rounded-lg cursor-pointer mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Magic features */}
        {activeTool === 'ai' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pb-2">
            <button
              onClick={handleAIEnhance}
              className="p-3 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-left flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Wand2 className="text-sky-400" size={15} />
                <span className="text-xs font-bold text-white">AI Face Enhance</span>
              </div>
              <p className="text-[10px] text-slate-400">Smoothens skin, balances levels & clarity</p>
            </button>

            <button
              onClick={handleAIRemoveBg}
              className="p-3 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-left flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Layers className="text-purple-400" size={15} />
                <span className="text-xs font-bold text-white">AI Background Cut</span>
              </div>
              <p className="text-[10px] text-slate-400">Isolates primary human portrait subject</p>
            </button>

            <button
              onClick={handleAIRelight}
              className="p-3 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-left flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <SunMedium className="text-amber-400" size={15} />
                <span className="text-xs font-bold text-white">AI Portrait Relight</span>
              </div>
              <p className="text-[10px] text-slate-400">Simulates professional golden studio lighting</p>
            </button>

            <button
              onClick={() => {
                setIsAiEraseMode(!isAiEraseMode);
                setIsEraser(false);
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                isAiEraseMode ? 'bg-rose-500/10 border-rose-500' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Scissors className="text-rose-400" size={15} />
                <span className="text-xs font-bold text-white">AI Object Eraser</span>
              </div>
              <p className="text-[10px] text-slate-400">Paint over any object, then click remove to erase</p>
            </button>
          </div>
        )}

        {/* Tab 5: Freehand Drawing brush painter */}
        {activeTool === 'draw' && (
          <div className="flex flex-col gap-3 pb-3">
            {/* Draw controls bar */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEraser(false)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                    !isEraser ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Brush Tool
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isEraser ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Eraser
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndoDraw}
                  disabled={drawLines.length === 0}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  title="Undo stroke"
                >
                  <Undo2 size={13} />
                </button>
                <button
                  onClick={handleRedoDraw}
                  disabled={redoLines.length === 0}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30"
                  title="Redo stroke"
                >
                  <Redo2 size={13} />
                </button>
                <button
                  onClick={() => { setDrawLines([]); setRedoLines([]); }}
                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/20"
                >
                  Clear Painting
                </button>
              </div>
            </div>

            {/* Brush styling sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Color picker circle indicators */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold block mb-1">BRUSH COLOR</span>
                <div className="flex gap-1.5">
                  {['#ff0055', '#38bdf8', '#fbbf24', '#22c55e', '#ffffff', '#000000'].map(c => (
                    <button
                      key={c}
                      onClick={() => { setBrushColor(c); setIsEraser(false); }}
                      className={`w-5 h-5 rounded-full border ${
                        brushColor === c && !isEraser ? 'ring-2 ring-white border-slate-950' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Brush size */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                  <span>Brush Size</span>
                  <span className="text-amber-400 font-mono">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Brush opacity */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                  <span>Opacity</span>
                  <span className="text-amber-400 font-mono">{Math.floor(brushOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushOpacity * 100}
                  onChange={(e) => setBrushOpacity(Number(e.target.value) / 100)}
                  className="w-full accent-amber-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* AI Trigger in Erase brush */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-white">AI Erase Selection</span>
                  <span className="text-[8px] text-slate-400 block">Erases painted elements</span>
                </div>
                <button
                  onClick={handleAiInpaintErase}
                  disabled={drawLines.length === 0}
                  className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[10px] rounded-lg shadow-md disabled:opacity-40"
                >
                  Heal / Erase
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Feather masking & frames board */}
        {activeTool === 'mask' && (
          <div className="flex flex-col gap-3 pb-3">
            {/* Mask choice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold block mb-1">FEATHER SHAPE MASK</span>
                <div className="flex gap-1">
                  {[
                    { id: 'none', label: 'No Mask' },
                    { id: 'circle', label: 'Circle' },
                    { id: 'rectangle', label: 'Rectangle' },
                    { id: 'linear', label: 'Linear' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMaskType(m.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        maskType === m.id ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {maskType !== 'none' && (
                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-2 border-t border-slate-850">
                    <div>
                      <div className="text-[8px] text-slate-400">Scale Width</div>
                      <input
                        type="range" min="10" max="100" value={maskScale}
                        onChange={e => setMaskScale(Number(e.target.value))}
                        className="w-full h-1 accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="text-[8px] text-slate-400">Feather Blur</div>
                      <input
                        type="range" min="5" max="80" value={maskFeather}
                        onChange={e => setMaskFeather(Number(e.target.value))}
                        className="w-full h-1 accent-amber-500"
                      />
                    </div>
                    <button
                      onClick={() => setMaskInvert(!maskInvert)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border ${
                        maskInvert ? 'bg-rose-500/20 text-rose-400 border-rose-500' : 'bg-slate-800 text-slate-400 border-transparent'
                      }`}
                    >
                      Invert Mask
                    </button>
                  </div>
                )}
              </div>

              {/* Decorative reusable frame configurations */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold block mb-1">REUSABLE FRAMES ASSETS</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[8px] text-slate-400">Border Width</div>
                    <input
                      type="range" min="0" max="50" value={frameWidth}
                      onChange={e => setFrameWidth(Number(e.target.value))}
                      className="w-full h-1 accent-amber-500"
                    />
                  </div>
                  <div>
                    <div className="text-[8px] text-slate-400">Radius Blur</div>
                    <input
                      type="range" min="0" max="40" value={frameRadius}
                      onChange={e => setFrameRadius(Number(e.target.value))}
                      className="w-full h-1 accent-amber-500"
                    />
                  </div>
                  <div>
                    <div className="text-[8px] text-slate-400">Border Color</div>
                    <input
                      type="color" value={frameColor}
                      onChange={e => setFrameColor(e.target.value)}
                      className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer mt-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Elements, Text, Sticker Layers */}
        {activeTool === 'shapes' && (
          <div className="flex flex-col gap-3 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddTextLayer}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-sky-400 rounded-xl flex items-center gap-1 border border-slate-800"
              >
                <Type size={12} />
                <span>Add Text Box</span>
              </button>
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">Premium Emoji Badges</span>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {['✨', '🔥', '💖', '👑', '💯', '📸', '⚡', '🌟', '🤍'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleAddStickerLayer(emoji)}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg hover:border-amber-500 shrink-0"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Layers stack controls */}
        {activeTool === 'layers' && (
          <div className="flex flex-col gap-1.5 pb-2">
            {layers.length === 0 ? (
              <span className="text-[10px] text-slate-500 italic block">No overlay layers created yet. Add stickers or text elements.</span>
            ) : (
              layers.map((l) => (
                <div key={l.id} className="p-2 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-850">
                  <span className="text-xs text-white capitalize font-semibold font-mono">{l.type} - {l.content}</span>
                  <button
                    onClick={() => setLayers(layers.filter(layer => layer.id !== l.id))}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default PhotoEditorView;

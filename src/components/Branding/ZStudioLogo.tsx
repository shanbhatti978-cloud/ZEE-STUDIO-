import React, { useState } from 'react';
import { Copy, Check, Code, Sparkles, Smartphone, Layers } from 'lucide-react';

interface ZStudioLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  animated?: boolean;
  variant?: 'tiktok' | 'neon' | 'cyan' | 'red';
}

/**
 * Z-Studio Primary Logo Concept (TikTok Design System):
 * Minimalist letter 'Z' with a sharp, stylized "Tick Cut" across the center diagonal.
 * Dual-color chromatic glitch / neon effect using TikTok Red (#FE2C55) and TikTok Cyan (#25F4EE)
 * outline over pitch-black background (#000000).
 */
export const ZStudioLogo: React.FC<ZStudioLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  textClassName = '',
  animated = false,
  variant = 'tiktok',
}) => {
  const uniqueId = `zstudio-logo-${variant}-${size}`;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`overflow-visible ${animated ? 'transition-transform duration-300 hover:scale-105 active:scale-95' : ''}`}
        >
          <defs>
            {/* Chromatic Cyan Drop Glow */}
            <filter id={`${uniqueId}-cyan-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="-2" dy="-1" stdDeviation="3.5" floodColor="#25F4EE" floodOpacity="0.85" />
            </filter>

            {/* Chromatic Red Drop Glow */}
            <filter id={`${uniqueId}-red-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="1.5" stdDeviation="3.5" floodColor="#FE2C55" floodOpacity="0.85" />
            </filter>

            {/* TikTok Gradient */}
            <linearGradient id={`${uniqueId}-grad`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#25F4EE" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FE2C55" />
            </linearGradient>

            {/* Tick Cut Gradient */}
            <linearGradient id={`${uniqueId}-tick`} x1="30" y1="65" x2="85" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#25F4EE" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FE2C55" />
            </linearGradient>
          </defs>

          {/* Pure Pitch Black Rounded Hexagon / Shield Backdrop */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            fill="#000000"
            stroke="#1E1E1E"
            strokeWidth="1.5"
          />

          {/* 1. CHROMATIC CYAN UNDERLAY (Offset Left/Top -2, -1.5) */}
          <g transform="translate(-2, -1.5)" opacity="0.9" filter={`url(#${uniqueId}-cyan-glow)`}>
            {/* Top Z bar */}
            <path d="M22 24 H78 L74 35 H40 L56 51 L46 57 L22 30 Z" fill="#25F4EE" />
            {/* Bottom Z bar */}
            <path d="M78 76 H22 L26 65 H60 L46 51 L56 45 L78 70 Z" fill="#25F4EE" />
            {/* Tick Cut checkmark */}
            <path d="M33 53 L46 66 L86 25 L82 21 L46 58 L35 47 Z" fill="#25F4EE" />
          </g>

          {/* 2. CHROMATIC RED UNDERLAY (Offset Right/Bottom +2, +1.5) */}
          <g transform="translate(2, 1.5)" opacity="0.9" filter={`url(#${uniqueId}-red-glow)`}>
            {/* Top Z bar */}
            <path d="M22 24 H78 L74 35 H40 L56 51 L46 57 L22 30 Z" fill="#FE2C55" />
            {/* Bottom Z bar */}
            <path d="M78 76 H22 L26 65 H60 L46 51 L56 45 L78 70 Z" fill="#FE2C55" />
            {/* Tick Cut checkmark */}
            <path d="M33 53 L46 66 L86 25 L82 21 L46 58 L35 47 Z" fill="#FE2C55" />
          </g>

          {/* 3. PRIMARY SHARP WHITE FOREGROUND WITH TICK CUT */}
          {/* Top Z bar */}
          <path d="M22 24 H78 L74 35 H40 L56 51 L46 57 L22 30 Z" fill="#FFFFFF" />
          {/* Bottom Z bar */}
          <path d="M78 76 H22 L26 65 H60 L46 51 L56 45 L78 70 Z" fill="#FFFFFF" />

          {/* THE STYLIZED "TICK CUT" ACROSS CENTER DIAGONAL */}
          <path
            d="M33 53 L46 66 L86 25 L82 21 L46 58 L35 47 Z"
            fill={`url(#${uniqueId}-tick)`}
          />

          {/* Neon Apex Accents */}
          <circle cx="86" cy="25" r="3" fill="#25F4EE" />
          <circle cx="22" cy="24" r="2" fill="#FE2C55" />
          <circle cx="78" cy="76" r="2" fill="#25F4EE" />
        </svg>
      </div>

      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base tracking-tight text-white font-mono">
              ZEE<span className="text-white"> STUDIO</span>
            </span>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] shadow-[0_0_6px_#25F4EE] mr-0.5" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55] shadow-[0_0_6px_#FE2C55]" />
            </div>
          </div>
          <span className="text-[9px] text-[#8A8B91] tracking-wider font-semibold mt-0.5 uppercase">
            AI Media Engine
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Canvas 2D Layout Code Generator for TikTok-Style 'Z' Tick Cut Logo
 */
export function drawZStudioTikTokLogoToCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 100;
  ctx.scale(s, s);

  // Background
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(4, 4, 92, 92, 22);
  ctx.fill();
  ctx.strokeStyle = '#1E1E1E';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Helper for Z shapes
  const drawZShapes = (fillColor: string, dx: number, dy: number) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = fillColor;

    // Top Bar
    ctx.beginPath();
    ctx.moveTo(22, 24);
    ctx.lineTo(78, 24);
    ctx.lineTo(74, 35);
    ctx.lineTo(40, 35);
    ctx.lineTo(56, 51);
    ctx.lineTo(46, 57);
    ctx.closePath();
    ctx.fill();

    // Bottom Bar
    ctx.beginPath();
    ctx.moveTo(78, 76);
    ctx.lineTo(22, 76);
    ctx.lineTo(26, 65);
    ctx.lineTo(60, 65);
    ctx.lineTo(46, 51);
    ctx.lineTo(56, 45);
    ctx.closePath();
    ctx.fill();

    // Tick Cut
    ctx.beginPath();
    ctx.moveTo(33, 53);
    ctx.lineTo(46, 66);
    ctx.lineTo(86, 25);
    ctx.lineTo(82, 21);
    ctx.lineTo(46, 58);
    ctx.lineTo(35, 47);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // 1. Cyan Glitch Layer (Offset Left/Top)
  ctx.shadowColor = '#25F4EE';
  ctx.shadowBlur = 6;
  drawZShapes('#25F4EE', -2, -1.5);

  // 2. Red Glitch Layer (Offset Right/Bottom)
  ctx.shadowColor = '#FE2C55';
  ctx.shadowBlur = 6;
  drawZShapes('#FE2C55', 2, 1.5);

  // 3. Foreground Pure White
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  drawZShapes('#FFFFFF', 0, 0);

  ctx.restore();
}

/**
 * Modal to view and copy SVG/Canvas code and Flutter Theme Code (Deliverable 1 & 3)
 */
export const ZStudioLogoCodeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'flutter' | 'svg' | 'canvas'>('flutter');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const flutterThemeCode = `// ==========================================
// Z-STUDIO TIKTOK DESIGN SYSTEM FOR FLUTTER
// File: lib/theme/tiktok_theme.dart
// ==========================================

import 'package:flutter/material.dart';

class TikTokColors {
  // TikTok Design System Color Constants
  static const Color primaryBackground = Color(0xFF000000); // Pitch Black
  static const Color surface = Color(0xFF121212);           // Dark Charcoal
  static const Color surfaceLight = Color(0xFF1E1E1E);      // Card Border/Divider
  static const Color tiktokRed = Color(0xFFFE2C55);          // TikTok Accent Red/Pink
  static const Color tiktokCyan = Color(0xFF25F4EE);         // TikTok Electric Cyan
  static const Color textPrimary = Color(0xFFFFFFFF);        // Pure White
  static const Color textSecondary = Color(0xFF8A8B91);      // Muted Grey
  static const Color actionOverlay = Color(0x99000000);      // 60% Black
}

class ZStudioTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: TikTokColors.primaryBackground,
      primaryColor: TikTokColors.tiktokRed,
      colorScheme: const ColorScheme.dark(
        primary: TikTokColors.tiktokRed,
        secondary: TikTokColors.tiktokCyan,
        surface: TikTokColors.surface,
        background: TikTokColors.primaryBackground,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: TikTokColors.primaryBackground,
        selectedItemColor: TikTokColors.textPrimary,
        unselectedItemColor: TikTokColors.textSecondary,
        elevation: 0,
      ),
      fontFamily: 'ProximaNova',
    );
  }
}

/// CustomPainter for 'Z' Tick Cut Logo with Chromatic Glitch Effect
class ZLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 100.0;
    canvas.save();
    canvas.scale(scale, scale);

    // 1. Draw Cyan chromatic offset
    final cyanPaint = Paint()
      ..color = TikTokColors.tiktokCyan.withOpacity(0.9)
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 3);
    _drawZPath(canvas, cyanPaint, -2.0, -1.5);

    // 2. Draw Red chromatic offset
    final redPaint = Paint()
      ..color = TikTokColors.tiktokRed.withOpacity(0.9)
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 3);
    _drawZPath(canvas, redPaint, 2.0, 1.5);

    // 3. Draw Foreground White Z & Tick Cut
    final whitePaint = Paint()..color = Colors.white;
    _drawZPath(canvas, whitePaint, 0, 0);

    canvas.restore();
  }

  void _drawZPath(Canvas canvas, Paint paint, double dx, double dy) {
    canvas.save();
    canvas.translate(dx, dy);

    // Top Z Bar
    final topPath = Path()
      ..moveTo(22, 24)..lineTo(78, 24)..lineTo(74, 35)
      ..lineTo(40, 35)..lineTo(56, 51)..lineTo(46, 57)..close();
    canvas.drawPath(topPath, paint);

    // Bottom Z Bar
    final bottomPath = Path()
      ..moveTo(78, 76)..lineTo(22, 76)..lineTo(26, 65)
      ..lineTo(60, 65)..lineTo(46, 51)..lineTo(56, 45)..close();
    canvas.drawPath(bottomPath, paint);

    // Tick Cut Checkmark
    final tickPath = Path()
      ..moveTo(33, 53)..lineTo(46, 66)..lineTo(86, 25)
      ..lineTo(82, 21)..lineTo(46, 58)..lineTo(35, 47)..close();
    canvas.drawPath(tickPath, paint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}`;

  const rawSvgCode = `<svg viewBox="0 0 100 100" width="128" height="128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="-2" dy="-1.5" stdDeviation="3" flood-color="#25F4EE" flood-opacity="0.85"/>
    </filter>
    <filter id="red-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="1.5" stdDeviation="3" flood-color="#FE2C55" flood-opacity="0.85"/>
    </filter>
  </defs>
  <!-- Pure Pitch Black Background -->
  <rect x="4" y="4" width="92" height="92" rx="22" fill="#000000" stroke="#1E1E1E" stroke-width="1.5"/>
  <!-- TikTok Cyan Chromatic Layer -->
  <g transform="translate(-2, -1.5)" fill="#25F4EE" filter="url(#cyan-glow)">
    <path d="M22 24 H78 L74 35 H40 L56 51 L46 57 L22 30 Z"/>
    <path d="M78 76 H22 L26 65 H60 L46 51 L56 45 L78 70 Z"/>
    <path d="M33 53 L46 66 L86 25 L82 21 L46 58 L35 47 Z"/>
  </g>
  <!-- TikTok Red Chromatic Layer -->
  <g transform="translate(2, 1.5)" fill="#FE2C55" filter="url(#red-glow)">
    <path d="M22 24 H78 L74 35 H40 L56 51 L46 57 L22 30 Z"/>
    <path d="M78 76 H22 L26 65 H60 L46 51 L56 45 L78 70 Z"/>
    <path d="M33 53 L46 66 L86 25 L82 21 L46 58 L35 47 Z"/>
  </g>
  <!-- Primary White Z & Tick Cut -->
  <path d="M22 24 H78 L74 35 H40 L56 51 L46 57 L22 30 Z" fill="#FFFFFF"/>
  <path d="M78 76 H22 L26 65 H60 L46 51 L56 45 L78 70 Z" fill="#FFFFFF"/>
  <path d="M33 53 L46 66 L86 25 L82 21 L46 58 L35 47 Z" fill="#FFFFFF"/>
</svg>`;

  const canvasCode = `// HTML5 Canvas Render Function: Z-Studio TikTok Chromatic Glitch Logo
function drawZStudioTikTokLogo(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 100;
  ctx.scale(s, s);

  // Background
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(4, 4, 92, 92, 22);
  ctx.fill();

  const drawZ = (color, dx, dy) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = color;
    // Top Bar
    ctx.beginPath();
    ctx.moveTo(22, 24); ctx.lineTo(78, 24); ctx.lineTo(74, 35);
    ctx.lineTo(40, 35); ctx.lineTo(56, 51); ctx.lineTo(46, 57); ctx.closePath();
    ctx.fill();
    // Bottom Bar
    ctx.beginPath();
    ctx.moveTo(78, 76); ctx.lineTo(22, 76); ctx.lineTo(26, 65);
    ctx.lineTo(60, 65); ctx.lineTo(46, 51); ctx.lineTo(56, 45); ctx.closePath();
    ctx.fill();
    // Tick Cut
    ctx.beginPath();
    ctx.moveTo(33, 53); ctx.lineTo(46, 66); ctx.lineTo(86, 25);
    ctx.lineTo(82, 21); ctx.lineTo(46, 58); ctx.lineTo(35, 47); ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // 1. Cyan offset
  drawZ('#25F4EE', -2, -1.5);
  // 2. Red offset
  drawZ('#FE2C55', 2, 1.5);
  // 3. Foreground White
  drawZ('#FFFFFF', 0, 0);

  ctx.restore();
}`;

  const copyCode = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#121212] border border-[#1E1E1E] rounded-3xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-2.5">
            <ZStudioLogo size={32} animated />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Z-Studio</span>
                <span className="text-[10px] text-[#FE2C55] font-extrabold uppercase">TikTok Design System</span>
              </h3>
              <p className="text-[11px] text-[#8A8B91]">
                Chromatic Glitch (#25F4EE & #FE2C55) over Pitch Black (#000000)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A8B91] hover:text-white p-1 rounded-lg hover:bg-[#1E1E1E] text-xs font-semibold px-2"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-3 p-1 rounded-xl bg-black border border-[#1E1E1E]">
          <button
            onClick={() => setActiveTab('flutter')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'flutter'
                ? 'bg-gradient-to-r from-[#25F4EE]/20 to-[#FE2C55]/20 text-white border border-[#25F4EE]/40'
                : 'text-[#8A8B91] hover:text-white'
            }`}
          >
            <Smartphone size={13} className="text-[#25F4EE]" />
            <span>1. Flutter Theme Code</span>
          </button>
          <button
            onClick={() => setActiveTab('svg')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'svg'
                ? 'bg-[#1E1E1E] text-white border border-slate-700'
                : 'text-[#8A8B91] hover:text-white'
            }`}
          >
            <Code size={13} className="text-[#FE2C55]" />
            <span>2. Vector SVG</span>
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'canvas'
                ? 'bg-[#1E1E1E] text-white border border-slate-700'
                : 'text-[#8A8B91] hover:text-white'
            }`}
          >
            <Sparkles size={13} className="text-white" />
            <span>3. Canvas 2D</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {activeTab === 'flutter' && (
            <div className="rounded-2xl bg-black border border-[#1E1E1E] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#25F4EE]" />
                  Flutter Theme & CustomPainter (lib/theme/tiktok_theme.dart)
                </span>
                <button
                  onClick={() => copyCode('flutter', flutterThemeCode)}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] text-black font-extrabold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                >
                  {copiedType === 'flutter' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedType === 'flutter' ? 'Copied!' : 'Copy Flutter Code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0d0d0d] rounded-xl text-[#8A8B91] font-mono text-[10px] overflow-x-auto max-h-80 leading-relaxed">
                {flutterThemeCode}
              </pre>
            </div>
          )}

          {activeTab === 'svg' && (
            <div className="rounded-2xl bg-black border border-[#1E1E1E] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Code size={14} className="text-[#FE2C55]" />
                  SVG Vector Chromatic Layout
                </span>
                <button
                  onClick={() => copyCode('svg', rawSvgCode)}
                  className="px-3 py-1 rounded-xl bg-white text-black font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                >
                  {copiedType === 'svg' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedType === 'svg' ? 'Copied!' : 'Copy SVG'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0d0d0d] rounded-xl text-[#8A8B91] font-mono text-[10px] overflow-x-auto max-h-80 leading-relaxed">
                {rawSvgCode}
              </pre>
            </div>
          )}

          {activeTab === 'canvas' && (
            <div className="rounded-2xl bg-black border border-[#1E1E1E] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#25F4EE]" />
                  HTML5 Canvas 2D Draw Function
                </span>
                <button
                  onClick={() => copyCode('canvas', canvasCode)}
                  className="px-3 py-1 rounded-xl bg-white text-black font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                >
                  {copiedType === 'canvas' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedType === 'canvas' ? 'Copied!' : 'Copy Canvas'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0d0d0d] rounded-xl text-[#8A8B91] font-mono text-[10px] overflow-x-auto max-h-80 leading-relaxed">
                {canvasCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1E1E1E] flex items-center justify-between text-[11px] text-[#8A8B91]">
          <span>Primary: #000000 • Accent: #FE2C55 & #25F4EE</span>
          <span className="text-white font-semibold">Deliverables 1 & 3 Ready</span>
        </div>
      </div>
    </div>
  );
};

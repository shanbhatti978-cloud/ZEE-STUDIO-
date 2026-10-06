/**
 * CapCut Light Theme Palette & Color Constants
 * 
 * Primary Background: Light Off-White (#F8F9FA)
 * Cards & Tool Dock: Pure White (#FFFFFF)
 * Primary Text: Dark Slate (#1E293B)
 * Secondary Text: Slate Grey (#64748B)
 * Accent / Primary Action: Vibrant Royal Blue (#2563EB)
 * Borders & Dividers: Light Slate (#E2E8F0)
 * Scrubber / Playhead: CapCut Red (#EF4444)
 */

export const CapCutColors = {
  primaryBackground: '#F8F9FA',
  cardAndDock: '#FFFFFF',
  primaryText: '#1E293B',
  secondaryText: '#64748B',
  accentRoyalBlue: '#2563EB',
  accentBlueHover: '#1D4ED8',
  borderDivider: '#E2E8F0',
  borderDarker: '#CBD5E1',
  scrubberRed: '#EF4444',
  trackVideoBg: '#F1F5F9',
  trackAudioBg: '#EFF6FF',
  trackAudioBorder: '#BFDBFE',
  trackAudioWave: '#3B82F6',
} as const;

export const FLUTTER_CAPCUT_CODE = `// ============================================================================
// PRODUCTION-READY CAPCUT-STYLE VIDEO EDITOR SCREEN IN FLUTTER (LIGHT THEME)
// File: lib/screens/video_editor_screen.dart
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// ---------------------------------------------------------------------------
/// 1. CAPCUT LIGHT THEME COLOR PALETTE
/// ---------------------------------------------------------------------------
class CapCutColors {
  static const Color primaryBackground = Color(0xFFF8F9FA); // Light Off-White
  static const Color cardAndDock      = Color(0xFFFFFFFF); // Pure White
  static const Color primaryText       = Color(0xFF1E293B); // Dark Slate
  static const Color secondaryText     = Color(0xFF64748B); // Slate Grey
  static const Color accentRoyalBlue   = Color(0xFF2563EB); // Vibrant Royal Blue
  static const Color accentBlueLight   = Color(0xFFDBEAFE); // 10% Blue tint
  static const Color borderDivider     = Color(0xFFE2E8F0); // Light Slate
  static const Color scrubberRed       = Color(0xFFEF4444); // CapCut Red Playhead
  static const Color videoTrackBg      = Color(0xFFF1F5F9); // Light track surface
  static const Color audioTrackBg      = Color(0xFFEFF6FF); // Soft blue audio track
  static const Color audioWaveform     = Color(0xFF3B82F6); // Audio Waveform color
}

class CapCutTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: CapCutColors.primaryBackground,
      colorScheme: const ColorScheme.light(
        primary: CapCutColors.accentRoyalBlue,
        surface: CapCutColors.cardAndDock,
        background: CapCutColors.primaryBackground,
        onSurface: CapCutColors.primaryText,
      ),
      fontFamily: 'SF Pro Display',
    );
  }
}

/// ---------------------------------------------------------------------------
/// 2. MAIN VIDEO EDITOR STATEFUL WIDGET
/// ---------------------------------------------------------------------------
class VideoEditorScreen extends StatefulWidget {
  final String? initialVideoPath;

  const VideoEditorScreen({super.key, this.initialVideoPath});

  @override
  State<VideoEditorScreen> createState() => _VideoEditorScreenState();
}

class _VideoEditorScreenState extends State<VideoEditorScreen> {
  // Playback & Timeline State
  bool _isPlaying = false;
  double _currentPosition = 12.5; // in seconds
  double _totalDuration = 90.0;    // in seconds (01:30.0)
  double _timelineZoom = 1.0;
  
  // Resolution & FPS State
  String _currentResolution = '1080P';
  int _currentFps = 60;
  
  // Selected Editing Tool State
  String _activeTool = 'split'; // Default active tool
  int _selectedTrackIndex = 0;  // 0: video, 1: audio

  @override
  void initState() {
    super.initState();
    // In production: initialize video_player controller here
  }

  void _togglePlayPause() {
    setState(() {
      _isPlaying = !_isPlaying;
    });
  }

  void _onScrub(double newPosition) {
    setState(() {
      _currentPosition = newPosition.clamp(0.0, _totalDuration);
    });
  }

  void _selectTool(String toolId) {
    setState(() {
      _activeTool = toolId;
    });
    // Trigger tool-specific actions or bottom sheets
    _handleToolAction(toolId);
  }

  void _handleToolAction(String toolId) {
    switch (toolId) {
      case 'split':
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Clip split at \${_formatTimecode(_currentPosition)}'),
            duration: const Duration(seconds: 1),
            behavior: SnackBarBehavior.floating,
          ),
        );
        break;
      case 'speed':
        _showSpeedModal();
        break;
      case 'export':
        _showExportDialog();
        break;
    }
  }

  void _showSpeedModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: CapCutColors.cardAndDock,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => const SpeedControlSheet(),
    );
  }

  void _showExportDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: CapCutColors.cardAndDock,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Export Video', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text('Exporting at \$_currentResolution • \$_currentFps FPS...'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: CapCutColors.secondaryText)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: CapCutColors.accentRoyalBlue,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Save to Gallery'),
          ),
        ],
      ),
    );
  }

  String _formatTimecode(double seconds) {
    final int mins = seconds ~/ 60;
    final double secs = seconds % 60;
    return '\${mins.toString().padLeft(2, '0')}:\${secs.toStringAsFixed(1).padLeft(4, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CapCutColors.primaryBackground,
      body: SafeArea(
        child: Column(
          children: [
            // 1. TOP HEADER BAR
            CapCutHeader(
              resolution: _currentResolution,
              fps: _currentFps,
              onBack: () => Navigator.maybePop(context),
              onResolutionTap: _showResolutionPicker,
              onExport: _showExportDialog,
            ),

            const SizedBox(height: 8),

            // 2. CENTER VIDEO PREVIEW CANVAS
            Expanded(
              flex: 5,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: VideoPreviewArea(
                  isPlaying: _isPlaying,
                  currentPosition: _currentPosition,
                  totalDuration: _totalDuration,
                  onTogglePlay: _togglePlayPause,
                ),
              ),
            ),

            const SizedBox(height: 12),

            // 3. CAPCUT MULTI-TRACK TIMELINE WITH RED SCRUBBER
            Expanded(
              flex: 4,
              child: MultiTrackTimeline(
                currentPosition: _currentPosition,
                totalDuration: _totalDuration,
                isPlaying: _isPlaying,
                onScrub: _onScrub,
                onTogglePlay: _togglePlayPause,
              ),
            ),

            // 4. BOTTOM EDITING TOOLBAR DOCK
            EditingToolbarDock(
              activeTool: _activeTool,
              onToolSelected: _selectTool,
            ),
          ],
        ),
      ),
    );
  }

  void _showResolutionPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: CapCutColors.cardAndDock,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Resolution & Frame Rate',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CapCutColors.primaryText),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                children: ['720P', '1080P', '2K/4K'].map((res) {
                  final isSel = _currentResolution == res;
                  return ChoiceChip(
                    label: Text(res),
                    selected: isSel,
                    selectedColor: CapCutColors.accentRoyalBlue,
                    labelStyle: TextStyle(color: isSel ? Colors.white : CapCutColors.primaryText, fontWeight: FontWeight.bold),
                    onSelected: (val) {
                      setState(() => _currentResolution = res);
                      Navigator.pop(ctx);
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// ---------------------------------------------------------------------------
/// 3. MODULAR SUB-WIDGET: TOP HEADER BAR
/// ---------------------------------------------------------------------------
class CapCutHeader extends StatelessWidget {
  final String resolution;
  final int fps;
  final VoidCallback onBack;
  final VoidCallback onResolutionTap;
  final VoidCallback onExport;

  const CapCutHeader({
    super.key,
    required this.resolution,
    required this.fps,
    required this.onBack,
    required this.onResolutionTap,
    required this.onExport,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
        color: CapCutColors.cardAndDock,
        border: Border(bottom: BorderSide(color: CapCutColors.borderDivider, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          // Back button
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: CapCutColors.primaryText),
            onPressed: onBack,
            tooltip: 'Return to Gallery',
          ),

          // Center Resolution & FPS Selector Pill
          GestureDetector(
            onTap: onResolutionTap,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: CapCutColors.primaryBackground,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: CapCutColors.borderDivider),
              ),
              child: Row(
                children: [
                  Text(
                    '\$resolution • \$fps FPS',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: CapCutColors.primaryText,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.keyboard_arrow_down, size: 16, color: CapCutColors.secondaryText),
                ],
              ),
            ),
          ),

          // Prominent Export Button in Royal Blue
          ElevatedButton.icon(
            onPressed: onExport,
            style: ElevatedButton.styleFrom(
              backgroundColor: CapCutColors.accentRoyalBlue,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            icon: const Icon(Icons.file_download_outlined, size: 18),
            label: const Text(
              'Export',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

/// ---------------------------------------------------------------------------
/// 4. MODULAR SUB-WIDGET: CENTER VIDEO PREVIEW AREA
/// ---------------------------------------------------------------------------
class VideoPreviewArea extends StatelessWidget {
  final bool isPlaying;
  final double currentPosition;
  final double totalDuration;
  final VoidCallback onTogglePlay;

  const VideoPreviewArea({
    super.key,
    required this.isPlaying,
    required this.currentPosition,
    required this.totalDuration,
    required this.onTogglePlay,
  });

  String _formatTimecode(double seconds) {
    final int mins = seconds ~/ 60;
    final double secs = seconds % 60;
    return '\${mins.toString().padLeft(2, '0')}:\${secs.toStringAsFixed(1).padLeft(4, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: CapCutColors.borderDivider, width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          )
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Center Video Player Canvas / Frame Mockup
          Center(
            child: Container(
              color: const Color(0xFF1E293B),
              child: const Center(
                child: Icon(Icons.movie_creation_outlined, color: Colors.white24, size: 64),
              ),
            ),
          ),

          // Center Play / Pause Overlay Toggle
          Center(
            child: GestureDetector(
              onTap: onTogglePlay,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 200),
                opacity: isPlaying ? 0.0 : 1.0,
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withOpacity(0.3), width: 1.5),
                  ),
                  child: Icon(
                    isPlaying ? Icons.pause : Icons.play_arrow_rounded,
                    color: Colors.white,
                    size: 36,
                  ),
                ),
              ),
            ),
          ),

          // Bottom-Left Timecode Indicator Overlay
          Positioned(
            left: 12,
            bottom: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.65),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '\${_formatTimecode(currentPosition)} / \${_formatTimecode(totalDuration)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// ---------------------------------------------------------------------------
/// 5. MODULAR SUB-WIDGET: CAPCUT MULTI-TRACK TIMELINE
/// ---------------------------------------------------------------------------
class MultiTrackTimeline extends StatelessWidget {
  final double currentPosition;
  final double totalDuration;
  final bool isPlaying;
  final ValueChanged<double> onScrub;
  final VoidCallback onTogglePlay;

  const MultiTrackTimeline({
    super.key,
    required this.currentPosition,
    required this.totalDuration,
    required this.isPlaying,
    required this.onScrub,
    required this.onTogglePlay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: CapCutColors.cardAndDock,
        border: Border(
          top: BorderSide(color: CapCutColors.borderDivider),
          bottom: BorderSide(color: CapCutColors.borderDivider),
        ),
      ),
      child: Stack(
        children: [
          // Scrollable Track Rows
          Column(
            children: [
              // Ruler Time Ticks
              Container(
                height: 24,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: CapCutColors.borderDivider)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(7, (i) {
                    final sec = (i * 15).toDouble();
                    return Text(
                      '00:\${sec.toInt().toString().padLeft(2, '0')}',
                      style: const TextStyle(fontSize: 9, color: CapCutColors.secondaryText, fontFamily: 'monospace'),
                    );
                  }),
                ),
              ),

              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  children: [
                    // Track 1: Video Track Layer with Filmstrip Placeholders
                    Container(
                      height: 52,
                      decoration: BoxDecoration(
                        color: CapCutColors.videoTrackBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: CapCutColors.borderDivider),
                      ),
                      child: Row(
                        children: List.generate(8, (index) => Expanded(
                          child: Container(
                            margin: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: CapCutColors.borderDivider, width: 0.5),
                            ),
                            child: const Center(
                              child: Icon(Icons.image_outlined, size: 14, color: CapCutColors.secondaryText),
                            ),
                          ),
                        )),
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Track 2: Audio Track Layer beneath Video Track
                    Container(
                      height: 36,
                      decoration: BoxDecoration(
                        color: CapCutColors.audioTrackBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Row(
                        children: [
                          const Icon(Icons.music_note, size: 14, color: CapCutColors.accentRoyalBlue),
                          const SizedBox(width: 6),
                          const Text('Audio Track 1', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CapCutColors.accentRoyalBlue)),
                          const Spacer(),
                          // Waveform visual bars
                          Row(
                            children: List.generate(24, (i) => Container(
                              width: 2.5,
                              height: (12 + (i % 5) * 4).toDouble(),
                              margin: const EdgeInsets.symmetric(horizontal: 1),
                              decoration: BoxDecoration(
                                color: CapCutColors.audioWaveform,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            )),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Center Vertical Red Scrubber Line (Playhead)
          Positioned(
            left: 120, // In dynamic view: calculate based on scroll offset & position
            top: 0,
            bottom: 0,
            child: Column(
              children: [
                // Diamond Playhead Handle at Top
                Container(
                  width: 14,
                  height: 14,
                  decoration: const BoxDecoration(
                    color: CapCutColors.scrubberRed,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.arrow_drop_down, color: Colors.white, size: 12),
                  ),
                ),
                // Red Vertical Line
                Expanded(
                  child: Container(
                    width: 2,
                    color: CapCutColors.scrubberRed,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// ---------------------------------------------------------------------------
/// 6. MODULAR SUB-WIDGET: BOTTOM EDITING TOOLBAR DOCK
/// ---------------------------------------------------------------------------
class EditingToolbarDock extends StatelessWidget {
  final String activeTool;
  final ValueChanged<String> onToolSelected;

  const EditingToolbarDock({
    super.key,
    required this.activeTool,
    required this.onToolSelected,
  });

  static const List<Map<String, dynamic>> tools = [
    {'id': 'split',     'name': 'Split',     'icon': Icons.content_cut_outlined},
    {'id': 'speed',     'name': 'Speed',     'icon': Icons.speed_outlined},
    {'id': 'volume',    'name': 'Volume',    'icon': Icons.volume_up_outlined},
    {'id': 'animation', 'name': 'Animation', 'icon': Icons.auto_awesome_motion_outlined},
    {'id': 'adjust',    'name': 'Adjust',    'icon': Icons.tune_outlined},
    {'id': 'filters',   'name': 'Filters',   'icon': Icons.filter_vintage_outlined},
    {'id': 'text',      'name': 'Text',      'icon': Icons.text_fields_outlined},
    {'id': 'audio',     'name': 'Audio',     'icon': Icons.library_music_outlined},
    {'id': 'canvas',    'name': 'Canvas',    'icon': Icons.aspect_ratio_outlined},
    {'id': 'delete',    'name': 'Delete',    'icon': Icons.delete_outline},
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 68,
      decoration: const BoxDecoration(
        color: CapCutColors.cardAndDock,
        border: Border(top: BorderSide(color: CapCutColors.borderDivider)),
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        itemCount: tools.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (context, index) {
          final tool = tools[index];
          final String id = tool['id'];
          final bool isSelected = activeTool == id;

          return InkWell(
            onTap: () => onToolSelected(id),
            borderRadius: BorderRadius.circular(10),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 58,
              padding: const EdgeInsets.symmetric(vertical: 4),
              decoration: BoxDecoration(
                color: isSelected ? CapCutColors.accentBlueLight : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isSelected ? CapCutColors.accentRoyalBlue.withOpacity(0.4) : Colors.transparent,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    tool['icon'] as IconData,
                    size: 20,
                    color: isSelected ? CapCutColors.accentRoyalBlue : CapCutColors.primaryText,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    tool['name'] as String,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? CapCutColors.accentRoyalBlue : CapCutColors.secondaryText,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

/// ---------------------------------------------------------------------------
/// 7. SAMPLE SPEED CONTROL BOTTOM SHEET
/// ---------------------------------------------------------------------------
class SpeedControlSheet extends StatefulWidget {
  const SpeedControlSheet({super.key});

  @override
  State<SpeedControlSheet> createState() => _SpeedControlSheetState();
}

class _SpeedControlSheetState extends State<SpeedControlSheet> {
  double _speed = 1.0;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Speed Adjustment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Text('\${_speed.toStringAsFixed(1)}x', style: const TextStyle(fontWeight: FontWeight.bold, color: CapCutColors.accentRoyalBlue)),
            ],
          ),
          const SizedBox(height: 16),
          Slider(
            value: _speed,
            min: 0.1,
            max: 5.0,
            divisions: 49,
            activeColor: CapCutColors.accentRoyalBlue,
            onChanged: (val) => setState(() => _speed = val),
          ),
        ],
      ),
    );
  }
}
`;

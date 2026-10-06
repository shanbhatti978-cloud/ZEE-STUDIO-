import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Smartphone, Layers, Palette } from 'lucide-react';
import { FLUTTER_CAPCUT_CODE } from './CapCutThemeData';

interface FlutterCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeViewerModal: React.FC<FlutterCodeViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('video_editor_screen.dart');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FLUTTER_CAPCUT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([FLUTTER_CAPCUT_CODE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile;
    link.click();
    URL.revokeObjectURL(url);
  };

  const files = [
    { name: 'video_editor_screen.dart', label: 'Main Screen', icon: Smartphone },
    { name: 'capcut_header.dart', label: 'Header Bar', icon: Layers },
    { name: 'video_preview_area.dart', label: 'Preview Canvas', icon: FileCode },
    { name: 'multi_track_timeline.dart', label: 'Timeline & Scrubber', icon: Layers },
    { name: 'editing_toolbar_dock.dart', label: 'Toolbar Dock', icon: Layers },
    { name: 'capcut_theme.dart', label: 'Light Theme Colors', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1E293B]">
                  Flutter Video Editor Screen Code
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] text-[10px] font-bold">
                  CapCut Light Theme
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Production-ready StatefulWidget with modular sub-widgets & state management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-[#1E293B] flex items-center gap-1.5 transition-colors"
              title="Download .dart file"
            >
              <Download size={14} className="text-[#64748B]" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
          {files.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedFile === f.name;
            return (
              <button
                key={f.name}
                onClick={() => setSelectedFile(f.name)}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white text-[#2563EB] font-bold shadow-xs border border-slate-200'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-200/60'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-[#2563EB]' : 'text-[#64748B]'} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0F172A] text-slate-200 font-mono text-xs leading-relaxed">
          <pre className="overflow-x-auto">
            <code>{FLUTTER_CAPCUT_CODE}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-[#F8F9FA] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <span>Accent: #2563EB</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span>Scrubber: #EF4444</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F8F9FA] border border-slate-300" />
              <span>Background: #F8F9FA</span>
            </span>
          </div>
          <span className="font-semibold text-[#1E293B]">Flutter 3.x • Material 3 Ready</span>
        </div>
      </div>
    </div>
  );
};

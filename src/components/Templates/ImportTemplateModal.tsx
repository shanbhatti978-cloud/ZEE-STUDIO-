import React, { useState } from 'react';
import {
  X,
  Link,
  FileVideo,
  FolderOpen,
  Camera,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { TemplateDefinition, TemplateConfidence, DuplicateDetectionResult } from '../../types/editor';
import { TemplateAnalyzerService, SceneAnalysisSegment } from '../../services/templateAnalyzer';

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTemplates: TemplateDefinition[];
  onSaveTemplate: (template: TemplateDefinition) => void;
  onOpenExistingTemplate: (templateId: string) => void;
  theme: AppTheme;
}

export const ImportTemplateModal: React.FC<ImportTemplateModalProps> = ({
  isOpen,
  onClose,
  existingTemplates,
  onSaveTemplate,
  onOpenExistingTemplate,
  theme
}) => {
  const [activeMethod, setActiveMethod] = useState<'link' | 'video' | 'file'>('link');
  const [urlInput, setUrlInput] = useState('https://www.tiktok.com/@creator/video/739281928391');
  const [selectedFileName, setSelectedFileName] = useState<string>('cinematic_urdu_velocity_beat.mp4');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Analysis Result State
  const [reconstructedTemplate, setReconstructedTemplate] = useState<TemplateDefinition | null>(null);
  const [confidenceScores, setConfidenceScores] = useState<TemplateConfidence | null>(null);
  const [sceneBreakdown, setSceneBreakdown] = useState<SceneAnalysisSegment[] | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateDetectionResult | null>(null);
  const [selectedScene, setSelectedScene] = useState<SceneAnalysisSegment | null>(null);

  if (!isOpen) return null;
  const p = theme.palette;

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setReconstructedTemplate(null);
    setDuplicateCheck(null);
    setSceneBreakdown(null);

    try {
      if (activeMethod === 'link') {
        if (!urlInput.trim()) throw new Error('Please provide a valid template or media URL.');
        const res = await TemplateAnalyzerService.analyzeLink(urlInput.trim());
        setReconstructedTemplate(res.template);
        setConfidenceScores(res.confidence);

        // Perform Duplicate Detection
        const dupResult = TemplateAnalyzerService.checkDuplicate(res.template, existingTemplates, 90);
        setDuplicateCheck(dupResult);
      } else if (activeMethod === 'video') {
        const res = await TemplateAnalyzerService.analyzeVideo(selectedFileName);
        setReconstructedTemplate(res.template);
        setConfidenceScores(res.confidence);
        setSceneBreakdown(res.segments);
        if (res.segments.length > 0) {
          setSelectedScene(res.segments[0]);
        }

        // Perform Duplicate Detection
        const dupResult = TemplateAnalyzerService.checkDuplicate(res.template, existingTemplates, 90);
        setDuplicateCheck(dupResult);
      } else {
        // File project import simulation
        const res = await TemplateAnalyzerService.analyzeVideo('local_project_backup.mp4');
        setReconstructedTemplate(res.template);
        setConfidenceScores(res.confidence);
        setSceneBreakdown(res.segments);
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Template analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSave = (forceSeparate = false) => {
    if (!reconstructedTemplate) return;
    const finalTemplate: TemplateDefinition = {
      ...reconstructedTemplate,
      id: forceSeparate ? `tmpl_sep_${Date.now()}` : reconstructedTemplate.id,
      title: forceSeparate ? `${reconstructedTemplate.title} (Separate Version)` : reconstructedTemplate.title
    };
    onSaveTemplate(finalTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: p.borderStrong
        }}
      >
        {/* Modal Header */}
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: p.borderSubtle }}
        >
          <div className="flex items-center gap-2">
            <DownloadCloud size={20} style={{ color: p.accent }} />
            <div>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: p.textPrimary }}>
                IMPORT TEMPLATE STUDIO
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Reconstruct editable multi-track templates from Links, Videos, or Project Files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-80"
            style={{ color: p.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!reconstructedTemplate ? (
            <>
              {/* Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ backgroundColor: p.bgElevated }}>
                <button
                  onClick={() => setActiveMethod('link')}
                  className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: activeMethod === 'link' ? p.bgSurface : 'transparent',
                    color: activeMethod === 'link' ? p.accent : p.textSecondary,
                    boxShadow: activeMethod === 'link' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <Link size={14} />
                  <span>A. From Link</span>
                </button>

                <button
                  onClick={() => setActiveMethod('video')}
                  className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: activeMethod === 'video' ? p.bgSurface : 'transparent',
                    color: activeMethod === 'video' ? p.accent : p.textSecondary,
                    boxShadow: activeMethod === 'video' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <FileVideo size={14} />
                  <span>B. From Video</span>
                </button>

                <button
                  onClick={() => setActiveMethod('file')}
                  className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: activeMethod === 'file' ? p.bgSurface : 'transparent',
                    color: activeMethod === 'file' ? p.accent : p.textSecondary,
                    boxShadow: activeMethod === 'file' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <FolderOpen size={14} />
                  <span>C. Local File</span>
                </button>
              </div>

              {/* Method Configuration Input */}
              {activeMethod === 'link' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold" style={{ color: p.textSecondary }}>
                    Paste Public Video / Template URL:
                  </label>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ backgroundColor: p.bgInput, borderColor: p.borderSubtle }}
                  >
                    <Link size={16} style={{ color: p.accent }} />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://www.tiktok.com/@user/video/..."
                      className="bg-transparent text-xs font-mono outline-none flex-1"
                      style={{ color: p.textPrimary }}
                    />
                  </div>
                  <p className="text-[11px]" style={{ color: p.textMuted }}>
                    Supported: TikTok, Instagram Reels, YouTube Shorts, CapCut Public Web. Recreates full editable timing, OCR text, and transitions.
                  </p>
                </div>
              )}

              {activeMethod === 'video' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold" style={{ color: p.textSecondary }}>
                    Upload or Select Video for Frame-by-Frame Cut & Scene Detection:
                  </label>
                  <div
                    className="p-4 rounded-xl border border-dashed text-center cursor-pointer transition-all hover:opacity-90"
                    style={{ backgroundColor: p.bgElevated, borderColor: p.borderStrong }}
                    onClick={() => setSelectedFileName('sample_urdu_aesthetic_edit.mp4')}
                  >
                    <FileVideo size={28} className="mx-auto mb-2" style={{ color: p.accent }} />
                    <p className="text-xs font-bold" style={{ color: p.textPrimary }}>
                      Selected: {selectedFileName}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: p.textSecondary }}>
                      Click to switch media or analyze detected audio beats & multilingual captions (Urdu, Arabic, Chinese, English)
                    </p>
                  </div>
                </div>
              )}

              {activeMethod === 'file' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold" style={{ color: p.textSecondary }}>
                    Import Local Template / Project JSON:
                  </label>
                  <div
                    className="p-4 rounded-xl border border-dashed text-center"
                    style={{ backgroundColor: p.bgElevated, borderColor: p.borderStrong }}
                  >
                    <FolderOpen size={28} className="mx-auto mb-2" style={{ color: p.accent }} />
                    <p className="text-xs font-bold" style={{ color: p.textPrimary }}>
                      Load Native VeloCut / Creator Studio Template File (.json)
                    </p>
                  </div>
                </div>
              )}

              {analysisError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  backgroundColor: p.accent,
                  color: p.accentText
                }}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Analyzing Scenes, Cuts, Beats & Multi-Language OCR...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Analyze & Reconstruct Editable Template</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Reconstructed Template Preview & Confidence Dashboard */
            <div className="space-y-4">
              {/* Duplicate Detection Alert if triggered */}
              {duplicateCheck?.isDuplicate && (
                <div
                  className="p-3 rounded-xl border flex items-start justify-between gap-3 animate-pulse"
                  style={{
                    backgroundColor: 'rgba(234, 88, 12, 0.1)',
                    borderColor: 'rgba(234, 88, 12, 0.4)'
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-500">
                        Duplicate Template Detected ({duplicateCheck.similarityPercentage}% Similar)
                      </h4>
                      <p className="text-[11px]" style={{ color: p.textSecondary }}>
                        Substantially identical to existing template <span className="font-bold" style={{ color: p.textPrimary }}>"{duplicateCheck.existingTemplate?.title}"</span>.
                      </p>
                      <ul className="text-[10px] list-disc list-inside mt-1 text-amber-400/90">
                        {duplicateCheck.matchReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {duplicateCheck.existingTemplate && (
                      <button
                        onClick={() => {
                          onOpenExistingTemplate(duplicateCheck.existingTemplate!.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-white shadow-sm"
                      >
                        Open Existing
                      </button>
                    )}
                    <button
                      onClick={() => handleConfirmSave(true)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                      style={{ color: p.textPrimary, borderColor: p.borderSubtle }}
                    >
                      Save Separate Version
                    </button>
                  </div>
                </div>
              )}

              {/* Template Reconstruction Overview */}
              <div
                className="p-3.5 rounded-xl border flex items-center justify-between"
                style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      Reconstructed Successfully
                    </span>
                    <span className="text-[11px]" style={{ color: p.textMuted }}>
                      Estimated from available media
                    </span>
                  </div>
                  <h3 className="text-sm font-bold mt-1" style={{ color: p.textPrimary }}>
                    {reconstructedTemplate.title}
                  </h3>
                  <p className="text-xs" style={{ color: p.textSecondary }}>
                    {reconstructedTemplate.duration.toFixed(1)}s · {reconstructedTemplate.slots.length} Editable Slots · {reconstructedTemplate.language || 'English'}
                  </p>
                </div>

                <button
                  onClick={() => setReconstructedTemplate(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80"
                  style={{ color: p.textSecondary, backgroundColor: p.bgInput }}
                >
                  Analyze Again
                </button>
              </div>

              {/* Confidence Scores Gauge Grid */}
              {confidenceScores && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textPrimary }}>
                    Reconstruction Confidence Breakdown
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {[
                      { label: 'TEXT OCR', score: confidenceScores.text },
                      { label: 'TIMING', score: confidenceScores.timing },
                      { label: 'TRANSITIONS', score: confidenceScores.transitions },
                      { label: 'EFFECTS', score: confidenceScores.effects },
                      { label: 'FONT', score: confidenceScores.font },
                      { label: 'AUDIO BEATS', score: confidenceScores.audio }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-2 rounded-xl border flex flex-col justify-center"
                        style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
                      >
                        <span className="text-sm font-extrabold" style={{ color: p.accent }}>
                          {item.score}%
                        </span>
                        <span className="text-[9px] font-semibold mt-0.5" style={{ color: p.textMuted }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scene Breakdown Timeline (Section 47) */}
              {sceneBreakdown && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textPrimary }}>
                    Detected Scene Segments & Properties
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {sceneBreakdown.map((seg) => {
                      const isSel = selectedScene?.index === seg.index;
                      return (
                        <div
                          key={seg.index}
                          onClick={() => setSelectedScene(seg)}
                          className="p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                          style={{
                            backgroundColor: isSel ? p.bgInput : p.bgElevated,
                            borderColor: isSel ? p.accent : p.borderSubtle
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono font-bold" style={{ color: p.accent }}>
                              {seg.timeRange}
                            </span>
                            <div>
                              <div className="text-xs font-bold" style={{ color: p.textPrimary }}>
                                {seg.label} · {seg.motion}
                              </div>
                              {seg.detectedText && (
                                <div className="text-[11px] text-amber-400 font-medium">
                                  Text Layer: "{seg.detectedText}" ({seg.language})
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: p.bgSurface, color: p.textSecondary }}>
                            {seg.detectedTransition}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: p.borderSubtle }}>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
                  style={{ color: p.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmSave(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
                  style={{ backgroundColor: p.accent, color: p.accentText }}
                >
                  Save to My Templates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

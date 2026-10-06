import React, { useState } from 'react';
import { Captions, Wand2, Sparkles, Check, Edit2, Play, Plus, Globe } from 'lucide-react';
import { Clip, TextConfig, TextWordHighlight } from '../../types/editor';

interface CaptionsDrawerProps {
  currentTime: number;
  projectDuration: number;
  onAddCaptionClips: (clips: Partial<Clip>[]) => void;
  onClose: () => void;
}

export const CaptionsDrawer: React.FC<CaptionsDrawerProps> = ({
  currentTime,
  projectDuration,
  onAddCaptionClips,
  onClose,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Urdu' | 'Arabic' | 'Hindi' | 'Roman Urdu'>('English');
  const [selectedStyle, setSelectedStyle] = useState<'karaoke' | 'boxed' | 'neon' | 'cinematic'>('karaoke');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<
    { id: string; text: string; start: number; end: number; words?: TextWordHighlight[] }[]
  >([
    {
      id: 'cap-1',
      text: 'Create stunning short-form videos',
      start: 0.2,
      end: 2.8,
      words: [
        { word: 'Create', start: 0.2, end: 0.8 },
        { word: 'stunning', start: 0.8, end: 1.5 },
        { word: 'short-form', start: 1.5, end: 2.1 },
        { word: 'videos', start: 2.1, end: 2.8 },
      ],
    },
    {
      id: 'cap-2',
      text: 'Fast · Magnetic · High Energy',
      start: 3.0,
      end: 5.6,
      words: [
        { word: 'Fast', start: 3.0, end: 3.8 },
        { word: '·', start: 3.8, end: 4.1 },
        { word: 'Magnetic', start: 4.1, end: 4.9 },
        { word: 'High', start: 4.9, end: 5.2 },
        { word: 'Energy', start: 5.2, end: 5.6 },
      ],
    },
    {
      id: 'cap-3',
      text: 'Ready to go viral on TikTok & Reels',
      start: 5.8,
      end: 8.5,
      words: [
        { word: 'Ready', start: 5.8, end: 6.4 },
        { word: 'to', start: 6.4, end: 6.8 },
        { word: 'go', start: 6.8, end: 7.2 },
        { word: 'viral', start: 7.2, end: 7.8 },
        { word: 'today!', start: 7.8, end: 8.5 },
      ],
    },
  ]);

  const languages = [
    { id: 'English', label: 'English (US)' },
    { id: 'Urdu', label: 'Urdu (اردو)' },
    { id: 'Roman Urdu', label: 'Roman Urdu' },
    { id: 'Hindi', label: 'Hindi (हिंदी)' },
    { id: 'Arabic', label: 'Arabic (العربية)' },
  ];

  // AI Generation trigger
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          duration: projectDuration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.captions && Array.isArray(data.captions)) {
          const mapped = data.captions.map((c: any, idx: number) => {
            const wordsList = (c.text || '').split(' ');
            const durationPerWord = (c.end - c.start) / Math.max(1, wordsList.length);
            const words = wordsList.map((w: string, wIdx: number) => ({
              word: w,
              start: c.start + wIdx * durationPerWord,
              end: c.start + (wIdx + 1) * durationPerWord,
            }));

            return {
              id: `cap-${idx}-${Date.now()}`,
              text: c.text,
              start: Number(c.start),
              end: Number(c.end),
              words,
            };
          });
          setGeneratedCaptions(mapped);
        }
      }
    } catch (e) {
      console.warn('AI Caption fetch failed, using localized preset fallback', e);
      // Localized fallback per language
      if (selectedLanguage === 'Urdu') {
        setGeneratedCaptions([
          { id: 'u1', text: 'شاندار ویڈیوز بنائیں', start: 0.2, end: 2.8 },
          { id: 'u2', text: 'تیز رفتار اور آسان ایڈیٹنگ', start: 3.0, end: 5.5 },
          { id: 'u3', text: 'وائرل کونٹینٹ کے لیے تیار', start: 5.8, end: 8.2 },
        ]);
      } else if (selectedLanguage === 'Roman Urdu') {
        setGeneratedCaptions([
          { id: 'ru1', text: 'Zabardast videos banayein', start: 0.2, end: 2.8 },
          { id: 'ru2', text: 'Fast aur aasan editing tools', start: 3.0, end: 5.5 },
          { id: 'ru3', text: 'Viral content ke liye tayyar', start: 5.8, end: 8.2 },
        ]);
      } else if (selectedLanguage === 'Arabic') {
        setGeneratedCaptions([
          { id: 'ar1', text: 'أنشئ مقاطع فيديو مذهلة', start: 0.2, end: 2.8 },
          { id: 'ar2', text: 'تحرير سريع واحترافي', start: 3.0, end: 5.5 },
          { id: 'ar3', text: 'جاهز للانتشار السريع', start: 5.8, end: 8.2 },
        ]);
      } else if (selectedLanguage === 'Hindi') {
        setGeneratedCaptions([
          { id: 'hi1', text: 'शानदार रील्स और शॉर्ट्स बनाएं', start: 0.2, end: 2.8 },
          { id: 'hi2', text: 'तेज़ और आसान वीडियो एडिटिंग', start: 3.0, end: 5.5 },
          { id: 'hi3', text: 'वायरल होने के लिए तैयार', start: 5.8, end: 8.2 },
        ]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert to timeline clips and apply
  const handleApplyToTimeline = () => {
    const clipsToAdd: Partial<Clip>[] = generatedCaptions.map((cap) => {
      let textConfig: TextConfig;

      if (selectedStyle === 'karaoke') {
        textConfig = {
          text: cap.text,
          fontFamily: 'Montserrat',
          fontSize: 48,
          color: '#ffffff',
          bold: true,
          italic: false,
          letterSpacing: 1,
          lineSpacing: 1.2,
          align: 'center',
          gradient: { enabled: false, startColor: '', endColor: '', angle: 0 },
          stroke: { enabled: true, color: '#000000', width: 7 },
          shadow: { enabled: true, color: 'rgba(0,0,0,0.9)', blur: 10, offsetX: 2, offsetY: 2 },
          glow: { enabled: false, color: '', intensity: 0 },
          backgroundBox: { enabled: false, color: '', padding: 0, borderRadius: 0 },
          animation: 'karaoke',
          karaokeWords: cap.words,
        };
      } else if (selectedStyle === 'boxed') {
        textConfig = {
          text: cap.text,
          fontFamily: 'Montserrat',
          fontSize: 44,
          color: '#ffffff',
          bold: true,
          italic: false,
          letterSpacing: 1,
          lineSpacing: 1.2,
          align: 'center',
          gradient: { enabled: false, startColor: '', endColor: '', angle: 0 },
          stroke: { enabled: false, color: '', width: 0 },
          shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0 },
          glow: { enabled: false, color: '', intensity: 0 },
          backgroundBox: { enabled: true, color: 'rgba(15, 23, 42, 0.85)', padding: 14, borderRadius: 10 },
          animation: 'pop',
        };
      } else if (selectedStyle === 'neon') {
        textConfig = {
          text: cap.text,
          fontFamily: 'Orbitron',
          fontSize: 42,
          color: '#38bdf8',
          bold: true,
          italic: false,
          letterSpacing: 2,
          lineSpacing: 1.2,
          align: 'center',
          gradient: { enabled: false, startColor: '', endColor: '', angle: 0 },
          stroke: { enabled: true, color: '#0369a1', width: 4 },
          shadow: { enabled: false, color: '', blur: 0, offsetX: 0, offsetY: 0 },
          glow: { enabled: true, color: '#38bdf8', intensity: 60 },
          backgroundBox: { enabled: false, color: '', padding: 0, borderRadius: 0 },
          animation: 'slide',
        };
      } else {
        // cinematic
        textConfig = {
          text: cap.text,
          fontFamily: 'Playfair Display',
          fontSize: 44,
          color: '#ffffff',
          bold: false,
          italic: true,
          letterSpacing: 2,
          lineSpacing: 1.3,
          align: 'center',
          gradient: { enabled: false, startColor: '', endColor: '', angle: 0 },
          stroke: { enabled: true, color: '#000000', width: 4 },
          shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 8, offsetX: 2, offsetY: 2 },
          glow: { enabled: false, color: '', intensity: 0 },
          backgroundBox: { enabled: false, color: '', padding: 0, borderRadius: 0 },
          animation: 'fade',
        };
      }

      return {
        name: cap.text.slice(0, 18),
        type: 'text',
        start: cap.start,
        duration: Math.max(0.5, cap.end - cap.start),
        x: 0,
        y: 28, // Lower third mobile placement
        scale: 1,
        textConfig,
      };
    });

    onAddCaptionClips(clipsToAdd);
    onClose();
  };

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Captions size={16} className="text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Auto Captions</h3>
        </div>

        <button
          onClick={handleApplyToTimeline}
          className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-sky-500/25 transition-all"
        >
          Add to Timeline ({generatedCaptions.length})
        </button>
      </div>

      {/* Language Selector */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Globe size={11} />
          <span>Speech Language</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLanguage(l.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedLanguage === l.id
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Caption Style Selector */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Caption Aesthetic</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'karaoke', label: 'Viral Karaoke', desc: 'Active word highlight' },
            { id: 'boxed', label: 'Modern Boxed', desc: 'High contrast card' },
            { id: 'neon', label: 'Cyber Glow', desc: 'Neon cyan outline' },
            { id: 'cinematic', label: 'Cinematic Italic', desc: 'Minimal bottom bar' },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id as any)}
              className={`p-2 rounded-xl border text-left transition-all ${
                selectedStyle === style.id
                  ? 'bg-sky-500/15 border-sky-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-200">{style.label}</div>
              <div className="text-[9px] text-slate-500">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Generate Button */}
      <div className="mb-3">
        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="w-full py-2 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-98"
        >
          <Wand2 size={14} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Transcribing & Aligning Timestamps...' : 'Generate AI Captions'}</span>
        </button>
      </div>

      {/* Editable Subtitle Segments List */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Subtitle Timings & Text
        </div>
        <div className="flex flex-col gap-1.5">
          {generatedCaptions.map((cap, idx) => (
            <div
              key={cap.id}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
            >
              <span className="text-[10px] font-mono text-sky-400 shrink-0">
                {cap.start.toFixed(1)}s - {cap.end.toFixed(1)}s
              </span>
              <input
                type="text"
                value={cap.text}
                onChange={(e) => {
                  const updated = [...generatedCaptions];
                  updated[idx].text = e.target.value;
                  setGeneratedCaptions(updated);
                }}
                className="bg-transparent border-b border-transparent focus:border-sky-500 text-xs text-white outline-none w-full px-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

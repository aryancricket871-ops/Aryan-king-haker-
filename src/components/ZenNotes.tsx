import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/soundEngine';
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Bold,
  Heading,
  Code,
  List,
  Sparkles,
} from 'lucide-react';

interface ZenNotesProps {
  lang: Language;
}

const DEFAULT_NOTE_EN = `# Aura Cognitive Studio Blueprint

## System Architecture Highlights
1. **Procedural Web Audio**: Zero static sound assets; audio is generated in-memory through native Web Audio oscillator & biquad filter graphs.
2. **Deterministic State**: Real-time reactivity using standard React 19 hooks and zero external runtime bloat.
3. **Ergonomic Typography**: Strict compliance with 60-30-10 palette rules and single-line controls.

### Quick Verification Checklist
- [x] Web Audio binaural 10Hz Alpha pulse verification
- [x] Spring physics gesture response on mobile and desktop
- [ ] Accessibility contrast audit across dark slate tokens
`;

const DEFAULT_NOTE_HI = `# ऑरा कॉग्निटिव स्टूडियो ब्लूप्रिंट

## सिस्टम आर्किटेक्चर मुख्य विशेषताएं
1. **प्रोसीजरल वेब ऑडियो**: किसी बाहरी ऑडियो फाइल की जरूरत नहीं; ब्राउज़र के वेब ऑडियो एपीआई से सीधे रियल-टाइम जनरेशन।
2. **डिटरमिनिस्टिक स्टेट**: बिना किसी लैग के तीव्र प्रतिक्रिया।
3. **प्रीमियम यूआई**: 60-30-10 कलर डिस्ट्रीब्यूशन और स्पष्ट टाइपोग्राफी।

### त्वरित सत्यापन सूची
- [x] वेब ऑडियो बाइनॉरल 10Hz अल्फा पल्स परीक्षण
- [x] स्प्रिंग फिजिक्स जेस्चर रिस्पॉन्स
- [ ] डार्क स्लेट टोकन्स पर एक्सेसिबिलिटी कॉन्ट्रास्ट ऑडिट
`;

export const ZenNotes: React.FC<ZenNotesProps> = ({ lang }) => {
  const t = translations[lang];
  const [content, setContent] = useState<string>(lang === 'hi' ? DEFAULT_NOTE_HI : DEFAULT_NOTE_EN);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute metrics
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readTimeSeconds = Math.ceil((words / 200) * 60);

  const handleCopy = async () => {
    soundEngine.playTactileClick();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm(t.notes.clearConfirm)) {
      soundEngine.playTactileClick();
      setContent('');
    }
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    soundEngine.playTactileClick();
    setContent((prev) => `${prev}\n${prefix}${suffix}`);
  };

  const applyTemplate = (type: 'meeting' | 'bug' | 'sprint') => {
    soundEngine.playTactileClick();
    if (type === 'meeting') {
      setContent(
        `# Team Sync & Review\n\n**Date**: ${new Date().toLocaleDateString()}\n**Objective**: Review application performance & test coverage\n\n### Key Discussion Points\n- Point 1\n- Point 2\n\n### Action Items\n- [ ] Action item A\n- [ ] Action item B`
      );
    } else if (type === 'bug') {
      setContent(
        `# Bug / Test Report\n\n**Component**: UI Spring Card\n**Severity**: Low\n\n### Reproduction Steps\n1. Navigate to UI Testing Lab\n2. Drag card across boundaries\n\n**Expected Outcome**: Smooth elastic rebound\n**Actual Outcome**: Working flawlessly`
      );
    } else if (type === 'sprint') {
      setContent(
        `# Sprint Objective & Scope\n\n- Goal 1: Execute complete UI stress tests\n- Goal 2: Validate procedural audio synthesis\n- Goal 3: Complete 4 deep-focus pomodoro sessions`
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            {t.notes.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">{t.notes.subtitle}</p>
        </div>

        {/* Readout metrics */}
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs text-zinc-400">
          <div>
            <span>{t.notes.words}: </span>
            <span className="font-mono text-zinc-100 font-semibold tabular-nums">{words}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div>
            <span>{t.notes.chars}: </span>
            <span className="font-mono text-zinc-100 font-semibold tabular-nums">{chars}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div>
            <span>{t.notes.readTime}: </span>
            <span className="font-mono text-zinc-100 font-semibold tabular-nums">
              {readTimeSeconds < 60 ? `${readTimeSeconds}s` : `${Math.ceil(readTimeSeconds / 60)}m`}
            </span>
          </div>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-4 sm:p-6 space-y-4">
        {/* Formatting & Template Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/70">
          <div className="flex items-center gap-1">
            <button
              onClick={() => insertSnippet('## ')}
              title="Heading"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Heading className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSnippet('**Bold Text**')}
              title="Bold"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSnippet('- [ ] ')}
              title="Task Checkbox"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSnippet('```\n// Code snippet\n```')}
              title="Code Block"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Templates */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => applyTemplate('meeting')}
              className="px-2.5 py-1 text-xs rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              {t.notes.templateMeeting}
            </button>
            <button
              onClick={() => applyTemplate('bug')}
              className="px-2.5 py-1 text-xs rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              {t.notes.templateBug}
            </button>
            <button
              onClick={() => applyTemplate('sprint')}
              className="px-2.5 py-1 text-xs rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              {t.notes.templateSprint}
            </button>
          </div>

          {/* Actions: Copy & Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.common.copied : t.common.copy}</span>
            </button>

            <button
              onClick={handleClear}
              title={t.common.clear}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.notes.placeholder}
          rows={16}
          className="w-full bg-transparent text-sm sm:text-base font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { SoundTrack, SoundPreset, Language } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { translations } from '../utils/translations';
import {
  CloudRain,
  Waves,
  Flame,
  Radio,
  Wind,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
} from 'lucide-react';

interface SoundscapeLabProps {
  lang: Language;
}

const INITIAL_TRACKS: SoundTrack[] = [
  {
    id: 'rain',
    name: 'Monsoon Rain',
    nameHi: 'मानसूनी बारिश',
    category: 'nature',
    volume: 0.6,
    isPlaying: false,
    iconName: 'rain',
    description: 'Deep rainfall with random soft droplet impacts',
    descriptionHi: 'गहरी बारिश और बूंदों की सुकूनभरी ध्वनि',
  },
  {
    id: 'waves',
    name: 'Ocean Swell',
    nameHi: 'समुद्र की लहरें',
    category: 'nature',
    volume: 0.5,
    isPlaying: false,
    iconName: 'waves',
    description: 'LFO rhythmic tidal swell and deep surge',
    descriptionHi: 'लयबद्ध समुद्री लहरों का प्राकृतिक प्रवाह',
  },
  {
    id: 'fire',
    name: 'Cabin Fireplace',
    nameHi: 'अंगीठी की आग',
    category: 'ambient',
    volume: 0.5,
    isPlaying: false,
    iconName: 'fire',
    description: 'Dry timber crackling and hearth resonance',
    descriptionHi: 'लकड़ी की चटकन और सुखद गर्माहट',
  },
  {
    id: 'binaural',
    name: 'Alpha Binaural (10Hz)',
    nameHi: 'अल्फा बाइनॉरल (10Hz)',
    category: 'focus',
    volume: 0.4,
    isPlaying: false,
    iconName: 'binaural',
    description: 'Stereo beat for relaxed alert cognitive flow',
    descriptionHi: 'एकाग्रता और मानसिक शांति के लिए साउंडवेव',
  },
  {
    id: 'wind',
    name: 'Mountain Breeze',
    nameHi: 'पहाड़ी हवा',
    category: 'nature',
    volume: 0.45,
    isPlaying: false,
    iconName: 'wind',
    description: 'Subtle high-altitude atmospheric gusts',
    descriptionHi: 'शांत और धीमी हवा के झोंके',
  },
  {
    id: 'whitenoise',
    name: 'Pink Noise Mask',
    nameHi: 'पिंक नॉइज़ मास्क',
    category: 'focus',
    volume: 0.35,
    isPlaying: false,
    iconName: 'whitenoise',
    description: 'Equal energy per octave for sensory dampening',
    descriptionHi: 'आसपास के शोर को ब्लॉक करने वाला साउंड',
  },
];

const PRESETS: SoundPreset[] = [
  {
    id: 'deep-study',
    name: 'Deep Study Sanctuary',
    nameHi: 'गहन अध्ययन अभयारण्य',
    description: 'Binaural beats coupled with gentle steady rainfall',
    volumes: { rain: 0.65, binaural: 0.5, fire: 0, waves: 0, wind: 0, whitenoise: 0 },
  },
  {
    id: 'midnight-cabin',
    name: 'Midnight Hearth',
    nameHi: 'मध्यरात्रि अंगीठी',
    description: 'Crackling fire embers with whispering mountain wind',
    volumes: { fire: 0.7, wind: 0.4, rain: 0.2, waves: 0, binaural: 0, whitenoise: 0 },
  },
  {
    id: 'oceanic-calm',
    name: 'Coastal Horizon',
    nameHi: 'समुद्री तट शांति',
    description: 'Pacing rhythmic tides with subtle open-air breeze',
    volumes: { waves: 0.75, wind: 0.3, rain: 0, fire: 0, binaural: 0, whitenoise: 0 },
  },
  {
    id: 'noise-cocoon',
    name: 'Deep Focus Cocoon',
    nameHi: 'एकाग्रता कवच',
    description: 'Pink spectrum noise paired with alpha entrainment',
    volumes: { whitenoise: 0.5, binaural: 0.45, rain: 0.25, fire: 0, waves: 0, wind: 0 },
  },
];

export const SoundscapeLab: React.FC<SoundscapeLabProps> = ({ lang }) => {
  const t = translations[lang];
  const [tracks, setTracks] = useState<SoundTrack[]>(INITIAL_TRACKS);
  const [masterVolume, setMasterVolume] = useState<number>(0.75);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio spectrum visualizer
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const analyser = soundEngine.getAnalyser();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!analyser) {
        // Idle ambient line
        ctx.strokeStyle = 'rgba(161, 161, 170, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient from indigo to cyan
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0.85)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleTrack = (trackId: string) => {
    soundEngine.playTactileClick();
    setTracks((prev) =>
      prev.map((trk) => {
        if (trk.id === trackId) {
          const nextState = !trk.isPlaying;
          if (nextState) {
            soundEngine.playTrack(trk.id, trk.volume);
          } else {
            soundEngine.stopTrack(trk.id);
          }
          return { ...trk, isPlaying: nextState };
        }
        return trk;
      })
    );
  };

  const updateTrackVolume = (trackId: string, newVol: number) => {
    setTracks((prev) =>
      prev.map((trk) => {
        if (trk.id === trackId) {
          soundEngine.setTrackVolume(trk.id, newVol);
          // If slider moved up from 0 and not playing, start it
          if (!trk.isPlaying && newVol > 0) {
            soundEngine.playTrack(trk.id, newVol);
            return { ...trk, volume: newVol, isPlaying: true };
          }
          return { ...trk, volume: newVol };
        }
        return trk;
      })
    );
  };

  const applyPreset = (preset: SoundPreset) => {
    soundEngine.playTactileClick();
    setActivePreset(preset.id);

    setTracks((prev) =>
      prev.map((trk) => {
        const targetVol = preset.volumes[trk.id] ?? 0;
        if (targetVol > 0) {
          soundEngine.playTrack(trk.id, targetVol);
          return { ...trk, volume: targetVol, isPlaying: true };
        } else {
          soundEngine.stopTrack(trk.id);
          return { ...trk, volume: trk.volume, isPlaying: false };
        }
      })
    );
  };

  const stopAll = () => {
    soundEngine.playTactileClick();
    soundEngine.stopAllTracks();
    setActivePreset(null);
    setTracks((prev) => prev.map((trk) => ({ ...trk, isPlaying: false })));
  };

  const handleMasterVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMasterVolume(vol);
    soundEngine.setMasterVolume(vol);
  };

  const anyPlaying = tracks.some((t) => t.isPlaying);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'rain':
        return <CloudRain className="w-5 h-5 text-sky-400" />;
      case 'waves':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'binaural':
        return <Radio className="w-5 h-5 text-indigo-400" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-teal-400" />;
      case 'whitenoise':
        return <Headphones className="w-5 h-5 text-purple-400" />;
      default:
        return <Volume2 className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero / Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            {t.soundscape.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
            {t.soundscape.subtitle}
          </p>
        </div>

        {/* Master Controls */}
        <div className="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={handleMasterVolume}
              className="w-24 sm:w-32 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              aria-label={t.soundscape.masterVolume}
            />
            <span className="text-xs font-mono text-zinc-400 tabular-nums w-8">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {anyPlaying && (
            <button
              onClick={stopAll}
              className="px-3 py-1 text-xs font-medium text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg hover:bg-red-900/40 transition-colors whitespace-nowrap"
            >
              {t.soundscape.allOff}
            </button>
          )}
        </div>
      </div>

      {/* Visualizer & Focus Recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Spectrum Visualizer */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.soundscape.audioVisualizer}</span>
            </div>
            <div className="text-xs text-zinc-500 font-mono">
              {anyPlaying ? (
                <span className="text-emerald-400 font-medium">● 48kHz Web Audio Active</span>
              ) : (
                <span>○ Idle / Standby</span>
              )}
            </div>
          </div>
          <div className="w-full h-24 sm:h-28 bg-zinc-950/60 rounded-xl overflow-hidden border border-zinc-800/50 flex items-center justify-center p-2">
            <canvas
              ref={canvasRef}
              width={600}
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Focus Recipes / Presets */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3 font-display">
            {t.soundscape.presetsTitle}
          </h2>
          <div className="space-y-2">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                    isActive
                      ? 'border-indigo-500/60 bg-indigo-950/30 text-white'
                      : 'border-zinc-800/60 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-medium text-zinc-100 mb-0.5">
                    {lang === 'hi' ? preset.nameHi : preset.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 line-clamp-1">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sound Track Cards Grid */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track) => {
            const name = lang === 'hi' ? track.nameHi : track.name;
            const desc = lang === 'hi' ? track.descriptionHi : track.description;

            return (
              <div
                key={track.id}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                  track.isPlaying
                    ? 'border-indigo-500/40 bg-zinc-900/90 shadow-lg shadow-indigo-950/20'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        track.isPlaying ? 'bg-zinc-800 text-white' : 'bg-zinc-850 text-zinc-400'
                      }`}
                    >
                      {getIcon(track.iconName)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100 font-display">
                        {name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTrack(track.id)}
                    title={track.isPlaying ? t.common.pause : t.common.start}
                    className={`p-2 rounded-xl border transition-all ${
                      track.isPlaying
                        ? 'border-indigo-500/50 bg-indigo-500 text-white shadow-sm'
                        : 'border-zinc-800 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {track.isPlaying ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Volume Slider & Level */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                  <div className="flex justify-between items-center text-[11px] text-zinc-400">
                    <span>{t.common.volume}</span>
                    <span className="font-mono tabular-nums text-zinc-300">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.volume}
                    onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    aria-label={`${name} ${t.common.volume}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

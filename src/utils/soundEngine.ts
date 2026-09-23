/**
 * Procedural Web Audio Engine
 * Generates ambient soundscapes and UI haptic audio synthesis without external files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;

  // Channel audio nodes
  private channelGains: Map<string, GainNode> = new Map();
  private channelSources: Map<string, { stop: () => void }> = new Map();
  private analyser: AnalyserNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setTrackVolume(trackId: string, vol: number) {
    const gain = this.channelGains.get(trackId);
    if (gain && this.ctx) {
      gain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public playTrack(trackId: string, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.channelSources.has(trackId)) {
      this.setTrackVolume(trackId, volume);
      return;
    }

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    trackGain.connect(this.masterGain);
    this.channelGains.set(trackId, trackGain);

    let stopper: () => void = () => {};

    switch (trackId) {
      case 'rain':
        stopper = this.createRainGenerator(trackGain);
        break;
      case 'waves':
        stopper = this.createWavesGenerator(trackGain);
        break;
      case 'fire':
        stopper = this.createCampfireGenerator(trackGain);
        break;
      case 'binaural':
        stopper = this.createBinauralGenerator(trackGain);
        break;
      case 'wind':
        stopper = this.createWindGenerator(trackGain);
        break;
      case 'whitenoise':
        stopper = this.createNoiseGenerator(trackGain);
        break;
      default:
        stopper = this.createNoiseGenerator(trackGain);
        break;
    }

    this.channelSources.set(trackId, { stop: stopper });
  }

  public stopTrack(trackId: string) {
    const source = this.channelSources.get(trackId);
    if (source) {
      source.stop();
      this.channelSources.delete(trackId);
    }
    const gain = this.channelGains.get(trackId);
    if (gain) {
      gain.disconnect();
      this.channelGains.delete(trackId);
    }
  }

  public stopAllTracks() {
    this.channelSources.forEach((source) => source.stop());
    this.channelSources.clear();
    this.channelGains.forEach((gain) => gain.disconnect());
    this.channelGains.clear();
  }

  // --- Procedural synthesizers ---

  private createNoiseBuffer(lengthSeconds: number = 5): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * lengthSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown/Pink filtered noise
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  private createRainGenerator(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter rain frequencies
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(300, this.ctx.currentTime);

    noiseSource.connect(highpass);
    highpass.connect(filter);
    filter.connect(dest);
    noiseSource.start();

    // Random raindrop generator
    let active = true;
    const dropTimer = setInterval(() => {
      if (!active || !this.ctx) return;
      if (Math.random() > 0.4) {
        const osc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const freq = 1200 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

        dropGain.gain.setValueAtTime(0.04 * Math.random(), this.ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(dropGain);
        dropGain.connect(dest);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
      }
    }, 180);

    return () => {
      active = false;
      clearInterval(dropTimer);
      try {
        noiseSource.stop();
        noiseSource.disconnect();
      } catch {}
    };
  }

  private createWavesGenerator(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // LFO for wave swelling
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(dest);

    noiseSource.start();
    lfo.start();

    return () => {
      try {
        noiseSource.stop();
        lfo.stop();
        noiseSource.disconnect();
        lfo.disconnect();
      } catch {}
    };
  }

  private createCampfireGenerator(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(3);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const baseGain = this.ctx.createGain();
    baseGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(baseGain);
    baseGain.connect(dest);
    noiseSource.start();

    // Wood crackle bursts
    let active = true;
    const crackleInterval = setInterval(() => {
      if (!active || !this.ctx) return;
      if (Math.random() < 0.6) {
        const crack = this.ctx.createBufferSource();
        const crackBuffer = this.ctx.createBuffer(1, 600, this.ctx.sampleRate);
        const data = crackBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
        }
        crack.buffer = crackBuffer;
        const crackGain = this.ctx.createGain();
        crackGain.gain.setValueAtTime(0.2 + Math.random() * 0.25, this.ctx.currentTime);
        crack.connect(crackGain);
        crackGain.connect(dest);
        crack.start();
      }
    }, 140);

    return () => {
      active = false;
      clearInterval(crackleInterval);
      try {
        noiseSource.stop();
        noiseSource.disconnect();
      } catch {}
    };
  }

  private createBinauralGenerator(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    // Base 200 Hz tone + 210 Hz (Alpha wave beat of 10 Hz)
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(210, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.3, this.ctx.currentTime);

    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.3, this.ctx.currentTime);

    oscLeft.connect(gainL);
    oscRight.connect(gainR);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    merger.connect(dest);

    oscLeft.start();
    oscRight.start();

    return () => {
      try {
        oscLeft.stop();
        oscRight.stop();
        oscLeft.disconnect();
        oscRight.disconnect();
      } catch {}
    };
  }

  private createWindGenerator(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // Wind gust frequency sweep
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(dest);

    noiseSource.start();
    lfo.start();

    return () => {
      try {
        noiseSource.stop();
        lfo.stop();
        noiseSource.disconnect();
      } catch {}
    };
  }

  private createNoiseGenerator(dest: GainNode): () => void {
    if (!this.ctx) return () => {};
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(dest);
    noiseSource.start();

    return () => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
      } catch {}
    };
  }

  // --- UI Sound Effects (Tactile Feedback) ---

  public playTactileClick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playChime() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const frequencies = [528, 792, 1056]; // Healing Solfeggio 528Hz harmonics
    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const delay = idx * 0.08;
      const startTime = this.ctx.currentTime + delay;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.25 / (idx + 1), startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.9);
    });
  }

  public playSuccessChord() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    // Major 7th chord: C5, E5, G5, B5
    const notes = [523.25, 659.25, 783.99, 987.77];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const start = this.ctx.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0.01, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.7);
    });
  }
}

export const soundEngine = new SoundEngine();

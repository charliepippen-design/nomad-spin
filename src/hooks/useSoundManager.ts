import { useCallback, useState, useEffect } from 'react';

class SoundManager {
  private ctx: AudioContext | null = null;
  private idleOsc: OscillatorNode | null = null;
  private idleGain: GainNode | null = null;
  private spinNoise: AudioBufferSourceNode | null = null;
  private spinFilter: BiquadFilterNode | null = null;
  private spinGain: GainNode | null = null;
  private _muted = false;

  get muted() { return this._muted; }
  set muted(v: boolean) {
    this._muted = v;
    if (v) { this.stopIdle(); this.stopSpin(); }
  }

  private getCtx() {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /** Low sub-bass idle hum — spaceship standby */
  startIdle() {
    if (this._muted || this.idleOsc) return;
    const ctx = this.getCtx();
    this.idleOsc = ctx.createOscillator();
    this.idleGain = ctx.createGain();
    this.idleOsc.type = 'sine';
    this.idleOsc.frequency.setValueAtTime(38, ctx.currentTime); // sub-bass
    this.idleGain.gain.setValueAtTime(0, ctx.currentTime);
    this.idleGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
    this.idleOsc.connect(this.idleGain).connect(ctx.destination);
    this.idleOsc.start();
  }

  stopIdle() {
    if (this.idleGain) {
      try {
        const ctx = this.getCtx();
        this.idleGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      } catch {}
    }
    setTimeout(() => {
      try { this.idleOsc?.stop(); } catch {}
      this.idleOsc = null;
      this.idleGain = null;
    }, 500);
  }

  /** Cinematic whoosh — white noise through sweeping low-pass filter */
  startSpin() {
    if (this._muted) return;
    const ctx = this.getCtx();
    this.stopSpin();
    this.stopIdle();

    // Generate white noise buffer
    const bufferSize = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    this.spinNoise = ctx.createBufferSource();
    this.spinNoise.buffer = buffer;
    this.spinNoise.loop = true;

    this.spinFilter = ctx.createBiquadFilter();
    this.spinFilter.type = 'lowpass';
    this.spinFilter.frequency.setValueAtTime(200, ctx.currentTime);
    this.spinFilter.Q.setValueAtTime(5, ctx.currentTime);

    this.spinGain = ctx.createGain();
    this.spinGain.gain.setValueAtTime(0, ctx.currentTime);
    this.spinGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);

    this.spinNoise.connect(this.spinFilter).connect(this.spinGain).connect(ctx.destination);
    this.spinNoise.start();
  }

  /** Sweep filter frequency to match spin velocity */
  updateSpinPitch(speed: number) {
    if (!this.spinFilter || !this.spinGain || this._muted) return;
    const ctx = this.getCtx();
    // Map speed (0.005-0.8) → filter freq (200-4000)
    const freq = 200 + (speed / 0.8) * 3800;
    const vol = Math.min(0.2, 0.05 + speed * 0.4);
    this.spinFilter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    this.spinGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
  }

  stopSpin() {
    if (this.spinGain) {
      try {
        const ctx = this.getCtx();
        this.spinGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      } catch {}
    }
    setTimeout(() => {
      try { this.spinNoise?.stop(); } catch {}
      this.spinNoise = null;
      this.spinFilter = null;
      this.spinGain = null;
    }, 400);
  }

  /** Mechanical tick — short percussive click */
  playTick() {
    if (this._muted) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  /** Vault door thud — heavy impact sound */
  playResult() {
    if (this._muted) return;
    const ctx = this.getCtx();

    // Low thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);

    // Snap/click layer
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    noise.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.25, ctx.currentTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(2000, ctx.currentTime);
    noise.connect(hp).connect(nGain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.08);
  }
}

const globalSoundManager = new SoundManager();

export function useSoundManager() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('nomadSpin_muted') === 'true';
  });

  useEffect(() => {
    globalSoundManager.muted = muted;
    localStorage.setItem('nomadSpin_muted', String(muted));
  }, [muted]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  return {
    muted,
    toggleMute,
    startIdle: () => globalSoundManager.startIdle(),
    stopIdle: () => globalSoundManager.stopIdle(),
    startSpin: () => globalSoundManager.startSpin(),
    updateSpinPitch: (speed: number) => globalSoundManager.updateSpinPitch(speed),
    stopSpin: () => globalSoundManager.stopSpin(),
    playTick: () => globalSoundManager.playTick(),
    playResult: () => globalSoundManager.playResult(),
  };
}

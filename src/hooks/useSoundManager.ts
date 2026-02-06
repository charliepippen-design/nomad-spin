import { useRef, useCallback, useState, useEffect } from 'react';

class SoundManager {
  private ctx: AudioContext | null = null;
  private spinOsc: OscillatorNode | null = null;
  private spinGain: GainNode | null = null;
  private _muted = false;

  get muted() { return this._muted; }
  set muted(v: boolean) { this._muted = v; if (v) this.stopSpin(); }

  private getCtx() {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  startSpin() {
    if (this._muted) return;
    const ctx = this.getCtx();
    this.stopSpin();
    
    this.spinOsc = ctx.createOscillator();
    this.spinGain = ctx.createGain();
    this.spinOsc.type = 'sawtooth';
    this.spinOsc.frequency.setValueAtTime(80, ctx.currentTime);
    this.spinGain.gain.setValueAtTime(0, ctx.currentTime);
    this.spinGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);
    this.spinOsc.connect(this.spinGain).connect(ctx.destination);
    this.spinOsc.start();
  }

  updateSpinPitch(speed: number) {
    if (!this.spinOsc || !this.spinGain || this._muted) return;
    const ctx = this.getCtx();
    // Map spin speed (0.005 - 0.4) to frequency (80 - 600)
    const freq = 80 + (speed / 0.4) * 520;
    const vol = Math.min(0.12, speed * 0.3);
    this.spinOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
    this.spinGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
  }

  stopSpin() {
    if (this.spinGain) {
      try {
        const ctx = this.getCtx();
        this.spinGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      } catch {}
    }
    setTimeout(() => {
      try { this.spinOsc?.stop(); } catch {}
      this.spinOsc = null;
      this.spinGain = null;
    }, 300);
  }

  playTick() {
    if (this._muted) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  playWin() {
    if (this._muted) return;
    const ctx = this.getCtx();
    // Major triad: C5, E5, G5
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 1.3);
    });
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
    startSpin: () => globalSoundManager.startSpin(),
    updateSpinPitch: (speed: number) => globalSoundManager.updateSpinPitch(speed),
    stopSpin: () => globalSoundManager.stopSpin(),
    playTick: () => globalSoundManager.playTick(),
    playWin: () => globalSoundManager.playWin(),
  };
}

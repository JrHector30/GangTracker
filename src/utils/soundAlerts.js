// Web Audio API Sound Synthesizer for Tactical Alarms
class SoundManager {
  constructor() {
    this.ctx = null;
    this.initContext = this.initContext.bind(this);
  }

  initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAlarm(type = 'tactical', volume = 0.8) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1), now);
      gainNode.connect(this.ctx.destination);

      if (type === 'siren') {
        // Two-tone tactical police/emergency siren
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
        osc.frequency.linearRampToValueAtTime(800, now + 0.6);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.9);
        osc.frequency.linearRampToValueAtTime(800, now + 1.2);

        gainNode.gain.setValueAtTime(volume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 1.3);
      } else if (type === 'digital') {
        // High-tech triple beep
        [0, 0.15, 0.3].forEach((delay, idx) => {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880 + idx * 220, now + delay);
          noteGain.gain.setValueAtTime(volume, now + delay);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + delay);
          osc.stop(now + delay + 0.1);
        });
      } else if (type === 'chime') {
        // Ambient glass chime
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        freqs.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          noteGain.gain.setValueAtTime(volume * 0.7, now + i * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.6);
        });
      } else {
        // Default: 'tactical' radar sweep & alert tone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

        osc2.frequency.setValueAtTime(880, now + 0.2); // A5
        osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.45); // A6

        gainNode.gain.setValueAtTime(volume * 0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start(now);
        osc1.stop(now + 0.3);
        osc2.start(now + 0.2);
        osc2.stop(now + 0.7);
      }

      // Haptic vibration on mobile device
      this.vibrate([300, 150, 300, 150, 400]);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  vibrate(pattern = [300, 150, 300, 150, 400]) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.warn('Vibration error or blocked by browser:', e);
    }
  }

  playTick(pitch = 'low') {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch === 'high' ? 1200 : 600, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();

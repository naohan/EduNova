/**
 * soundEffects.ts
 * Motor de Audio Procedural & música de fondo usando Web Audio API.
 * 100% Offline, sin dependencias de red ni MP3s pesados.
 * Cumple con RNF-01 (Offline-First y bajo consumo) del Plan Maestro EduNova.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxMuted: boolean = false;
  private bgmMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.sfxMuted = localStorage.getItem("edunova_sfx_muted") === "true";
        this.bgmMuted = localStorage.getItem("edunova_bgm_muted") === "true";
      } catch {
        this.sfxMuted = false;
        this.bgmMuted = false;
      }

      // Auto-unlock Web Audio on first user interaction (touch, click, key)
      const unlockAudio = () => {
        this.init();
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume().then(() => {
            if (!this.bgmMuted && !this.bgmPlaying) {
              this.startBGM();
            }
          }).catch(() => {});
        }
      };

      window.addEventListener("pointerdown", unlockAudio, { passive: true });
      window.addEventListener("keydown", unlockAudio, { passive: true });
      window.addEventListener("click", unlockAudio, { passive: true });
    }
  }

  public init(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Dynamics Compressor to avoid clipping and give punchy audio
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : 0.85, this.ctx.currentTime);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmMuted ? 0 : 0.42, this.ctx.currentTime);

        // Routing
        this.sfxGain.connect(this.compressor);
        this.bgmGain.connect(this.compressor);
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.sfxMuted;
  }

  public isBgmMuted(): boolean {
    return this.bgmMuted;
  }

  public isBgmActive(): boolean {
    return this.bgmPlaying && !this.bgmMuted;
  }

  public toggleMute(): boolean {
    this.sfxMuted = !this.sfxMuted;
    const ctx = this.init();
    if (ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : 0.85, ctx.currentTime);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("edunova_sfx_muted", String(this.sfxMuted));
      } catch {
        /* ignore */
      }
    }
    if (!this.sfxMuted) {
      this.playCoin();
    }
    return this.sfxMuted;
  }

  public toggleBGM(): boolean {
    this.bgmMuted = !this.bgmMuted;
    const ctx = this.init();
    if (ctx && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(this.bgmMuted ? 0 : 0.42, ctx.currentTime);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("edunova_bgm_muted", String(this.bgmMuted));
      } catch {
        /* ignore */
      }
    }

    if (this.bgmMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return !this.bgmMuted;
  }

  // =========================================================================
  // MÚSICA DE FONDO PROCEDURAL (Groovy 124 BPM)
  // =========================================================================
  public startBGM() {
    if (this.bgmMuted || this.bgmPlaying) return;
    const ctx = this.init();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    this.bgmPlaying = true;
    this.bgmStep = 0;

    // Tempo: 124 BPM -> 16th note = ~121ms
    const stepInterval = 120; // ms

    this.bgmTimer = window.setInterval(() => {
      if (!this.bgmPlaying || this.bgmMuted) return;
      this.playBgmStep();
    }, stepInterval);
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer != null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private playBgmStep() {
    const ctx = this.ctx;
    if (!ctx || !this.bgmGain || this.bgmMuted) return;
    const now = ctx.currentTime;
    const step = this.bgmStep % 32; // 2 bars de 16 pasos
    this.bgmStep++;

    // BASSLINE FUNKY (groove sincopado)
    // Bar 1 (0-15): D2, D2, F2, G2, A2, G2, F2, C3
    // Bar 2 (16-31): Bb1, Bb1, C2, D2, F2, E2, D2, A1
    const bassNotes1: Record<number, number> = {
      0: 73.42, // D2
      2: 73.42,
      4: 87.31, // F2
      6: 98.00, // G2
      8: 110.00, // A2
      10: 98.00,
      12: 87.31,
      14: 130.81, // C3
    };

    const bassNotes2: Record<number, number> = {
      16: 58.27, // Bb1
      18: 58.27,
      20: 65.41, // C2
      22: 73.42, // D2
      24: 87.31, // F2
      26: 82.41, // E2
      28: 73.42, // D2
      30: 110.00, // A2
    };

    const bassFreq = bassNotes1[step] ?? bassNotes2[step];
    if (bassFreq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(bassFreq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.18);
    }

    // PERCUSIÓN: Kick en beats 1 y 3 (pasos 0, 8, 16, 24)
    if (step % 8 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = "sine";
      kickOsc.frequency.setValueAtTime(140, now);
      kickOsc.frequency.exponentialRampToValueAtTime(36, now + 0.09);

      kickGain.gain.setValueAtTime(0.32, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      kickOsc.connect(kickGain);
      kickGain.connect(this.bgmGain);

      kickOsc.start(now);
      kickOsc.stop(now + 0.11);
    }

    // PERCUSIÓN: Snare / Clap en beats 2 y 4 (pasos 4, 12, 20, 28)
    if (step % 8 === 4) {
      const snareOsc = ctx.createOscillator();
      const snareGain = ctx.createGain();
      snareOsc.type = "triangle";
      snareOsc.frequency.setValueAtTime(260, now);
      snareOsc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

      snareGain.gain.setValueAtTime(0.18, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      snareOsc.connect(snareGain);
      snareGain.connect(this.bgmGain);

      snareOsc.start(now);
      snareOsc.stop(now + 0.1);
    }

    // PERCUSIÓN: Hi-Hat en contratiempos (pasos 2, 6, 10, 14, 18, 22, 26, 30)
    if (step % 4 === 2) {
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = "square";
      hatOsc.frequency.setValueAtTime(3800, now);

      hatGain.gain.setValueAtTime(0.04, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      hatOsc.connect(hatGain);
      hatGain.connect(this.bgmGain);

      hatOsc.start(now);
      hatOsc.stop(now + 0.04);
    }

    // ARPEGIO / MARIMBA LÚDICA (Melodía de concentración / suspense festivo)
    const leadNotes: Record<number, number> = {
      0: 587.33,  // D5
      3: 698.46,  // F5
      6: 880.00,  // A5
      8: 1174.66, // D6
      11: 1046.50,// C6
      14: 880.00, // A5
      16: 698.46, // F5
      19: 783.99, // G5
      22: 932.33, // Bb5
      24: 1174.66,// D6
      27: 1396.91,// F6
      30: 1046.50,// C6
    };

    const leadFreq = leadNotes[step];
    if (leadFreq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(leadFreq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // =========================================================================
  // EFECTOS DE SONIDO (SFX) CON VOLUMEN CLARO Y PUNCHY
  // =========================================================================

  /** Sonido de dado rodando (sonido de traqueteo de madera) */
  public playDice() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    // Generamos 6 impactos rítmicos programados en la línea de tiempo de audio
    for (let i = 0; i < 6; i++) {
      const hitTime = now + i * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? "triangle" : "sine";
      const freq = 180 + (i * 35) + Math.random() * 40;
      osc.frequency.setValueAtTime(freq, hitTime);
      osc.frequency.exponentialRampToValueAtTime(50, hitTime + 0.05);

      gain.gain.setValueAtTime(0.38, hitTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(hitTime);
      osc.stop(hitTime + 0.06);
    }
  }

  /** Sonido de salto de casilla ("pop" elástico ascendente) */
  public playStep() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.08);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Acierto triunfal / Fanfarria mayor alegre (Do - Mi - Sol - Do) */
  public playCorrect() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const sfx = this.sfxGain;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.45, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

      osc.connect(gain);
      gain.connect(sfx);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  /** Error empático / Boing suave no punitivo */
  public playWrong() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.28);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Recoger NovaCoin ("cling" cristalino agudo) */
  public playCoin() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.32);
  }

  /** Pérdida de vida (impacto y alerta con robot) */
  public playHeartLost() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Ganar vida / Recuperación de energía */
  public playHeartGain() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const sfx = this.sfxGain;
    const now = ctx.currentTime;

    const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    freqs.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.36, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(sfx);

      osc.start(noteTime);
      osc.stop(noteTime + 0.28);
    });
  }

  /** Activar Habilidad Especial (whoosh de energía) */
  public playAbility() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1050, now + 0.3);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /** Subir de Nivel / Fanfarria mayor gloriosa */
  public playLevelUp() {
    if (this.sfxMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const sfx = this.sfxGain;
    const now = ctx.currentTime;

    const chords = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.1 },
      { f: 783.99, t: 0.2 },
      { f: 1046.5, t: 0.35 },
      { f: 1318.51, t: 0.5 },
      { f: 1567.98, t: 0.65 },
    ];
    chords.forEach(({ f, t }) => {
      const noteTime = now + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.48, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(sfx);

      osc.start(noteTime);
      osc.stop(noteTime + 0.55);
    });
  }
}

export const soundManager = new SoundEngine();

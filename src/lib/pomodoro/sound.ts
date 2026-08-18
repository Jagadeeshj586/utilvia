let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) audioContext = new AudioCtx();
  return audioContext;
}

/** Unlock audio after a user gesture so later completion sounds can play. */
export async function unlockPomodoroAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
  }
}

export function playPomodoroChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume().then(() => {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02 + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + index * 0.08);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + 0.32 + index * 0.08);
    });
  }).catch(() => {
    /* autoplay blocked */
  });
}

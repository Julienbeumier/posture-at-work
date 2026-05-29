import type { Exercise } from "@/lib/exercises";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
}

class VoiceGuide {
  private enabled = false;
  private voice: SpeechSynthesisVoice | null = null;
  private repTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadVoice();
    if (typeof window !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.addEventListener("voiceschanged", () => this.loadVoice());
    }
  }

  private loadVoice() {
    if (typeof window === "undefined") return;
    const voices = speechSynthesis.getVoices();
    const fr = voices.filter(v => v.lang.startsWith("fr"));
    const thomas = fr.find(v => v.name.toLowerCase().includes("thomas"));
    const marie = fr.find(v => v.name.toLowerCase().includes("marie"));
    const remoteFr = fr.find(v => v.lang === "fr-FR" && !v.localService);
    const anyFrFR = fr.find(v => v.lang === "fr-FR");
    this.voice = thomas ?? marie ?? remoteFr ?? anyFrFR ?? fr[0] ?? null;
  }

  speak(text: string, options: SpeakOptions = {}) {
    if (!this.enabled || typeof window === "undefined") return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (this.voice) utt.voice = this.voice;
    utt.lang = "fr-FR";
    utt.rate = options.rate ?? 1.0;
    utt.pitch = options.pitch ?? 1.0;
    utt.volume = options.volume ?? 1.0;
    if (options.onEnd) utt.onend = options.onEnd;
    speechSynthesis.speak(utt);
  }

  stop() {
    if (typeof window === "undefined") return;
    speechSynthesis.cancel();
    if (this.repTimer) { clearInterval(this.repTimer); this.repTimer = null; }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  isEnabled() {
    return this.enabled;
  }

  announceExercise(exercise: Exercise) {
    this.speak(`${exercise.name}. ${exercise.instruction}. ${exercise.reps}.`, { rate: 0.95 });
  }

  countdown(seconds: number): () => void {
    const mid = Math.floor(seconds / 2);
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const sayAt = (delayMs: number, text: string) => {
      timeouts.push(setTimeout(() => {
        if (this.enabled) this.speak(text, { rate: 1.1 });
      }, delayMs));
    };

    if (seconds >= 10) sayAt((seconds - 10) * 1000, "Plus que dix secondes !");
    if (seconds >= 4 && mid > 3) sayAt(mid * 1000, "Continue !");
    if (seconds >= 6) {
      sayAt((seconds - 3) * 1000, "Trois");
      sayAt((seconds - 2) * 1000, "Deux");
      sayAt((seconds - 1) * 1000, "Un");
    }

    return () => timeouts.forEach(clearTimeout);
  }

  encourageEnd(exerciseIndex: number, totalExercises: number) {
    const isLast = exerciseIndex >= totalExercises - 1;
    if (isLast) {
      this.speak("Excellent ! Session terminée, bravo à toi !", { rate: 1.0, pitch: 1.1 });
    } else {
      const messages = [
        "Bien joué ! Prépare-toi pour la suite.",
        "Super ! On continue.",
        "C'est bien ! Encore un effort.",
        "Parfait ! Prochaine étape.",
        "Continue comme ça !",
      ];
      this.speak(messages[exerciseIndex % messages.length], { rate: 1.0 });
    }
  }

  countReps(total: number, onComplete?: () => void) {
    if (this.repTimer) { clearInterval(this.repTimer); this.repTimer = null; }
    let current = 1;
    this.speak(`Un`, { rate: 0.9 });
    this.repTimer = setInterval(() => {
      current++;
      if (current <= total) {
        this.speak(`${current}`, { rate: 0.9 });
      }
      if (current >= total) {
        if (this.repTimer) { clearInterval(this.repTimer); this.repTimer = null; }
        onComplete?.();
      }
    }, 2000);
  }

  announceRest(seconds: number) {
    this.speak(`Repos. ${seconds} secondes de récupération.`, { rate: 0.9, pitch: 0.95 });
  }

  announceSessionStart(programName: string, exerciseCount: number) {
    this.speak(
      `Début de la session ${programName}. ${exerciseCount} exercice${exerciseCount > 1 ? "s" : ""} au programme. C'est parti !`,
      { rate: 0.95 }
    );
  }
}

let voiceInstance: VoiceGuide | null = null;

export function getVoiceGuide(): VoiceGuide | null {
  if (typeof window === "undefined") return null;
  if (!("speechSynthesis" in window)) return null;
  if (!voiceInstance) voiceInstance = new VoiceGuide();
  return voiceInstance;
}

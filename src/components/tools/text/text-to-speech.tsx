"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { TTS_MAX_CHARS } from "@/lib/text-to-speech/speech";
import { cn, downloadBlob } from "@/lib/utils";

const DEFAULT_TEXT = "Hello from Utilvia. Type or paste any text, pick a voice, and listen instantly in your browser.";

export function TextToSpeechTool() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const next = window.speechSynthesis?.getVoices() ?? [];
      setVoices(next);
      setVoiceUri((current) => current || next[0]?.voiceURI || "");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const selectedVoice = voices.find((voice) => voice.voiceURI === voiceUri) ?? null;
  const charCount = text.length;
  const overLimit = charCount > TTS_MAX_CHARS;

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    utteranceRef.current = null;
  };

  const speak = () => {
    if (!text.trim()) {
      toast.error("Enter some text to speak.");
      return;
    }
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis is not available in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const download = async () => {
    if (!text.trim()) {
      toast.error("Enter some text to download.");
      return;
    }
    if (overLimit) {
      toast.error(`Keep text under ${TTS_MAX_CHARS} characters for download.`);
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          lang: selectedVoice?.lang ?? "en-US",
          rate,
          pitch,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Download failed");
      }

      const blob = await response.blob();
      downloadBlob(blob, "speech.mp3");
      toast.success("MP3 downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download audio.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="tts-text">Text</Label>
          <span className={cn("text-xs tabular-nums", overLimit ? "text-destructive" : "text-muted-foreground")}>
            {charCount.toLocaleString()} / {TTS_MAX_CHARS.toLocaleString()}
          </span>
        </div>
        <Textarea
          id="tts-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          placeholder="Type or paste the text you want to hear…"
          className="min-h-[12rem] text-base leading-relaxed"
        />
      </div>

      <div className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="tts-voice">Voice</Label>
          {voices.length ? (
            <select
              id="tts-voice"
              value={voiceUri}
              onChange={(event) => setVoiceUri(event.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink"
            >
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-muted-foreground">
              Voices load after the first interaction in some browsers. Try clicking Speak once.
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="tts-rate">Speed</Label>
              <span className="font-medium tabular-nums text-ink">{rate.toFixed(1)}×</span>
            </div>
            <Slider
              id="tts-rate"
              min={0.5}
              max={2}
              step={0.1}
              value={[rate]}
              onValueChange={([value]) => setRate(value)}
              aria-label="Speech speed"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="tts-pitch">Pitch</Label>
              <span className="font-medium tabular-nums text-ink">{pitch.toFixed(1)}</span>
            </div>
            <Slider
              id="tts-pitch"
              min={0.5}
              max={2}
              step={0.1}
              value={[pitch]}
              onValueChange={([value]) => setPitch(value)}
              aria-label="Speech pitch"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={speak}
          disabled={!text.trim() || speaking}
          className="min-h-11 flex-1 gap-2"
        >
          <Volume2 className="h-4 w-4" aria-hidden />
          Speak
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={stop}
          disabled={!speaking}
          className="min-h-11 flex-1 gap-2"
        >
          <Square className="h-4 w-4" aria-hidden />
          Stop
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={download}
          disabled={!text.trim() || overLimit || downloading}
          className="min-h-11 flex-1 gap-2"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Preparing…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden />
              Download MP3
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Playback uses your browser voices with your speed and pitch settings. Download saves an MP3 file of the same text.
      </p>
    </div>
  );
}

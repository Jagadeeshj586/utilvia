"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  STATUS_COPY,
  extensionFromMime,
  formatElapsed,
  isWebmMime,
  permissionErrorMessage,
  pickRecorderMime,
  recordingFilename,
  supportError,
  type RecorderStatus,
} from "@/lib/audio-recorder/recorder";
import { cn, downloadBlob, formatBytes } from "@/lib/utils";

type Session = {
  id: number;
  blob: Blob;
  url: string;
  durationMs: number;
  mime: string;
};

const LEVEL_BARS = 16;

function rmsLevel(data: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const sample = (data[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.min(1, Math.sqrt(sum / data.length) * 4);
}

export function AudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [blocked, setBlocked] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef(0);
  const pausedMsRef = useRef(0);
  const pauseStartedRef = useRef<number | null>(null);
  const nextIdRef = useRef(1);
  const audioRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const sessionsRef = useRef<Session[]>([]);
  const statusRef = useRef<RecorderStatus>(status);
  sessionsRef.current = sessions;
  statusRef.current = status;

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    analyserRef.current = null;
    if (audioRef.current) {
      void audioRef.current.close().catch(() => undefined);
      audioRef.current = null;
    }
    setLevel(0);
  }, []);

  useEffect(() => {
    setBlocked(supportError());
    return () => {
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
      stopTracks();
      sessionsRef.current.forEach((session) => URL.revokeObjectURL(session.url));
    };
  }, [stopTracks]);

  useEffect(() => {
    if (status !== "recording") return undefined;
    const tick = () => {
      elapsedRef.current = Date.now() - startedAtRef.current - pausedMsRef.current;
      setElapsed(elapsedRef.current);
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [status]);

  const watchLevel = useCallback((stream: MediaStream) => {
    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const context = new Ctor();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioRef.current = context;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.fftSize);

    const draw = () => {
      if (!analyserRef.current) return;
      if (statusRef.current === "paused") {
        setLevel(0);
      } else {
        analyserRef.current.getByteTimeDomainData(data);
        setLevel(rmsLevel(data));
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const start = async () => {
    const reason = supportError();
    if (reason) {
      setBlocked(reason);
      toast.error(reason);
      return;
    }
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMime((type) => MediaRecorder.isTypeSupported(type));
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      elapsedRef.current = 0;
      pausedMsRef.current = 0;
      pauseStartedRef.current = null;
      startedAtRef.current = Date.now();
      setElapsed(0);

      rec.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      rec.onerror = () => {
        toast.error("Recording failed. Try again.");
        rec.stop();
      };
      rec.onstop = () => {
        const mime = rec.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        stopTracks();
        recorderRef.current = null;
        setStatus("idle");
        if (!blob.size) {
          toast.error("Nothing was captured. Try a slightly longer take.");
          setElapsed(0);
          return;
        }
        const url = URL.createObjectURL(blob);
        const durationMs = elapsedRef.current;
        setSessions((current) => [
          { id: nextIdRef.current, blob, url, durationMs, mime },
          ...current,
        ]);
        nextIdRef.current += 1;
        setElapsed(0);
      };

      recorderRef.current = rec;
      rec.start(250);
      watchLevel(stream);
      setStatus("recording");
    } catch (error) {
      stopTracks();
      setStatus("idle");
      const message = permissionErrorMessage(error);
      toast.error(message);
    }
  };

  const pause = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.pause();
    pauseStartedRef.current = Date.now();
    setStatus("paused");
  };

  const resume = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "paused") return;
    if (pauseStartedRef.current != null) {
      pausedMsRef.current += Date.now() - pauseStartedRef.current;
      pauseStartedRef.current = null;
    }
    rec.resume();
    setStatus("recording");
  };

  const stop = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    if (rec.state === "paused") rec.resume();
    rec.stop();
  };

  const downloadSession = (session: Session, indexFromNewest: number) => {
    const index = sessions.length - indexFromNewest;
    downloadBlob(session.blob, recordingFilename(index, session.mime));
    toast.success("Download started");
  };

  const removeSession = (id: number) => {
    setSessions((current) => {
      const match = current.find((session) => session.id === id);
      if (match) URL.revokeObjectURL(match.url);
      return current.filter((session) => session.id !== id);
    });
  };

  const latestMime = sessions[0]?.mime ?? "";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-2xl border border-[var(--hairline)] bg-surface-card px-6 py-10 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              status === "recording" ? "animate-pulse bg-coral" : status === "paused" ? "bg-amber" : "bg-[var(--hairline)]",
            )}
            aria-hidden
          />
          <p className="text-sm font-medium text-[var(--muted-ink)]" aria-live="polite">
            {STATUS_COPY[status]}
          </p>
        </div>

        <p className="font-display text-6xl font-semibold tabular-nums tracking-tight text-ink sm:text-7xl" aria-label={`Elapsed ${formatElapsed(elapsed)}`}>
          {formatElapsed(elapsed)}
        </p>

        {status === "recording" || status === "paused" ? (
          <div className="mx-auto mt-6 flex h-8 max-w-xs items-end justify-center gap-0.5" aria-hidden>
            {Array.from({ length: LEVEL_BARS }, (_, index) => {
              const threshold = (index + 1) / LEVEL_BARS;
              const active = status === "recording" && level >= threshold * 0.35;
              return (
                <span
                  key={index}
                  className={cn(
                    "w-1.5 rounded-sm transition-colors",
                    active ? "bg-coral" : "bg-[var(--hairline)]",
                  )}
                  style={{ height: `${18 + (index % 5) * 6}px` }}
                />
              );
            })}
          </div>
        ) : (
          <div className="mx-auto mt-6 flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-coral">
            <Mic className="h-5 w-5" aria-hidden />
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {status === "idle" || status === "requesting" ? (
            <Button type="button" className="min-h-10 min-w-40" onClick={() => void start()} disabled={Boolean(blocked) || status === "requesting"}>
              <Mic className="h-4 w-4" />
              {status === "requesting" ? "Starting…" : "Start Recording"}
            </Button>
          ) : null}
          {status === "recording" ? (
            <>
              <Button type="button" variant="outline" className="min-h-10" onClick={pause}>
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button type="button" className="min-h-10" onClick={stop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          ) : null}
          {status === "paused" ? (
            <>
              <Button type="button" className="min-h-10" onClick={resume}>
                <Play className="h-4 w-4" />
                Resume
              </Button>
              <Button type="button" variant="outline" className="min-h-10" onClick={stop}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {blocked ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{blocked}</p>
      ) : (
        <p className="text-center text-sm text-[var(--muted-ink)]">
          {latestMime && !isWebmMime(latestMime)
            ? `This browser saves ${extensionFromMime(latestMime).toUpperCase()} instead of WebM. Audio stays on your device until you download it.`
            : "Recordings are saved as WebM when your browser supports it. Audio stays in your browser until you download it."}
        </p>
      )}

      {sessions.length ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-ink">This session</h2>
          <ul className="space-y-3">
            {sessions.map((session, index) => (
              <li key={session.id} className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Recording {sessions.length - index}</p>
                    <p className="text-xs text-[var(--muted-ink)]">
                      {formatElapsed(session.durationMs)} · {formatBytes(session.blob.size)} · {extensionFromMime(session.mime).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="min-h-10" onClick={() => downloadSession(session, index)}>
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-10"
                      onClick={() => removeSession(session.id)}
                      aria-label={`Remove recording ${sessions.length - index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <audio controls src={session.url} className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const seek = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta));
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
  }, []);

  const jumpToEnd = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = audio.duration;
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVol = Math.max(0, Math.min(1, audio.volume + delta));
    audio.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && audio.muted) {
      audio.muted = false;
      setMuted(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Home':
          e.preventDefault();
          restart();
          break;
        case 'End':
          e.preventDefault();
          jumpToEnd();
          break;
      }
    },
    [togglePlay, seek, adjustVolume, toggleMute, restart, jumpToEnd]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);
    const onVolumeChange = () => {
      setVolume(audio.volume);
      setMuted(audio.muted);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('volumechange', onVolumeChange);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('volumechange', onVolumeChange);
    };
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    audio.currentTime = frac * duration;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={playerRef}
      className="w-full bg-gray-50 border border-border-custom rounded-lg p-4 space-y-3"
      role="application"
      aria-label={`Audio player for ${title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress bar */}
      <div
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
        onClick={handleProgressClick}
        role="slider"
        aria-label={`Audio progress: ${formatTime(currentTime)} of ${formatTime(duration)}`}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={-1}
      >
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercent}% - 8px)` }}
        />
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={() => seek(-10)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Rewind 10 seconds"
        >
          <SkipBack className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs">10s</span>
        </button>

        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={
            playing ? `Pause audio narration of ${title}` : `Play audio narration of ${title}`
          }
        >
          {playing ? (
            <Pause className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
          )}
        </button>

        <button
          onClick={() => seek(10)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Forward 10 seconds"
        >
          <span className="text-xs">10s</span>
          <SkipForward className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          <label htmlFor="speed-select" className="sr-only">
            Playback speed
          </label>
          <select
            id="speed-select"
            value={playbackRate}
            onChange={(e) => {
              const rate = parseFloat(e.target.value);
              setPlaybackRate(rate);
              if (audioRef.current) audioRef.current.playbackRate = rate;
            }}
            className="text-xs px-2 py-1 border border-border-custom rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const audio = audioRef.current;
              if (!audio) return;
              audio.volume = val;
              audio.muted = val === 0;
              setVolume(val);
              setMuted(val === 0);
            }}
            className="w-20 h-1.5 accent-primary"
            aria-label="Volume"
          />
        </div>

        {/* Download */}
        <a
          href={src}
          download
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Download audio"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";

interface PlaylistItem {
  src: string;
  [key: string]: any;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  progress: number;
  duration: number;
  currentTime: number;
  currentIndex: number;
  seek: (percent: number) => void;
}

export default function useAudioPlayer(playlist: PlaylistItem[]): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);   // 0-100 (%)
  const [duration, setDuration] = useState<number>(0);   // in seconds
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds

  // Load song whenever currentIndex changes
  useEffect(() => {
    if (playlist.length === 0) return;

    const audio = audioRef.current;
    audio.src = playlist[currentIndex].src;

    // Set up event listeners
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => next();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    // Play automatically if already in play mode
    if (isPlaying) audio.play();

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentIndex, isPlaying, playlist]);

  const play = useCallback((): void => {
    audioRef.current.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback((): void => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const next = useCallback((): void => {
    setCurrentIndex((i) => (i + 1) % playlist.length);
  }, [playlist.length]);

  const prev = useCallback((): void => {
    setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const seek = useCallback((percent: number): void => {
    const audio = audioRef.current;
    audio.currentTime = (percent / 100) * audio.duration;
  }, []);

  return {
    isPlaying,
    play,
    pause,
    next,
    prev,
    progress,
    duration,
    currentTime,
    currentIndex,
    seek,
  };
}

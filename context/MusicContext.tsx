import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Song } from "@/constants/Songs";
import { router } from "expo-router";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MusicContextType {
  // Current song state
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  // Playlist state
  playlist: Song[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: "none" | "one" | "all";
  upNext: Song[]; // Queue of songs to play next

  // Audio state
  sound: Audio.Sound | null;

  // Favorites state
  favoriteSongs: string[]; // Array of song IDs

  // Actions
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (songs: Song[]) => void;
  setCurrentIndex: (index: number) => void;
  setIsShuffled: (shuffled: boolean) => void;
  setRepeatMode: (mode: "none" | "one" | "all") => void;

  // Utility functions
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  playSongFromPlaylist: (index: number) => void;
  openMusicPlayer: () => void;
  syncDeviceVolume: () => void;
  loadAndPlaySong: (song: Song) => Promise<void>;

  // Queue functions
  addToUpNext: (song: Song) => void;
  removeFromUpNext: (index: number) => void;
  clearUpNext: () => void;

  // Favorites functions
  toggleFavorite: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  getFavoriteSongs: () => Song[];
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  // State management
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.75);

  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [upNext, setUpNext] = useState<Song[]>([]);

  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Favorites state
  const [favoriteSongs, setFavoriteSongs] = useState<string[]>([]);

  // Initialize with first song when context loads
  useEffect(() => {
    const initializeDefaultSong = async () => {
      try {
        const { songs } = require("@/constants/Songs");
        if (songs && songs.length > 0 && !currentSong) {
          setCurrentSong(songs[0]);
          setPlaylist(songs);
          setDuration(songs[0].duration);
        }
      } catch (error) {
        console.log("Error initializing default song:", error);
      }
    };

    initializeDefaultSong();
  }, []);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Sync with device volume on mount
  useEffect(() => {
    syncDeviceVolume();

    // Cleanup sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Update volume when volume state changes
  useEffect(() => {
    if (sound) {
      sound.setVolumeAsync(volume);
    }
  }, [volume, sound]);

  // Functions for navigation and volume
  const openMusicPlayer = () => {
    router.push("/(tabs)/MusicPlayer");
  };

  // Favorites functions
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favoriteSongs");
      if (stored) {
        setFavoriteSongs(JSON.parse(stored));
      }
    } catch (error) {
      console.log("Error loading favorites:", error);
    }
  };

  const saveFavorites = async (favorites: string[]) => {
    try {
      await AsyncStorage.setItem("favoriteSongs", JSON.stringify(favorites));
    } catch (error) {
      console.log("Error saving favorites:", error);
    }
  };

  const toggleFavorite = (songId: string) => {
    let newFavorites: string[];
    if (favoriteSongs.includes(songId)) {
      newFavorites = favoriteSongs.filter((id) => id !== songId);
    } else {
      newFavorites = [...favoriteSongs, songId];
    }
    setFavoriteSongs(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (songId: string) => {
    return favoriteSongs.includes(songId);
  };

  const getFavoriteSongs = () => {
    // Import songs here to avoid circular dependency
    const { songs } = require("@/constants/Songs");
    return songs.filter((song: Song) => favoriteSongs.includes(song.id));
  };

  // Queue functions
  const addToUpNext = (song: Song) => {
    setUpNext((prev) => [...prev, song]);
  };

  const removeFromUpNext = (index: number) => {
    setUpNext((prev) => prev.filter((_, i) => i !== index));
  };

  const clearUpNext = () => {
    setUpNext([]);
  };

  const syncDeviceVolume = async () => {
    try {
      // Set up audio mode for music playback
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // For Expo, we'll set a reasonable default volume
      // The actual volume control will be handled by the system
      setVolume(0.75);

      // Note: expo-av doesn't provide direct device volume access
      // but the audio will respect system volume settings
      console.log("Audio system initialized for volume sync");
    } catch (error) {
      console.log("Audio system setup failed:", error);
      setVolume(0.75); // fallback to default volume
    }
  };

  const loadAndPlaySong = async (song: Song) => {
    try {
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (song.audio) {
        // Create and load new sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: song.audio },
          {
            shouldPlay: true,
            volume: volume,
            isLooping: repeatMode === "one",
          }
        );

        setSound(newSound);

        // Get duration
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        }

        // Set up playback status update
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setCurrentTime(
              status.positionMillis ? status.positionMillis / 1000 : 0
            );
            setIsPlaying(status.isPlaying);

            // Handle song end
            if (status.didJustFinish && !status.isLooping) {
              playNext();
            }
          }
        });

        setIsPlaying(true);
      }
    } catch (error) {
      console.log("Error loading song:", error);
    }
  };

  // Utility functions
  const playNext = async () => {
    // Check if there are songs in the "Up Next" queue first
    if (upNext.length > 0) {
      const nextSong = upNext[0];
      // Remove the song from the queue
      setUpNext((prev) => prev.slice(1));
      // Play the next song from queue
      setCurrentSong(nextSong);
      setCurrentTime(0);
      await loadAndPlaySong(nextSong);
      return;
    }

    // If no queue, proceed with normal playlist logic
    if (playlist.length === 0) return;

    let nextIndex: number;

    if (repeatMode === "one") {
      // Stay on the same song
      nextIndex = currentIndex;
    } else if (repeatMode === "all") {
      // Loop to the beginning if at the end
      nextIndex = (currentIndex + 1) % playlist.length;
    } else {
      // No repeat - stop if at the end
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
    setCurrentTime(0);

    // Load and play the next song
    await loadAndPlaySong(playlist[nextIndex]);
  };

  const playPrevious = async () => {
    if (playlist.length === 0) return;

    let prevIndex: number;

    if (repeatMode === "all") {
      // Loop to the end if at the beginning
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    } else {
      // No repeat - stop if at the beginning
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        setCurrentTime(0);
        return;
      }
    }

    setCurrentIndex(prevIndex);
    setCurrentSong(playlist[prevIndex]);
    setCurrentTime(0);

    // Load and play the previous song
    await loadAndPlaySong(playlist[prevIndex]);
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const playSongFromPlaylist = async (index: number) => {
    if (playlist.length === 0 || index < 0 || index >= playlist.length) return;

    setCurrentIndex(index);
    setCurrentSong(playlist[index]);
    setCurrentTime(0);

    // Load and play the new song
    await loadAndPlaySong(playlist[index]);
  };

  const contextValue: MusicContextType = {
    // State
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    currentIndex,
    isShuffled,
    repeatMode,
    upNext,
    sound,
    favoriteSongs,

    // Setters
    setCurrentSong,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setPlaylist,
    setCurrentIndex,
    setIsShuffled,
    setRepeatMode,

    // Functions
    playNext,
    playPrevious,
    togglePlayPause,
    playSongFromPlaylist,
    openMusicPlayer,
    syncDeviceVolume,
    loadAndPlaySong,

    // Queue functions
    addToUpNext,
    removeFromUpNext,
    clearUpNext,

    // Favorites functions
    toggleFavorite,
    isFavorite,
    getFavoriteSongs,
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
};

// Custom hook to use the Music Context
export const useMusicContext = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};

export default MusicContext;

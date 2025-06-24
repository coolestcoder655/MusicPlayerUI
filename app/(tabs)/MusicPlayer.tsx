import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/Feather";
import { songs, getCurrentSong, Song } from "../../constants/Songs";

const { width, height } = Dimensions.get("window");

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(137);
  const [duration, setDuration] = useState(243);
  const [volume, setVolume] = useState(0.75);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const currentSong = songs[currentSongIndex];
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying && currentTime < currentSong.duration) {
      interval = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, currentSong.duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, currentSong.duration]);

  interface FormatTime {
    (seconds: number): string;
  }

  const formatTime: FormatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };
  const getRepeatIcon = () => {
    if (repeatMode === 2) return "repeat";
    return "repeat";
  };

  const playNext = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSongIndex(randomIndex);
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    }
    setCurrentTime(0);
  };

  const playPrevious = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSongIndex(randomIndex);
    } else {
      setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    }
    setCurrentTime(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["#6366f1", "#3b82f6", "#1e40af"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>NOW PLAYING</Text>
        </View>

        {/* Album Art Section */}
        <View style={styles.albumSection}>
          <View style={styles.albumArtContainer}>
            <Image
              source={{ uri: currentSong.cover }}
              style={styles.albumArt}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{currentSong.title}</Text>
          <Text style={styles.artistName}>{currentSong.artist}</Text>
          <Text style={styles.albumName}>{currentSong.album}</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          {" "}
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={currentSong.duration}
            value={currentTime}
            onValueChange={setCurrentTime}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>
              {formatTime(currentSong.duration)}
            </Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity
            onPress={() => setIsShuffled(!isShuffled)}
            style={[styles.controlButton, isShuffled && styles.activeButton]}
          >
            <Icon
              name="shuffle"
              size={24}
              color={isShuffled ? "#10b981" : "rgba(255, 255, 255, 0.7)"}
            />
          </TouchableOpacity>{" "}
          <TouchableOpacity style={styles.controlButton} onPress={playPrevious}>
            <Icon name="skip-back" size={32} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            style={styles.playButton}
          >
            <Icon
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="#000000"
              style={!isPlaying && { marginLeft: 3 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={playNext}>
            <Icon
              name="skip-forward"
              size={32}
              color="rgba(255, 255, 255, 0.9)"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleRepeat}
            style={[
              styles.controlButton,
              repeatMode > 0 && styles.activeButton,
            ]}
          >
            <Icon
              name={getRepeatIcon()}
              size={24}
              color={repeatMode > 0 ? "#10b981" : "rgba(255, 255, 255, 0.7)"}
            />
            {repeatMode === 2 && (
              <View style={styles.repeatBadge}>
                <Text style={styles.repeatBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            onPress={() => setIsLiked(!isLiked)}
            style={styles.secondaryButton}
          >
            <Icon
              name="heart"
              size={24}
              color={isLiked ? "#ef4444" : "rgba(255, 255, 255, 0.7)"}
            />
          </TouchableOpacity>

          <View style={styles.volumeContainer}>
            <Icon name="volume-2" size={20} color="rgba(255, 255, 255, 0.7)" />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            />
            <Text style={styles.volumeText}>{Math.round(volume * 100)}</Text>
          </View>

          <TouchableOpacity style={styles.secondaryButton}>
            <Icon
              name="more-horizontal"
              size={24}
              color="rgba(255, 255, 255, 0.7)"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  albumSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  albumArtContainer: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
  },
  albumArt: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  songInfo: {
    alignItems: "center",
    paddingBottom: 32,
  },
  songTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  artistName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 20,
    marginBottom: 4,
    textAlign: "center",
  },
  albumName: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    textAlign: "center",
  },
  progressSection: {
    paddingBottom: 32,
  },
  progressSlider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#FFFFFF",
    width: 16,
    height: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  timeText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  controlButton: {
    padding: 12,
    borderRadius: 24,
  },
  activeButton: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  playButton: {
    backgroundColor: "#FFFFFF",
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  repeatBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#10b981",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  repeatBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  secondaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 32,
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 24,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    maxWidth: 200,
    marginHorizontal: 16,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  volumeThumb: {
    backgroundColor: "#FFFFFF",
    width: 12,
    height: 12,
  },
  volumeText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    width: 24,
    textAlign: "right",
  },
});

export default MusicPlayer;

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
  FlatList,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/Feather";
import { getSongs, Song } from "../../constants/Songs";
import { useMusicContext } from "@/context/MusicContext";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playlist,
    currentIndex,
    isShuffled,
    repeatMode,
    upNext,
    sound,
    setIsPlaying,
    setCurrentTime,
    setIsShuffled,
    setRepeatMode,
    playNext,
    playPrevious,
    togglePlayPause,
    syncDeviceVolume,
    toggleFavorite,
    isFavorite,
    addToUpNext,
    removeFromUpNext,
    clearUpNext,
  } = useMusicContext();

  const [showUpNext, setShowUpNext] = useState(false);
  const [fallbackSongs, setFallbackSongs] = useState<Song[]>([]);

  // Load fallback songs
  useEffect(() => {
    const loadFallbackSongs = async () => {
      const songsData = await getSongs();
      setFallbackSongs(songsData);
    };
    loadFallbackSongs();
  }, []);

  // Sync device volume on mount
  useEffect(() => {
    syncDeviceVolume();
  }, []);

  // Use the current song from context, fallback to first song if none selected
  const displaySong = currentSong ||
    fallbackSongs[0] || {
      title: "",
      artist: "",
      album: "",
      duration: 0,
      cover: "",
      id: "",
    };

  useEffect(() => {
    let interval: any;
    if (isPlaying && displaySong && currentTime < displaySong.duration) {
      interval = setInterval(() => {
        setCurrentTime(Math.min(currentTime + 1, displaySong.duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, displaySong?.duration]);

  interface FormatTime {
    (seconds: number): string;
  }

  const formatTime: FormatTime = (seconds) => {
    // Ensure seconds is a valid number
    const validSeconds =
      isNaN(seconds) || !isFinite(seconds) ? 0 : Math.max(0, seconds);
    const mins = Math.floor(validSeconds / 60);
    const secs = Math.floor(validSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRepeat = () => {
    if (repeatMode === "none") {
      setRepeatMode("all");
    } else if (repeatMode === "all") {
      setRepeatMode("one");
    } else {
      setRepeatMode("none");
    }
  };

  const handleSeek = async (value: number) => {
    setCurrentTime(value);
    if (sound) {
      await sound.setPositionAsync(value * 1000); // Convert to milliseconds
    }
  };

  const getRepeatIcon = () => {
    if (repeatMode === "one") return "repeat";
    return "repeat";
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
          <Text style={styles.headerText}>
            {currentSong ? "NOW PLAYING" : "SELECT A SONG"}
          </Text>
        </View>

        {currentSong ? (
          <>
            {/* Album Art Section */}
            <View style={styles.albumSection}>
              <View style={styles.albumArtContainer}>
                <Image
                  source={{
                    uri:
                      displaySong?.cover ||
                      "https://via.placeholder.com/300x300/6366f1/ffffff?text=No+Cover",
                  }}
                  style={styles.albumArt}
                  resizeMode="cover"
                  onError={(error) => console.log("Image load error:", error)}
                  onLoad={() => console.log("Image loaded successfully")}
                />
              </View>
            </View>

            {/* Song Info */}
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{displaySong?.title || ""}</Text>
              <Text style={styles.artistName}>{displaySong?.artist || ""}</Text>
              <Text style={styles.albumName}>{displaySong?.album || ""}</Text>
            </View>
          </>
        ) : (
          <View style={styles.noSongContainer}>
            <Icon name="music" size={80} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.noSongText}>
              Go to the Music Library tab to select a song
            </Text>
          </View>
        )}

        {currentSong && (
          <>
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <Slider
                style={styles.progressSlider}
                minimumValue={0}
                maximumValue={Math.max(displaySong?.duration || 0, 1)}
                value={Math.max(
                  0,
                  Math.min(currentTime || 0, displaySong?.duration || 0)
                )}
                onValueChange={handleSeek}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {formatTime(currentTime || 0)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(displaySong?.duration || 0)}
                </Text>
              </View>
            </View>

            {/* Main Controls */}
            <View style={styles.mainControls}>
              <TouchableOpacity
                onPress={() => setIsShuffled(!isShuffled)}
                style={[
                  styles.controlButton,
                  isShuffled && styles.activeButton,
                ]}
              >
                <Icon
                  name="shuffle"
                  size={24}
                  color={isShuffled ? "#10b981" : "rgba(255, 255, 255, 0.7)"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={playPrevious}
              >
                <Icon
                  name="skip-back"
                  size={32}
                  color="rgba(255, 255, 255, 0.9)"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={togglePlayPause}
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
                  repeatMode !== "none" && styles.activeButton,
                ]}
              >
                <Icon
                  name={getRepeatIcon()}
                  size={24}
                  color={
                    repeatMode !== "none"
                      ? "#10b981"
                      : "rgba(255, 255, 255, 0.7)"
                  }
                />
                {repeatMode === "one" && (
                  <View style={styles.repeatBadge}>
                    <Text style={styles.repeatBadgeText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Secondary Controls */}
            <View style={styles.secondaryControls}>
              <TouchableOpacity
                onPress={() => currentSong && toggleFavorite(currentSong.id)}
                style={styles.secondaryButton}
              >
                <Icon
                  name="heart"
                  size={24}
                  color={
                    currentSong && isFavorite(currentSong.id)
                      ? "#ef4444"
                      : "rgba(255, 255, 255, 0.7)"
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowUpNext(true)}
              >
                <Icon name="list" size={24} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>

      {/* Up Next Modal */}
      <Modal
        visible={showUpNext}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUpNext(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Up Next</Text>
            <View style={styles.modalHeaderButtons}>
              {upNext.length > 0 && (
                <TouchableOpacity
                  onPress={clearUpNext}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowUpNext(false)}
                style={styles.closeButton}
              >
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {upNext.length === 0 ? (
            <View style={styles.emptyUpNext}>
              <Icon name="music" size={60} color="rgba(0, 0, 0, 0.3)" />
              <Text style={styles.emptyUpNextText}>
                No songs in queue. Add songs from the music library!
              </Text>
            </View>
          ) : (
            <FlatList
              data={upNext}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.upNextItem}>
                  <Text style={styles.upNextIndex}>{index + 1}</Text>
                  <Image
                    source={{ uri: item.cover }}
                    style={styles.upNextCover}
                  />
                  <View style={styles.upNextInfo}>
                    <Text style={styles.upNextTitle}>{item.title}</Text>
                    <Text style={styles.upNextArtist}>{item.artist}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromUpNext(index)}
                    style={styles.removeButton}
                  >
                    <Icon name="x" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.upNextList}
            />
          )}
        </View>
      </Modal>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  albumSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  albumArtContainer: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  albumArt: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  songInfo: {
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 12,
  },
  noSongContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noSongText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 40,
  },
  songTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  artistName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 2,
    textAlign: "center",
  },
  albumName: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    textAlign: "center",
  },
  progressSection: {
    paddingBottom: 20,
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
    paddingBottom: 24,
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
    justifyContent: "space-around",
    paddingBottom: 20,
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 24,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  modalHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  emptyUpNext: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyUpNextText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 32,
  },
  upNextList: {
    flex: 1,
  },
  upNextItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  upNextIndex: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    width: 24,
    marginRight: 12,
  },
  upNextCover: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  upNextInfo: {
    flex: 1,
  },
  upNextTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  upNextArtist: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 8,
  },
});

export default MusicPlayer;

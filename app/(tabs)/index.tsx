import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { Song } from "@/constants/Songs";
import { useMusicContext } from "@/context/MusicContext";
import { useSongs } from "@/Hooks/useSongs";

const IndexPage = () => {
  const router = useRouter();
  const {
    currentSong,
    setPlaylist,
    playSongFromPlaylist,
    openMusicPlayer,
    isPlaying,
    addToUpNext,
    toggleFavorite,
    isFavorite,
  } = useMusicContext();

  const { songs, loading, error, refetch } = useSongs();
  const [showMenu, setShowMenu] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSongPress = (song: Song, index: number) => {
    // Set the current playlist to all songs
    setPlaylist(songs);
    // Play the selected song
    playSongFromPlaylist(index);
    // Open the music player modal
    openMusicPlayer();
  };

  const handleMenuPress = (song: Song) => {
    setSelectedSong(song);
    setShowMenu(true);
  };

  const handleAddToUpNext = () => {
    if (selectedSong) {
      addToUpNext(selectedSong);
      Alert.alert(
        "Added to Queue",
        `"${selectedSong.title}" has been added to Up Next`
      );
    }
    setShowMenu(false);
  };

  const handleToggleFavorite = () => {
    if (selectedSong) {
      toggleFavorite(selectedSong.id);
      const action = isFavorite(selectedSong.id) ? "removed from" : "added to";
      Alert.alert(
        "Favorites Updated",
        `"${selectedSong.title}" has been ${action} favorites`
      );
    }
    setShowMenu(false);
  };

  const handleAddSong = () => {
    router.push("/(tabs)/MusicAdder");
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentSong = currentSong?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentSong && styles.currentSongItem]}
        onPress={() => handleSongPress(item, index)}
      >
        <Image source={{ uri: item.cover }} style={styles.albumCover} />
        <View style={styles.songInfo}>
          <Text
            style={[styles.songTitle, isCurrentSong && styles.currentSongText]}
          >
            {item.title}
          </Text>
          <Text style={styles.artistName}>{item.artist}</Text>
          <Text style={styles.albumName}>{item.album}</Text>
        </View>
        <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        {isCurrentSong && (
          <Icon
            name={isPlaying ? "volume-2" : "pause"}
            size={16}
            color="#007AFF"
            style={styles.playIcon}
          />
        )}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => handleMenuPress(item)}
        >
          <Icon
            name="more-horizontal"
            size={20}
            color="rgba(255, 255, 255, 0.7)"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Library</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading songs from database...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          style={styles.songList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Song Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSong}>
        <LinearGradient
          colors={["#ef4444", "#f97316"]} // red to orange gradient
          style={styles.addButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="plus" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Three Dots Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuModal}>
            <Text style={styles.menuTitle}>{selectedSong?.title}</Text>
            <Text style={styles.menuSubtitle}>{selectedSong?.artist}</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAddToUpNext}
            >
              <Icon name="plus" size={20} color="#007AFF" />
              <Text style={styles.menuItemText}>Add to Up Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleToggleFavorite}
            >
              <Icon
                name="heart"
                size={20}
                color={
                  selectedSong && isFavorite(selectedSong.id)
                    ? "#ef4444"
                    : "#007AFF"
                }
              />
              <Text style={styles.menuItemText}>
                {selectedSong && isFavorite(selectedSong.id)
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelItem]}
              onPress={() => setShowMenu(false)}
            >
              <Icon name="x" size={20} color="#666" />
              <Text style={[styles.menuItemText, styles.cancelText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default IndexPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  songList: {
    flex: 1,
    width: "100%",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    backgroundColor: "transparent",
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  albumName: {
    fontSize: 12,
    opacity: 0.5,
  },
  duration: {
    fontSize: 14,
    opacity: 0.7,
  },
  currentSongItem: {
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    borderColor: "rgba(0, 122, 255, 0.5)",
    borderWidth: 1,
  },
  currentSongText: {
    color: "#007AFF",
    fontWeight: "700",
  },
  playIcon: {
    marginLeft: 8,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
  },
  cancelItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  cancelText: {
    color: "#666",
  },
  // Add Song Button styles
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});

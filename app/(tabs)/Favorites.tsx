import React, { useState } from "react";
import {
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

import { Text, View } from "@/components/Themed";
import { Song } from "@/constants/Songs";
import { useMusicContext } from "@/context/MusicContext";

const FavoritesScreen = () => {
  const {
    currentSong,
    setPlaylist,
    playSongFromPlaylist,
    openMusicPlayer,
    isPlaying,
    getFavoriteSongs,
    toggleFavorite,
    isFavorite,
    addToUpNext,
  } = useMusicContext();

  const [showMenu, setShowMenu] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const favoriteSongs = getFavoriteSongs();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSongPress = (song: Song, index: number) => {
    // Set the current playlist to favorite songs
    setPlaylist(favoriteSongs);
    // Play the selected song
    playSongFromPlaylist(index);
    // Open the music player
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

  const handleRemoveFromFavorites = () => {
    if (selectedSong) {
      toggleFavorite(selectedSong.id);
      Alert.alert(
        "Removed from Favorites",
        `"${selectedSong.title}" has been removed from favorites`
      );
    }
    setShowMenu(false);
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
        <TouchableOpacity
          onPress={() => handleMenuPress(item)}
          style={styles.menuButton}
        >
          <Icon
            name="more-horizontal"
            size={20}
            color="rgba(255, 255, 255, 0.7)"
          />
        </TouchableOpacity>
        {isCurrentSong && (
          <Icon
            name={isPlaying ? "volume-2" : "pause"}
            size={16}
            color="#007AFF"
            style={styles.playIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Songs</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {favoriteSongs.length > 0 ? (
        <FlatList
          data={favoriteSongs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          style={styles.songList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="heart" size={80} color="rgba(128, 128, 128, 0.3)" />
          <Text style={styles.emptyText}>No favorite songs yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on songs to add them to your favorites
          </Text>
        </View>
      )}

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
              onPress={handleRemoveFromFavorites}
            >
              <Icon name="heart" size={20} color="#ef4444" />
              <Text style={styles.menuItemText}>Remove from Favorites</Text>
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

export default FavoritesScreen;

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
    marginRight: 12,
  },
  favoriteButton: {
    padding: 8,
    marginRight: 8,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
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
});

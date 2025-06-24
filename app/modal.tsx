import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import MusicPlayer from "./(tabs)/MusicPlayer";

export default function ModalScreen() {
  return (
    <>
      <MusicPlayer />
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}

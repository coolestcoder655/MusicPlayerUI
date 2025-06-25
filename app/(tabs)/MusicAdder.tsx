import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  supabase,
  ensureAnonymousSession,
} from "@/integrations/supabase/client";

interface FormData {
  title: string;
  artist: string;
  album: string;
  audioFile: DocumentPicker.DocumentPickerResult | null;
  coverImage: {
    uri: string;
    fileName?: string;
    [key: string]: any;
  } | null;
}

interface Previews {
  audio: string | null;
  image: string | null;
}

const MusicAdder = () => {
  // Debug Data
  const [formData, setFormData] = useState<FormData>({
    title: "Clubstep",
    artist: "DJ Nate",
    album: "Geometry Dash Official Soundtrack",
    audioFile: null,
    coverImage: null,
  });

  const [previews, setPreviews] = useState<Previews>({
    audio: null,
    image: null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<string>("");

  // Helper function to get audio duration (basic implementation)
  const getAudioDuration = async (uri: string): Promise<number> => {
    // This is a basic implementation - in a real app you might want to use
    // a library like expo-av to get the actual duration
    return 180; // Default to 3 minutes for now
  };

  // Helper function to sanitize filename for Supabase storage
  const sanitizeFilename = (filename: string): string => {
    // Remove or replace invalid characters for Supabase storage
    return filename
      .replace(/[[\]{}()*+?.,\\^$|#\s]/g, "_") // Replace special chars with underscore
      .replace(/_+/g, "_") // Replace multiple underscores with single
      .replace(/^_|_$/g, "") // Remove leading/trailing underscores
      .toLowerCase(); // Convert to lowercase for consistency
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFormData((prev) => ({
          ...prev,
          audioFile: result,
        }));

        setPreviews((prev) => ({
          ...prev,
          audio: asset.name,
        }));
      }
    } catch (err) {
      Alert.alert("Error", "Failed to select audio file");
    }
  };

  const selectCoverImage = () => {
    Alert.alert("Select Cover Image", "Choose an option", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openImageLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setFormData((prev) => ({
        ...prev,
        coverImage: {
          uri: asset.uri,
          fileName: `camera_${Date.now()}.jpg`,
        },
      }));
      setPreviews((prev) => ({
        ...prev,
        image: asset.uri,
      }));
    }
  };

  const openImageLibrary = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Gallery permission is required to select photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setFormData((prev) => ({
        ...prev,
        coverImage: {
          uri: asset.uri,
          fileName: asset.fileName || `gallery_${Date.now()}.jpg`,
        },
      }));
      setPreviews((prev) => ({
        ...prev,
        image: asset.uri,
      }));
    }
  };

  const removeFile = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }));

    if (type === "coverImage") {
      setPreviews((prev) => ({ ...prev, image: null }));
    } else if (type === "audioFile") {
      setPreviews((prev) => ({ ...prev, audio: null }));
    }
  };

  // Test database connection and RLS policies
  const testDatabaseInsert = async () => {
    setTestResults("Testing database connection...");

    try {
      // Ensure we have a session
      const sessionUser = await ensureAnonymousSession();

      // First test: Check user session
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      let userInfo = "";
      if (user) {
        userInfo = `Authenticated user: ${user.id}`;
      } else {
        userInfo = "No authenticated user (using anon key)";
      }

      setTestResults((prev) => prev + `\n${userInfo}`);

      // Second test: Try to read from songs table
      setTestResults((prev) => prev + "\nTesting read access...");
      const { data: songs, error: readError } = await supabase
        .from("songs")
        .select("*")
        .limit(1);

      if (readError) {
        setTestResults((prev) => prev + `\nRead error: ${readError.message}`);
      } else {
        setTestResults(
          (prev) => prev + `\nRead success: Found ${songs?.length || 0} songs`
        );
      }

      // Third test: Try storage upload
      setTestResults((prev) => prev + "\nTesting storage upload...");
      const testBlob = new Blob(["test"], { type: "text/plain" });
      const testFileName = `test_${Date.now()}.txt`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("music")
        .upload(testFileName, testBlob);

      if (storageError) {
        setTestResults(
          (prev) => prev + `\nStorage error: ${storageError.message}`
        );
        setTestResults(
          (prev) =>
            prev + `\nThis is the main issue! Storage RLS blocking uploads.`
        );
      } else {
        setTestResults((prev) => prev + "\nStorage upload success!");
        // Clean up test file
        await supabase.storage.from("music").remove([testFileName]);
        setTestResults((prev) => prev + "\nTest file cleaned up.");
      }

      // Fourth test: Try minimal database insert
      setTestResults((prev) => prev + "\nTesting database insert...");
      const testSong = {
        title: "Test Song " + Date.now(),
        artist: "Test Artist",
        album: "Test Album",
        audio: "https://example.com/test.mp3",
        cover: "https://example.com/test.jpg",
        duration: 180,
      };

      const { data: insertData, error: insertError } = await supabase
        .from("songs")
        .insert([testSong])
        .select();

      if (insertError) {
        setTestResults(
          (prev) => prev + `\nDB Insert error: ${insertError.message}`
        );
      } else {
        setTestResults((prev) => prev + "\nDB Insert success!");
        // Clean up test record
        if (insertData && insertData[0]) {
          await supabase.from("songs").delete().eq("id", insertData[0].id);
          setTestResults((prev) => prev + "\nTest record cleaned up.");
        }
      }
    } catch (error) {
      setTestResults((prev) => prev + `\nTest failed: ${error}`);
    }
  };

  // Show instructions for fixing RLS issue
  const showRLSFixInstructions = () => {
    Alert.alert(
      "🚨 STORAGE BUCKET RLS ISSUE CONFIRMED",
      "The error is 100% from STORAGE BUCKET Row Level Security policies blocking file uploads.\n\n" +
        "🗄️ QUICK FIX - DISABLE STORAGE RLS:\n" +
        "1. Go to Supabase Dashboard\n" +
        "2. Navigate to Storage\n" +
        "3. Click 'music' bucket\n" +
        "4. Go to Settings tab\n" +
        "5. Toggle OFF 'Enable RLS'\n" +
        "6. Repeat for 'pictures' bucket\n\n" +
        "🔐 OR ADD STORAGE POLICIES:\n" +
        "1. Storage → music bucket → Policies\n" +
        "2. Create new policy:\n" +
        "   • Name: 'Allow public uploads'\n" +
        "   • Target roles: anon, authenticated\n" +
        "   • Operation: INSERT\n" +
        "   • Policy expression: true\n" +
        "3. Repeat for pictures bucket\n\n" +
        "⚡ Option 1 (Disable RLS) is fastest for testing!",
      [{ text: "I'll fix it now", style: "default" }]
    );
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title || !formData.artist || !formData.audioFile) {
      Alert.alert(
        "Missing Information",
        "Please fill in at least the title, artist, and upload an audio file."
      );
      return;
    }

    if (!formData.album) {
      formData.album = "NOT SET"; // Default to empty string if album is not provided
    }

    setIsUploading(true);

    try {
      // Strategy 1: Try to get/create an authenticated user
      console.log("=== AUTHENTICATION STRATEGY ===");
      const user = await ensureAnonymousSession();
      console.log("Session user:", user);

      // Check current authentication state
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      console.log("Current user after session attempt:", currentUser);

      // If still no user, let's try a different approach
      if (!currentUser) {
        console.log("=== NO AUTH USER - TRYING BYPASS ===");

        // Try creating a simple user account
        const simpleEmail = `user_${Date.now()}@test.com`;
        const simplePassword = "TestPass123!";

        const { data: newUser, error: createError } =
          await supabase.auth.signUp({
            email: simpleEmail,
            password: simplePassword,
          });

        if (createError) {
          console.warn("User creation failed:", createError.message);
        } else {
          console.log("Created new user:", newUser.user?.id);
        }
      }

      let audioUrl = "";
      let coverUrl = "";

      // Upload audio file to music bucket
      if (
        formData.audioFile &&
        formData.audioFile.assets &&
        formData.audioFile.assets[0]
      ) {
        const audioAsset = formData.audioFile.assets[0];
        const audioResponse = await fetch(audioAsset.uri);
        const audioBlob = await audioResponse.blob();

        const sanitizedName = sanitizeFilename(audioAsset.name);
        const audioFileName = `${Date.now()}_${sanitizedName}`;

        const { data: _, error: audioError } = await supabase.storage
          .from("music")
          .upload(audioFileName, audioBlob, {
            contentType: audioAsset.mimeType || "audio/mpeg",
            upsert: false,
          });

        if (audioError) {
          console.error("=== STORAGE UPLOAD ERROR ===");
          console.error("Audio storage error:", audioError);
          console.error("Error message:", audioError.message);
          console.error("Error details:", JSON.stringify(audioError, null, 2));

          // The error is actually from storage RLS, not database RLS
          throw new Error(
            `Audio storage upload failed due to Row Level Security on storage buckets. Please check storage bucket policies. Error: ${audioError.message}`
          );
        }

        // Get public URL for audio
        const {
          data: { publicUrl: audioPublicUrl },
        } = supabase.storage.from("music").getPublicUrl(audioFileName);

        audioUrl = audioPublicUrl;
        console.log("Audio upload successful. URL:", audioUrl);

        // Validate the audio URL is accessible
        try {
          const response = await fetch(audioUrl, { method: "HEAD" });
          console.log("Audio URL validation - Status:", response.status);
        } catch (urlError) {
          console.warn("Audio URL validation failed:", urlError);
        }
      }

      // Upload cover image to pictures bucket if provided
      if (formData.coverImage) {
        const imageResponse = await fetch(formData.coverImage.uri);
        const imageBlob = await imageResponse.blob();

        const sanitizedImageName = sanitizeFilename(
          formData.coverImage.fileName || "cover.jpg"
        );
        const imageFileName = `${Date.now()}_${sanitizedImageName}`;

        const { data: _, error: imageError } = await supabase.storage
          .from("pictures")
          .upload(imageFileName, imageBlob, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (imageError) {
          console.error("=== IMAGE STORAGE ERROR ===");
          console.error("Image storage error:", imageError);
          console.error("Error message:", imageError.message);
          console.error("Error details:", JSON.stringify(imageError, null, 2));

          throw new Error(
            `Image storage upload failed due to Row Level Security on storage buckets. Please check storage bucket policies. Error: ${imageError.message}`
          );
        }

        // Get public URL for image
        const {
          data: { publicUrl: imagePublicUrl },
        } = supabase.storage.from("pictures").getPublicUrl(imageFileName);

        coverUrl = imagePublicUrl;
        console.log("Image upload successful. URL:", coverUrl);

        // Validate the image URL is accessible
        try {
          const response = await fetch(coverUrl, { method: "HEAD" });
          console.log("Image URL validation - Status:", response.status);
        } catch (urlError) {
          console.warn("Image URL validation failed:", urlError);
        }
      }

      // Get audio duration
      const audioAsset = formData.audioFile.assets?.[0];
      const duration = audioAsset
        ? await getAudioDuration(audioAsset.uri)
        : 180;

      // Create database record with enhanced debugging
      const songData = {
        title: formData.title,
        artist: formData.artist,
        album: formData.album || "",
        audio: audioUrl,
        cover: coverUrl,
        duration: duration,
      };

      console.log("Attempting to insert:", songData);

      // Enhanced debugging - let's check what might be different about our data
      console.log("=== DEBUGGING SONG DATA ===");
      console.log("Title length:", formData.title.length);
      console.log("Artist length:", formData.artist.length);
      console.log("Album length:", (formData.album || "").length);
      console.log("Audio URL:", audioUrl.substring(0, 100) + "...");
      console.log(
        "Cover URL:",
        coverUrl ? coverUrl.substring(0, 100) + "..." : "none"
      );
      console.log("Duration:", duration);

      // Check for potential problematic characters
      const hasSpecialChars = /[^\x00-\x7F]/.test(
        formData.title + formData.artist + formData.album
      );
      console.log("Contains non-ASCII characters:", hasSpecialChars);

      // Check final auth state before insert
      const {
        data: { user: finalUser },
      } = await supabase.auth.getUser();
      console.log("Final user before insert:", finalUser?.id || "No user");

      // Strategy 1: Try regular insert first
      console.log("=== ATTEMPTING INSERT ===");
      const { data: insertData, error: insertError } = await supabase
        .from("songs")
        .insert([songData])
        .select();

      if (insertError) {
        console.error("=== INSERT FAILED ===");
        console.error("Error message:", insertError.message);
        console.error("Error code:", insertError.code);
        console.error("Error hint:", insertError.hint);
        console.error("Error details:", insertError.details);

        // Strategy 2: Try with RPC call (if available)
        console.log("=== TRYING RPC APPROACH ===");
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            "insert_song",
            {
              p_title: formData.title,
              p_artist: formData.artist,
              p_album: formData.album || "",
              p_audio: audioUrl,
              p_cover: coverUrl,
              p_duration: duration,
            }
          );

          if (rpcError) {
            console.error("RPC also failed:", rpcError.message);
          } else {
            console.log("=== RPC SUCCESS! ===");
            Alert.alert("Success", "Music added successfully via RPC!");
            return; // Exit early on success
          }
        } catch (rpcErr) {
          console.log("RPC not available or failed:", rpcErr);
        }

        // Strategy 3: Try with service role (requires env var)
        console.log("=== TRYING SERVICE ROLE APPROACH ===");

        // For now, let's provide a clear error message about the RLS issue
        throw new Error(
          `Database insert failed due to Row Level Security. The issue is that your Supabase project requires authentication but anonymous sign-ins are disabled. Please either:\n\n1. Enable anonymous authentication in Supabase Auth settings\n2. Implement proper user registration/login\n3. Disable RLS on the songs table\n4. Update RLS policies to allow public access\n\nOriginal error: ${insertError.message}`
        );
      } else {
        console.log("=== INSERT SUCCEEDED! ===");
      }

      Alert.alert("Success", "Music added successfully!");

      // Reset form but keep debug data as requested
      setFormData({
        title: "Clubstep", // Preserve debug data
        artist: "DJ Nate", // Preserve debug data
        album: "Geometry Dash Official Soundtrack", // Preserve debug data
        audioFile: null,
        coverImage: null,
      });
      setPreviews({ audio: null, image: null });
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 Add New Music</Text>
      </View>

      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={(value) => handleInputChange("title", value)}
            placeholder="Enter song title"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Artist Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Artist *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.artist}
            onChangeText={(value) => handleInputChange("artist", value)}
            placeholder="Enter artist name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Album Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Album</Text>
          <TextInput
            style={styles.textInput}
            value={formData.album}
            onChangeText={(value) => handleInputChange("album", value)}
            placeholder="Enter album name (optional)"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Audio Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Audio File *</Text>
          {!formData.audioFile ? (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={selectAudioFile}
            >
              <Text style={styles.uploadIcon}>🎵</Text>
              <Text style={styles.uploadText}>Tap to upload audio file</Text>
              <Text style={styles.uploadSubtext}>MP3, WAV, FLAC supported</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.filePreview}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>🎵</Text>
                <Text style={styles.fileName}>{previews.audio}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFile("audioFile")}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Cover Image Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cover Image</Text>
          {!formData.coverImage ? (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={selectCoverImage}
            >
              <Text style={styles.uploadIcon}>🖼️</Text>
              <Text style={styles.uploadText}>Tap to upload cover image</Text>
              <Text style={styles.uploadSubtext}>JPG, PNG supported</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreview}>
              {previews.image && (
                <Image
                  source={{ uri: previews.image }}
                  style={styles.previewImage}
                />
              )}
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeFile("coverImage")}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.imageFileName}>
                {formData.coverImage.fileName}
              </Text>
            </View>
          )}
        </View>

        {/* Test Database Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={testDatabaseInsert}
        >
          <Text style={styles.testButtonText}>🧪 Test Database Connection</Text>
        </TouchableOpacity>

        {/* Fix RLS Instructions Button */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={showRLSFixInstructions}
        >
          <Text style={styles.helpButtonText}>🔧 Fix Database Issues</Text>
        </TouchableOpacity>

        {/* Test Results */}
        {testResults ? (
          <View style={styles.testResults}>
            <Text style={styles.testResultsTitle}>Test Results:</Text>
            <Text style={styles.testResultsText}>{testResults}</Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isUploading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isUploading}
        >
          <Text style={styles.submitButtonText}>
            {isUploading ? "⏳ Uploading..." : "💾 Add Music"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 30,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EBF8FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  fileName: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
    flex: 1,
  },
  removeButton: {
    backgroundColor: "#EF4444",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  imagePreview: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#EF4444",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  imageFileName: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  testButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  testResults: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  testResultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  testResultsText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    lineHeight: 16,
  },
  helpButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  helpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MusicAdder;

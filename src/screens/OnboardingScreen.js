import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OnboardingScreen = ({ navigation }) => {
  // When the "Get Started" button is pressed, navigate to the main app (TabNavigator)
  const handleContinue = () => {
    navigation.replace("MainApp"); // Navigates to TabNavigator
  };

  return (
    <View style={styles.container}>
      {/* Icon in a styled container */}
      <View style={styles.iconContainer}>
        <Ionicons name="journal" size={100} color="#6366f1" />
      </View>

      {/* Welcome title */}
      <Text style={styles.title}>Welcome to Thymos</Text>

      {/* Description below the title */}
      <Text style={styles.subtitle}>
        Take a gentle step toward self-discovery. Reflect on your thoughts,
        track your moods, and grow at your own pace one day at a time.
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;

// Styles for the onboarding screen
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes full height
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#eef2ff",
    padding: 32,
    borderRadius: 100,
    marginBottom: 32,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4338ca",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

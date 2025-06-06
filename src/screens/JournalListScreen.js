import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { format, parseISO } from "date-fns"; // For formatting date/time
import { useApp } from "../context/AppContext"; // Custom context for app data
import { Ionicons } from "@expo/vector-icons"; // Icon set
import { useFocusEffect } from "@react-navigation/native"; // Hook to run code when screen is focused

const JournalListScreen = ({ navigation }) => {
  const { getEntriesByDate, loading, error, clearError, deleteEntry } =
    useApp();
  const [refreshing, setRefreshing] = useState(false);

  // Show alert if there's an error when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (error) {
        Alert.alert("Error", error);
        clearError();
      }
    }, [error, clearError])
  );

  // Pull-to-refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Simulate refresh
  };

  // Confirm and delete entry
  const handleDeleteEntry = (entryId) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEntry(entryId),
        },
      ]
    );
  };

  // Render a single journal entry card
  const renderEntryItem = ({ item }) => {
    const mood = {
      amazing: { emoji: "😁", color: "#10b981" },
      good: { emoji: "😊", color: "#60a5fa" },
      okay: { emoji: "😐", color: "#fbbf24" },
      poor: { emoji: "😔", color: "#f87171" },
      terrible: { emoji: "😭", color: "#ef4444" },
    }[item.mood] || { emoji: "😐", color: "#9ca3af" };

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => navigation.navigate("EntryDetail", { entryId: item.id })}
      >
        {/* Mood and timestamp */}
        <View style={styles.entryHeader}>
          <View style={[styles.moodIndicator, { backgroundColor: mood.color }]}>
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          </View>
          <Text style={styles.entryTime}>
            {format(parseISO(item.timestamp), "h:mm a")}
          </Text>
        </View>

        {/* Entry text and image */}
        <View style={styles.entryContent}>
          <Text style={styles.entryText} numberOfLines={3}>
            {item.content}
          </Text>

          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.entryImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Edit and Delete buttons */}
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("EditEntry", { entryId: item.id })
            }
          >
            <Ionicons name="pencil" size={18} color="#6366f1" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteEntry(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render entries grouped by date
  const renderDateGroup = ({ item }) => {
    const [dateStr, entries] = item;
    const dateObj = new Date(dateStr);

    return (
      <View style={styles.dateGroup}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {format(dateObj, "EEEE, MMMM d, yyyy")}
          </Text>
          <Text style={styles.entryCount}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Text>
        </View>

        <FlatList
          data={entries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const entriesByDate = getEntriesByDate();
  const dateGroups = Object.entries(entriesByDate); // Convert object to array of [date, entries]

  // Show loading spinner while fetching
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* If no entries, show empty state */}
      {dateGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="journal-outline" size={80} color="#d1d5db" />
          <Text style={styles.emptyStateText}>No logs yet.</Text>
          <Text style={styles.emptyStateSubText}>
            Ready to reflect? Add your first entry.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={dateGroups}
          renderItem={renderDateGroup}
          keyExtractor={([date]) => date}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Floating Add Entry Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddEntry")}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4338ca",
  },
  entryCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  entryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  moodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 22,
  },
  entryTime: {
    fontSize: 14,
    color: "#6b7280",
  },
  entryContent: {
    marginBottom: 12,
  },
  entryText: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 22,
  },
  entryImage: {
    height: 150,
    width: "100%",
    borderRadius: 8,
    marginTop: 12,
  },
  entryActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    paddingVertical: 4,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6366f1",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
});

export default JournalListScreen;

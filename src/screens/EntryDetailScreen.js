import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { format, parseISO } from 'date-fns'; // For formatting timestamps
import { useApp } from '../context/AppContext'; // Custom context hook
import { Ionicons } from '@expo/vector-icons'; // Icon pack

const EntryDetailScreen = ({ route, navigation }) => {
  // Retrieve entryId from route parameters
  const { entryId } = route.params;

  // Get necessary functions and data from context
  const { getEntryById, moodOptions, deleteEntry, loading } = useApp();

  // Fetch the specific entry by ID
  const entry = getEntryById(entryId);

  // Show loading spinner while fetching
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // If entry is not found, show error
  if (!entry) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Entry not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get mood details based on the mood value in the entry
  const moodInfo = moodOptions.find(m => m.value === entry.mood) || moodOptions[2]; // Default to "okay" mood

  // Handle delete confirmation
  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteEntry(entryId); // Delete from storage
            navigation.goBack(); // Return to previous screen
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header showing mood, date and time */}
        <View style={styles.header}>
          <View style={[styles.moodBadge, { backgroundColor: moodInfo.color }]}>
            <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
            <Text style={styles.moodText}>{moodInfo.label}</Text>
          </View>

          {/* Formatted date and time */}
          <Text style={styles.date}>
            {format(parseISO(entry.timestamp), 'EEEE, MMMM d, yyyy')}
          </Text>
          <Text style={styles.time}>
            {format(parseISO(entry.timestamp), 'h:mm a')}
          </Text>
        </View>

        {/* Display image if available */}
        {entry.image && (
          <Image source={{ uri: entry.image }} style={styles.image} resizeMode="cover" />
        )}

        {/* Display journal content */}
        <Text style={styles.content}>{entry.content}</Text>
      </ScrollView>

      {/* Edit and Delete buttons at the bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditEntry', { entryId })}
        >
          <Ionicons name="pencil" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Edit Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Style definitions
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 16,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    color: '#6b7280',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 24,
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1f2937',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  editButton: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});

export default EntryDetailScreen;

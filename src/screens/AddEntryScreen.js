import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Main screen for adding a new journal entry
const AddEntryScreen = ({ navigation }) => {
  const { moodOptions, addEntry, pickImage, error, clearError } = useApp();
  
  // Local state to track form input
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('okay');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Open image picker and set image URI
  const handleAddImage = async () => {
    const selectedImage = await pickImage();
    if (selectedImage) {
      setImage(selectedImage);
    }
  };
  
  // Remove selected image
  const handleRemoveImage = () => {
    setImage(null);
  };
  
  // Submit the entry form
  const handleSubmit = async () => {
    if (content.trim() === '') {
      Alert.alert('Error', 'Please write something in your journal entry');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const entryId = await addEntry(content, selectedMood, image); // Save the entry
      if (entryId) {
        navigation.goBack(); // Go back after saving
      }
    } catch (err) {
      console.error('Error adding entry:', err);
      Alert.alert('Error', 'Failed to save your journal entry');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show error message from context if available
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Mood selector row */}
        <View style={styles.moodSelector}>
          <Text style={styles.moodLabel}>How are you feeling today?</Text>
          <View style={styles.moodOptions}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodOption,
                  selectedMood === mood.value && { 
                    borderColor: mood.color,
                    backgroundColor: `${mood.color}15`, // 15% opacity
                  },
                ]}
                onPress={() => setSelectedMood(mood.value)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text 
                  style={[
                    styles.moodText,
                    selectedMood === mood.value && { color: mood.color, fontWeight: '600' }
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input field for writing journal */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind today?"
            placeholderTextColor="#9ca3af"
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />
        </View>
        
        {/* Show image preview if available */}
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="close-circle" size={28} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          // Button to add image
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleAddImage}
          >
            <Ionicons name="image-outline" size={24} color="#6366f1" />
            <Text style={styles.addImageText}>Add Image</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.spacer} />
      </ScrollView>
    
      {/* Footer buttons: Cancel and Save */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.saveButton,
            (isSubmitting || content.trim() === '') && styles.saveButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || content.trim() === ''}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  moodSelector: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  moodLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 16,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
    width: '19%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 8.5,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputContainer: {
    padding: 20,
    minHeight: 220,
  },
  input: {
    fontSize: 18,
    color: '#1f2937',
    lineHeight: 26,
    minHeight: 220,
    textAlignVertical: 'top',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  addImageText: {
    fontSize: 16,
    color: '#6366f1',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    margin: 16,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    padding: 2,
  },
  spacer: {
    height: 40,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    marginRight: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5b4fc',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default AddEntryScreen;

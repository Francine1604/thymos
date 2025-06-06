import React, { useState, useEffect } from 'react';
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

const EditEntryScreen = ({ route, navigation }) => {
  // Get entryId from navigation route params
  const { entryId } = route.params;

  // Destructure context values
  const { getEntryById, moodOptions, updateEntry, pickImage, error, clearError, loading } = useApp();
  
  // Local state to manage the current entry data
  const [entry, setEntry] = useState(null);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('okay');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch the entry data when the component mounts
  useEffect(() => {
    const entryData = getEntryById(entryId);
    if (entryData) {
      setEntry(entryData);
      setContent(entryData.content);
      setSelectedMood(entryData.mood);
      setImage(entryData.image);
    } else {
      Alert.alert('Error', 'Entry not found');
      navigation.goBack();
    }
  }, [entryId, getEntryById]);
  
  // Display error alerts if any
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);
  
  // Open image picker and set the selected image
  const handleAddImage = async () => {
    const selectedImage = await pickImage();
    if (selectedImage) {
      setImage(selectedImage);
    }
  };
  
  // Remove the currently selected image
  const handleRemoveImage = () => {
    setImage(null);
  };
  
  // Submit the updated entry
  const handleSubmit = async () => {
    if (content.trim() === '') {
      Alert.alert('Error', 'Please write something in your journal entry');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await updateEntry(entryId, {
        content,
        mood: selectedMood,
        image,
      });
      navigation.goBack();
    } catch (err) {
      console.error('Error updating entry:', err);
      Alert.alert('Error', 'Failed to update your journal entry');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading indicator until the entry is ready
  if (loading || !entry) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        {/* Mood Selection */}
        <View style={styles.moodSelector}>
          <Text style={styles.moodLabel}>How are you feeling?</Text>
          <View style={styles.moodOptions}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodOption,
                  selectedMood === mood.value && { borderColor: mood.color },
                ]}
                onPress={() => setSelectedMood(mood.value)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text 
                  style={[
                    styles.moodText,
                    selectedMood === mood.value && { color: mood.color }
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      
        {/* Text Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#9ca3af"
            multiline
            value={content}
            onChangeText={setContent}
          />
        </View>
      
        {/* Image Preview or Add Button */}
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleAddImage}
          >
            <Ionicons name="image-outline" size={24} color="#6366f1" />
            <Text style={styles.addImageText}>Add Image</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    
      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={isSubmitting || content.trim() === ''}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Update Entry</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Styling definitions
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodSelector: {
    padding: 18,
    backgroundColor: '#f5f5f7',
  },
  moodLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 12,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
    width: '19%',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 10,
    color: '#6b7280',
  },
  inputContainer: {
    padding: 16,
    minHeight: 200,
  },
  input: {
    fontSize: 18,
    color: '#1f2937',
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addImageText: {
    fontSize: 16,
    color: '#6366f1',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    margin: 16,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
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
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default EditEntryScreen;

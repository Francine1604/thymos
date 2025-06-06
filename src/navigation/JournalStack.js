import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all the screens used in the journal flow
import JournalListScreen from '../screens/JournalListScreen';
import AddEntryScreen from '../screens/AddEntryScreen';
import EditEntryScreen from '../screens/EditEntryScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';

// Create a native stack navigator instance
const Stack = createNativeStackNavigator();

// JournalStack defines the navigation stack for journal-related screens
const JournalStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontWeight: 'bold',       
          color: '#4338ca',         
        },
        headerStyle: {
          backgroundColor: '#ffffff', 
        },
      }}
    >
      {/* Main screen listing all journal entries */}
      <Stack.Screen 
        name="JournalList" 
        component={JournalListScreen} 
        options={{ title: 'My Journal' }} 
      />

      {/* Screen for adding a new entry */}
      <Stack.Screen 
        name="AddEntry" 
        component={AddEntryScreen} 
        options={{ title: 'New Entry' }}
      />

      {/* Screen for editing an existing entry */}
      <Stack.Screen 
        name="EditEntry" 
        component={EditEntryScreen} 
        options={{ title: 'Edit Entry' }}
      />

      {/* Detailed view for a single journal entry */}
      <Stack.Screen 
        name="EntryDetail" 
        component={EntryDetailScreen} 
        options={{ title: 'Journal Entry' }} 
      />
    </Stack.Navigator>
  );
};

export default JournalStack;

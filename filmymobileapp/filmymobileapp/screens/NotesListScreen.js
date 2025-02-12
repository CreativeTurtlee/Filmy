import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import db from '../database/db';

export default function NotesListScreen() {
  const {
    params: { listId },
  } = useRoute();
  const [notes, setNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const navigation = useNavigation();

  const loadNotes = useCallback(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM notes WHERE list_id = ?',
        [listId],
        (_, { rows: { _array } }) => setNotes(_array)
      );
    });
  }, [listId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const deleteNote = (noteId) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));

    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM notes WHERE id = ?',
        [noteId],
        () => console.log('Note deleted successfully'),
        (_, error) => {
          console.error('Error deleting note:', error);
          loadNotes();
        }
      );
    });
  };

  const renderNoteItem = ({ item }) => (
    <ScrollView style={styles.noteItem}>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.noteImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <Text>Genre: {item.genre}</Text>
        <Text>Year: {item.year}</Text>
        <Text>Description: {item.description}</Text>
      </View>

      {isEditing && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNote(item.id)}>
          <Icon name="delete" color="red" size={24} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButton}>{isEditing ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    fontSize: 18,
    color: 'blue',
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    height: 'fit-content000',
    width: '100%',
    padding: 12,
  },
  noteContent: {
    padding: 12,
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteButton: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  noteImage: {
    width: '50%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
});

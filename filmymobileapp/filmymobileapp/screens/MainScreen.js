import { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  ScrollView,
  View,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import db from '../database/db';
import { useNavigation } from '@react-navigation/native';

export default function MainScreen() {
  const [lists, setLists] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const loadLists = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM lists ORDER BY title;',
        [],
        (_, { rows: { _array } }) => setLists(_array)
      );
    });
  };

  useEffect(() => {
    if (isFocused) loadLists();
  }, [isFocused]);

  const getNoteCount = (listId) => {
    return lists.find((list) => list.id === listId)?.noteCount || 0;
  };

  const addList = () => {
    const newId = Date.now().toString();
    const newList = { id: newId, title: 'Новый список', isDefault: false };

    setLists((prev) => {
      if (prev.some((list) => list.id === newId)) return prev;
      return [...prev, newList];
    });

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO lists (id, title) VALUES (?, ?)',
        [newId, 'Новый список'],
        () => console.log('List added successfully'),
        (_, error) => {
          console.error('Error adding list:', error);
          setLists((prev) => prev.filter((list) => list.id !== newId));
        }
      );
    });
  };

  const deleteList = (listId) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM lists WHERE id = ? AND isDefault = 0',
        [listId],
        () => setLists((prev) => prev.filter((list) => list.id !== listId))
      );
    });
  };

  const updateListTitle = (listId, newTitle) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE lists SET title = ? WHERE id = ?',
        [newTitle, listId],
        () =>
          setLists((prev) =>
            prev.map((list) =>
              list.id === listId ? { ...list, title: newTitle } : list
            )
          )
      );
    });
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() =>
        !isEditing && navigation.navigate('NotesList', { listId: item.id })
      }>
      <View style={styles.listContent}>
        {editingListId === item.id ? (
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            onBlur={() => {
              updateListTitle(item.id, editedTitle);
              setEditingListId(null);
            }}
            autoFocus
            style={styles.titleInput}
          />
        ) : (
          <View style={styles.titleContainer}>
            <Text style={styles.listTitle}>{item.title}</Text>
          </View>
        )}
        <Text>{getNoteCount(item.id)} notes</Text>
      </View>

      {isEditing && !item.isDefault && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteList(item.id)}>
          <Icon name="delete" color="red" size={24} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButton}>{isEditing ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('AddNote')}>
          <Icon name="note-add" size={40} />
        </TouchableOpacity>
        <TouchableOpacity onPress={addList}>
          <Icon name="add-circle" size={40} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    marginLeft: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
});

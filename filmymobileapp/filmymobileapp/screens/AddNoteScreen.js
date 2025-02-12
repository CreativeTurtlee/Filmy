import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  Button,
  StyleSheet,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import db from '../database/db';

import { createStackNavigator } from '@react-navigation/stack';

export default function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('unsorted');
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM lists', [], (_, { rows: { _array } }) => {
        setLists(_array);
        if (_array.length > 0) setSelectedList(_array[0].id);
      });
    });
  }, []);

  // верхняя панель навигации с кнопками
  navigation.setOptions({
    headerRight: () => <Button title="Добавить фильм" onPress={saveNote} />,
  });

  const saveNote = () => {
    const newId = Date.now().toString();
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO notes (id, title, genre, year, description, list_id, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newId, title, genre, year, description, selectedList, imageUrl],
        () => navigation.goBack()
      );
    });
  };

  const importInfo = () => {
    setLoading(true);
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-KEY': 'BJ42ZJA-4044651-N2AA1NJ-R89XVT3',
      },
    };

    fetch(
      'https://api.kinopoisk.dev/v1.4/movie/search?page=1&limit=1&query=' +
        searchTitle,
      options
    )
      .then((res) => {
        res.json().then((data) => {
          console.log(data.docs[0].year);
          setTitle(data.docs[0].name || data.docs[0].alternativeName);
          setDescription(data.docs[0].description);
          setGenre(data.docs[0].genres[0].name);
          setYear(data.docs[0].year.toString());
          setImageUrl(data.docs[0].poster.previewUrl);
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Заполнить автоматически по названию фильма"
        placeholderTextColor="grey"
        value={searchTitle}
        onChangeText={setSearchTitle}
        style={styles.input}
      />

      <Button
        title="Найти информацию"
        onPress={importInfo}
        disabled={loading}
      />

      <View style={styles.photoContainer}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.noteImage}
            resizeMode="cover"
          />
        )}
      </View>

      <TextInput
        placeholder="Название"
        placeholderTextColor="grey"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Жанр"
        placeholderTextColor="grey"
        value={genre}
        onChangeText={setGenre}
        style={styles.input}
      />

      <TextInput
        placeholder="Год выхода"
        placeholderTextColor="grey"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Описание"
        placeholderTextColor="grey"
        multiline
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 300 }]}
      />

      <Picker
        selectedValue={selectedList}
        onValueChange={setSelectedList}
        itemStyle={{ color: 'grey' }}
        style={styles.picker}>
        {lists.map((list) => (
          <Picker.Item key={list.id} label={list.title} value={list.id} />
        ))}
      </Picker>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    height: '100%',
  },
  container: {
    height: 'fit-content',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  picker: {
    marginVertical: 5,
  },
  noteImage: {
    width: '100%',
    height: 600,
    borderRadius: 8,
    marginBottom: 8,
  },
});

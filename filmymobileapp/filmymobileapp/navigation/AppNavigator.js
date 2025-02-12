import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../screens/MainScreen';
import AddNoteScreen from '../screens/AddNoteScreen';
import NotesListScreen from '../screens/NotesListScreen';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: 'Filmy' }}
        />
        <Stack.Screen
          name="AddNote"
          component={AddNoteScreen}
          options={{ title: 'Добавить фильм' }}
        />
        <Stack.Screen
          name="NotesList"
          component={NotesListScreen}
          options={{ title: 'Добавленные фильмы' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

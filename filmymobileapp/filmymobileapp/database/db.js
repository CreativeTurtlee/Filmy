let lists = [{ id: 'unsorted', title: 'Unsorted', isDefault: true }];
let notes = [];

export const initializeDB = () => {};

export default {
  transaction: (callback) => {
    const mockTx = {
      executeSql: (query, params, successCallback) => {
        try {
          if (query.includes('SELECT * FROM lists')) {
            const updatedLists = lists.map((list) => ({
              ...list,
              noteCount: notes.filter((note) => note.list_id === list.id)
                .length,
            }));
            successCallback(null, { rows: { _array: updatedLists } });
          } else if (query.includes('INSERT INTO lists')) {
            const newList = {
              id: params[0],
              title: params[1],
              isDefault: false,
            };
            lists.push(newList);
            successCallback(null, { insertId: params[0] });
          } else if (query.includes('DELETE FROM lists')) {
            lists = lists.filter((list) => list.id !== params[0]);
            successCallback(null, { rowsAffected: 1 });
          } else if (query.includes('INSERT INTO notes')) {
            const newNote = {
              id: params[0],
              title: params[1],
              genre: params[2],
              year: params[3],
              description: params[4],
              list_id: params[5],
              image: params[6] || null,
            };
            notes.push(newNote);
            successCallback(null, { insertId: params[0] });
          } else if (query.includes('SELECT * FROM notes')) {
            const listNotes = notes.filter((n) => n.list_id === params[0]);
            successCallback(null, { rows: { _array: listNotes } });
          } else if (query.includes('DELETE FROM notes')) {
            notes = notes.filter((note) => note.id !== params[0]);
            successCallback(null, { rowsAffected: 1 });
          } else {
            successCallback(null, { rows: { _array: [] } });
          }
        } catch (error) {
          console.error('Database error:', error);
        }
      },
    };
    callback(mockTx);
  },
};

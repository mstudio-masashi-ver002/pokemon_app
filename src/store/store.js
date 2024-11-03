import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import pokemonReducer from './pokemonSlice';

// ローカルストレージから状態を読み込む関数
const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('appState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    console.error("Could not load state from localStorage", e);
    return undefined;
  }
};

// ストアの初期状態に読み込んだローカルストレージの状態を渡す
const store = configureStore({
  reducer: {
    pokemon: pokemonReducer,
    user: userReducer,
  },
  preloadedState: loadFromLocalStorage(),
});

// 状態が変更されるたびにローカルストレージに保存する
store.subscribe(() => {
  try {
    const state = store.getState();
    const serializedState = {
      user: state.user,
      pokemon: state.pokemon
    };
    localStorage.setItem('appState', JSON.stringify(serializedState));
  } catch (e) {
    console.error("Could not save state to localStorage", e);
  }
});

export default store;

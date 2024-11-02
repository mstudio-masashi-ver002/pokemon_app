import { configureStore } from '@reduxjs/toolkit';
import pokemonReducer from './pokemonSlice'; // ポケモン関連のスライスをインポート

const store = configureStore({
  reducer: {
    pokemon: pokemonReducer, // ポケモンの状態を管理するスライス
    // 他のスライスも必要に応じて追加
  },
});

export default store;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  caughtPokemon: [], // 捕まえたポケモンのリスト
  selectedPokemon: null, // バトルのために選択されたポケモン
};

export const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    // ポケモンを捕まえる
    catchPokemon: (state, action) => {
      state.caughtPokemon.push(action.payload);
    },
    
    // 捕まえたポケモンの中から選択する（バトル用）
    selectPokemon: (state, action) => {
      state.selectedPokemon = state.caughtPokemon.find(pokemon => pokemon.id === action.payload);
    },

    // ポケモンのレベルを上げる
    levelUpPokemon: (state, action) => {
      const pokemonIndex = state.caughtPokemon.findIndex(pokemon => pokemon.id === action.payload);
      if (pokemonIndex >= 0) {
        state.caughtPokemon[pokemonIndex].level += 1; // レベルを1上げる
      }
    },
    
    // ポケモンのリセット（すべてのポケモンを削除）
    resetPokemon: (state) => {
      state.caughtPokemon = [];
      state.selectedPokemon = null;
    },
  },
});

// アクションをエクスポート
export const { catchPokemon, selectPokemon, levelUpPokemon, resetPokemon } = pokemonSlice.actions;

// スライサーをエクスポート
export default pokemonSlice.reducer;

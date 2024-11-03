import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userGold: localStorage.getItem('userGold') ? parseInt(localStorage.getItem('userGold'), 10) : 1000,
  userTickets: localStorage.getItem('userTickets') ? parseInt(localStorage.getItem('userTickets'), 10) : 3,
  pokeballCount: localStorage.getItem('pokeballCount') ? parseInt(localStorage.getItem('pokeballCount'), 10) : 10,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserGold: (state, action) => {
      state.userGold = action.payload;
      localStorage.setItem('appState', JSON.stringify(state)); // ローカルストレージに保存
    },
    setUserTickets: (state, action) => {
      state.userTickets = action.payload;
      localStorage.setItem('appState', JSON.stringify(state)); // ローカルストレージに保存
    },
    setPokeballCount: (state, action) => {
      state.pokeballCount = action.payload;
      localStorage.setItem('appState', JSON.stringify(state)); // ローカルストレージに保存
    },
    incrementPokeball: (state, action) => {
      state.pokeballCount += action.payload || 1;
      localStorage.setItem('appState', JSON.stringify(state)); // ローカルストレージに保存
    },
    decrementGold: (state, action) => {
        if (state.userGold >= action.payload) {
          state.userGold -= action.payload;
          localStorage.setItem('appState', JSON.stringify(state)); // ローカルストレージに保存
        } else {
          console.warn("所持金が足りません");
        }
      },
  },
});

export const { setUserGold, setUserTickets, setPokeballCount, incrementPokeball, decrementGold } = userSlice.actions;

export default userSlice.reducer;

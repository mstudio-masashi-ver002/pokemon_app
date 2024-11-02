import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux'; // Provider のインポート
import store from './store/store'; // 作成した Redux ストアのインポート
import PokemonSelectionPage from './pages/PokemonSelectionPage';
import HomePage from './pages/HomePage';
// import BattlePage from './pages/BattlePage';
// import CongratulationsPage from './pages/CongratulationsPage';
// import Header from './components/Header'; // 共通のヘッダー
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CaughtPokemonListPage from './pages/CaughtPokemonListPage';
import BattlePage from './pages/BattlePage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* アプリ全体に共通するヘッダー */}
        {/* <Header /> */}

        {/* 各ページへのルート */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select" element={<PokemonSelectionPage />} />
          <Route path="/caught" element={<CaughtPokemonListPage />} />
          <Route path="/battle" element={<BattlePage />} />
          {/* <Route path="/congratulations" element={<CongratulationsPage />} /> */}
        </Routes>
        <ToastContainer />
      </Router>
    </Provider>
  );
}

export default App;

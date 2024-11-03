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
import Header from './components/Header';
import Footer from './components/Footer';
import PokemonDetailPage from './pages/PokemonDetailPage';
import ShopPage from './pages/ShopPage';
import { useEffect } from 'react';
function App() {
  useEffect(() => {
    // リロードやページ遷移を禁止するためのイベントリスナーを追加
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      // 標準のメッセージはブラウザによって異なる
      event.returnValue = ''; 
    };

    // イベントリスナーを登録
    window.addEventListener('beforeunload', handleBeforeUnload);

    // クリーンアップ関数でイベントリスナーを解除
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  return (
    <Provider store={store}>
      <Router>
        {/* アプリ全体に共通するヘッダー */}
        <Header />

        {/* 各ページへのルート */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select" element={<PokemonSelectionPage />} />
          <Route path="/caught" element={<CaughtPokemonListPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          <Route path="/shop" element={<ShopPage />} />
          {/* <Route path="/congratulations" element={<CongratulationsPage />} /> */}
        </Routes>
        <Footer />
        <ToastContainer />
      </Router>
    </Provider>
  );
}

export default App;

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setUserTickets, setUserGold } from '../store/userSlice';
import { motion } from 'framer-motion'; // Framer Motionをインポート
import { FaStar } from 'react-icons/fa'; // React Iconsをインポート
import './HomePage.css';

const HomePage = () => {
  const userTickets = useSelector((state) => state.user.userTickets); // Reduxからチケットの数を取得
  const userGold = useSelector((state) => state.user.userGold); // Reduxから所持金の数を取得
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ポケモンを捕まえに行くリンクをクリックした時の処理
  const handleGoToCatch = () => {
    if (userTickets > 0 && userGold >= 50) {
      // チケットを1枚消費する
      dispatch(setUserTickets(userTickets - 1));
      toast.success('チケットを1枚消費しました！');
      dispatch(setUserGold(userGold - 50));
      toast.success('100円を消費しました！');
      navigate('/select'); // "/select"ページに遷移
    } else {
      // チケットがない場合のエラーメッセージ
      if (userTickets <= 0) {
        toast.error('チケットが足りません！');
      }
      if (userGold < 50) {
        toast.error('所持金が不足しています！');
      }
    }
  };

  return (
    <div className="home-page">
      <h1 className="title">ポケモンバトルやで！</h1>
      <p className="description">100円とチケット1枚で<br />ポケモンを捕まえに行く！</p>
      <motion.div
        className="banner"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 0.5, yoyo: Infinity }}
      >
        <div className="banner-content">
          <FaStar className="star-icon" />
          <motion.button
            className="catch-button"
            whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgb(255, 215, 0)" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleGoToCatch}
          >
            ポケモンを<br />捕まえに行く！
          </motion.button>
          <FaStar className="star-icon" />
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
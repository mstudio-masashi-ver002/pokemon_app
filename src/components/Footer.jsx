// Footer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';
import { FaBiohazard, FaCartArrowDown, FaCat } from 'react-icons/fa'; // React Iconsをインポート
const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className="footer">
      <div className="footer-item" onClick={() => handleNavigation('/shop')}>
        <span role="img" aria-label="ショップ"><FaCartArrowDown /></span>
        <p>ショップ</p>
      </div>
      <div className="footer-item" onClick={() => handleNavigation('/caught')}>
        <span role="img" aria-label="ポケモンの家"> <FaCat /></span>
        <p>捕獲リスト</p>
      </div>
      <div className="footer-item" onClick={() => handleNavigation('/battle')}>
        <span role="img" aria-label="バトル"> <FaBiohazard /></span>
        <p>バトル</p>
      </div>
    </footer>
  );
};

export default Footer;

// Header.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa'; // React Iconsをインポート
const Header = () => {
    const navigate = useNavigate();
    const handleNavigation = (path) => {
        navigate(path);
    };
    const userGold = useSelector((state) => state.user.userGold);
    const userTickets = useSelector((state) => state.user.userTickets);
    const pokeballCount = useSelector((state) => state.user.pokeballCount);
  
    return (
      <header className="header">
        <div className="header-content">
            <div className="header-item">
                <span role="img" aria-label="home"  onClick={() => handleNavigation('/')}><FaHome /></span>
            </div>
          <div className="user-info">
            <div className="user-gold">
              <span role="img" aria-label="gold">💴</span>{userGold}円
            </div>
            <div className="user-tickets">
              <span role="img" aria-label="tickets">🎫</span>{userTickets}枚
            </div>
            <div className="user-caught-pokemon">
              <span role="img" aria-label="caught-pokemon">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="モンスターボール" />
              </span>{pokeballCount}個
            </div>
          </div>
        </div>
      </header>
    );
  };
  
  export default Header;
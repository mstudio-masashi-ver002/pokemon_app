// ShopPage.jsx
import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { decrementGold, incrementPokeball } from '../store/userSlice';
import { toast } from 'react-toastify';

// Styled Components for Shop Page
const ShopContainer = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #ffcc70 0%, #ff8c00 100%);
  min-height: 100vh;
  color: white;
  padding-top: 100px;
  padding-bottom: 100px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 30px;
  color: #ffde03;
  text-shadow: 2px 2px #364f6b;
`;

const ItemContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ItemCard = styled.div`
  background: #364f6b;
  border-radius: 15px;
  padding: 20px;
  margin: 20px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  max-width: 300px;
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background: #ff8c00;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #ff6f00;
  }

  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

const ShopPage = () => {
    const dispatch = useDispatch();
    const userGold = useSelector((state) => state.user.userGold);
    const pokeballPrice = 100; // モンスターボールの価格を設定
  
    // モンスターボールを購入する関数
    const handlePurchase = () => {
      if (userGold >= pokeballPrice) {
        dispatch(decrementGold(pokeballPrice));
        dispatch(incrementPokeball(1));
        toast.success('モンスターボールを購入しました！', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      } else {
        toast.error('所持金が足りません！');
      }
    };

  return (
    <ShopContainer>
      <Title>ショップ</Title>
      <h2>所持金: {userGold} G</h2>
      <ItemContainer>
        <ItemCard>
          <h3>モンスターボール</h3>
          <ItemImage
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="モンスターボール"
          />
          <p>価格: {pokeballPrice} G</p>
          <Button onClick={handlePurchase} disabled={userGold < pokeballPrice}>
            購入する
          </Button>
        </ItemCard>
      </ItemContainer>
    </ShopContainer>
  );
};

export default ShopPage;

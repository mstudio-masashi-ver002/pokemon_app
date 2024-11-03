import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

// Styled Componentsの設定
const PageContainer = styled.div`
  text-align: center;
  padding: 20px;
  background: rgb(48, 98, 48);
  min-height: 100vh;
  color: white;
  overflow: hidden;
  padding-top: 100px;
  padding-bottom: 100px;
`;

const Title = styled.h1`
    font-size: 1.6rem;
  margin-bottom: 30px;
  color: #ffde03;
  text-shadow: 2px 2px #364f6b;
`;

const PokemonList = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 0;
`;

const PokemonCard = styled(motion.li)`
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  color: white;
  transition: transform 0.2s;
  cursor: pointer;

  ${({ level }) => {
    if (level >= 50) {
      return css`
        background: linear-gradient(135deg, #ffd700, #ffac33);
        box-shadow: 0px 6px 20px rgba(255, 215, 0, 0.6);
        border: 2px solid #ffd700;
      `;
    } else if (level >= 30) {
      return css`
        background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
        box-shadow: 0px 6px 20px rgba(192, 192, 192, 0.6);
        border: 2px solid #c0c0c0;
      `;
    } else {
      return css`
        background: linear-gradient(135deg, #cd7f32, #b87333);
        box-shadow: 0px 6px 20px rgba(205, 127, 50, 0.6);
        border: 2px solid #cd7f32;
      `;
    }
  }}

  &:hover {
    transform: scale(1.05);
    box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const PokemonName = styled.h3`
  font-size: 1.5rem;
  color: #ffde03;
`;

const PokemonImage = styled.img`
  width: 100%;
  max-width: 150px;
  height: auto;
  margin-bottom: 10px;
  border-radius: 10px;
  transition: transform 0.3s;

  &:hover {
    transform: rotate(5deg);
  }
`;

const PokemonLevel = styled.p`
  font-size: 1.2rem;
  color: #ffde03;
  text-shadow: 1px 1px #364f6b;
`;


// フレームモーションのアニメーション設定
const listVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const CaughtPokemonListPage = () => {
  const [caughtPokemon, setCaughtPokemon] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPokemon = localStorage.getItem('caughtPokemon');
    if (savedPokemon) {
      const parsedPokemon = JSON.parse(savedPokemon);
      setCaughtPokemon(parsedPokemon);
      if (parsedPokemon.length > 0) {
        triggerConfetti();
      }
    }
  }, []);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleCardClick = (id) => {
    navigate(`/pokemon/${id}`); // クリックで詳細ページに遷移
  };

  return (
    <PageContainer>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <Title>捕まえたポケモン一覧</Title>
      {caughtPokemon.length > 0 ? (
        <PokemonList>
          {caughtPokemon.map((pokemon, index) => (
            <PokemonCard
              key={index}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.1 }}
              level={pokemon.level}
              onClick={() => handleCardClick(pokemon.id)}
            >
              <PokemonName>{pokemon.name}</PokemonName>
              <PokemonImage
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                alt={pokemon.name}
              />
              <PokemonLevel>レベル: {pokemon.level}</PokemonLevel>
            </PokemonCard>
          ))}
        </PokemonList>
      ) : (
        <p>まだポケモンを捕まえていません。</p>
      )}
    </PageContainer>
  );
};

export default CaughtPokemonListPage;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { LinearProgress, Box, Typography } from '@mui/material';

// パラメータ名の日本語マッピング
const parameterMapping = {
  hp: "HP",
  attack: "攻撃",
  defense: "防御",
  "special-attack": "特攻",
  "special-defense": "特防",
  speed: "素早さ",
};

// Styled Componentsの設定
const PageContainer = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
  min-height: 100vh;
  color: white;
  padding-top: 100px;
  padding-bottom: 100px;
`;

const PokemonDetailContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #364f6b;
  border-radius: 15px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  color: white;
`;

const PokemonImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  margin-bottom: 10px;
  border-radius: 10px;
`;

const StatList = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
`;

const StatItem = styled.li`
  font-size: 1.2rem;
  margin: 15px 0;
`;

const StatBar = ({ label, value }) => {
  const maxStatValue = 200; // ステータスの最大値を仮定

  // ステータスの値に応じたバーの色を設定
  const getBarColor = (value) => {
    if (value >= 150) {
      return '#00cc00'; // 高いステータス -> 緑色
    } else if (value >= 75) {
      return '#ffcc00'; // 中程度のステータス -> 黄色
    } else {
      return '#ff4444'; // 低いステータス -> 赤色
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: 2 }}>
      <Typography sx={{ minWidth: 100, color: '#fff', textShadow: '1px 1px #364f6b' }}>
        {label}
      </Typography>
      <Box sx={{ width: '70%', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(value / maxStatValue) * 100}
          sx={{
            height: 15,
            borderRadius: 5,
            '& .MuiLinearProgress-bar': {
              backgroundColor: getBarColor(value),
            },
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="textSecondary">{value}</Typography>
      </Box>
    </Box>
  );
};

const PokemonDetailPage = () => {
  const { id } = useParams(); // URLからポケモンのIDを取得
  const [pokemon, setPokemon] = useState(null);
  const [japaneseName, setJapaneseName] = useState('');

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        setPokemon(response.data);

        // 日本語の名前を取得するためにspeciesエンドポイントを呼び出す
        const speciesResponse = await axios.get(response.data.species.url);
        const japaneseNameEntry = speciesResponse.data.names.find((name) => name.language.name === "ja");
        setJapaneseName(japaneseNameEntry ? japaneseNameEntry.name : response.data.name);
      } catch (error) {
        console.error('Error fetching Pokémon details:', error);
      }
    };

    fetchPokemonDetails();
  }, [id]);

  if (!pokemon) {
    return <p>読み込み中...</p>;
  }

  return (
    <PageContainer>
      <PokemonDetailContainer>
        <h1>{japaneseName}</h1>
        <PokemonImage
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
          alt={japaneseName}
        />
        <StatList>
          <StatItem>高さ: {pokemon.height * 10} cm</StatItem> {/* 高さをcmに変換 */}
          <StatItem>重さ: {pokemon.weight / 10} kg</StatItem> {/* 重さをkgに変換 */}
          {pokemon.stats.map((stat) => (
            <StatItem key={stat.stat.name}>
              <StatBar
                label={parameterMapping[stat.stat.name] || stat.stat.name.toUpperCase()}
                value={stat.base_stat}
              />
            </StatItem>
          ))}
        </StatList>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PokemonImage
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
            alt={`${japaneseName} front`}
          />
          <PokemonImage
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemon.id}.png`}
            alt={`${japaneseName} back`}
          />
        </div>
      </PokemonDetailContainer>
    </PageContainer>
  );
};

export default PokemonDetailPage;

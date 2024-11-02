import React, { useEffect, useState } from 'react';

const CaughtPokemonListPage = () => {
  // ローカルストレージから捕まえたポケモンのリストを取得
  const [caughtPokemon, setCaughtPokemon] = useState([]);

  useEffect(() => {
    const savedPokemon = localStorage.getItem('caughtPokemon');
    if (savedPokemon) {
      setCaughtPokemon(JSON.parse(savedPokemon));
    }
  }, []);

  return (
    <div>
      <h1>捕まえたポケモン一覧</h1>
      {caughtPokemon.length > 0 ? (
        <ul>
          {caughtPokemon.map((pokemon, index) => (
            <li key={index}>
              <h3>{pokemon.name}</h3>
              <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`} alt={pokemon.name} />
              <p>レベル: {pokemon.level}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>まだポケモンを捕まえていません。</p>
      )}
    </div>
  );
};

export default CaughtPokemonListPage;
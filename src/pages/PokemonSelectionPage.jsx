import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PokemonSelectionPage.css'; // カスタムCSSをインポート

const PokemonSelectionPage = () => {
  const [randomPokemon, setRandomPokemon] = useState(null);
  const [pokemonName, setPokemonName] = useState(""); // 日本語名を保存するための変数
  const [catchProbability, setCatchProbability] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // ポケモン取得中のフラグ
  const [caughtPokemon, setCaughtPokemon] = useState([]); // 捕まえたポケモンを管理するためのステート

  // 初回ロード時と新しいポケモンが必要なときに呼び出される
  const fetchRandomPokemon = async () => {
    try {
      setIsLoading(true); // ロード中フラグをセット
      const randomId = Math.floor(Math.random() * 150) + 1;

      // モンスターボールが回転するアニメーションを見せるために少し待つ
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      setRandomPokemon(response.data);

      const speciesResponse = await axios.get(response.data.species.url);
      const names = speciesResponse.data.names;
      const japaneseName = names.find((name) => name.language.name === "ja").name;
      setPokemonName(japaneseName);

      calculateCatchProbability(response.data);
    } catch (error) {
      console.error('Error fetching random Pokémon:', error);
    } finally {
      setIsLoading(false); // ロードが終わったらフラグを解除
    }
  };

  // 捕まえる確率を計算する関数
  const calculateCatchProbability = (pokemon) => {
    // ポケモンの全ステータスの合計値を取得
    const totalStats = pokemon.stats.reduce((acc, stat) => acc + stat.base_stat, 0);

    // ポケモンの強さによって捕まえる確率を調整
    let baseProbability;
    if (totalStats <= 300) {
      baseProbability = 70; // 弱いポケモンは捕まえやすい
    } else if (totalStats >= 500) {
      baseProbability = 30; // 強いポケモンは捕まえにくい
    } else {
      baseProbability = 50; // 普通の強さなら平均的な捕まえる確率
    }

    // プレイヤーレベルを考慮して、最終的な捕まえる確率を計算
    const playerLevel = caughtPokemon.length > 0 ? caughtPokemon.reduce((sum, p) => sum + p.level, 0) / caughtPokemon.length : 1;
    const probability = Math.min(100, Math.max(10, baseProbability + (playerLevel - pokemon.base_experience) * 0.05));
    
    setCatchProbability(probability);
  };

  // レベルに応じてステータスを成長させる関数
  const calculateStats = (baseStats, level) => {
    return {
      hp: Math.floor(baseStats.hp * (1 + level * 0.05)), // HPはレベルごとに5%増加
      attack: Math.floor(baseStats.attack * (1 + level * 0.03)), // 攻撃力はレベルごとに3%増加
      defense: Math.floor(baseStats.defense * (1 + level * 0.03)), // 防御力も同様
      speed: baseStats.speed, // 素早さはそのまま（または成長させたい場合はここで調整）
    };
  };

  // ポケモンを捕まえる関数
  const handleCatchPokemon = async () => {
    const success = Math.random() * 100 < catchProbability;
    console.log('捕まえる判定:', success); // 捕まえたかどうかの結果を出力

    if (success) {
      const isAlreadyCaught = caughtPokemon.some(p => p.id === randomPokemon.id);
      console.log('既に捕まえているか:', isAlreadyCaught); // ポケモンが既に捕まっているかどうかを出力

      if (!isAlreadyCaught) {
        // 各技の詳細情報を取得
        const moves = await Promise.all(
          randomPokemon.moves.slice(0, 4).map(async (move) => {
            const moveResponse = await axios.get(move.move.url);
            // 日本語名を取得
            const japaneseMoveName = moveResponse.data.names.find((name) => name.language.name === "ja")?.name || move.move.name;

            return {
              name: japaneseMoveName, // 日本語の技名を使用
              power: moveResponse.data.power || 0,
              pp: moveResponse.data.pp,
            };
          })
        );

        // 各ステータス（HP、こうげき、ぼうぎょ等）の取得と成長
        const stats = randomPokemon.stats.reduce((acc, stat) => {
          const statName = stat.stat.name;
          switch (statName) {
            case 'hp':
              acc.hp = stat.base_stat;
              break;
            case 'attack':
              acc.attack = stat.base_stat;
              break;
            case 'defense':
              acc.defense = stat.base_stat;
              break;
            case 'special-attack':
              acc.specialAttack = stat.base_stat;
              break;
            case 'special-defense':
              acc.specialDefense = stat.base_stat;
              break;
            case 'speed':
              acc.speed = stat.base_stat;
              break;
            default:
              break;
          }
          return acc;
        }, {});

        // レベル設定とステータスの成長を計算
        const level = Math.floor(Math.random() * 10) + 1;
        const updatedStats = calculateStats(stats, level);

        const newPokemon = {
          name: pokemonName,
          level: level,
          id: randomPokemon.id,
          moves: moves, // 技の情報を追加
          stats: updatedStats, // 成長後のステータスを追加
        };

        const updatedPokemonList = [...caughtPokemon, newPokemon];

        // ステートとローカルストレージに新しいポケモンを追加
        setCaughtPokemon(updatedPokemonList);
        localStorage.setItem('caughtPokemon', JSON.stringify(updatedPokemonList));
        console.log('ローカルストレージ更新:', updatedPokemonList);

        toast.success(`${pokemonName}を捕まえた！`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.info(`${pokemonName}はすでに捕まえています！`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      toast.error(`${pokemonName}は逃げてしまった...`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // 初回ロード時にポケモンを取得し、ローカルストレージからデータを復元する
  useEffect(() => {
    console.log('初回ロードで実行されるuseEffect');

    const savedPokemon = localStorage.getItem('caughtPokemon');
    if (savedPokemon) {
      const parsedPokemon = JSON.parse(savedPokemon);
      console.log('ローカルストレージから取得したポケモン:', parsedPokemon);
      setCaughtPokemon(parsedPokemon);
    }

    fetchRandomPokemon();
  }, []); // 依存関係を空配列にすることで初回ロードのみ実行

  return (
    <div className="pokemon-selection-page">
      <h1>ポケモンを選択</h1>
      {isLoading ? (
        <div className="loading-container">
          <div className="pokeball-loader"></div>
          <p>ポケモンを探しています...</p>
        </div>
      ) : randomPokemon ? (
        <div>
          <h2>出現したポケモン: {pokemonName}</h2>
          <img src={randomPokemon.sprites.front_default} alt={pokemonName} />
          <p>捕まえる確率: {catchProbability.toFixed(2)}%</p>
          <button onClick={handleCatchPokemon}>捕まえる！</button>
          <button onClick={fetchRandomPokemon}>他のポケモンを探す</button>
        </div>
      ) : (
        <p>ポケモンを探しています...</p>
      )}
    </div>
  );
};

export default PokemonSelectionPage;

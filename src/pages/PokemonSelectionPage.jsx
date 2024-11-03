import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PokemonSelectionPage.css'; // カスタムCSSをインポート
import { useSelector, useDispatch } from 'react-redux';
import { setPokeballCount, setUserGold } from '../store/userSlice';
import { motion } from 'framer-motion'; // Framer Motionをインポート
import { useNavigate } from 'react-router-dom';

const PokemonSelectionPage = () => {
  const [randomPokemon, setRandomPokemon] = useState(null);
  const [pokemonName, setPokemonName] = useState(""); // 日本語名を保存するための変数
  const [catchProbability, setCatchProbability] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // ポケモン取得中のフラグ
  const [caughtPokemon, setCaughtPokemon] = useState([]); // 捕まえたポケモンを管理するためのステート
  const [isDataLoaded, setIsDataLoaded] = useState(false); // データロード完了フラグ
  const [isCaughtAnimation, setIsCaughtAnimation] = useState(false); // 捕まえた時の演出ステート
  const [isCatchDisabled, setIsCatchDisabled] = useState(false); // 捕まえるボタンを無効化するステート

  const pokeballCount = useSelector((state) => state.user.pokeballCount); // Reduxからモンスターボールの数を取得
  const userGold = useSelector((state) => state.user.userGold); // Reduxから所持金の数を取得
  const dispatch = useDispatch();

  const navigate = useNavigate();

  // 初回ロード時にローカルストレージからデータを復元する
  useEffect(() => {
    console.log('初回ロードで実行されるuseEffect');
    const savedPokemon = localStorage.getItem('caughtPokemon');

    if (savedPokemon) {
      const parsedPokemon = JSON.parse(savedPokemon);
      console.log('ローカルストレージから取得したポケモン:', parsedPokemon);
      setCaughtPokemon(parsedPokemon);
    } else {
      console.log('ローカルストレージに保存されているポケモンはありません。');
    }

    setIsDataLoaded(true); // ローカルストレージからの復元が完了したことを示す
  }, []); // 依存リストは空で、初回ロード時のみ実行

  // データのロードが完了した後にポケモンを取得する
  useEffect(() => {
    if (isDataLoaded) {
      console.log('ローカルストレージからのデータ復元後に新しいポケモンを取得します。');
      fetchRandomPokemon();
    }
  }, [isDataLoaded]); // isDataLoadedがtrueになったときのみ実行

// 未捕獲ポケモンのIDリストからランダムに選択する関数
const getRandomPokemonId = () => {
  const allPokemonIds = Array.from({ length: 150 }, (_, i) => i + 1); // 1から150までのIDを生成
  const caughtPokemonIds = caughtPokemon.map(pokemon => pokemon.id);
  const uncaughtPokemonIds = allPokemonIds.filter(id => !caughtPokemonIds.includes(id)); // 未捕獲のIDのみ取得

  if (uncaughtPokemonIds.length === 0) {
    console.log('すべてのポケモンを捕まえました！');
    return null;
  }

  // 未捕獲ポケモンIDからランダムに1つ選択
  const randomIndex = Math.floor(Math.random() * uncaughtPokemonIds.length);
  return uncaughtPokemonIds[randomIndex];
};

// fetchRandomPokemonの中でgetRandomPokemonId関数を使用
const fetchRandomPokemon = async () => {
  try {
    if (userGold <= 0) {
      toast.error('所持金が不足しています！バトルして稼ぎなさい！');
      navigate('/battle'); // 所持金が不足している場合、ホームに遷移
      return;
    }

    // 所持金を50消費
    dispatch(setUserGold(userGold - 50));

    setIsLoading(true); // ロード中フラグをセット

    console.log('--- 新しいポケモンを探します ---');
    console.log('捕まえたポケモン一覧:', caughtPokemon.map(pokemon => pokemon.name));

    const randomId = getRandomPokemonId();
    if (randomId === null) {
      toast.info('すべてのポケモンを捕まえました！');
      setIsLoading(false);
      return;
    }

    console.log(`選択された未捕獲のポケモンID: ${randomId}`);

    // モンスターボールが回転するアニメーションを見せるために少し待つ
    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    setRandomPokemon(response.data);

    const speciesResponse = await axios.get(response.data.species.url);
    const names = speciesResponse.data.names;
    const japaneseName = names.find((name) => name.language.name === "ja").name;
    setPokemonName(japaneseName);

    console.log(`新しいポケモン「${japaneseName}」を取得しました！`);

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

  // ポケモンを捕まえる関数
  const handleCatchPokemon = async () => {
    if (pokeballCount <= 0) {
      toast.error('モンスターボールが不足しています！ショップに移動します。');
      navigate('/shop'); // モンスターボールが不足している場合、ショップに遷移
      return;
    }

    // モンスターボールを1つ消費
    dispatch(setPokeballCount(pokeballCount - 1));

    const pokeballElement = document.querySelector('.pokeball-image');
    if (pokeballElement) {
      console.log('モンスターボール要素を見つけました:', pokeballElement); 
      pokeballElement.classList.add('throw');
      setTimeout(() => {
        pokeballElement.classList.remove('throw');
      }, 500); // アニメーションが終わったら削除
    } else {
      console.error('モンスターボール要素が見つかりませんでした');
    }

    const success = Math.random() * 100 < catchProbability;
    console.log('捕まえる判定:', success); // 捕まえたかどうかの結果を出力

    if (success) {
      const isAlreadyCaught = caughtPokemon.some(p => p.id === randomPokemon.id);
      setIsCatchDisabled(true); // 捕まえたらボタンを無効化
      console.log('捕まえるボタンが無効化されました。');
      console.log('既に捕まえているか:', isAlreadyCaught); // ポケモンが既に捕まっているかどうかを出力

      if (!isAlreadyCaught) {

        // 捕まえたときの特別な演出を追加
        pokeballElement.classList.add('caught-success');

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

        // モンスターボールの変化が完了した後に捕まえた演出を表示
        pokeballElement.addEventListener('animationend', () => {
          setIsCaughtAnimation(true); // 捕まえた演出を表示
          
          setTimeout(() => {
            setIsCaughtAnimation(false);
            fetchRandomPokemon();
            setIsCatchDisabled(false); // 次のポケモンが表示されるときにボタンを有効化
            pokeballElement.classList.remove('catch-success'); // 特別演出クラスを削除
          }, 3000);
        }, { once: true });

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

  // レベルに応じてステータスを成長させる関数
  const calculateStats = (baseStats, level) => {
    return {
      hp: Math.floor(baseStats.hp * (1 + level * 0.05)), // HPはレベルごとに5%増加
      attack: Math.floor(baseStats.attack * (1 + level * 0.03)), // 攻撃力はレベルごとに3%増加
      defense: Math.floor(baseStats.defense * (1 + level * 0.03)), // 防御力も同様
      speed: baseStats.speed, // 素早さはそのまま（または成長させたい場合はここで調整）
    };
  };

  return (
    <motion.div className="pokemon-selection-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>

      {isCaughtAnimation ? (
        <div className="caught-animation">
          <motion.img
            src={randomPokemon.sprites.other.dream_world.front_default}
            alt={pokemonName}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1.5 }}
            transition={{ duration: 1 }}
            className="caught-pokemon-image"
          />
          <div className="caught-pokemon-image-sub-container">
          <motion.img
            src={randomPokemon.sprites.front_default}
            alt={pokemonName}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="caught-pokemon-image-sub"
          />
          <motion.img
            src={randomPokemon.sprites.back_default}
            alt={pokemonName}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
              className="caught-pokemon-image-sub"
            />
          </div>
          <h2 className="congrats-message">🎊 おめでとう！ 🎊<br />{pokemonName}<br /><small>を捕まえた！</small></h2>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="loading-container">
              <motion.div className="pokeball-loader" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}></motion.div>
              <p>ポケモンを探しています...</p>
            </div>
          ) : randomPokemon ? (
            <motion.div className="pokemon-display" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h2 className="pokemon-name">{pokemonName}<small>が現れた！</small></h2>
              <img src={randomPokemon.sprites.front_default} alt={pokemonName} className="pokemon-image" />
              <p className="catch-probability">捕まえる確率: {catchProbability.toFixed(2)}%</p>
              <div className="catch-button-container">
                <motion.img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                  alt="モンスターボール"
                  className="pokeball-image"
                  whileHover={{ scale: 1.2 }}
                />
                <motion.button
                  className={`catch-button ${isCatchDisabled ? "disabled" : ""}`}
                  whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgb(255, 215, 0)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCatchPokemon}
                  disabled={isCatchDisabled} // ボタンの無効化を反映
                >
                  <span>捕まえる！</span>
                  <span><img className="catch-button-icon" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="" /> - 1</span>
                </motion.button>
              </div>
              <motion.button
                className={`change-button ${isCatchDisabled ? "disabled" : ""}`}
                whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgb(255, 0, 0)" }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchRandomPokemon}
                disabled={isCatchDisabled} // ボタンの無効化を反映
              >
                <span>チェンジ！</span>
                <span>💴 - 50</span>
              </motion.button>
            </motion.div>
          ) : (
            <p>ポケモンを探しています...</p>
          )}
        </>
      )}
    </motion.div>
  );
};

export default PokemonSelectionPage;
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './BattlePage.css';
import { LinearProgress, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setUserGold, setUserTickets } from '../store/userSlice';

// HPバーのコンポーネント
const HPBar = ({ hp, maxHp }) => {
    const percentage = (hp / maxHp) * 100;
  
    return (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '80%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 20,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: percentage > 50 ? '#00cc00' : percentage > 20 ? '#ffcc00' : '#ff0000'
              }
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="textSecondary">{`${hp} / ${maxHp}`}</Typography>
        </Box>
      </Box>
    );
  };
  

  const BattlePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userGold = useSelector((state) => state.user.userGold);
    const userTickets = useSelector((state) => state.user.userTickets);
    const [caughtPokemon, setCaughtPokemon] = useState([]);
    const [playerPokemon, setPlayerPokemon] = useState(null);
    const [enemyPokemon, setEnemyPokemon] = useState(null);
    const [playerHP, setPlayerHP] = useState(0);
    const [enemyHP, setEnemyHP] = useState(0);
    const [turn, setTurn] = useState(null);
    const [playerMove, setPlayerMove] = useState(null);
    const [enemyMove, setEnemyMove] = useState(null);
    const [isSelectingPokemon, setIsSelectingPokemon] = useState(true);
    const [battleLog, setBattleLog] = useState([]);
    const [isBattleEnded, setIsBattleEnded] = useState(false); 
    const [isActionInProgress, setIsActionInProgress] = useState(false); // アクション中フラグ
    const [showCelebration, setShowCelebration] = useState(false); // お祝い表示のフラグ
  
    const battleLogRef = useRef(null);

  useEffect(() => {
    const savedPokemon = localStorage.getItem('caughtPokemon');
    if (savedPokemon) {
      const parsedPokemon = JSON.parse(savedPokemon);
      setCaughtPokemon(parsedPokemon);
    } else {
      toast.info('バトルには少なくとも1匹のポケモンが必要です！');
      navigate('/caught');
    }
  }, [navigate]);

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);

  useEffect(() => {
    if (playerPokemon && !isBattleEnded) {
      fetchRandomEnemyPokemon();
    }
  }, [playerPokemon, isBattleEnded]);

  const fetchRandomEnemyPokemon = async () => {
    try {
      if (!playerPokemon) {
        return;
      }

      const randomId = Math.floor(Math.random() * 150) + 1;
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const enemyData = response.data;

      const speciesResponse = await axios.get(enemyData.species.url);
      const japaneseName = speciesResponse.data.names.find((name) => name.language.name === "ja")?.name || enemyData.name;

      const enemyLevel = Math.max(1, playerPokemon.level + Math.floor(Math.random() * 5) - 2);

      const enemy = {
        id: enemyData.id,
        name: japaneseName,
        level: enemyLevel,
        sprite: enemyData.sprites.front_default,
        stats: enemyData.stats.reduce((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat + (enemyLevel - 1) * 5;
          return acc;
        }, {}),
        moves: await Promise.all(
          enemyData.moves.slice(0, 4).map(async (move) => {
            const moveResponse = await axios.get(move.move.url);
            return {
              name: moveResponse.data.names.find((name) => name.language.name === "ja")?.name || move.move.name,
              power: moveResponse.data.power || 0,
              pp: moveResponse.data.pp,
            };
          })
        ),
      };

      setEnemyPokemon(enemy);
      setEnemyHP(enemy.stats.hp || 50);
      updateBattleLog(`敵のポケモン ${enemy.name} が現れた！`);
    } catch (error) {
      console.error('Error fetching random enemy Pokémon:', error);
      toast.error('敵のポケモンを取得できませんでした。');
      navigate('/');
    }
  };

  const handleSelectPokemon = (pokemon) => {
    setPlayerPokemon(pokemon);
    setPlayerHP(pokemon.stats.hp);
    setIsSelectingPokemon(false);
    updateBattleLog(`行けっ！！ ${pokemon.name} ！！`);
  };

  const determineTurnOrder = () => {
    if (playerPokemon && enemyPokemon && !isBattleEnded) {
      const playerSpeed = playerPokemon.stats.speed;
      const enemySpeed = enemyPokemon.stats.speed;

      if (playerSpeed >= enemySpeed) {
        setTurn("player");
        updateBattleLog("先制攻撃だ！");
      } else {
        setTurn("enemy");
        updateBattleLog("敵が先制攻撃を仕掛けてきた！");
      }
    }
  };

  useEffect(() => {
    if (playerPokemon && enemyPokemon && !isBattleEnded) {
      determineTurnOrder();
    }
  }, [playerPokemon, enemyPokemon, isBattleEnded]);

  const handlePlayerAttack = (move) => {
    if (turn === "player" && !isBattleEnded && !isActionInProgress) {
      setIsActionInProgress(true); // アクション開始
      setPlayerMove(move);
      updateBattleLog(`${playerPokemon.name} は ${move.name} を使った！`);
    
      const playerImg = document.querySelector('.player-side img');
      // 攻撃をミスする確率（5%）
    const isMiss = Math.random() < 0.05;
    if (isMiss) {
      playerImg.classList.add('miss-attack'); 
      updateBattleLog(`${playerPokemon.name} の攻撃は外れた！`);
      toast.warn(`${playerPokemon.name} の攻撃は外れた！`);
      setIsActionInProgress(false); // アクション終了
      setTimeout(() => {
        playerImg.classList.remove('miss-attack'); 
      }, 500);
      setTurn("enemy"); // ターンを敵に変更
      return;
    }

       // 攻撃力と防御力を利用してダメージを計算
       const playerAttack = playerPokemon.stats.attack;
       const enemyDefense = enemyPokemon.stats.defense;
       const baseDamage = move.power || 10;
       const randomFactor = Math.random() * 5 + 1;
       const levelFactor = playerPokemon.level * 0.3;
   
       // クリーンヒットの確率（10%）
       const isCleanHit = Math.random() < 0.1;
       const damageMultiplier = isCleanHit ? 1.5 : 1; // クリーンヒットなら1.5倍
       const damage = Math.floor(((baseDamage + playerAttack / 5 - enemyDefense / 5) * 0.5 + randomFactor + levelFactor) * damageMultiplier);


      if (isCleanHit) {
        playerImg.classList.add('clean-hit-attack'); // クリーンヒット用アニメーションを追加
        updateBattleLog(`クリーンヒット！ ${enemyPokemon.name} は特大の ${damage} ダメージを受けた！`);
        toast.success('クリーンヒット！大ダメージを与えた！🎉');
      } else {
        playerImg.classList.add('player-attack'); // 通常の攻撃アニメーションを追加
        updateBattleLog(`${enemyPokemon.name} は ${damage} のダメージをくらった！`);
      }
    
      setTimeout(() => {
        playerImg.classList.remove('player-attack', 'clean-hit-attack'); // アニメーション終了後にクラスを削除

    
        setEnemyHP((prevHP) => {
          const newHP = Math.max(prevHP - damage, 0);
          if (newHP === 0) {
            updateBattleLog(`敵の ${enemyPokemon.name} は倒れた！`);
            toast.success(`${enemyPokemon.name}を倒した！🎉`);
            setIsBattleEnded(true); 
            levelUpPlayerPokemon();
            rewardPlayer(); 
            setTimeout(() => navigate('/'), 3000);
          } else {
            setTurn("enemy"); // ターンを敵に変更
          }
          setIsActionInProgress(false); // アクション終了
          return newHP;
        });
      }, 500);
    }
  };
  

  const handleEnemyAttack = () => {
    if (turn === "enemy" && !isBattleEnded) {
      const enemyMove = enemyPokemon.moves[Math.floor(Math.random() * enemyPokemon.moves.length)];
      setEnemyMove(enemyMove);
      updateBattleLog(`${enemyPokemon.name} は ${enemyMove.name} を使った！`);
  
      const enemyImg = document.querySelector('.enemy-side img');

      // 攻撃をミスする確率（5%）
      const isMiss = Math.random() < 0.5;

        if (isMiss) {
          enemyImg.classList.add('miss-attack');
          updateBattleLog(`${enemyPokemon.name} の攻撃は外れた！`);
          toast.warn(`${enemyPokemon.name} の攻撃は外れた！`);
          setIsActionInProgress(false); // アクション終了
          setTimeout(() => {
            enemyImg.classList.remove('miss-attack');
          }, 500);
          setTurn("player"); // ターンを敵に変更
          return;
        }

        // 攻撃力と防御力を利用してダメージを計算
        const enemyAttack = enemyPokemon.stats.attack;
        const playerDefense = playerPokemon.stats.defense;
        const baseDamage = enemyMove.power || 10;
        const randomFactor = Math.random() * 5 + 1;
        const levelFactor = enemyPokemon.level * 0.3;

        // クリーンヒットの確率（10%）
        const isCleanHit = Math.random() < 0.1;
        const damageMultiplier = isCleanHit ? 1.5 : 1;
        const damage = Math.floor(((baseDamage + enemyAttack / 5 - playerDefense / 5) * 0.5 + randomFactor + levelFactor) * damageMultiplier);

      if (isCleanHit) {
        enemyImg.classList.add('clean-hit-attack-enemy'); // クリーンヒット用アニメーションを追加
        updateBattleLog(`敵の ${enemyPokemon.name} のクリーンヒット！ ${playerPokemon.name} は特大の ${damage} ダメージを受けた！`);
        toast.error('敵のクリーンヒット！大ダメージを受けた！💥');
      } else {
        enemyImg.classList.add('enemy-attack');
        updateBattleLog(`${playerPokemon.name} は ${damage} のダメージをくらった！`);
      }
  
      setTimeout(() => {
        enemyImg.classList.remove('enemy-attack', 'clean-hit-attack-enemy');

        setPlayerHP((prevHP) => {
          const newHP = Math.max(prevHP - damage, 0);
          if (newHP === 0) {
            updateBattleLog(`${playerPokemon.name} は倒れてしまった...`);
            toast.error(`${playerPokemon.name}は倒れてしまった...😢`);
            setIsBattleEnded(true); // バトル終了フラグをセット
            setTimeout(() => navigate('/'), 3000);
          }
          return newHP;
        });
        setTurn("player");
      }, 500);
    }
  };
  

  const levelUpPlayerPokemon = () => {
    if (playerPokemon) {
      const newLevel = playerPokemon.level + 1;
      const newStats = { ...playerPokemon.stats };
      newStats.hp = Math.floor(newStats.hp * 1.05);
      newStats.attack = Math.floor(newStats.attack * 1.05);
      newStats.defense = Math.floor(newStats.defense * 1.05);
      newStats.speed = Math.floor(newStats.speed * 1.05);

      const updatedPokemon = { ...playerPokemon, level: newLevel, stats: newStats };
      setPlayerPokemon(updatedPokemon);
      updateBattleLog(`${playerPokemon.name} のレベルが上がった！ レベル${newLevel}になった！`);
      toast.success(`${playerPokemon.name}のレベルが上がった！🎉 HP: ${newStats.hp}, 攻撃力: ${newStats.attack}, 防御力: ${newStats.defense}, 素早さ: ${newStats.speed}`);

      const updatedCaughtPokemon = caughtPokemon.map((p) =>
        p.id === playerPokemon.id ? updatedPokemon : p
      );
      setCaughtPokemon(updatedCaughtPokemon);
      localStorage.setItem('caughtPokemon', JSON.stringify(updatedCaughtPokemon));
    }
  };

  const rewardPlayer = () => {
    if (enemyPokemon) {
      // 敵のレベルに基づいて所持金を獲得
      const goldEarned = enemyPokemon.level * 10;
      dispatch(setUserGold(userGold + goldEarned)); // ReduxのuserGoldを更新
      toast.success(`ゴールドを ${goldEarned} 獲得した！💴`);

      // チケット獲得の確率
      const ticketChance = Math.random() < enemyPokemon.level * 0.02; // 敵のレベルに基づいて確率を決定
      if (ticketChance) {
        dispatch(setUserTickets(userTickets + 1)); // ReduxのuserTicketsを更新
        toast.success('超レア！チケットを獲得した！🎉🎫', {
          position: "top-center",
          autoClose: 5000,
          style: { backgroundColor: '#ffeb3b', color: '#333', fontWeight: 'bold' },
        });
        setShowCelebration(true); // お祝い表示をオンにする
        setTimeout(() => setShowCelebration(false), 5000); // 5秒後にお祝いを非表示
      }
    }
  };

  const updateBattleLog = (message) => {
    setBattleLog((prevLog) => [...prevLog, message]);
  };

  useEffect(() => {
    if (turn === "enemy" && enemyPokemon && playerHP > 0 && !isBattleEnded) {
      setTimeout(() => {
        handleEnemyAttack();
      }, 1500);
    }
  }, [turn, enemyPokemon, playerHP, isBattleEnded]);

  return (
    <main className="battle">
      {isSelectingPokemon ? (
        <div className="select-pokemon-container">
          <h2 className="select-pokemon-title">ポケモンを選んでくれ！</h2>
          <div className="pokemon-selection">
            {caughtPokemon.sort((a, b) => b.level - a.level).map((pokemon, index) => (
              <div key={index} className="pokemon-card" onClick={() => handleSelectPokemon(pokemon)}>
                <h3>{pokemon.name}</h3>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                />
                <p>レベル: {pokemon.level}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        playerPokemon && enemyPokemon && (
          <>
            <div className="battle-page">
              <div className="battle-arena">
                <div className="player-side">
                  <h2>{playerPokemon.name}</h2>
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerPokemon.id}.png`}
                    alt={playerPokemon.name}
                  />
                  <p>レベル: {playerPokemon.level}</p>
                  <p>HP: {playerHP}</p>
                  <HPBar hp={playerHP} maxHp={playerPokemon.stats.hp} />
                </div>

                <div className="enemy-side">
                  <h2>{enemyPokemon.name}</h2>
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemyPokemon.id}.png`}
                    alt={enemyPokemon.name}
                  />
                  <p>レベル: {enemyPokemon.level}</p>
                  <p>HP: {enemyHP}</p>
                  <HPBar hp={enemyHP} maxHp={enemyPokemon.stats.hp} />
                </div>
              </div>

              <div className="move-selection">
                {turn === "player" && playerPokemon.moves.map((move, index) => (
                  <button
                    key={index}
                    onClick={() => handlePlayerAttack(move)}
                    disabled={turn !== "player" || isActionInProgress || isBattleEnded} 
                  >
                    {move.name}
                  </button>
                ))}
              </div>

              <div className="battle-log" ref={battleLogRef}>
                <ul>
                  {battleLog.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </div>
            </div>
            {/* 特別なお祝いポップアップ */}
            {showCelebration && (
              <div className="celebration-popup">
                <p>🎉 おめでとう！ 🎉<br /><small>チケットを獲得しました！</small>🎫</p>
              </div>
            )}
          </>
        )
      )}
    </main>
  );
};

export default BattlePage;

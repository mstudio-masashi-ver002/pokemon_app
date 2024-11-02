import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './BattlePage.css';

const BattlePage = () => {
  const navigate = useNavigate();
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
  const [isBattleEnded, setIsBattleEnded] = useState(false); // バトル終了フラグ

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
    if (turn === "player" && !isBattleEnded) {
      setPlayerMove(move);
      updateBattleLog(`${playerPokemon.name} は ${move.name} を使った！`);

      const playerImg = document.querySelector('.player-side img');
      playerImg.classList.add('player-attack');

      setTimeout(() => {
        playerImg.classList.remove('player-attack');

        const baseDamage = move.power || 10;
        const randomFactor = Math.random() * 5 + 1;
        const levelFactor = playerPokemon.level * 0.3;
        const damage = Math.floor(baseDamage * 0.5 + randomFactor + levelFactor);

        updateBattleLog(`${enemyPokemon.name} は ${damage} のダメージをくらった！`);

        setEnemyHP((prevHP) => {
          const newHP = Math.max(prevHP - damage, 0);
          if (newHP === 0) {
            updateBattleLog(`敵の ${enemyPokemon.name} は倒れた！`);
            toast.success(`${enemyPokemon.name}を倒した！🎉`);
            setIsBattleEnded(true); // バトル終了フラグをセット
            levelUpPlayerPokemon();
            setTimeout(() => navigate('/'), 3000);
          } else {
            setTurn("enemy");
          }
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
      enemyImg.classList.add('enemy-attack');

      setTimeout(() => {
        enemyImg.classList.remove('enemy-attack');

        const baseDamage = enemyMove.power || 10;
        const randomFactor = Math.random() * 5 + 1;
        const levelFactor = enemyPokemon.level * 0.3;
        const damage = Math.floor(baseDamage * 0.5 + randomFactor + levelFactor);

        updateBattleLog(`${playerPokemon.name} は ${damage} のダメージをくらった！`);

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
      newStats.hp = Math.floor(newStats.hp * 1.1);
      newStats.attack = Math.floor(newStats.attack * 1.05);
      newStats.defense = Math.floor(newStats.defense * 1.05);
      newStats.speed = Math.floor(newStats.speed * 1.02);

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
    <div className="battle-page">
      {isSelectingPokemon ? (
        <div>
          <h2>使用するポケモンを選んでください：</h2>
          <div className="pokemon-selection">
            {caughtPokemon.map((pokemon, index) => (
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
            <div className="battle-arena">
              <div className="player-side">
                <h2>{playerPokemon.name}</h2>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerPokemon.id}.png`}
                  alt={playerPokemon.name}
                />
                <p>レベル: {playerPokemon.level}</p>
                <p>HP: {playerHP}</p>
              </div>

              <div className="enemy-side">
                <h2>{enemyPokemon.name}</h2>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemyPokemon.id}.png`}
                  alt={enemyPokemon.name}
                />
                <p>レベル: {enemyPokemon.level}</p>
                <p>HP: {enemyHP}</p>
              </div>
            </div>

            <div className="move-selection">
              {turn === "player" && playerPokemon.moves.map((move, index) => (
                <button
                  key={index}
                  onClick={() => handlePlayerAttack(move)}
                  disabled={turn !== "player"}
                >
                  {move.name} (威力: {move.power || 'なし'})
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
          </>
        )
      )}
    </div>
  );
};

export default BattlePage;

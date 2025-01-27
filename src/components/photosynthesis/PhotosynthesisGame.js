import React, { useState, useEffect } from 'react';
import './PhotosynthesisGame.css';

const resources = {
  light: { name: 'Light', icon: '☀️', baseRate: 2 },
  water: { name: 'Water', icon: '💧', baseRate: 1.5 },
  co2: { name: 'CO₂', icon: '🌫️', baseRate: 1 }
};

const obstacles = [
  { name: 'Drought', affects: 'water', severity: 0.5 },
  { name: 'Cloud Cover', affects: 'light', severity: 0.7 },
  { name: 'Low CO₂', affects: 'co2', severity: 0.6 }
];

function PhotosynthesisGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [glucose, setGlucose] = useState(0);
  const [resourceLevels, setResourceLevels] = useState({
    light: 50,
    water: 50,
    co2: 50
  });
  const [activeObstacles, setActiveObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(60);
    setScore(0);
    setGlucose(0);
    setResourceLevels({ light: 50, water: 50, co2: 50 });
    setActiveObstacles([]);
    setGameOver(false);
  };

  const collectResource = (resource) => {
    if (!gameStarted || gameOver) return;

    const obstacle = activeObstacles.find(obs => obs.affects === resource);
    const effectiveRate = obstacle 
      ? resources[resource].baseRate * obstacle.severity 
      : resources[resource].baseRate;

    setResourceLevels(prev => ({
      ...prev,
      [resource]: Math.min(100, prev[resource] + effectiveRate * 10)
    }));
  };

  const produceGlucose = () => {
    const minResource = Math.min(
      resourceLevels.light,
      resourceLevels.water,
      resourceLevels.co2
    );

    if (minResource >= 10) {
      const produced = Math.floor(minResource / 10);
      setGlucose(prev => prev + produced);
      setScore(prev => prev + produced * 10);
      
      setResourceLevels(prev => ({
        light: prev.light - produced * 10,
        water: prev.water - produced * 10,
        co2: prev.co2 - produced * 10
      }));
    }
  };

  const addRandomObstacle = () => {
    const availableObstacles = obstacles.filter(
      obs => !activeObstacles.find(active => active.affects === obs.affects)
    );
    
    if (availableObstacles.length > 0) {
      const newObstacle = availableObstacles[
        Math.floor(Math.random() * availableObstacles.length)
      ];
      setActiveObstacles(prev => [...prev, newObstacle]);

      setTimeout(() => {
        setActiveObstacles(prev => 
          prev.filter(obs => obs.name !== newObstacle.name)
        );
      }, 5000);
    }
  };

  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });

        if (Math.random() < 0.1) {
          addRandomObstacle();
        }

        produceGlucose();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, resourceLevels]);

  return (
    <div className="photosynthesis-game">
      <div className="game-header">
        <h2>Photosynthesis Race</h2>
        {!gameStarted ? (
          <button onClick={startGame}>Start Game</button>
        ) : (
          <div className="game-stats">
            <div>Time: {timeLeft}s</div>
            <div>Score: {score}</div>
            <div>Glucose: {glucose}</div>
          </div>
        )}
      </div>

      {gameStarted && !gameOver && (
        <div className="game-area">
          <div className="resource-containers">
            {Object.entries(resources).map(([key, resource]) => (
              <div key={key} className="resource-container">
                <button 
                  className="resource-button"
                  onClick={() => collectResource(key)}
                  disabled={resourceLevels[key] >= 100}
                >
                  {resource.icon}
                </button>
                <div className="resource-level">
                  <div 
                    className="level-fill"
                    style={{ width: `${resourceLevels[key]}%` }}
                  ></div>
                </div>
                <div className="resource-label">
                  {resource.name}: {Math.round(resourceLevels[key])}%
                </div>
              </div>
            ))}
          </div>

          {activeObstacles.length > 0 && (
            <div className="obstacles">
              {activeObstacles.map(obstacle => (
                <div key={obstacle.name} className="obstacle-alert">
                  {obstacle.name}!
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          <p>Glucose Produced: {glucose}</p>
          <button onClick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default PhotosynthesisGame;

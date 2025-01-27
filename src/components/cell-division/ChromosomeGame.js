import React, { useState, useEffect, useCallback } from 'react';
import './ChromosomeGame.css';

const difficultyLevels = {
  easy: { pairs: 4, timeLimit: 90, bonusTime: 5 },
  medium: { pairs: 6, timeLimit: 120, bonusTime: 3 },
  hard: { pairs: 8, timeLimit: 150, bonusTime: 2 }
};

// Define chromosome patterns
const chromosomePatterns = [
  { bands: [[0.2, 0.3], [0.5, 0.6], [0.8, 0.9]], color: '#ff79c6' },
  { bands: [[0.3, 0.4], [0.6, 0.7]], color: '#bd93f9' },
  { bands: [[0.1, 0.2], [0.4, 0.5], [0.7, 0.8]], color: '#50fa7b' },
];

function ChromosomeGame() {
  const [difficulty, setDifficulty] = useState('easy');
  const [chromosomes, setChromosomes] = useState([]);
  const [selectedChromosome, setSelectedChromosome] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastMatchTime, setLastMatchTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);

  const generateChromosomes = (pairs) => {
    const chromosomePairs = Array.from({ length: pairs }, (_, index) => ({
      id: index,
      pair: index,
      length: Math.random() * 50 + 50, // Random length between 50-100px
      pattern: chromosomePatterns[index % chromosomePatterns.length],
      centromerePosition: Math.random() * 0.4 + 0.3, // Position between 30-70%
      bands: chromosomePatterns[index % chromosomePatterns.length].bands
    }));

    // Create pairs and shuffle
    return [...chromosomePairs, ...chromosomePairs]
      .map(chr => ({ ...chr, uniqueId: Math.random() }))
      .sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const level = difficultyLevels[difficulty];
    setChromosomes(generateChromosomes(level.pairs));
    setMatchedPairs([]);
    setScore(0);
    setTimeLeft(level.timeLimit);
    setGameStarted(true);
    setGameOver(false);
  };

  const playMatchSound = useCallback(() => {
    const audio = new Audio('/sounds/match.mp3');
    audio.play().catch(() => {}); // Ignore if sound fails
  }, []);

  const handleMatch = (chromosome) => {
    if (selectedChromosome?.pair === chromosome.pair) {
      const timeSinceLastMatch = Date.now() - lastMatchTime;
      let bonus = 100;
      
      // Combo system
      if (timeSinceLastMatch < 2000) { // 2 seconds for combo
        setComboMultiplier(prev => Math.min(prev + 0.5, 4));
        bonus = Math.floor(bonus * comboMultiplier);
      } else {
        setComboMultiplier(1);
      }

      setScore(prev => prev + bonus);
      setStreak(prev => prev + 1);
      setTimeLeft(prev => prev + difficultyLevels[difficulty].bonusTime);
      setShowFeedback({ type: 'match', bonus, combo: comboMultiplier > 1 });
      playMatchSound();
    } else {
      setStreak(0);
      setComboMultiplier(1);
      setShowFeedback({ type: 'miss' });
    }
    setLastMatchTime(Date.now());
  };

  const handleChromosomeClick = (chromosome) => {
    if (!gameStarted || gameOver || matchedPairs.includes(chromosome.pair)) {
      return;
    }

    if (selectedChromosome === null) {
      setSelectedChromosome(chromosome);
    } else {
      if (selectedChromosome.pair === chromosome.pair &&
          selectedChromosome.uniqueId !== chromosome.uniqueId) {
        // Match found
        setMatchedPairs([...matchedPairs, chromosome.pair]);
        handleMatch(chromosome);
      } else {
        // No match
        setScore(Math.max(0, score - 20));
      }
      setSelectedChromosome(null);
    }
  };

  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setGameOver(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (matchedPairs.length === difficultyLevels[difficulty].pairs) {
      setGameOver(true);
    }
  }, [matchedPairs, difficulty]);

  const renderChromosome = (chromosome) => {
    const isSelected = selectedChromosome?.uniqueId === chromosome.uniqueId;
    const isMatched = matchedPairs.includes(chromosome.pair);
    
    return (
      <div
        key={chromosome.uniqueId}
        className={`chromosome ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
        onClick={() => handleChromosomeClick(chromosome)}
        style={{
          '--chromosome-length': `${chromosome.length}px`,
          '--centromere-position': `${chromosome.centromerePosition * 100}%`,
          '--chromosome-color': chromosome.pattern.color
        }}
      >
        <div className="chromatid left">
          {chromosome.bands.map((band, idx) => (
            <div
              key={idx}
              className="band"
              style={{
                top: `${band[0] * 100}%`,
                height: `${(band[1] - band[0]) * 100}%`
              }}
            />
          ))}
        </div>
        <div className="centromere" />
        <div className="chromatid right">
          {chromosome.bands.map((band, idx) => (
            <div
              key={idx}
              className="band"
              style={{
                top: `${band[0] * 100}%`,
                height: `${(band[1] - band[0]) * 100}%`
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTutorial = () => (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        <h2>How to Play</h2>
        <div className="tutorial-step">
          <div className="example-chromosome"></div>
          <p>Match chromosomes with identical:</p>
          <ul>
            <li>Length</li>
            <li>Banding patterns</li>
            <li>Centromere position</li>
          </ul>
        </div>
        <button onClick={() => setShowTutorial(false)}>Start Playing!</button>
      </div>
    </div>
  );

  return (
    <div className="chromosome-game-fullscreen">
      {!gameStarted && !showTutorial ? (
        <div className="start-screen">
          <h1>Chromosome Matching Game</h1>
          <div className="difficulty-select">
            <h3>Select Difficulty:</h3>
            {Object.keys(difficultyLevels).map(level => (
              <button
                key={level}
                className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                onClick={() => setDifficulty(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          {showTutorial && renderTutorial()}
          
          <div className="game-header">
            <div className="game-stats">
              <div className="stat time">⏰ {timeLeft}s</div>
              <div className="stat score">🎯 {score}</div>
              <div className="stat streak">
                🔥 Streak: {streak} {comboMultiplier > 1 && `(${comboMultiplier}x)`}
              </div>
            </div>
            
            {!gameStarted && (
              <div className="difficulty-select">
                {Object.keys(difficultyLevels).map(level => (
                  <button
                    key={level}
                    className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                    onClick={() => setDifficulty(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {gameStarted && (
            <div className="game-board">
              <div className="chromosome-grid">
                {chromosomes.map(renderChromosome)}
              </div>
            </div>
          )}
        </>
      )}

      {showFeedback && (
        <div className={`feedback ${showFeedback.type}`}>
          {showFeedback.type === 'match' ? (
            <>
              +{showFeedback.bonus}
              {showFeedback.combo && <span className="combo">COMBO!</span>}
            </>
          ) : (
            'Try again!'
          )}
        </div>
      )}

      {gameOver && (
        <div className="game-over-screen">
          <h2>Game Over!</h2>
          <div className="final-stats">
            <p>Final Score: {score}</p>
            <p>Best Streak: {streak}</p>
            <p>Pairs Matched: {matchedPairs.length}</p>
          </div>
          <button className="play-again" onClick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default ChromosomeGame;

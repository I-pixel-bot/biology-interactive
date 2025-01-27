import React, { useState, useEffect } from 'react';
import './GeneticPredictor.css';

const scenarios = [
  {
    id: 1,
    description: "If a homozygous dominant plant (TT) is crossed with a heterozygous plant (Tt), what percentage of offspring will be tall?",
    parents: ['TT', 'Tt'],
    correctAnswer: '100',
    hint: "Remember: T is dominant over t, and all offspring will receive at least one dominant allele."
  },
  {
    id: 2,
    description: "Two heterozygous parents (Bb x Bb) have children. What percentage will show the recessive trait?",
    parents: ['Bb', 'Bb'],
    correctAnswer: '25',
    hint: "In a heterozygous cross, recessive traits appear in 1/4 of offspring."
  },
  // Add more scenarios...
];

function GeneticPredictor() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentScenario(0);
    setAnswer('');
    setFeedback('');
  };

  const checkAnswer = () => {
    const current = scenarios[currentScenario];
    if (answer === current.correctAnswer) {
      setScore(score + 10);
      setFeedback('Correct! +10 points');
      nextScenario();
    } else {
      setFeedback('Incorrect. Try again or use the hint!');
      setScore(Math.max(0, score - 5));
    }
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(curr => curr + 1);
      setAnswer('');
      setShowHint(false);
      setFeedback('');
    } else {
      setFeedback(`Game Over! Final Score: ${score}`);
      setGameStarted(false);
    }
  };

  return (
    <div className="predictor-container">
      <h2>Genetic Trait Predictor</h2>
      
      {!gameStarted ? (
        <div className="start-screen">
          <p>Test your knowledge of Mendelian genetics!</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <div className="game-content">
          <div className="score-display">Score: {score}</div>
          
          <div className="scenario">
            <p>{scenarios[currentScenario].description}</p>
            <div className="parents">
              Parent Genotypes: {scenarios[currentScenario].parents.join(' × ')}
            </div>
          </div>

          <div className="answer-section">
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter percentage"
            />
            <button onClick={checkAnswer}>Submit Answer</button>
          </div>

          <button 
            className="hint-button"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>

          {showHint && (
            <div className="hint">
              Hint: {scenarios[currentScenario].hint}
            </div>
          )}

          {feedback && <div className="feedback">{feedback}</div>}
        </div>
      )}
    </div>
  );
}

export default GeneticPredictor;
import React, { useState, useEffect } from 'react';
import './GeneticCodeGame.css';

const codonTable = {
  'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
  'CUU': 'Leu', 'CUC': 'Leu', 'CUA': 'Leu', 'CUG': 'Leu',
  'AUU': 'Ile', 'AUC': 'Ile', 'AUA': 'Ile', 'AUG': 'Met',
  'GUU': 'Val', 'GUC': 'Val', 'GUA': 'Val', 'GUG': 'Val',
  'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser', 'UCG': 'Ser',
  'AGU': 'Ser', 'AGC': 'Ser', 'CCU': 'Pro', 'CCC': 'Pro',
  'CAU': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
  'CGU': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
  'ACU': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
  'AAU': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
  'GCU': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
  'GAU': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
  'UGU': 'Cys', 'UGC': 'Cys', 'UGG': 'Trp',
  'GGU': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
  'UAU': 'Tyr', 'UAC': 'Tyr', 'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP'
};

const difficulties = {
  easy: { sequenceLength: 3, timeLimit: 60 },
  medium: { sequenceLength: 6, timeLimit: 90 },
  hard: { sequenceLength: 9, timeLimit: 120 }
};

function GeneticCodeGame() {
  const [difficulty, setDifficulty] = useState('easy');
  const [sequence, setSequence] = useState('');
  const [currentCodon, setCurrentCodon] = useState('');
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [buttonStates, setButtonStates] = useState([]);
  const [highlightCodon, setHighlightCodon] = useState(false);

  const generateSequence = (length) => {
    const bases = ['U', 'A', 'G', 'C'];
    return Array.from({ length: length * 3 }, () => 
      bases[Math.floor(Math.random() * bases.length)]
    ).join('');
  };

  const generateOptions = (correctAnswer) => {
    if (!correctAnswer) return [];
    
    const allAminoAcids = [...new Set(Object.values(codonTable))].filter(aa => aa !== 'STOP');
    const options = [correctAnswer];
    
    while (options.length < 4) {
      const randomAA = allAminoAcids[Math.floor(Math.random() * allAminoAcids.length)];
      if (!options.includes(randomAA)) {
        options.push(randomAA);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const newSequence = generateSequence(difficulties[difficulty].sequenceLength);
    const firstCodon = newSequence.slice(0, 3);
    const firstAminoAcid = codonTable[firstCodon];
    
    setSequence(newSequence);
    setCurrentCodon(firstCodon);
    setOptions(generateOptions(firstAminoAcid));
    setScore(0);
    setCombo(0);
    setTimeLeft(difficulties[difficulty].timeLimit);
    setGameStarted(true);
    setGameOver(false);
    setFeedback('');
    setButtonStates([]);
    
    // Play start sound
    new Audio('/game-start.mp3').play().catch(console.error);
  };

  const handleAnswer = (answer, index) => {
    if (buttonStates.length > 0) return; // Prevent multiple clicks

    const correct = answer === codonTable[currentCodon];
    const newButtonStates = options.map((opt, i) => {
      if (i === index) return correct ? 'correct' : 'wrong';
      if (opt === codonTable[currentCodon]) return 'correct';
      return 'disabled';
    });
    
    setButtonStates(newButtonStates);
    setHighlightCodon(true);

    if (correct) {
      const comboMultiplier = Math.floor(combo / 3);
      const points = 10 * (1 + comboMultiplier);
      const newCombo = combo + 1;
      
      setScore(prev => prev + points);
      setCombo(newCombo);
      setFeedback(`Correct! +${points} points (${newCombo}x combo!)`);
      new Audio('/success.mp3').play().catch(console.error);

      const remainingSequence = sequence.slice(3);
      if (remainingSequence.length >= 3) {
        setTimeout(() => {
          const nextCodon = remainingSequence.slice(0, 3);
          setSequence(remainingSequence);
          setCurrentCodon(nextCodon);
          setOptions(generateOptions(codonTable[nextCodon]));
          setButtonStates([]);
          setHighlightCodon(false);
          setFeedback('');
        }, 800);
      } else {
        setTimeout(() => {
          setGameOver(true);
          new Audio('/victory.mp3').play().catch(console.error);
        }, 800);
      }
    } else {
      setCombo(0);
      setScore(prev => Math.max(0, prev - 5));
      setFeedback('Wrong! -5 points');
      new Audio('/error.mp3').play().catch(console.error);
      
      setTimeout(() => {
        setButtonStates([]);
        setHighlightCodon(false);
        setFeedback('');
      }, 800);
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

  return (
    <div className="genetic-code-game">
      <div className="game-header">
        <h2>🧬 Genetic Code Cracker 🧬</h2>
        <div className="controls">
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameStarted}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button onClick={startGame} disabled={gameStarted && !gameOver}>
            {gameOver ? 'Play Again' : 'Start Game'}
          </button>
        </div>
      </div>

      {gameStarted && !gameOver && (
        <div className="game-area">
          <div className="stats">
            <div className="score">Score: {score}</div>
            <div className="combo">Combo: x{combo}</div>
            <div className="timer">Time: {timeLeft}s</div>
          </div>

          {feedback && <div className="feedback">{feedback}</div>}

          <div className="codon-display">
            <div className={`current-codon ${highlightCodon ? 'highlight' : ''}`}>
              {currentCodon}
            </div>
            <div className="remaining-sequence">
              {sequence.slice(3).match(/.{1,3}/g)?.map((codon, index) => (
                <span key={index} className="future-codon">{codon}</span>
              ))}
            </div>
          </div>

          <div className="options-grid">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option, index)}
                className={`option-button ${buttonStates[index] || ''}`}
                disabled={buttonStates.length > 0}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          <p>Best Combo: x{combo}</p>
          <button onClick={startGame}>Play Again</button>
          <div className="codon-wheel">
            {/* Add visual codon wheel here */}
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneticCodeGame;

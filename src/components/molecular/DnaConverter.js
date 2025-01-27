import React, { useState, useEffect } from 'react';
import './DnaConverter.css';

const codonTable = {
  'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
  'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser', 'UCG': 'Ser',
  'UAU': 'Tyr', 'UAC': 'Tyr', 'UAA': 'STOP', 'UAG': 'STOP',
  'UGU': 'Cys', 'UGC': 'Cys', 'UGA': 'STOP', 'UGG': 'Trp',
  // ...add more codons
};

const basePairs = {
  'A': 'U',
  'T': 'A',
  'G': 'C',
  'C': 'G'
};

function DnaConverter() {
  const [dnaSequence, setDnaSequence] = useState('');
  const [rnaSequence, setRnaSequence] = useState('');
  const [aminoAcids, setAminoAcids] = useState([]);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [animatingSequence, setAnimatingSequence] = useState([]);
  const [conversionType, setConversionType] = useState('dnaToRna'); // Add this state
  const [isWinner, setIsWinner] = useState(false);
  const [inputSequence, setInputSequence] = useState(''); // Add this new state

  const bases = ['A', 'T', 'C', 'G'];

  const rnaToBasePairs = {
    'U': 'A',
    'A': 'T',
    'C': 'G',
    'G': 'C'
  };

  const validateSequence = (sequence, type) => {
    if (type === 'dna') {
      return /^[ATCG]+$/.test(sequence);
    } else {
      return /^[AUCG]+$/.test(sequence);
    }
  };

  const transcribe = () => {
    let finalSequence = dnaSequence
      .split('')
      .map(base => basePairs[base])
      .join('');
    
    setRnaSequence(finalSequence);
    translate(finalSequence);
  };

  const translate = (rna) => {
    const codons = rna.match(/.{1,3}/g) || [];
    const aminoAcidSequence = [];
    
    // Process codons until we hit a stop codon
    for (let codon of codons) {
      const aminoAcid = codonTable[codon] || '?';
      if (aminoAcid === 'STOP') break;
      aminoAcidSequence.push(aminoAcid);
    }
    
    setAminoAcids(aminoAcidSequence);
  };

  const generateRandomSequence = (length, type) => {
    const possibleBases = type === 'dna' ? ['A', 'T', 'C', 'G'] : ['A', 'U', 'C', 'G'];
    return Array(length).fill()
      .map(() => possibleBases[Math.floor(Math.random() * possibleBases.length)]);
  };

  const playSlotSound = () => {
    const audio = new Audio('/slot-machine-sound.mp3'); // Add this sound file to public folder
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const playWinSound = () => {
    const audio = new Audio('/win-sound.mp3'); // Add this sound file to public folder
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const spinSequence = () => {
    setSpinning(true);
    playSlotSound();
    const inputLength = inputSequence.length;
    
    // Generate random sequence for final result
    const randomSequence = generateRandomSequence(
      inputLength, 
      conversionType === 'dnaToRna' ? 'dna' : 'rna'
    );
    
    // Calculate final conversion sequence
    const finalSequence = conversionType === 'dnaToRna'
      ? randomSequence.map(base => basePairs[base])
      : randomSequence.map(base => rnaToBasePairs[base]);
    
    // Start with input sequence
    setAnimatingSequence(inputSequence.split(''));
    if (conversionType === 'dnaToRna') {
      setDnaSequence(inputSequence);
    } else {
      setRnaSequence(inputSequence);
    }

    // Spin each position with delays
    finalSequence.forEach((finalBase, index) => {
      let spins = 0;
      const maxSpins = 20 + (index * 5);
      
      setTimeout(() => {
        const spinInterval = setInterval(() => {
          spins++;
          setAnimatingSequence(prev => {
            const next = [...prev];
            // Random bases during spin
            next[index] = conversionType === 'dnaToRna' 
              ? ['A', 'T', 'C', 'G'][Math.floor(Math.random() * 4)]
              : ['A', 'U', 'C', 'G'][Math.floor(Math.random() * 4)];
            return next;
          });

          if (spins >= maxSpins) {
            clearInterval(spinInterval);
            setAnimatingSequence(prev => {
              const next = [...prev];
              next[index] = randomSequence[index]; // Set to random sequence
              return next;
            });

            if (index === finalSequence.length - 1) {
              setTimeout(() => {
                setSpinning(false);
                setIsWinner(true);
                playWinSound();
                if (conversionType === 'dnaToRna') {
                  setRnaSequence(finalSequence.join(''));
                  translate(finalSequence.join(''));
                  setDnaSequence(randomSequence.join('')); // Set final random DNA
                } else {
                  setDnaSequence(finalSequence.join('')); // Set final DNA conversion
                  setRnaSequence(randomSequence.join('')); // Set final random RNA
                }
                setTimeout(() => setIsWinner(false), 1000);
              }, 500);
            }
          }
        }, 50);
      }, index * 200);
    });
  };

  const convertRnaToDna = () => {
    let finalSequence = dnaSequence
      .split('')
      .map(base => rnaToBasePairs[base])
      .join('');
    setRnaSequence(dnaSequence);
    setDnaSequence(finalSequence);
  };

  const handleConvert = () => {
    const isValid = validateSequence(
      inputSequence,
      conversionType === 'dnaToRna' ? 'dna' : 'rna'
    );
    
    if (!isValid) {
      setError(
        conversionType === 'dnaToRna' 
          ? 'Invalid DNA sequence. Please use only A, T, C, G.'
          : 'Invalid RNA sequence. Please use only A, U, C, G.'
      );
      return;
    }
    
    setError('');
    setShowAnimation(true);
    spinSequence();
  };

  return (
    <div className="dna-converter">
      <h2>🎰 DNA Slot Machine 🎰</h2>
      
      <div className="input-section">
        <div className="conversion-type">
          <button 
            className={conversionType === 'dnaToRna' ? 'active' : ''}
            onClick={() => {
              setConversionType('dnaToRna');
              setInputSequence('');
              setDnaSequence('');
              setRnaSequence('');
              setAminoAcids([]);
            }}
          >
            DNA → RNA
          </button>
          <button 
            className={conversionType === 'rnaToDna' ? 'active' : ''}
            onClick={() => {
              setConversionType('rnaToDna');
              setInputSequence('');
              setDnaSequence('');
              setRnaSequence('');
              setAminoAcids([]);
            }}
          >
            RNA → DNA
          </button>
        </div>
        
        <label>
          Enter {conversionType === 'dnaToRna' ? 'DNA' : 'RNA'} Sequence:
        </label>
        <input
          type="text"
          value={inputSequence}
          onChange={(e) => setInputSequence(e.target.value.toUpperCase())}
          placeholder={conversionType === 'dnaToRna' ? 'ATCG...' : 'AUCG...'}
        />
        <button onClick={handleConvert} disabled={spinning}>
          {spinning ? 'Converting...' : 'Convert'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className={`conversion-display ${showAnimation ? 'animate' : ''}`}>
        {conversionType === 'dnaToRna' ? (
          // DNA to RNA order
          <>
            <div className="dna-strand">
              <h3>DNA</h3>
              <div className={`sequence ${isWinner ? 'sequence-complete' : ''}`}>
                {(spinning ? animatingSequence : dnaSequence.split('')).map((base, index) => (
                  <span 
                    key={index} 
                    className={`base ${spinning ? 'spinning' : ''}`}
                    data-current={base}
                  >
                    {base}
                  </span>
                ))}
              </div>
            </div>

            {rnaSequence && (
              <div className="rna-strand">
                <h3>mRNA</h3>
                <div className="sequence">
                  {rnaSequence.split('').map((base, index) => (
                    <span key={index} className="base">{base}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // RNA to DNA order
          <>
            <div className="rna-strand">
              <h3>RNA</h3>
              <div className={`sequence ${isWinner ? 'sequence-complete' : ''}`}>
                {(spinning ? animatingSequence : rnaSequence.split('')).map((base, index) => (
                  <span 
                    key={index} 
                    className={`base ${spinning ? 'spinning' : ''}`}
                    data-current={base}
                  >
                    {base}
                  </span>
                ))}
              </div>
            </div>

            {dnaSequence && (
              <div className="dna-strand">
                <h3>DNA</h3>
                <div className="sequence">
                  {dnaSequence.split('').map((base, index) => (
                    <span key={index} className="base">{base}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {aminoAcids.length > 0 && conversionType === 'dnaToRna' && (
          <div className="protein-chain">
            <h3>Protein</h3>
            <div className="sequence">
              {aminoAcids.map((aa, index) => (
                <span key={index} className="amino-acid">{aa}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="info-panel">
        <h3>Base Pairing Rules</h3>
        <ul>
          <li>DNA A ↔ RNA U</li>
          <li>DNA T ↔ RNA A</li>
          <li>DNA G ↔ RNA C</li>
          <li>DNA C ↔ RNA G</li>
        </ul>
      </div>
    </div>
  );
}

export default DnaConverter;

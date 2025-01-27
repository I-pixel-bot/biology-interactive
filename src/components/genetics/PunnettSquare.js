import React, { useState, useEffect } from 'react';
import './PunnettSquare.css';

function PunnettSquare() {
  const [parent1, setParent1] = useState('Aa');
  const [parent2, setParent2] = useState('Aa');
  const [square, setSquare] = useState([]);
  const [probabilities, setProbabilities] = useState({});
  const [error, setError] = useState('');

  const validateGenotype = (genotype) => {
    // Allow both uppercase letters, or one upper and one lower
    const pattern = /^[A-Z][A-Za-z]$/;
    return pattern.test(genotype);
  };

  const generateGametes = (genotype) => {
    if (!validateGenotype(genotype)) {
      return [];
    }
    // Always return both alleles even if they're the same
    return [genotype[0], genotype[1]];
  };

  const calculateProbabilities = (square) => {
    const total = square.flat().length;
    const counts = {};
    
    square.flat().forEach(genotype => {
      counts[genotype] = (counts[genotype] || 0) + 1;
    });

    return Object.entries(counts).reduce((acc, [genotype, count]) => {
      acc[genotype] = ((count / total) * 100).toFixed(1) + '%';
      return acc;
    }, {});
  };

  const updatePunnettSquare = (p1, p2) => {
    if (validateGenotype(p1) && validateGenotype(p2)) {
      setError('');
      const gametes1 = generateGametes(p1);
      const gametes2 = generateGametes(p2);
      
      const newSquare = gametes1.map(g1 => 
        gametes2.map(g2 => {
          // Sort alleles so capital letters always come first
          const alleles = [g1, g2].sort((a, b) => {
            if (a.toUpperCase() === b.toUpperCase()) {
              return a === a.toUpperCase() ? -1 : 1;
            }
            return a.toUpperCase() < b.toUpperCase() ? -1 : 1;
          });
          return alleles.join('');
        })
      );

      setSquare(newSquare);
      setProbabilities(calculateProbabilities(newSquare));
    } else {
      setError('Invalid genotype. Please use format: Aa, Bb, etc.');
      setSquare([]);
      setProbabilities({});
    }
  };

  const handleParentChange = (value, setParent) => {
    setParent(value);
  };

  useEffect(() => {
    updatePunnettSquare(parent1, parent2);
  }, [parent1, parent2]);

  return (
    <div className="punnett-container">
      <h2>Punnett Square Calculator</h2>
      
      <div className="input-section">
        <div className="input-group">
          <label>Parent 1 Genotype:</label>
          <input 
            type="text" 
            value={parent1}
            onChange={(e) => handleParentChange(e.target.value, setParent1)}
            placeholder="Aa"
          />
        </div>
        <div className="input-group">
          <label>Parent 2 Genotype:</label>
          <input 
            type="text" 
            value={parent2}
            onChange={(e) => handleParentChange(e.target.value, setParent2)}
            placeholder="Aa"
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {square.length > 0 && (
        <>
          <div className="punnett-square">
            <div className="row header">
              <div className="cell empty"></div>
              {generateGametes(parent2).map((gamete, i) => (
                <div key={i} className="cell gamete">{gamete}</div>
              ))}
            </div>
            {square.map((row, i) => (
              <div key={i} className="row">
                <div className="cell gamete">{generateGametes(parent1)[i]}</div>
                {row.map((genotype, j) => (
                  <div key={j} className="cell">{genotype}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="probabilities">
            <h3>Genotype Probabilities</h3>
            {Object.entries(probabilities).map(([genotype, probability]) => (
              <div key={genotype} className="probability-item">
                {genotype}: {probability}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PunnettSquare;

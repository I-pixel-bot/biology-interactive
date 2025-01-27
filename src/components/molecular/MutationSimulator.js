import React, { useState, useEffect } from 'react';
import './MutationSimulator.css';

const mutationTypes = {
  substitution: {
    name: 'Substitution',
    description: 'Replace one base with another',
    effect: 'May change amino acid (missense) or create stop codon (nonsense)'
  },
  insertion: {
    name: 'Insertion',
    description: 'Add one or more bases',
    effect: 'Shifts reading frame, usually severe effects'
  },
  deletion: {
    name: 'Deletion',
    description: 'Remove one or more bases',
    effect: 'Shifts reading frame, usually severe effects'
  }
};

const codonTable = {
  'AUG': 'Met (Start)', 'UAA': 'Stop', 'UAG': 'Stop', 'UGA': 'Stop',
  'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
  // Add more codons as needed
};

function MutationSimulator() {
  const [dnaSequence, setDnaSequence] = useState('');
  const [mutationType, setMutationType] = useState('substitution');
  const [mutationPosition, setMutationPosition] = useState(0);
  const [newBase, setNewBase] = useState('A');
  const [result, setResult] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [highlightedBase, setHighlightedBase] = useState(null);

  const resetSimulator = () => {
    setDnaSequence('');
    setMutationType('substitution');
    setMutationPosition(0);
    setNewBase('A');
    setResult(null);
    setAnimating(false);
    setHighlightedBase(null);
  };

  const validateDNA = (sequence) => {
    return /^[ATCG]+$/.test(sequence);
  };

  const transcribeToRNA = (dna) => {
    return dna.replace(/T/g, 'U');
  };

  const translateToProtein = (rna) => {
    const codons = rna.match(/.{1,3}/g) || [];
    return codons.map(codon => codonTable[codon] || '?').join('-');
  };

  const applyMutation = () => {
    if (!validateDNA(dnaSequence)) {
      alert('Please enter a valid DNA sequence (A, T, C, G only)');
      return;
    }

    let mutatedDNA = dnaSequence;
    const position = parseInt(mutationPosition);

    switch (mutationType) {
      case 'substitution':
        mutatedDNA = 
          dnaSequence.slice(0, position) + 
          newBase + 
          dnaSequence.slice(position + 1);
        break;
      case 'insertion':
        mutatedDNA = 
          dnaSequence.slice(0, position) + 
          newBase + 
          dnaSequence.slice(position);
        break;
      case 'deletion':
        mutatedDNA = 
          dnaSequence.slice(0, position) + 
          dnaSequence.slice(position + 1);
        break;
      default:
        break;
    }

    const originalRNA = transcribeToRNA(dnaSequence);
    const mutatedRNA = transcribeToRNA(mutatedDNA);
    const originalProtein = translateToProtein(originalRNA);
    const mutatedProtein = translateToProtein(mutatedRNA);

    setResult({
      originalDNA: dnaSequence,
      mutatedDNA,
      originalRNA,
      mutatedRNA,
      originalProtein,
      mutatedProtein,
      isFrameshift: ['insertion', 'deletion'].includes(mutationType)
    });
  };

  const visualizeMutation = () => {
    setAnimating(true);
    setHighlightedBase(parseInt(mutationPosition));

    // Animated mutation application
    setTimeout(() => {
      applyMutation();
      setTimeout(() => {
        setAnimating(false);
      }, 1000);
    }, 1500);
  };

  const renderDNAStrand = (sequence, mutatedIndex = -1) => (
    <div className="dna-strand">
      {sequence.split('').map((base, index) => (
        <div
          key={index}
          className={`base 
            ${index === mutatedIndex ? 'mutated' : ''} 
            ${index === parseInt(mutationPosition) ? 'targeted' : ''} 
            ${index === highlightedBase ? 'highlighted' : ''}`
          }
          onMouseEnter={() => setHighlightedBase(index)}
          onMouseLeave={() => setHighlightedBase(null)}
          onClick={() => setMutationPosition(index)}
          title={`Click to target this base for mutation`}
        >
          {base}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mutation-simulator">
      <div className="simulator-header">
        <h2>DNA Mutation Simulator</h2>
        <p>Visualize the effects of different mutations on DNA sequences</p>
      </div>

      <div className="simulator-container">
        <div className="input-section">
          <input
            type="text"
            className="sequence-input"
            value={dnaSequence}
            onChange={(e) => setDnaSequence(e.target.value.toUpperCase())}
            placeholder="Enter DNA sequence (e.g., ATCG)"
          />

          <div className="mutation-controls">
            <div className="control-group">
              <label>Mutation Type</label>
              <select
                value={mutationType}
                onChange={(e) => setMutationType(e.target.value)}
              >
                {Object.entries(mutationTypes).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            {mutationType !== 'deletion' && (
              <div className="control-group">
                <label>New Base</label>
                <select
                  value={newBase}
                  onChange={(e) => setNewBase(e.target.value)}
                >
                  {['A', 'T', 'C', 'G'].map(base => (
                    <option key={base} value={base}>{base}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="visualization">
            {dnaSequence && renderDNAStrand(dnaSequence, parseInt(mutationPosition))}
          </div>

          <div className="button-group">
            <button 
              className="apply-button"
              onClick={visualizeMutation}
              disabled={animating || !dnaSequence}
            >
              {animating ? 'Mutating...' : 'Apply Mutation'}
            </button>
            <button 
              className="reset-button"
              onClick={resetSimulator}
              disabled={animating}
            >
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className="results">
            <h3>Mutation Results</h3>
            <div className="sequence-comparison">
              <div className="original">
                <h4>Original Sequence</h4>
                {renderDNAStrand(result.originalDNA)}
              </div>
              <div className="mutated">
                <h4>Mutated Sequence</h4>
                {renderDNAStrand(result.mutatedDNA)}
              </div>
            </div>

            <div className="mutation-info">
              <h4>Effect Analysis</h4>
              <p>{mutationTypes[mutationType].description}</p>
              <p>{mutationTypes[mutationType].effect}</p>
              {result.isFrameshift && (
                <div className="warning">
                  ⚠️ Frameshift Mutation Detected
                  <p>This mutation alters the reading frame of the genetic code.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MutationSimulator;

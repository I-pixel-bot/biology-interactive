import React, { useState, useEffect } from 'react';
import './MutationMitosis.css';

const mutationTypes = {
  nondisjunction: {
    name: 'Nondisjunction',
    description: 'Chromosomes fail to separate during cell division, leading to abnormal chromosome numbers.',
    examples: ['Down Syndrome (Trisomy 21)', 'Turner Syndrome (Monosomy X)'],
    effect: 'Results in cells with extra or missing chromosomes.'
  },
  deletion: {
    name: 'Deletion',
    description: 'Loss of a chromosome segment.',
    examples: ['Cri du Chat Syndrome', 'DiGeorge Syndrome'],
    effect: 'Missing genetic material can lead to developmental issues.'
  },
  duplication: {
    name: 'Duplication',
    description: 'Chromosome segment is repeated.',
    examples: ['Charcot-Marie-Tooth Disease Type 1A'],
    effect: 'Extra copies of genes can disrupt normal cell function.'
  },
  translocation: {
    name: 'Translocation',
    description: 'Chromosome segment attaches to a different chromosome.',
    examples: ['Chronic Myeloid Leukemia', 'Burkitt Lymphoma'],
    effect: 'Can activate cancer-causing genes or create fusion proteins.'
  }
};

function MutationMitosis() {
  const [selectedMutation, setSelectedMutation] = useState('nondisjunction');
  const [chromosomeCount, setChromosomeCount] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);
  const [daughterCells, setDaughterCells] = useState([]);
  const [showInfo, setShowInfo] = useState(true);

  const simulateMutation = () => {
    setIsSimulating(true);
    let cells = [];
    
    switch(selectedMutation) {
      case 'nondisjunction':
        cells = [
          { chromosomes: chromosomeCount + 1, normal: false },
          { chromosomes: chromosomeCount - 1, normal: false }
        ];
        break;
      case 'deletion':
        cells = [
          { chromosomes: chromosomeCount, deletedSegments: [true], normal: false },
          { chromosomes: chromosomeCount, normal: true }
        ];
        break;
      case 'duplication':
        cells = [
          { chromosomes: chromosomeCount, duplicatedSegments: [true], normal: false },
          { chromosomes: chromosomeCount, normal: true }
        ];
        break;
      case 'translocation':
        cells = [
          { chromosomes: chromosomeCount, translocated: true, normal: false },
          { chromosomes: chromosomeCount, normal: true }
        ];
        break;
      default:
        cells = [
          { chromosomes: chromosomeCount, normal: true },
          { chromosomes: chromosomeCount, normal: true }
        ];
    }
    
    setDaughterCells(cells);
  };

  return (
    <div className="mutation-simulator">
      <h2>Chromosome Mutation Simulator</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>Mutation Type:</label>
          <select 
            value={selectedMutation}
            onChange={(e) => setSelectedMutation(e.target.value)}
          >
            {Object.entries(mutationTypes).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>Starting Chromosome Count:</label>
          <input
            type="number"
            min="2"
            max="8"
            value={chromosomeCount}
            onChange={(e) => setChromosomeCount(parseInt(e.target.value))}
          />
        </div>
        
        <button onClick={simulateMutation} disabled={isSimulating}>
          Simulate Mutation
        </button>
      </div>

      <div className="mutation-info">
        <h3>{mutationTypes[selectedMutation].name}</h3>
        <p>{mutationTypes[selectedMutation].description}</p>
        <h4>Real-World Examples:</h4>
        <ul>
          {mutationTypes[selectedMutation].examples.map((example, index) => (
            <li key={index}>{example}</li>
          ))}
        </ul>
      </div>

      {isSimulating && (
        <div className="simulation-area">
          <div className="parent-cell">
            <h4>Parent Cell</h4>
            <div className="cell">
              {Array(chromosomeCount).fill().map((_, i) => (
                <div key={i} className="chromosome" />
              ))}
            </div>
          </div>
          
          <div className="daughter-cells">
            {daughterCells.map((cell, index) => (
              <div key={index} className="cell-container">
                <h4>Daughter Cell {index + 1}</h4>
                <div className={`cell ${cell.normal ? 'normal' : 'mutated'}`}>
                  {Array(cell.chromosomes).fill().map((_, i) => (
                    <div 
                      key={i} 
                      className={`chromosome 
                        ${cell.deletedSegments?.[i] ? 'deleted' : ''}
                        ${cell.duplicatedSegments?.[i] ? 'duplicated' : ''}
                        ${cell.translocated && i === 0 ? 'translocated' : ''}`}
                    />
                  ))}
                </div>
                <p>{cell.normal ? 'Normal' : 'Mutated'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MutationMitosis;

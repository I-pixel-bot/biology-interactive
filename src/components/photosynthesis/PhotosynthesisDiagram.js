import React, { useState } from 'react';
import './PhotosynthesisDiagram.css';

const chloroplastComponents = {
  thylakoid: {
    name: 'Thylakoid',
    description: 'Site of light-dependent reactions, contains chlorophyll',
    processes: ['Light absorption', 'Water splitting', 'NADPH production']
  },
  stroma: {
    name: 'Stroma',
    description: 'Site of Calvin cycle (dark reactions)',
    processes: ['CO₂ fixation', 'Glucose synthesis']
  },
  membrane: {
    name: 'Chloroplast Membrane',
    description: 'Controls substance movement in/out of chloroplast',
    processes: ['CO₂ entry', 'Glucose export']
  }
};

const environmentalFactors = {
  light: { name: 'Light Intensity', min: 0, max: 100, default: 50 },
  co2: { name: 'CO₂ Levels', min: 0, max: 100, default: 50 },
  temperature: { name: 'Temperature (°C)', min: 0, max: 50, default: 25 }
};

function PhotosynthesisDiagram() {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [environmentalValues, setEnvironmentalValues] = useState({
    light: 50,
    co2: 50,
    temperature: 25
  });
  const [glucoseProduction, setGlucoseProduction] = useState(0);

  const handleComponentClick = (component, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedComponent(chloroplastComponents[component]);
  };

  const handleEnvironmentalChange = (factor, value) => {
    setEnvironmentalValues(prev => ({
      ...prev,
      [factor]: Number(value)
    }));
    
    // Calculate glucose production based on environmental factors
    calculateGlucoseProduction({
      ...environmentalValues,
      [factor]: Number(value)
    });
  };

  const calculateGlucoseProduction = (values) => {
    // Simplified glucose production calculation
    const efficiency = Math.min(
      values.light / 100,
      values.co2 / 100,
      Math.max(0, (values.temperature - 5) / 35)
    );
    setGlucoseProduction(Math.round(efficiency * 100));
  };

  return (
    <div className="photosynthesis-diagram">
      <h2>Interactive Photosynthesis Diagram</h2>

      <div className="environmental-controls">
        {Object.entries(environmentalFactors).map(([factor, config]) => (
          <div key={factor} className="control-group">
            <label>{config.name}</label>
            <input
              type="range"
              min={config.min}
              max={config.max}
              value={environmentalValues[factor]}
              onChange={(e) => handleEnvironmentalChange(factor, e.target.value)}
            />
            <span>{environmentalValues[factor]}</span>
          </div>
        ))}
      </div>

      <div className="chloroplast-diagram">
        <div 
          className={`component membrane ${selectedComponent?.name === 'Chloroplast Membrane' ? 'active' : ''}`}
          onClick={(e) => handleComponentClick('membrane', e)}
          title="Click to learn about the membrane"
        />
        
        <div 
          className={`component stroma ${selectedComponent?.name === 'Stroma' ? 'active' : ''}`}
          onClick={(e) => handleComponentClick('stroma', e)}
          title="Click to learn about the stroma"
        >
          <div className="calvin-cycle" title="Calvin Cycle"/>
        </div>
        
        <div 
          className={`component thylakoid ${selectedComponent?.name === 'Thylakoid' ? 'active' : ''}`}
          onClick={(e) => handleComponentClick('thylakoid', e)}
          title="Click to learn about thylakoids"
        >
          <div className="grana" />
          <div className="grana" />
          <div className="grana" />
          <div className="grana" />
        </div>
      </div>

      {selectedComponent && (
        <div className="component-info">
          <h3>{selectedComponent.name}</h3>
          <p>{selectedComponent.description}</p>
          <h4>Key Processes:</h4>
          <ul>
            {selectedComponent.processes.map((process, index) => (
              <li key={index}>{process}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="glucose-production">
        <h3>Glucose Production Efficiency</h3>
        <div className="progress-bar">
          <div 
            className="progress"
            style={{ width: `${glucoseProduction}%` }}
          ></div>
        </div>
        <p>{glucoseProduction}% efficiency</p>
      </div>
    </div>
  );
}

export default PhotosynthesisDiagram;

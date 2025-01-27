import React, { useState, useEffect } from 'react';
import './CarbonTracker.css';

const carbonProcesses = {
  photosynthesis: {
    name: 'Photosynthesis',
    description: 'Plants convert CO₂ and water into glucose using sunlight',
    rate: 1,
    affected_by: ['deforestation', 'pollution']
  },
  respiration: {
    name: 'Cellular Respiration',
    description: 'Organisms break down glucose to produce energy, releasing CO₂',
    rate: 1,
    affected_by: ['temperature']
  },
  decomposition: {
    name: 'Decomposition',
    description: 'Breakdown of dead organisms, releasing CO₂',
    rate: 0.5,
    affected_by: ['temperature', 'pollution']
  },
  fossilFuels: {
    name: 'Fossil Fuel Burning',
    description: 'Human activity releasing stored carbon',
    rate: 2,
    affected_by: ['human_activity']
  }
};

const environmentalFactors = {
  deforestation: { name: 'Deforestation', impact: -0.5 },
  pollution: { name: 'Pollution', impact: -0.3 },
  temperature: { name: 'Temperature Rise', impact: 0.2 },
  human_activity: { name: 'Human Activity', impact: 0.5 }
};

function CarbonTracker() {
  const [carbonLevels, setCarbonLevels] = useState({
    atmosphere: 100,
    biosphere: 100,
    ocean: 100,
    soil: 100
  });

  const [activeFactors, setActiveFactors] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [warnings, setWarnings] = useState([]);
  const [processEffects, setProcessEffects] = useState({});
  const [selectedReservoir, setSelectedReservoir] = useState(null);
  const [carbonParticles, setCarbonParticles] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);

  const calculateProcessRate = (process) => {
    let rate = carbonProcesses[process].rate;
    carbonProcesses[process].affected_by.forEach(factor => {
      if (activeFactors.includes(factor)) {
        rate += environmentalFactors[factor].impact;
      }
    });
    return Math.max(0, rate);
  };

  const checkEnvironmentalImpact = (levels) => {
    const newWarnings = [];
    if (levels.atmosphere > 150) {
      newWarnings.push('High atmospheric CO₂ levels detected!');
    }
    if (levels.biosphere < 50) {
      newWarnings.push('Critical biosphere carbon levels!');
    }
    setWarnings(newWarnings);
  };

  const updateCarbonLevels = () => {
    setCarbonLevels(prev => {
      const newLevels = calculateNewLevels(prev);
      checkEnvironmentalImpact(newLevels);
      return newLevels;
    });
  };

  const calculateNewLevels = (prev) => {
    const rates = Object.keys(carbonProcesses).reduce((acc, process) => {
      acc[process] = calculateProcessRate(process);
      return acc;
    }, {});

    setProcessEffects(rates);

    return {
      atmosphere: Math.max(0, prev.atmosphere - rates.photosynthesis + rates.respiration + rates.decomposition + rates.fossilFuels),
      biosphere: Math.max(0, prev.biosphere + rates.photosynthesis - rates.respiration),
      ocean: Math.max(0, prev.ocean + (prev.atmosphere > 120 ? 0.5 : -0.5)),
      soil: Math.max(0, prev.soil + rates.decomposition - rates.fossilFuels)
    };
  };

  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(updateCarbonLevels, simulationSpeed);
    }
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, activeFactors]);

  const toggleFactor = (factor) => {
    setActiveFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const addCarbonParticle = (from, to) => {
    const id = Date.now();
    setCarbonParticles(prev => [...prev, { id, from, to }]);
    setTimeout(() => {
      setCarbonParticles(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  const handleReservoirClick = (reservoir) => {
    setSelectedReservoir(reservoir);
    // Add visual feedback
    addCarbonParticle('atmosphere', reservoir);
  };

  const renderCarbonParticles = () => (
    <div className="carbon-particles">
      {carbonParticles.map(particle => (
        <div 
          key={particle.id}
          className={`carbon-particle ${particle.from}-to-${particle.to}`}
        >
          CO₂
        </div>
      ))}
    </div>
  );

  return (
    <div className="carbon-tracker">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h3>Welcome to Carbon Cycle Simulator!</h3>
            <ul>
              <li>Click reservoirs to see carbon flow</li>
              <li>Toggle environmental factors to see their impact</li>
              <li>Watch carbon particles move through the system</li>
            </ul>
            <button onClick={() => setShowTutorial(false)}>Start Simulating!</button>
          </div>
        </div>
      )}

      <div className="header">
        <h2>Carbon Cycle Simulator</h2>
        <p>Monitor and control carbon flow through Earth's systems</p>
      </div>

      <div className="controls">
        <button 
          className={`control-button ${isSimulating ? 'active' : ''}`}
          onClick={() => setIsSimulating(!isSimulating)}
        >
          {isSimulating ? '⏸ Pause' : '▶ Start'} Simulation
        </button>
        <select 
          className="speed-select"
          value={simulationSpeed} 
          onChange={(e) => setSimulationSpeed(Number(e.target.value))}
        >
          <option value={2000}>🐢 Slow</option>
          <option value={1000}>🚶 Normal</option>
          <option value={500}>🏃 Fast</option>
        </select>
      </div>

      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning, index) => (
            <div key={index} className="warning">⚠️ {warning}</div>
          ))}
        </div>
      )}

      <div className="carbon-cycle-diagram">
        {renderCarbonParticles()}
        {Object.entries(carbonLevels).map(([reservoir, level]) => (
          <div 
            key={reservoir} 
            className={`carbon-reservoir ${reservoir} ${selectedReservoir === reservoir ? 'selected' : ''}`}
            onClick={() => handleReservoirClick(reservoir)}
          >
            <div className="reservoir-content">
              <h3>{reservoir.charAt(0).toUpperCase() + reservoir.slice(1)}</h3>
              <div className="carbon-level">
                {Math.round(level)}
                <span className="unit">CO₂ units</span>
              </div>
              <div className="level-indicator">
                <div 
                  className="level-fill"
                  style={{ height: `${Math.min(100, level)}%` }}
                />
              </div>
            </div>
            <div className="reservoir-info">
              <p>Click to interact</p>
            </div>
          </div>
        ))}
      </div>

      <div className="environmental-factors">
        {Object.entries(environmentalFactors).map(([key, factor]) => (
          <button
            key={key}
            className={`factor-button ${activeFactors.includes(key) ? 'active' : ''}`}
            onClick={() => toggleFactor(key)}
          >
            <div className="factor-icon">{getFactorIcon(key)}</div>
            <div className="factor-content">
              <span className="factor-name">{factor.name}</span>
              <span className="factor-impact">
                Impact: {factor.impact > 0 ? '+' : ''}{factor.impact}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="process-info">
        {Object.entries(carbonProcesses).map(([key, process]) => (
          <div key={key} className="process">
            <h4>{process.name}</h4>
            <p>{process.description}</p>
            <div className="rate-indicator">
              <div 
                className="rate-fill"
                style={{ width: `${(processEffects[key] || process.rate) * 50}%` }}
              />
            </div>
            <div className="rate-value">
              Rate: {(processEffects[key] || process.rate).toFixed(2)}x
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get icons for factors
function getFactorIcon(factor) {
  const icons = {
    deforestation: '🌲',
    pollution: '🏭',
    temperature: '🌡️',
    human_activity: '👥'
  };
  return icons[factor] || '❓';
}

export default CarbonTracker;

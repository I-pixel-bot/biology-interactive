import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BiologyLanding from './components/landing/BiologyLanding';
import PunnettSquare from './components/genetics/PunnettSquare';
import GeneticPredictor from './components/genetics/GeneticPredictor';
import PedigreeSimulator from './components/genetics/PedigreeSimulator';
import DnaConverter from './components/molecular/DnaConverter';
import GeneticCodeGame from './components/molecular/GeneticCodeGame';
import MutationSimulator from './components/molecular/MutationSimulator';
import PhotosynthesisDiagram from './components/photosynthesis/PhotosynthesisDiagram';
import CarbonTracker from './components/photosynthesis/CarbonTracker';
import ChromosomeGame from './components/cell-division/ChromosomeGame';
import SpeciesScanner from './components/landing/SpeciesScanner';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<BiologyLanding />} />
          
          <Route path="/genetics/punnett" element={<PunnettSquare />} />
          <Route path="/genetics/predictor" element={<GeneticPredictor />} />
          <Route path="/genetics/pedigree" element={<PedigreeSimulator />} />
          
          <Route path="/molecular/dna-converter" element={<DnaConverter />} />
          <Route path="/molecular/code-game" element={<GeneticCodeGame />} />
          <Route path="/molecular/mutation" element={<MutationSimulator />} />
          
          <Route path="/photosynthesis/diagram" element={<PhotosynthesisDiagram />} />
          <Route path="/photosynthesis/carbon" element={<CarbonTracker />} />
          
          <Route path="/cell-division/chromosome-game" element={<ChromosomeGame />} />
          
          <Route path="/evolution/scanner" element={<SpeciesScanner />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

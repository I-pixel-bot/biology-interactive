import React from 'react';
import { Link } from 'react-router-dom';
import './BiologyLanding.css';

const tools = {
  genetics: [
    {
      title: 'Punnett Square Generator',
      description: 'Calculate genetic inheritance patterns with an interactive Punnett square.',
      path: '/genetics/punnett',
      icon: '🧬'
    },
    {
      title: 'Genetic Predictor Game',
      description: 'Test your knowledge of Mendelian inheritance patterns.',
      path: '/genetics/predictor',
      icon: '🎲'
    },
    {
      title: 'Pedigree Simulator',
      description: 'Build and analyze family trees for trait inheritance.',
      path: '/genetics/pedigree',
      icon: '👪'
    }
  ],
  molecular: [
    {
      title: 'DNA to RNA Converter',
      description: 'Transcribe DNA sequences into RNA and translate to proteins.',
      path: '/molecular/dna-converter',
      icon: '🧪'
    },
    {
      title: 'Genetic Code Game',
      description: 'Match codons to amino acids in this educational game.',
      path: '/molecular/code-game',
      icon: '🎮'
    },
    {
      title: 'Mutation Simulator',
      description: 'Explore different types of genetic mutations.',
      path: '/molecular/mutation',
      icon: '🔬'
    }
  ],
  photosynthesis: [
    {
      title: 'Interactive Diagram',
      description: 'Explore the process of photosynthesis step by step.',
      path: '/photosynthesis/diagram',
      icon: '🌿'
    },
    {
      title: 'Carbon Cycle Tracker',
      description: 'Visualize carbon flow through biological systems.',
      path: '/photosynthesis/carbon',
      icon: '♻️'
    }
  ],
  cellDivision: [
    {
      title: 'Chromosome Game',
      description: 'Sort chromosomes and identify cell division stages.',
      path: '/cell-division/chromosome-game',
      icon: '🎯'
    }
  ],
  evolution: [
    {
      title: 'Species Scanner',
      description: 'Scan any organism to discover its evolutionary history using AI.',
      path: '/evolution/scanner', // This path must match App.js route exactly
      icon: '🔍'
    }
  ]
};

const BiologyLanding = () => {
  return (
    <div className="biology-landing">
      <nav className="main-nav">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">🧬</span>
            <span className="logo-text">BioInteractive</span>
          </div>
          <a href="https://your-institution.edu" className="institution-link">
            Educational Platform
          </a>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <h1>Interactive Biology Learning</h1>
          <p className="hero-description">
            Discover the fascinating world of biology through hands-on simulations, 
            interactive tools, and engaging learning experiences designed by educators.
          </p>
        </div>
      </div>

      <main className="tools-section">
        {Object.entries(tools).map(([category, items]) => (
          <section key={category} className="tool-category">
            <h2 className="category-title">
              <span className="category-icon">
                {category === 'genetics' ? '🧬' :
                 category === 'molecular' ? '🔬' :
                 category === 'photosynthesis' ? '🌿' :
                 category === 'cellDivision' ? '🔄' : '🔍'}
              </span>
              {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
            </h2>
            <div className="tools-grid">
              {items.map((tool, index) => (
                <Link to={tool.path} key={index} className="tool-card">
                  <div className="tool-icon">{tool.icon}</div>
                  <div className="tool-content">
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <span className="tool-link">Try it now →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About BioInteractive</h4>
            <p>Educational tools developed by biology educators to enhance learning through interactive experiences.</p>
          </div>
          <div className="footer-section">
            <h4>Supported By</h4>
            <p>Leading universities and educational institutions</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>support@biointeractive-edu.org</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BioInteractive. Educational Use Only.</p>
        </div>
      </footer>
    </div>
  );
};

export default BiologyLanding;

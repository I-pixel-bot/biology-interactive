import React, { useState, useEffect } from 'react';
import './CellCycleSimulator.css';

const cellCycleStages = {
  mitosis: [
    {
      name: 'Interphase',
      description: 'The cell grows (G₁), duplicates DNA (S), and prepares for division (G₂). The chromatin (DNA + proteins) is relaxed.',
      duration: 8000,
      phase: 'preparation'
    },
    {
      name: 'Prophase',
      description: 'Chromatin condenses into distinct chromosomes (each with two sister chromatids). Nuclear envelope starts to break down. Centrosomes move to opposite poles. Mitotic spindle begins to form.',
      duration: 5000,
      phase: 'early'
    },
    {
      name: 'Metaphase',
      description: 'Chromosomes line up on the metaphase plate. Each sister chromatid attaches to a spindle fiber from opposite poles.',
      duration: 4000,
      phase: 'middle'
    },
    {
      name: 'Anaphase',
      description: 'Centromeres split and sister chromatids separate. Newly separated chromosomes are pulled to opposite poles as microtubules shorten.',
      duration: 3000,
      phase: 'late'
    },
    {
      name: 'Telophase',
      description: 'Chromosomes arrive at poles and decondense into chromatin. Nuclear envelopes reform around each set. Spindle apparatus disassembles.',
      duration: 4000,
      phase: 'completion'
    },
    {
      name: 'Cytokinesis',
      description: 'Cytoplasm divides. Cleavage furrow forms and pinches the cell in two, creating two identical daughter cells.',
      duration: 5000,
      phase: 'division'
    }
  ],
  meiosis: [
    {
      name: 'Prophase I',
      description: 'Homologous chromosomes pair up (synapsis) forming tetrads. Crossing over occurs between non-sister chromatids, increasing genetic diversity.',
      duration: 6000,
      phase: 'meiosis1'
    },
    {
      name: 'Metaphase I',
      description: 'Tetrads (paired homologous chromosomes) align at the metaphase plate. Each homolog attaches to spindle fibers from opposite poles.',
      duration: 5000,
      phase: 'meiosis1'
    },
    {
      name: 'Anaphase I',
      description: 'Homologous chromosomes separate and move to opposite poles. Sister chromatids remain together. This reduces chromosome number by half.',
      duration: 4000,
      phase: 'meiosis1'
    },
    {
      name: 'Telophase I',
      description: 'Each half has a haploid set of chromosomes (still as sister chromatids). Nuclear envelopes may reform briefly.',
      duration: 4000,
      phase: 'meiosis1'
    },
    {
      name: 'Prophase II',
      description: 'Nuclear envelopes break down again. Spindle apparatus reforms. Chromosomes (as sister chromatids) move toward spindle.',
      duration: 4000,
      phase: 'meiosis2'
    },
    {
      name: 'Metaphase II',
      description: 'Chromosomes align at metaphase plates. Each sister chromatid attaches to microtubules from opposite poles.',
      duration: 4000,
      phase: 'meiosis2'
    },
    {
      name: 'Anaphase II',
      description: 'Sister chromatids separate and move to opposite poles, becoming independent chromosomes.',
      duration: 3000,
      phase: 'meiosis2'
    },
    {
      name: 'Telophase II',
      description: 'Four haploid nuclei form. Cytokinesis creates four genetically distinct daughter cells (gametes).',
      duration: 4000,
      phase: 'meiosis2'
    }
  ]
};

const cellStates = {
  mitosis: {
    'Interphase': {
      dna: {
        visible: true,
        phase: 'S',
        state: 'relaxed',
        replicating: true,
        strands: [
          { id: 'original', type: 'parent', position: { x: 45, y: 45 } },
          { id: 'replicating', type: 'daughter', position: { x: 55, y: 45 }, opacity: 0 }
        ],
        progress: 0
      },
      nucleus: {
        visible: true,
        opacity: 1,
        style: 'solid'
      },
      chromatin: {
        visible: true,
        state: 'relaxed',
        pattern: 'dispersed',
        intensity: 0.8
      }
    },
    'Prophase': {
      dna: {
        visible: true,
        state: 'condensing',
        chromosomes: [
          {
            id: 'chromosome1',
            type: 'condensing',
            position: { x: 45, y: 45 },
            hasSisterChromatids: true,
            chromatids: [
              { id: 'chromatid1a', position: 'top' },
              { id: 'chromatid1b', position: 'bottom' }
            ],
            color: '#ff79c6',
            width: 60,
            height: 30,
            condensationState: 0
          }
        ],
        initialState: {
          radius: 35,
          opacity: 0.8,
          blur: 3
        }
      },
      nucleus: {
        visible: true,
        opacity: 0.6,
        style: 'dashed',
        breaking: true
      },
      centrosomes: [
        { position: { x: 20, y: 50 }, visible: true, migrating: true },
        { position: { x: 80, y: 50 }, visible: true, migrating: true }
      ],
      spindle: {
        visible: true,
        formation: 'initial',
        opacity: 0.3
      }
    },
    'Metaphase': {
      nucleus: { visible: false },
      centrosomes: [
        { position: { x: 10, y: 50 }, visible: true },
        { position: { x: 90, y: 50 }, visible: true }
      ],
      spindle: { 
        visible: true, 
        formation: 'complete',
        opacity: 1,
        attachedToKinetochores: true
      },
      chromosomes: [
        {
          id: 'chromosome1', // Same ID to maintain continuity
          type: 'aligned',
          position: { x: 50, y: 50 },
          hasSisterChromatids: true,
          chromatids: [
            { id: 'chromatid1a', position: 'top' },
            { id: 'chromatid1b', position: 'bottom' }
          ],
          color: '#ff79c6',
          width: 60,
          height: 30
        }
      ],
      metaphasePlate: { visible: true, position: { x: 50, y: 50 } }
    },
    'Anaphase': {
      nucleus: { visible: false },
      spindle: {
        visible: true,
        formation: 'pulling',
        opacity: 1,
        shortening: true
      },
      microtubules: {
        visible: true,
        pulling: true,
        connections: [
          { start: { x: 10, y: 50 }, end: { x: 35, y: 50 } },
          { start: { x: 90, y: 50 }, end: { x: 65, y: 50 } }
        ]
      },
      chromosomes: [
        { 
          id: '1a', 
          type: 'separating', 
          position: { x: 35, y: 50 },
          targetPosition: { x: 20, y: 50 },
          hasSister: false, 
          color: '#ff79c6'
        },
        { 
          id: '1b', 
          type: 'separating', 
          position: { x: 65, y: 50 },
          targetPosition: { x: 80, y: 50 },
          hasSister: false, 
          color: '#ff79c6'
        }
      ]
    },
    'Telophase': {
      nucleus: {
        visible: true,
        forming: true,
        count: 2,
        positions: [
          { x: 25, y: 50 },
          { x: 75, y: 50 }
        ],
        opacity: 0.8,
        style: 'solid'
      },
      chromosomes: [
        { 
          id: '1a', 
          type: 'decondensing', 
          position: { x: 25, y: 50 },
          color: '#ff79c6',
          opacity: 0.7,
          condensationState: 1
        }
      ],
      chromatin: {
        visible: true,
        state: 'relaxing',
        pattern: 'dispersing',
        intensity: 0.6
      },
      spindle: {
        visible: true,
        disassembling: true,
        opacity: 0.2
      }
    },
    'Cytokinesis': {
      nucleus: { visible: true, opacity: 1, style: 'solid', count: 2 },
      cleavageFurrow: { 
        active: true, 
        progress: 0,
        animation: 'pinching',
        depth: 0
      },
      cellMembrane: {
        dividing: true,
        progress: 0
      },
      cytoplasm: {
        dividing: true,
        separation: 0
      },
      chromosomes: [],
      chromatin: { visible: true, opacity: 0.8 }
    }
  },
  meiosis: {
    'Prophase I': {
      chromosomes: [
        {
          id: '1',
          type: 'tetrad',
          homologousPair: true,
          crossingOver: true,
          position: { x: 45, y: 45 },
          synapsis: true,
          chiasmata: [
            { position: 0.3 },
            { position: 0.7 }
          ]
        }
      ],
      nucleus: { visible: true, opacity: 0.8, style: 'dashed' },
      chromatin: { visible: false },
      centrosomes: [
        { position: { x: 20, y: 50 }, visible: true },
        { position: { x: 80, y: 50 }, visible: true }
      ],
      spindle: { visible: true, formation: 'forming', opacity: 0.3 },
      tetrad: { visible: true },
      crossingOver: { active: true }
    },
    'Metaphase I': {
      nucleus: { visible: false },
      centrosomes: [
        { position: { x: 5, y: 50 }, visible: true },
        { position: { x: 95, y: 50 }, visible: true }
      ],
      spindle: { visible: true, formation: 'complete', opacity: 1 },
      chromosomes: [
        { 
          id: '1', type: 'tetrad', position: { x: 50, y: 50 }, 
          hasSister: true, homologousPair: true, color: '#ff79c6' 
        }
      ]
    },
    'Anaphase I': {
      nucleus: { visible: false },
      spindle: { visible: true, formation: 'pulling', opacity: 1 },
      centrosomes: [
        { position: { x: 5, y: 50 }, visible: true },
        { position: { x: 95, y: 50 }, visible: true }
      ],
      chromosomes: [
        { 
          id: '1a', type: 'separated', position: { x: 25, y: 50 }, 
          hasSister: true, moving: 'left', color: '#ff79c6' 
        },
        { 
          id: '1b', type: 'separated', position: { x: 75, y: 50 }, 
          hasSister: true, moving: 'right', color: '#ff79c6' 
        }
      ]
    },
    'Telophase I': {
      nucleus: { visible: true, opacity: 0.8, style: 'forming', count: 2 },
      spindle: { visible: false },
      chromosomes: [
        { 
          id: '1a', type: 'condensed', position: { x: 25, y: 50 }, 
          hasSister: true, color: '#ff79c6'
        },
        { 
          id: '1b', type: 'condensed', position: { x: 75, y: 50 }, 
          hasSister: true, color: '#ff79c6'
        }
      ]
    },
    'Prophase II': {
      nucleus: { visible: true, opacity: 0.8, style: 'dashed' },
      chromatin: { visible: false },
      centrosomes: [
        { position: { x: 20, y: 50 }, visible: true },
        { position: { x: 80, y: 50 }, visible: true }
      ],
      spindle: { visible: true, formation: 'forming', opacity: 0.3 },
      chromosomes: [
        { 
          id: '1a', type: 'condensed', position: { x: 45, y: 40 }, 
          hasSister: true, color: '#ff79c6'
        },
        { 
          id: '1b', type: 'condensed', position: { x: 45, y: 45 }, 
          hasSister: true, color: '#ff79c6'
        }
      ]
    },
    'Metaphase II': {
      nucleus: { visible: false },
      centrosomes: [
        { position: { x: 5, y: 50 }, visible: true },
        { position: { x: 95, y: 50 }, visible: true }
      ],
      spindle: { visible: true, formation: 'complete', opacity: 1 },
      chromosomes: [
        { 
          id: '1a', type: 'aligned', position: { x: 50, y: 50 }, 
          hasSister: true, color: '#ff79c6'
        },
        { 
          id: '1b', type: 'aligned', position: { x: 50, y: 55 }, 
          hasSister: true, color: '#ff79c6'
        }
      ]
    },
    'Anaphase II': {
      nucleus: { visible: false },
      spindle: { visible: true, formation: 'pulling', opacity: 1 },
      centrosomes: [
        { position: { x: 5, y: 50 }, visible: true },
        { position: { x: 95, y: 50 }, visible: true }
      ],
      chromosomes: [
        { 
          id: '1a', type: 'separated', position: { x: 25, y: 50 }, 
          hasSister: false, moving: 'left', color: '#ff79c6' 
        },
        { 
          id: '1b', type: 'separated', position: { x: 75, y: 50 }, 
          hasSister: false, moving: 'right', color: '#ff79c6' 
        }
      ]
    },
    'Telophase II': {
      nucleus: { visible: true, opacity: 0.8, style: 'forming', count: 4 },
      spindle: { visible: false },
      chromosomes: [
        { 
          id: '1a', type: 'decondensing', position: { x: 25, y: 50 }, 
          hasSister: false, color: '#ff79c6'
        },
        { 
          id: '1b', type: 'decondensing', position: { x: 75, y: 50 }, 
          hasSister: false, color: '#ff79c6'
        }
      ]
    }
  }
};

function CellCycleSimulator() {
  const [divisionType, setDivisionType] = useState('mitosis');
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stageTime, setStageTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const resetSimulation = () => {
    setCurrentStage(0);
    setIsPlaying(false);
    setShowQuiz(false);
    setScore(0);
    setProgress(0);
    setStageTime(0);
    setIsPaused(false);
  };

  const getCurrentStageInfo = () => {
    if (!cellCycleStages[divisionType] || currentStage < 0) return null;
    return cellCycleStages[divisionType][currentStage] || null;
  };

  const getCurrentStageState = () => {
    const stageInfo = getCurrentStageInfo();
    if (!stageInfo) return null;
    return cellStates[divisionType]?.[stageInfo.name] || null;
  };

  useEffect(() => {
    let timer;
    if (isPlaying && !isPaused) {
      const stageInfo = getCurrentStageInfo();
      if (!stageInfo?.duration) return; // Check for valid duration

      const interval = 50;
      timer = setInterval(() => {
        setStageTime(prev => {
          const newTime = prev + interval;
          const progress = (newTime / stageInfo.duration) * 100;
          setProgress(progress);
          
          // Update DNA replication progress during Interphase
          if (stageInfo.name === 'Interphase') {
            const state = getCurrentStageState(); // Use the new function here
            if (state?.dna?.replicating) {
              state.dna.progress = progress / 100;
            }
          }
          
          if (newTime >= stageInfo.duration) {
            const nextStage = currentStage + 1;
            if (nextStage < cellCycleStages[divisionType].length) {
              setCurrentStage(nextStage);
              return 0;
            } else {
              setIsPlaying(false);
              setShowQuiz(true);
              return 0;
            }
          }
          return newTime;
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, currentStage, divisionType]);

  const startSimulation = () => {
    setCurrentStage(0);
    setIsPlaying(true);
    setShowQuiz(false);
    setProgress(0);
  };

  const pauseSimulation = () => {
    setIsPlaying(!isPlaying);
  };

  // Add phase-specific animations
  const renderDNAReplication = (dna, phase) => {
    if (phase === 'S' && dna.replicating) {
      return (
        <div className="dna-replication">
          <div className="dna-helicase" />
          <div className="dna-polymerase" />
          {/* Add replication fork visualization */}
        </div>
      );
    }
    return null;
  };

  const renderChromosome = (chr) => {
    const className = `chromosome ${chr.type} ${chr.crossingOver ? 'crossing-over' : ''} ${chr.homologousPair ? 'homologous' : ''}`;
    return (
      <div
        key={chr.id}
        className={className}
        style={{
          left: `${chr.position.x}%`,
          top: `${chr.position.y}%`,
          transform: `rotate(${chr.rotation || 0}deg)`,
          backgroundColor: chr.color,
          '--separation-distance': chr.moving === 'left' ? '-300px' : '300px'
        }}
      >
        {chr.hasSisterChromatids && (
          <>
            <div className="chromatid top" />
            <div className="centromere" />
            <div className="chromatid bottom" />
          </>
        )}
      </div>
    );
  };

  const renderSpindle = (spindle, centrosomes) => (
    <>
      {centrosomes?.map((c, i) => (
        <div
          key={i}
          className={`centrosome ${spindle.fullyAttached ? 'fully-attached' : ''}`}
          style={{
            left: `${c.position.x}%`,
            top: `${c.position.y}%`
          }}
        />
      ))}
      {spindle.visible && (
        <div 
          className={`spindle-apparatus ${spindle.formation} ${spindle.fullyAttached ? 'fully-attached' : ''}`}
          style={{ opacity: spindle.opacity }}
        />
      )}
    </>
  );

  const renderCrossingOver = (chromosome) => {
    if (!chromosome.crossingOver) return null;
    
    return (
      <div className="crossing-over-marker">
        <div className="exchange-point" />
        <div className="genetic-material-exchange" />
      </div>
    );
  };

  const renderCleavageFurrow = (furrow) => {
    if (!furrow?.active) return null;
    
    return (
      <div 
        className="cleavage-furrow"
        style={{
          '--furrow-depth': `${furrow.depth}%`,
          '--furrow-progress': furrow.progress
        }}
      />
    );
  };

  const renderDNA = (dna) => {
    if (!dna?.visible) return null;
    
    return (
      <div className={`dna-strands ${dna.replicating ? 'replicating' : ''}`}
        style={{ '--replication-progress': dna.progress }}>
        <div className="dna-strand original" />
        {dna.replicating && <div className="dna-strand new" />}
      </div>
    );
  };

  const renderNucleus = (nucleus) => {
    if (!nucleus?.visible) return null;

    if (nucleus.count === 2 && nucleus.position) {
      return (
        <>
          <div className="nucleus forming"
            style={{
              left: `${nucleus.position.left?.x ?? 20}%`,
              top: `${nucleus.position.left?.y ?? 50}%`,
              opacity: nucleus.opacity,
              borderStyle: nucleus.style
            }}
          />
          <div className="nucleus forming"
            style={{
              left: `${nucleus.position.right?.x ?? 80}%`,
              top: `${nucleus.position.right?.y ?? 50}%`,
              opacity: nucleus.opacity,
              borderStyle: nucleus.style
            }}
          />
        </>
      );
    }

    // Default single nucleus rendering
    return (
      <div className="nucleus"
        style={{
          left: '15%',
          top: '15%',
          width: '70%',
          height: '70%',
          opacity: nucleus.opacity,
          borderStyle: nucleus.style
        }}
      />
    );
  };

  const renderDNAStrands = (dna) => {
    if (!dna?.visible) return null;
    
    return (
      <div className="dna-container">
        {dna.strands.map(strand => (
          <div
            key={strand.id}
            className={`dna-strand ${strand.type} ${dna.replicating ? 'replicating' : ''}`}
            style={{
              left: `${strand.position.x}%`,
              top: `${strand.position.y}%`,
              '--replication-progress': dna.progress
            }}
          />
        ))}
      </div>
    );
  };

  const renderMicrotubules = (microtubules, centrioles) => {
    if (!microtubules?.visible) return null;

    return (
      <div className="microtubule-network">
        {centrioles?.pairs.map((pair, index) => (
          <div key={index} className="microtubule-aster"
            style={{
              left: `${pair.x}%`,
              top: `${pair.y}%`,
              transform: `rotate(${pair.angle}deg)`,
              opacity: microtubules.opacity || 1
            }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`microtubule ${microtubules.organizing ? 'growing' : ''} 
                           ${microtubules.disassembling ? 'shrinking' : ''}`}
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderCentrioles = (centrioles) => {
    if (!centrioles?.visible) return null;

    return (
      <>
        {centrioles.pairs.map((pair, index) => (
          <div key={index} 
            className={`centriole-pair ${centrioles.duplicating ? 'duplicating' : ''} 
                       ${centrioles.separating ? 'separating' : ''} 
                       ${pair.fading ? 'fading' : ''}`}
            style={{
              left: `${pair.x}%`,
              top: `${pair.y}%`,
              transform: `rotate(${pair.angle}deg)`
            }}>
            <div className="centriole perpendicular" />
            <div className="centriole parallel" />
          </div>
        ))}
      </>
    );
  };

  const renderCell = () => {
    const stageInfo = getCurrentStageInfo();
    const stageState = getCurrentStageState();
    
    if (!stageInfo || !stageState) return null;
  
    return (
      <div className="cell-visual">
        {/* DNA/Chromatin visualization */}
        <div className="dna-content">
          {stageInfo.name === 'Prophase' && (
            renderChromatin(stageState.dna, progress / 100)
          )}
          
          {stageInfo.name === 'Metaphase' && (
            <div className="chromosome-container">
              {stageState.chromosomes.map(chr => (
                <div
                  key={chr.id}
                  className="chromosome aligned"
                  style={{
                    width: chr.width,
                    height: chr.height,
                    backgroundColor: chr.color,
                    left: `${chr.position.x}%`,
                    top: `${chr.position.y}%`
                  }}
                >
                  <div className="sister-chromatid top" />
                  <div className="centromere" />
                  <div className="sister-chromatid bottom" />
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* Nuclear envelope is separate from DNA */}
        {stageState.nucleus?.visible && (
          <div 
            className={`nuclear-envelope ${
              stageInfo.name === 'Prophase' ? 'dissolving' : 
              stageInfo.name === 'Telophase' ? 'reforming' : ''
            }`}
            style={{
              opacity: stageState.nucleus.opacity,
              borderStyle: stageState.nucleus.style
            }}
          />
        )}
  
        {/* Other cell components */}
        {stageState.spindle?.visible && renderSpindle(stageState.spindle, stageState.centrosomes)}
        {stageState.cleavageFurrow?.active && renderCleavageFurrow(stageState.cleavageFurrow)}
      </div>
    );
  };

  // Add function to handle chromosome separation in Anaphase
  const updateChromosomePositions = (state) => {
    if (state?.chromosomes) {
      const updatedChromosomes = state.chromosomes.map(chr => ({
        ...chr,
        position: {
          x: chr.moving === 'left' ? 
            Math.max(chr.position.x - 1, 10) : 
            Math.min(chr.position.x + 1, 90),
          y: chr.position.y
        }
      }));
      state.chromosomes = updatedChromosomes;
    }
  };

  // Add DNA phase-specific rendering
  const renderDNAState = (dna, phase) => {
    switch(phase) {
      case 'Interphase':
        return (
          <div className="dna-container">
            <div className="chromatin-network relaxed" />
            {dna.replicating && (
              <div className="replication-bubble">
                <div className="helicase" />
                <div className="dna-polymerase" />
              </div>
            )}
          </div>
        );
      case 'Prophase':
        return (
          <div className="dna-container">
            <div className="chromatin-network condensing">
              {dna.chromosomes.map(chr => (
                <div className="forming-chromosome" 
                     key={chr.id}
                     style={{
                       '--condensation-state': chr.condensationProgress
                     }} />
              ))}
            </div>
          </div>
        );
      // Add other phases...
    }
  };

  const renderChromatin = (dna, progress) => {
    if (dna.state === 'condensing') {
      return (
        <div className="chromatin-condensation">
          <div 
            className="chromatin-mass"
            style={{
              '--condense-progress': progress,
              width: `${dna.initialState.radius * (1 - progress)}%`,
              height: `${dna.initialState.radius * (1 - progress)}%`,
              opacity: dna.initialState.opacity,
              filter: `blur(${dna.initialState.blur * (1 - progress)}px)`
            }}
          />
          {dna.chromosomes.map(chr => (
            <div
              key={chr.id}
              className="condensing-chromosome"
              style={{
                '--condense-progress': progress,
                width: chr.width,
                height: chr.height,
                opacity: progress,
                transform: `scale(${0.2 + progress * 0.8})`,
                backgroundColor: chr.color
              }}
            >
              <div className="chromatid top" />
              <div className="centromere" />
              <div className="chromatid bottom" />
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cell-cycle-simulator">
      <div className="controls">
        <button 
          className={`control-button ${divisionType === 'mitosis' ? 'active' : ''}`}
          onClick={() => setDivisionType('mitosis')}
          disabled={isPlaying}
        >
          Mitosis
        </button>
        <button 
          className={`control-button ${divisionType === 'meiosis' ? 'active' : ''}`}
          onClick={() => setDivisionType('meiosis')}
          disabled={isPlaying}
        >
          Meiosis
        </button>
        <button 
          className="control-button"
          onClick={isPlaying ? () => setIsPaused(!isPaused) : startSimulation}
        >
          {isPlaying ? (isPaused ? '▶ Resume' : '⏸ Pause') : '▶ Start'}
        </button>
        <button 
          className="control-button reset"
          onClick={resetSimulation}
          disabled={!isPlaying && currentStage === 0}
        >
          🔄 Reset
        </button>
      </div>

      <div className="simulation-area">
        {getCurrentStageState() && renderCell()}
        
        <div className="stage-info">
          {getCurrentStageInfo() && (
            <>
              <h3 className="stage-name">
                {getCurrentStageInfo().name}
              </h3>
              <div className="progress-bar">
                <div 
                  className="progress"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="stage-description">
                {getCurrentStageInfo().description}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="stage-timeline">
        {cellCycleStages[divisionType].map((stage, index) => (
          <div
            key={index}
            className={`timeline-point ${currentStage === index ? 'active' : ''}`}
            data-stage={stage.name}
            onClick={() => !isPlaying && setCurrentStage(index)}
          />
        ))}
      </div>

      {showQuiz && (
        <div className="quiz-section">
          <h3>Test Your Knowledge</h3>
          <div className="quiz-question">
            <p>What happens during {cellCycleStages[divisionType][currentStage].name}?</p>
            {/* Add quiz implementation here */}
          </div>
          <p>Current Score: {score}</p>
        </div>
      )}
    </div>
  );
}

export default CellCycleSimulator;

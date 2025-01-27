import React, { useState, useRef } from 'react';
import './PedigreeSimulator.css';

const TRAITS = {
  autosomalDominant: {
    name: 'Autosomal Dominant',
    pattern: (parent1, parent2) => {
      // If either parent is affected, 50% chance for each child
      if (parent1.affected || parent2.affected) {
        // Proper Mendelian inheritance
        const parentAlleles = [];
        if (parent1.affected) parentAlleles.push('A', 'a');
        else parentAlleles.push('a', 'a');
        if (parent2.affected) parentAlleles.push('A', 'a');
        else parentAlleles.push('a', 'a');
        
        // Random allele from each parent
        const allele1 = parentAlleles[Math.floor(Math.random() * 2)];
        const allele2 = parentAlleles[Math.floor(Math.random() * 2 + 2)];
        
        return allele1 === 'A' || allele2 === 'A';
      }
      return false;
    }
  },
  autosomalRecessive: {
    name: 'Autosomal Recessive',
    pattern: (parent1, parent2) => {
      // Proper recessive inheritance
      const getParentAlleles = (parent) => {
        if (parent.affected) return ['a', 'a'];
        if (parent.carrier) return ['A', 'a'];
        return ['A', 'A'];
      };

      const parent1Alleles = getParentAlleles(parent1);
      const parent2Alleles = getParentAlleles(parent2);
      
      const allele1 = parent1Alleles[Math.floor(Math.random() * 2)];
      const allele2 = parent2Alleles[Math.floor(Math.random() * 2)];
      
      const isAffected = allele1 === 'a' && allele2 === 'a';
      const isCarrier = (allele1 === 'A' && allele2 === 'a') || (allele1 === 'a' && allele2 === 'A');
      
      return { affected: isAffected, carrier: isCarrier };
    }
  },
  xLinked: {
    name: 'X-Linked Recessive',
    pattern: (parent1, parent2, childGender) => {
      if (childGender === 'male') {
        // Males inherit X only from mother
        if (parent1.affected) return true;
        if (parent1.carrier) return Math.random() < 0.5;
        return false;
      } else {
        // Females need both X's affected
        if (parent2.affected) { // Father affected
          return parent1.affected || (parent1.carrier && Math.random() < 0.5);
        }
        // Father unaffected
        return false;
      }
    }
  }
};

function PedigreeSimulator() {
  const [family, setFamily] = useState({
    members: [],
    connections: [] // For marriage and parent-child connections
  });
  const [selectedTrait, setSelectedTrait] = useState('autosomalDominant');
  const [selectedTool, setSelectedTool] = useState('add');
  const [selectedMember, setSelectedMember] = useState(null);
  const [lineStart, setLineStart] = useState(null);
  const [lineEnd, setLineEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef(null);

  const setMemberGender = (memberId, gender) => {
    setFamily(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.id === memberId ? { ...m, gender } : m
      )
    }));
  };

  const addFamilyMember = (e) => {
    // Only add if we're in add mode
    if (selectedTool !== 'add') return;

    // Get click position relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create new member with absolute positioning
    const newMember = {
      id: Date.now(),
      x: x,
      y: y,
      gender: 'unknown',
      affected: false,
      carrier: false,
      generation: Math.floor(y / 100),
      parents: [],
      children: []
    };

    // Update family state
    setFamily(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const connectMembers = (member1, member2) => {
    if (!member1 || !member2) return;
    
    // Only allow marriage between opposite genders
    if (member1.generation === member2.generation) {
      if (member1.gender === member2.gender || 
          member1.gender === 'unknown' || 
          member2.gender === 'unknown') {
        return; // Don't allow same-gender marriage or unknown gender
      }
      
      // Check if either member is already married
      const existingMarriage = family.connections.find(conn => 
        conn.type === 'marriage' && 
        (conn.members.includes(member1.id) || conn.members.includes(member2.id))
      );
      
      if (!existingMarriage) {
        setFamily(prev => ({
          ...prev,
          connections: [...prev.connections, {
            type: 'marriage',
            members: [member1.id, member2.id]
          }]
        }));
      }
    }
    // Parent-child connection
    else {
      const parent = member1.generation < member2.generation ? member1 : member2;
      const child = member1.generation < member2.generation ? member2 : member1;
      
      // Check if child already has this parent
      if (!child.parents.includes(parent.id)) {
        setFamily(prev => ({
          ...prev,
          members: prev.members.map(m => {
            if (m.id === child.id) {
              return { ...m, parents: [...m.parents, parent.id] };
            }
            if (m.id === parent.id) {
              return { ...m, children: [...m.children, child.id] };
            }
            return m;
          })
        }));
      }
    }
  };

  const toggleAffected = (memberId) => {
    setFamily(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.id === memberId ? { ...m, affected: !m.affected } : m
      )
    }));
  };

  const handleMouseDown = (e, member) => {
    if (selectedTool === 'line') {
      e.stopPropagation(); // Prevent chart click
      setIsDragging(true);
      setLineStart({
        x: member.x,
        y: member.y,
        id: member.id
      });
      setLineEnd({
        x: member.x,
        y: member.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedTool === 'line') {
      const rect = containerRef.current.getBoundingClientRect();
      setLineEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseUp = (member) => {
    if (isDragging && lineStart && member) {
      if (lineStart.id !== member.id) {
        const startMember = family.members.find(m => m.id === lineStart.id);
        if (startMember && member) {
          // Calculate distance
          const distance = Math.sqrt(
            Math.pow(member.x - startMember.x, 2) + 
            Math.pow(member.y - startMember.y, 2)
          );
          
          if (distance <= 200) {
            connectMembers(startMember, member);
          }
        }
      }
    }
    setIsDragging(false);
    setLineStart(null);
    setLineEnd(null);
  };

  const calculateLineDirection = (start, end) => {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    // If horizontal difference is greater, make it a horizontal line
    // Otherwise, make it a vertical line
    return dx > dy ? 'horizontal' : 'vertical';
  };

  const getAutoCorrectedLine = (start, end) => {
    const direction = calculateLineDirection(start, end);
    if (direction === 'horizontal') {
      return {
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: start.y // Keep y constant for horizontal
      };
    } else {
      return {
        x1: start.x,
        y1: start.y,
        x2: start.x, // Keep x constant for vertical
        y2: end.y
      };
    }
  };

  const renderConnections = () => {
    // Group marriages by generation for better organization
    const marriagesByGeneration = {};
    family.connections
      .filter(conn => conn.type === 'marriage')
      .forEach(marriage => {
        const spouse1 = family.members.find(m => m.id === marriage.members[0]);
        const spouse2 = family.members.find(m => m.id === marriage.members[1]);
        const gen = spouse1.generation;
        
        if (!marriagesByGeneration[gen]) {
          marriagesByGeneration[gen] = [];
        }
        marriagesByGeneration[gen].push({ spouse1, spouse2 });
      });

    return (
      <>
        {Object.entries(marriagesByGeneration).map(([gen, marriages]) => (
          <g key={gen}>
            {marriages.map((marriage, i) => {
              const { spouse1, spouse2 } = marriage;
              const marriageY = spouse1.y;
              const parentMidX = (spouse1.x + spouse2.x) / 2;
              
              // Find children of this marriage
              const children = family.members.filter(m => 
                m.parents.includes(spouse1.id) && m.parents.includes(spouse2.id)
              ).sort((a, b) => a.x - b.x);

              // Calculate spacing for children
              const childrenMidX = children.length > 0 
                ? (children[0].x + children[children.length - 1].x) / 2 
                : parentMidX;

              return (
                <g key={`marriage-${gen}-${i}`}>
                  {/* Marriage line */}
                  <line
                    x1={spouse1.x}
                    y1={marriageY}
                    x2={spouse2.x}
                    y2={marriageY}
                    stroke="#000"
                    strokeWidth="2"
                  />

                  {children.length > 0 && (
                    <>
                      {/* Vertical line down from marriage */}
                      <line
                        x1={parentMidX}
                        y1={marriageY}
                        x2={parentMidX}
                        y2={children[0].y - 30}
                        stroke="#000"
                        strokeWidth="2"
                      />

                      {/* Horizontal line above children */}
                      <line
                        x1={children[0].x}
                        y1={children[0].y - 30}
                        x2={children[children.length - 1].x}
                        y2={children[0].y - 30}
                        stroke="#000"
                        strokeWidth="2"
                      />

                      {/* Vertical lines to each child */}
                      {children.map((child, j) => (
                        <line
                          key={`child-line-${j}`}
                          x1={child.x}
                          y1={child.y - 30}
                          x2={child.x}
                          y2={child.y}
                          stroke="#000"
                          strokeWidth="2"
                        />
                      ))}
                    </>
                  )}
                </g>
              );
            })}
          </g>
        ))}

        {/* Preview line */}
        {isDragging && lineStart && lineEnd && (
          <line
            {...getAutoCorrectedLine(lineStart, lineEnd)}
            stroke="#666"
            strokeWidth="2"
            strokeDasharray="4"
          />
        )}
      </>
    );
  };

  const generateRandomPedigree = () => {
    setFamily({ members: [], connections: [] });

    setTimeout(() => {
      const newMembers = [];
      const newConnections = [];
      const spacing = {
        horizontal: 140,  // Increased from 100 to give more room
        vertical: 120
      };
      
      const containerWidth = containerRef.current.clientWidth - 100;
      const startX = containerWidth / 2;
      const startY = 50;
      
      // First generation - adjust spacing between spouses
      const grandfather = {
        id: Date.now(),
        x: startX - spacing.horizontal/3, // Changed from /4 to /3
        y: startY,
        gender: 'male',
        affected: Math.random() > 0.7,
        carrier: false,
        generation: 0,
        parents: [],
        children: []
      };
      
      const grandmother = {
        id: Date.now() + 1,
        x: startX + spacing.horizontal/3, // Changed from /4 to /3
        y: startY,
        gender: 'female',
        affected: Math.random() > 0.7,
        carrier: false,
        generation: 0,
        parents: [],
        children: []
      };
      
      newMembers.push(grandfather, grandmother);
      newConnections.push({
        type: 'marriage',
        members: [grandfather.id, grandmother.id]
      });

      // Second generation - their children
      const numChildren = Math.floor(Math.random() * 3) + 1; // 1-3 children
      const childrenStartX = startX - ((numChildren - 1) * spacing.horizontal / 2);

      for(let i = 0; i < numChildren; i++) {
        // Create child with random gender
        const childGender = Math.random() > 0.5 ? 'male' : 'female';
        const child = {
          id: Date.now() + 10 + i,
          x: childrenStartX + (i * spacing.horizontal),
          y: startY + spacing.vertical,
          gender: childGender,
          affected: TRAITS[selectedTrait].pattern(grandfather, grandmother),
          carrier: false,
          generation: 1,
          parents: [grandfather.id, grandmother.id],
          children: []
        };
        
        newMembers.push(child);
        grandfather.children.push(child.id);
        grandmother.children.push(child.id);

        // Each child gets an opposite-gender spouse
        const spouse = {
          id: child.id + 100,
          x: child.x + spacing.horizontal/2, // Changed from /4 to /2
          y: child.y,
          gender: childGender === 'male' ? 'female' : 'male',
          affected: Math.random() > 0.7,
          carrier: false,
          generation: 1,
          parents: [],
          children: []
        };
        
        newMembers.push(spouse);
        newConnections.push({
          type: 'marriage',
          members: [child.id, spouse.id]
        });

        // Third generation - grandchildren
        const numGrandchildren = Math.floor(Math.random() * 2) + 1; // 1-2 grandchildren per couple
        const grandchildStartX = (child.x + spouse.x)/2 - ((numGrandchildren - 1) * spacing.horizontal / 3);

        for(let j = 0; j < numGrandchildren; j++) {
          const grandchild = {
            id: Date.now() + 100 + (i * 10) + j,
            x: grandchildStartX + (j * (spacing.horizontal * 0.66)), // More compact spacing
            y: startY + (spacing.vertical * 2),
            gender: Math.random() > 0.5 ? 'male' : 'female',
            affected: TRAITS[selectedTrait].pattern(child, spouse),
            carrier: false,
            generation: 2,
            parents: [child.id, spouse.id],
            children: []
          };
          
          newMembers.push(grandchild);
          child.children.push(grandchild.id);
          spouse.children.push(grandchild.id);
        }
      }

      setFamily({
        members: newMembers,
        connections: newConnections
      });
    }, 100);
  };

  return (
    <div className="pedigree-simulator">
      <div className="toolbar">
        <select value={selectedTrait} onChange={e => setSelectedTrait(e.target.value)}>
          {Object.entries(TRAITS).map(([key, trait]) => (
            <option key={key} value={key}>{trait.name}</option>
          ))}
        </select>
        <div className="tools">
          <button 
            className={selectedTool === 'add' ? 'active' : ''}
            onClick={() => setSelectedTool('add')}
          >
            Add Member
          </button>
          <button 
            className={selectedTool === 'line' ? 'active' : ''}
            onClick={() => setSelectedTool('line')}
          >
            Draw Line
          </button>
          <button 
            className={selectedTool === 'connect' ? 'active' : ''}
            onClick={() => setSelectedTool('connect')}
          >
            Connect
          </button>
          <button 
            className="generate-button"
            onClick={generateRandomPedigree}
          >
            Generate Random Pedigree
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="pedigree-chart"
        onClick={(e) => {
          // Prevent click if clicking on a member or controls
          if (e.target.className === 'pedigree-chart') {
            addFamilyMember(e);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => handleMouseUp(null)}
      >
        <svg width="100%" height="100%" className="connections">
          {renderConnections()}
        </svg>
        {family.members.map(member => (
          <div
            key={member.id}
            className={`family-member ${member.gender} ${member.affected ? 'affected' : ''} ${selectedMember?.id === member.id ? 'selected' : ''}`}
            style={{
              position: 'absolute',
              left: `${member.x}px`,
              top: `${member.y}px`
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === 'connect') {
                if (selectedMember) {
                  connectMembers(selectedMember, member);
                  setSelectedMember(null);
                } else {
                  setSelectedMember(member);
                }
              } else if (selectedTool === 'add') {
                toggleAffected(member.id);
              }
            }}
            onMouseDown={(e) => handleMouseDown(e, member)}
            onMouseUp={() => handleMouseUp(member)}
          >
            <div className="member-controls">
              <button onClick={() => setMemberGender(member.id, 'male')}>♂</button>
              <button onClick={() => setMemberGender(member.id, 'female')}>♀</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PedigreeSimulator;
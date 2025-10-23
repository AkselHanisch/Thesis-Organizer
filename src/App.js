import React, { useState, useEffect } from 'react';
import './App.css';

// const statusColors = ['green', 'limegreen', 'yellow', 'orange', 'red'];
const statusColors = ['red', 'orange', 'yellow', 'limegreen', 'green'];

const initialExplanation = 'This tool helps you organize your thesis sections and subsections.\n\nClick on the colored boxes to cycle through status colors indicating your progress.\n\nYou can add, edit, and delete sections and subsections as needed. Your data will be saved automatically in your browser\'s local storage.';

const initialSections = [
  {
    id: 1,
    title: 'Section1',
    color: 'green',
    subsections: [
      { id: 11, title: 'Subsection', color: 'green' },
      { id: 12, title: 'Subsection', color: 'green' },
      { id: 13, title: 'Subsection', color: 'green' },
      { id: 14, title: 'Subsection', color: 'green' },
    ]
  },
  {
    id: 2,
    title: 'Section2',
    color: 'yellow',
    subsections: [
      { id: 21, title: 'Subsection', color: 'yellow' },
      { id: 22, title: 'Subsection', color: 'limegreen' },
      { id: 23, title: 'Subsection', color: 'limegreen' },
      { id: 24, title: 'Subsection', color: 'green' },
    ]
  },
  {
    id: 3,
    title: 'Section3',
    color: 'orange',
    subsections: [
      { id: 31, title: 'Subsection', color: 'red' },
      { id: 32, title: 'Subsection', color: 'orange' },
      { id: 33, title: 'Subsection', color: 'red' },
      { id: 34, title: 'Subsection', color: 'orange' },
    ]
  },
];

function App() {
  const [sections, setSections] = useState(initialSections);
  const [explanation, setExplanation] = useState(initialExplanation);
  const [nextId, setNextId] = useState(100);

  useEffect(() => {
    const savedSections = localStorage.getItem('thesisSections');
    const savedExplanation = localStorage.getItem('thesisExplanation');
    const savedNextId = localStorage.getItem('thesisNextId');
    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedExplanation) setExplanation(savedExplanation);
    if (savedNextId) setNextId(parseInt(savedNextId, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem('thesisSections', JSON.stringify(sections));
    localStorage.setItem('thesisExplanation', explanation);
    localStorage.setItem('thesisNextId', nextId);
  }, [sections, explanation, nextId]);

  const addSection = () => {
    const newId = nextId;
    setSections([...sections, { id: newId, title: `Section ${newId}`, color: 'red', subsections: [] }]);
    setNextId(nextId + 1);
  };

  const deleteSection = (id) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const updateSection = (id, updates) => {
    setSections(sections.map(section => section.id === id ? { ...section, ...updates } : section));
  };

  const addSubsection = (sectionId) => {
    const subId = nextId;
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: [...section.subsections, { id: subId, title: 'Subsection', color: 'red' }]
        };
      }
      return section;
    }));
    setNextId(nextId + 1);
  };

  const deleteSubsection = (sectionId, subId) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: section.subsections.filter(sub => sub.id !== subId)
        };
      }
      return section;
    }));
  };

  const updateSubsection = (sectionId, subId, updates) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: section.subsections.map(sub => sub.id === subId ? { ...sub, ...updates } : sub)
        };
      }
      return section;
    }));
  };

  const cycleColor = (id, isSection) => {
    const target = isSection
      ? sections.find(s => s.id === id)
      : sections.flatMap(s => s.subsections).find(s => s.id === id);
    const currentIndex = statusColors.indexOf(isSection ? target.color : target.color);
    const nextIndex = (currentIndex + 1) % statusColors.length;
    const newColor = statusColors[nextIndex];
    if (isSection) {
      updateSection(id, { color: newColor });
    } else {
      const sectionId = sections.find(s => s.subsections.some(sub => sub.id === id)).id;
      updateSubsection(sectionId, id, { color: newColor });
    }
  };

  return (
    <div className="app">
      <header className="headline">
        <h1>Thesis Organizer</h1>
      </header>
      
      <div className="explanation">
        <p contentEditable onBlur={(e) => setExplanation(e.target.innerText)} suppressContentEditableWarning>
          {explanation}
        </p>
      </div>

      {sections.map(section => (
        <div key={section.id} className="section">
          <div className="item section-item">
            <div className="color-box section-color" style={{ backgroundColor: section.color }} onClick={() => cycleColor(section.id, true)} />
            <h2 contentEditable onBlur={(e) => updateSection(section.id, { title: e.target.innerText })} suppressContentEditableWarning>
              {section.title}
            </h2>
            <div className="controls">
              <button onClick={() => addSubsection(section.id)}>Add Sub</button>
              <button onClick={() => deleteSection(section.id)}>Delete</button>
            </div>
          </div>
          <div class="subsections">
            {section.subsections.map(sub => (
              <div key={sub.id} className="item sub-item">
                <div className="color-box sub-color" style={{ backgroundColor: sub.color }} onClick={() => cycleColor(sub.id, false)} />
                <h3 contentEditable onBlur={(e) => updateSubsection(section.id, sub.id, { title: e.target.innerText })} suppressContentEditableWarning>
                  {sub.title}
                </h3>
                <div className="controls">
                  <button onClick={() => deleteSubsection(section.id, sub.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="add-section" onClick={addSection}>Add Section</button>

      {/* <div className="donate">
        <a href="https://your-donate-link.com" target="_blank" rel="noopener noreferrer">Donate here</a>
      </div> */}
    </div>
  );
}

export default App;
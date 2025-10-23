import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import './App.css';

const statusColors = ['green', 'limegreen', 'yellow', 'orange', 'red'];
const THESIS_DOC_ID = 'shared-thesis';

const initialExplanation = 'This tool helps you organize your thesis sections and subsections.\n\nClick on the colored boxes to cycle through status colors indicating your progress.\n\nYou can add, edit, and delete sections and subsections as needed.';
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
  const [user, setUser] = useState(null);
  const [sections, setSections] = useState(initialSections);
  const [explanation, setExplanation] = useState(initialExplanation);
  const [nextId, setNextId] = useState(100);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const thesisRef = doc(db, 'thesis', THESIS_DOC_ID);
    const unsubscribe = onSnapshot(thesisRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSections(data.sections || initialSections);
        setExplanation(data.explanation || initialExplanation);
      } else {
        setDoc(thesisRef, { sections: initialSections, explanation: initialExplanation });
      }
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const thesisRef = doc(db, 'thesis', THESIS_DOC_ID);
    setDoc(thesisRef, { sections, explanation, updatedAt: new Date() }, { merge: true });
  }, [sections, explanation, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert('Google login failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

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

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="login-overlay">
        <div className="login-form">
          <h2>Thesis Organizer Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In with Email</button>
          </form>
          <button onClick={handleGoogleLogin}>Sign In with Google</button>
          <p>New team? Add users in Firebase console first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="headline">
        <h1>Thesis Organizer</h1>
        <button onClick={handleLogout}>Logout</button>
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
          <div className="subsections">
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
        <a href="https://your-donate-link.com" target="_blank" rel="noopener noreferrer">
          <span role="img" aria-label="donate">💰</span> Donate here
        </a>
      </div> */}
    </div>
  );
}

export default App;
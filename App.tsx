import React, { useState } from 'react';
import Landing from './components/Landing';
import Studio from './components/Studio';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');

  return (
    <>
      {currentView === 'landing' ? (
        <Landing onStart={() => setCurrentView('studio')} />
      ) : (
        <Studio />
      )}
    </>
  );
}

export default App;
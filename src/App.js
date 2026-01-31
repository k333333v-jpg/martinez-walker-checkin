import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import CheckIn from './pages/CheckIn';
import Waiting from './pages/Waiting';
import Staff from './pages/Staff';
import './App.css';

function App() {
  return (
    <QueueProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<CheckIn />} />
            <Route path="/waiting" element={<Waiting />} />
            <Route path="/staff" element={<Staff />} />
          </Routes>
        </div>
      </Router>
    </QueueProvider>
  );
}

export default App;

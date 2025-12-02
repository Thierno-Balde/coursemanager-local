import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import { StoreProvider } from './context/StoreContext';
import Footer from './components/Footer';

// Using HashRouter because this is intended to run as a local file-based app
// or on static hosts without server-side rewrite rules.
const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
          </Routes>
          <Footer />
        </div>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
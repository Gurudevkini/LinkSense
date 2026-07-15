import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './App';
import RedirectPage from './pages/RedirectPage';

function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:slug" element={<RedirectPage />} />
      </Routes>
    </Router>
  );
}

export default Root;

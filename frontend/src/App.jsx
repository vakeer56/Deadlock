import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Deadlock from "./pages/login";
import CrackTheCode from "./pages/CrackTheCode";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/login" element={<Deadlock />} />
        <Route path="/crackTheCode" element={<CrackTheCode />} />
      </Routes>
    </Router>
  );
}

export default App;

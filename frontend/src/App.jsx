import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import CTCLobby from "./pages/ctcLobby";
import DLLobby from "./pages/dlLobby";
import Deadlock from "./pages/login";

import Dashboard from "./pages/dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<Deadlock />} />
        <Route path="/dashboard" element={<CTCLobby />} />
        <Route path="/deadlock-lobby" element={<DLLobby />} />
      </Routes>
    </Router>
  );
}

export default App;

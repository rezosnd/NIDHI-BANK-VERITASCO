import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      if (savedUser && token) {
        // 🛡️ Validate JWT expiry on page load — don't trust a stale token
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired — clear storage and force re-login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          return null;
        }
        return JSON.parse(savedUser);
      }
    } catch (e) {
      // Malformed token or JSON — clear and re-login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/*" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

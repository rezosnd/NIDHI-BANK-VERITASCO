import { useState, useEffect } from 'react';
import './FandomLogin.css';

function EarthGlobe() {
  return (
    <div className="css-fandom-globe">
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptchaCode(`${n1} + ${n2}`);
    setCaptchaAnswer(n1 + n2);
    setCaptchaInput('');
  };

  useEffect(() => { generateCaptcha(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parseInt(captchaInput) !== captchaAnswer) {
      setError('Incorrect security code. Please try again.');
      generateCaptcha();
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid username or password.');
        generateCaptcha();
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fandom-container">
      {/* 3D Earth Globe */}
      <div className="fandom-globe-wrapper">
        <EarthGlobe />
      </div>

      <div className="login-form-area">
        <div className="login-form-header">
          <h1 className="company-name">VERITASCO NIDHI BANK</h1>
          <p className="company-tagline">Advanced Financial Infrastructure & Secure Banking</p>
        </div>

        <div className="debit-card-wrapper">
          <div className="card-header">
            <img src="/veritasco.png" alt="VeritasCo Logo" className="card-bank-logo" />
            <svg className="contactless-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8a12 12 0 0 1 16 0"/><path d="M7 12a8 8 0 0 1 10 0"/><path d="M10 16a4 4 0 0 1 4 0"/><path d="M12 20h.01"/>
            </svg>
          </div>

          <div className="card-chip"></div>

          <form onSubmit={handleSubmit} className="card-form-elements">
            <div className="card-input-group">
              <label>USER ID / EMAIL</label>
              <input 
                type="text" 
                placeholder="YOUR USERNAME" 
                className="card-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="card-input-row">
              <div className="card-input-group">
                <label>PIN / PASSCODE</label>
                <input 
                  type="password" 
                  placeholder="••••" 
                  className="card-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="card-input-group">
                <label>SEC: {captchaCode}</label>
                <input 
                  type="text" 
                  placeholder="RESULT" 
                  className="card-input"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="card-btn" disabled={isLoading}>
              {isLoading ? 'PROCESSING...' : 'LOGIN'}
            </button>
          </form>

          {error && <div className="fandom-error">{error}</div>}

          <div className="card-footer">
            <span className="card-brand">VeritasCo</span>
            <div className="card-network-circles">
              <div className="card-circle red"></div>
              <div className="card-circle yellow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

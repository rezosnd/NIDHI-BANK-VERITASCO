import { useState, useEffect } from 'react';
import './FandomLogin.css';

function EarthGlobe() {
  return (
    <div className="css-fandom-globe"></div>
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
      setError('Incorrect security verification code.');
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
      setError('Cannot connect to secure server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="premium-login-container">
      {/* Immersive 3D Globe Background */}
      <div className="premium-globe-wrapper">
        <EarthGlobe />
      </div>

      <div className="login-content-area">
        <div className="login-header-branding">
          <h1 className="premium-company-name">VERITASCO NIDHI</h1>
          <p className="premium-company-tagline">Enterprise Banking Infrastructure</p>
        </div>

        {/* The Premium ATM Card Login Interface */}
        <div className="premium-atm-card">
          <div className="card-top-row">
            <img src="/veritasco.png" alt="VeritasCo Logo" className="card-bank-logo" />
            <svg className="contactless-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8a12 12 0 0 1 16 0"/><path d="M7 12a8 8 0 0 1 10 0"/><path d="M10 16a4 4 0 0 1 4 0"/><path d="M12 20h.01"/>
            </svg>
          </div>

          <div className="card-chip-container">
            <div className="premium-card-chip"></div>
          </div>

          <form onSubmit={handleSubmit} className="card-form-body">
            <div className="card-input-group">
              <label>AUTHORIZED USER ID</label>
              <input 
                type="text" 
                placeholder="ENTER USERNAME" 
                className="premium-card-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="card-split-inputs">
              <div className="card-input-group">
                <label>SECURE PIN</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="premium-card-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="card-input-group">
                <label>AUTH: {captchaCode}</label>
                <input 
                  type="text" 
                  placeholder="RESULT" 
                  className="premium-card-input"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="card-error-message">{error}</div>}

            <button type="submit" className="premium-card-button" disabled={isLoading}>
              {isLoading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
            </button>
          </form>

          <div className="card-bottom-row">
            <span className="card-embossed-name">VERITASCO ENTERPRISE</span>
            <div className="card-network-circles">
              <div className="circle circle-red"></div>
              <div className="circle circle-blue"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

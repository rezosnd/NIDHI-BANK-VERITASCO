import { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaString, setCaptchaString] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Generate Captcha on load
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaString(`${num1} + ${num2}`);
    setCaptchaAnswer(num1 + num2);
  };

  useState(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(captchaInput) !== captchaAnswer) {
      setError('Invalid Captcha. Please try again.');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid username or password');
        generateCaptcha();
        setCaptchaInput('');
      }
    } catch (err) {
      setError('Unable to connect to server. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="loader-overlay">
          <div className="dotted-loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}
      <div className="split-auth-container">
        {/* Left Branding/Hero Section */}
        <div className="auth-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        
        {/* Cool Digital Abstract SVG Background instead of circles */}
        <svg className="hero-decoration" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15, zIndex: 1 }}>
          <polygon points="0,100 100,0 100,100" fill="url(#grad1)"/>
          <polygon points="0,0 100,100 0,100" fill="url(#grad2)"/>
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>
        </svg>

        <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <img src="/veritasco.png" alt="VeritasCo Logo" style={{ height: '54px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', lineHeight: '1.2', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            VERITASCO<br />
            <span style={{ fontSize: '1.5rem', color: '#38bdf8' }}>A COMPLETE DIGITAL SOLUTION</span>
          </h2>
          <p style={{ color: '#d1d5db', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.6' }}>
            Experience secure, high-performance financial management. Log in to access your dashboard, manage branches, and oversee operations.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="auth-form-wrapper">
        <div className="auth-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          </div>
          <h2 className="auth-title" style={{ textAlign: 'center' }}>Admin Login</h2>
          <p className="auth-subtitle" style={{ textAlign: 'center' }}>Secure access to your banking portal</p>
          
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input
                  id="username"
                  type="text"
                  className="form-input has-icon"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input
                  id="password"
                  type="password"
                  className="form-input has-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="captcha">Security Captcha</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '2px', border: '1px solid var(--border-soft)', userSelect: 'none', color: '#0f172a', fontSize: '1.1rem' }}>
                  {captchaString} = ?
                </div>
                <input
                  id="captcha"
                  type="text"
                  className="form-input"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Answer"
                  required
                  style={{ flex: 1, textAlign: 'center', fontSize: '1.1rem', letterSpacing: '1px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }} />
                Remember me
              </label>
              <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</a>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="auth-button">
              Sign In to Dashboard
            </button>
          </form>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            End-to-End Encrypted Secure Connection
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Login;

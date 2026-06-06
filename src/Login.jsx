import { useState, useEffect } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

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
    <div className="login-page-container">
      <div className="login-content-wrapper">
        {/* ── LEFT PANEL ── */}
        <div className="login-left-panel">
          <div className="login-left-content">
            {/* Top Header */}
            <div className="login-left-header">
              <div className="login-logo-container">
                <img src="/veritasco.png" alt="VeritasCo Logo" className="login-logo-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="login-logo-fallback">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div className="login-logo-text">
                  <div className="login-logo-title">VeritasCo</div>
                  <div className="login-logo-subtitle">Complete digital solutions</div>
                </div>
              </div>
              
              <div className="login-header-right">
                <div className="login-orange-text">Banking / Nidhi Company</div>
                <div className="login-white-text">Modern Business Solutions</div>
                <div className="login-bold-text">PRODUCTION SOFTWARE</div>
              </div>
            </div>

            <div className="login-phone-contact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.35h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 17z"/></svg>
              <span>+91-98864-61360</span>
            </div>

            {/* Main Headline */}
            <div className="login-hero-text">
              <h1>Complete<br /><span className="text-highlight">Digital Solutions</span><br />For Modern Businesses</h1>
              <p>Smart, Secure & Scalable Software Solutions for Co-operative Societies, Banks & Nidhi Companies.</p>
              <div className="login-hero-divider" />
            </div>

            {/* Features */}
            <div className="login-features-list">
              {[
                { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Secure & Reliable', desc: 'Enterprise-grade security for your data' },
                { icon: 'M18 20V10M12 20V4M6 20v-6', title: 'Performance Driven', desc: 'Built for speed, efficiency and growth' },
                { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', title: 'User Friendly', desc: 'Intuitive design for seamless experience' },
                { icon: 'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z', title: 'Always Supported', desc: 'Dedicated support whenever you need' },
              ].map((f, i) => (
                <div className="login-feature-item" key={i}>
                  <div className="login-feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d={f.icon}/></svg>
                  </div>
                  <div className="login-feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (WHITE CARD) ── */}
        <div className="login-right-panel">
          <div className="login-card">
            <div className="login-card-bg-dots" />
            
            <div className="login-card-content">
              <div className="login-card-logo">
                <div className="login-card-logo-circle">
                  <img src="/veritasco.png" alt="V" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                  <svg style={{ display: 'none' }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
              </div>

              <h2 className="login-card-title">Welcome Back!</h2>
              <p className="login-card-subtitle">Sign in to continue to your account</p>

              {error && <div className="login-error-msg">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-form-group">
                  <label>Username</label>
                  <div className="login-input-wrapper">
                    <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required />
                  </div>
                </div>

                <div className="login-form-group">
                  <label>Password</label>
                  <div className="login-input-wrapper">
                    <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="login-form-group">
                  <label>Enter the code shown</label>
                  <div className="login-captcha-row">
                    <input type="text" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder="Enter code" required maxLength={3} className="login-captcha-input" />
                    <div className="login-captcha-display">{captchaCode} = ?</div>
                    <button type="button" className="login-captcha-refresh" onClick={generateCaptcha}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    </button>
                  </div>
                </div>

                <div className="login-form-options">
                  <label className="login-checkbox">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="login-forgot-link">Forgot Password?</a>
                </div>

                <button type="submit" className="login-submit-btn" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : (
                    <>
                      <span>Login</span>
                      <div className="login-btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </div>
                    </>
                  )}
                </button>
              </form>

              <div className="login-card-footer">
                <div className="login-footer-secure">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Secure Login
                </div>
                <div className="login-footer-text">Your data is protected with enterprise-grade security</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

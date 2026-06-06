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
            
            {/* Top Header - Logo and Text Side by Side */}
            <div className="login-header-row">
              <div className="login-logo-block">
                <img src="/veritasco.png" alt="VeritasCo Logo" className="login-logo-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="login-logo-fallback">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
              </div>
              
              <div className="login-header-text-block">
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

            {/* Horizontal Line spanning left panel */}
            <div className="login-horizontal-line" />

            {/* Features - Vertical Stack */}
            <div className="login-features-list">
              {[
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Secure & Reliable', desc: 'Enterprise-grade security for your data' },
                { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', title: 'Performance Driven', desc: 'Built for speed, efficiency and growth' },
                { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', title: 'User Friendly', desc: 'Intuitive design for seamless experience' },
                { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: 'Always Supported', desc: 'Dedicated support whenever you need' },
              ].map((f, i) => (
                <div className="login-feature-item" key={i}>
                  <div className="login-feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/></svg>
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
            <div className="login-card-bg-dots top-right" />
            <div className="login-card-bg-dots bottom-left" />
            
            <div className="login-card-content">
              <div className="login-card-logo">
                <div className="login-card-logo-circle">
                  <img src="/veritasco.png" alt="V" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                  <svg style={{ display: 'none' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
              </div>

              <h2 className="login-card-title">Welcome Back!</h2>
              <p className="login-card-subtitle">Sign in to continue to your account</p>

              {error && <div className="login-error-msg">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-form-group">
                  <label>Username</label>
                  <div className="login-input-wrapper">
                    <div className="login-input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required />
                  </div>
                </div>

                <div className="login-form-group">
                  <label>Password</label>
                  <div className="login-input-wrapper">
                    <div className="login-input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    </div>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="login-form-group">
                  <label>Enter the code shown</label>
                  <div className="login-captcha-row">
                    <input type="text" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder="Enter code" required maxLength={3} className="login-captcha-input" />
                    <div className="login-captcha-display-box">
                      <div className="login-captcha-display">{captchaCode} = ?</div>
                      <button type="button" className="login-captcha-refresh" onClick={generateCaptcha}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="login-form-options">
                  <label className="login-checkbox">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    <span className="checkbox-custom"></span>
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="login-forgot-link">Forgot Password?</a>
                </div>

                <button type="submit" className="login-submit-btn" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : (
                    <>
                      <span>Login</span>
                      <div className="login-btn-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" /></svg>
                      </div>
                    </>
                  )}
                </button>
              </form>

              <div className="login-card-footer">
                <div className="login-footer-secure">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
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

export default Login;t default Login;

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

            {/* ── TOP: Brand + nav info ── */}
            <div className="lp-top">
              {/* Logo + company name */}
              <div className="lp-brand">
                <div className="lp-brand-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div className="lp-brand-name">VeritasCo</div>
                  <div className="lp-brand-tag">Complete digital solutions</div>
                </div>
              </div>

              {/* Top right info */}
              <div className="lp-topright">
                <div className="lp-badge">Banking · Nidhi · Co-op</div>
                <div className="lp-badge lp-badge-outline">PRODUCTION</div>
              </div>
            </div>

            {/* ── CENTRE: SVG Illustration + Headline ── */}
            <div className="lp-centre">
              {/* Bespoke SVG: abstract shield / data network */}
              <div className="lp-svg-wrap">
                <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-svg">
                  {/* Glow blob */}
                  <ellipse cx="160" cy="110" rx="130" ry="90" fill="url(#blobGrad)" opacity="0.18"/>
                  {/* Grid lines */}
                  <line x1="0" y1="55" x2="320" y2="55" stroke="#1e3a5f" strokeWidth="1"/>
                  <line x1="0" y1="110" x2="320" y2="110" stroke="#1e3a5f" strokeWidth="1"/>
                  <line x1="0" y1="165" x2="320" y2="165" stroke="#1e3a5f" strokeWidth="1"/>
                  <line x1="80" y1="0" x2="80" y2="220" stroke="#1e3a5f" strokeWidth="1"/>
                  <line x1="160" y1="0" x2="160" y2="220" stroke="#1e3a5f" strokeWidth="1"/>
                  <line x1="240" y1="0" x2="240" y2="220" stroke="#1e3a5f" strokeWidth="1"/>
                  {/* Shield */}
                  <path d="M160 20 L200 38 L200 82 Q200 118 160 138 Q120 118 120 82 L120 38 Z" fill="url(#shieldGrad)" opacity="0.9"/>
                  <path d="M160 28 L194 44 L194 82 Q194 113 160 130 Q126 113 126 82 L126 44 Z" fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
                  {/* Checkmark inside shield */}
                  <path d="M148 79 l8 9 l16-18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Connection nodes */}
                  <circle cx="52" cy="80" r="5" fill="#3b82f6" opacity="0.7"/>
                  <circle cx="268" cy="80" r="5" fill="#3b82f6" opacity="0.7"/>
                  <circle cx="52" cy="145" r="4" fill="#60a5fa" opacity="0.5"/>
                  <circle cx="268" cy="145" r="4" fill="#60a5fa" opacity="0.5"/>
                  <circle cx="160" cy="165" r="4" fill="#93c5fd" opacity="0.5"/>
                  {/* Connection lines */}
                  <line x1="57" y1="80" x2="120" y2="65" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"/>
                  <line x1="263" y1="80" x2="200" y2="65" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"/>
                  <line x1="56" y1="145" x2="126" y2="120" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 3" opacity="0.3"/>
                  <line x1="264" y1="145" x2="194" y2="120" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 3" opacity="0.3"/>
                  <line x1="160" y1="161" x2="160" y2="138" stroke="#93c5fd" strokeWidth="1" strokeDasharray="4 3" opacity="0.3"/>
                  {/* Stat pills */}
                  <rect x="18" y="68" width="28" height="12" rx="6" fill="#1e3a5f" opacity="0.8"/>
                  <text x="32" y="77" textAnchor="middle" fontSize="6" fill="#93c5fd" fontFamily="monospace">99.9%</text>
                  <rect x="274" y="68" width="28" height="12" rx="6" fill="#1e3a5f" opacity="0.8"/>
                  <text x="288" y="77" textAnchor="middle" fontSize="6" fill="#93c5fd" fontFamily="monospace">256-bit</text>
                  {/* Defs */}
                  <defs>
                    <radialGradient id="blobGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#3b82f6"/>
                      <stop offset="100%" stopColor="#0f172a"/>
                    </radialGradient>
                    <linearGradient id="shieldGrad" x1="160" y1="20" x2="160" y2="138" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#2563eb"/>
                      <stop offset="100%" stopColor="#1e3a8a"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="lp-headline">
                <h1>
                  Complete<br />
                  <span className="lp-hl-accent">Digital Solutions</span><br />
                  For Modern Businesses
                </h1>
                <p>Smart, Secure &amp; Scalable Software for Co-operative Societies, Banks &amp; Nidhi Companies.</p>
                <div className="lp-divider"/>
              </div>
            </div>

            {/* ── BOTTOM: features + phone ── */}
            <div className="lp-bottom">
              <div className="lp-features">
                {[
                  { path:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label:'Secure & Reliable' },
                  { path:'M13 10V3L4 14h7v7l9-11h-7z', label:'Performance Driven' },
                  { path:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z', label:'User Friendly' },
                  { path:'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', label:'Always Supported' },
                ].map((f,i) => (
                  <div className="lp-feat" key={i}>
                    <div className="lp-feat-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={f.path}/>
                      </svg>
                    </div>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="lp-footer-row">
                <div className="lp-phone">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.5 2 2 0 013.6 1.35h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l.92-.92a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.5 17z"/>
                  </svg>
                  <span>+91-8709442363</span>
                </div>
                <div className="lp-powered">© 2025 VeritasCo · All rights reserved</div>
              </div>
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
                  <svg style={{ display: 'none' }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required />
                  </div>
                </div>

                <div className="login-form-group">
                  <label>Password</label>
                  <div className="login-input-wrapper">
                    <div className="login-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
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
                    <div className="login-captcha-display-box">
                      <div className="login-captcha-display">{captchaCode} = ?</div>
                      <button type="button" className="login-captcha-refresh" onClick={generateCaptcha}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
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
                      <span>Secure Login</span>
                      <div className="login-btn-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </div>
                    </>
                  )}
                </button>
              </form>

              <div className="login-card-footer">
                <div className="login-footer-secure">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Your data is protected with enterprise-grade security
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;t default Login;

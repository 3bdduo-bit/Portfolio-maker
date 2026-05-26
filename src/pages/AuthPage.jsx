import { useState } from 'react';
import s from './AuthPage.module.css';
import { ThemeToggle } from '../ThemeToggle';

export default function AuthPage({ onLogin }) {

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showRePwd, setShowRePwd] = useState(false);
  const [remember, setRemember] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rePassword: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // FIX: Client-side password match validation
    if (!isLogin && formData.password !== formData.rePassword) {
      setError('Passwords do not match. Please check and try again.');
      setLoading(false);
      return;
    }

    // FIX: Minimum password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const url = isLogin
      ? 'https://ecommerce.routemisr.com/api/v1/auth/signin'
      : 'https://ecommerce.routemisr.com/api/v1/auth/signup';

    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.ok && data.message === 'success') {
        const userData = data.user || { email: formData.email, name: formData.name };
        // FIX: Remember me logic — sessionStorage vs localStorage
        if (remember) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('userToken', data.token);
          sessionStorage.setItem('userData', JSON.stringify(userData));
          // Also set in localStorage for App.jsx compatibility
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        onLogin(data.token, userData);
      } else {
        let errMsg = data.message;
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            errMsg = data.errors.map(e => e.param ? `${e.param}: ${e.msg}` : e.msg).join(' | ');
          } else if (data.errors.msg) {
            errMsg = data.errors.msg;
          }
        }
        setError(errMsg || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '', rePassword: '', phone: '' });
  };

  return (
    <div className={s.page}>
      <div style={{ position: 'fixed', top: '2rem', left: '2rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div className={s.pageBg} />

      <div className={s.card}>
        {/* LEFT PANEL */}
        <div className={s.leftPanel}>
          <div className={s.leftPanelBg}></div>
          <div className={s.leftContent}>
            <div>
              <span className={`${s.wiseQuote} text-animate`}>A WISE QUOTE<span className={s.line}></span></span>
            </div>
            <div className={s.leftTextWrap}>
              <h1 className={`${s.leftTitle} text-animate`}>Get<br />Everything<br />You Want</h1>
              <p className={`${s.leftDesc} text-animate`}>You can get everything you want if you work hard, trust the process, and stick to the plan.</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={s.rightPanel}>
          <div className={s.logo}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
              <path d="M14 13.12c0 2.38 0 6.38-3.42 8.36" />
              <path d="M9.79 16.9a10.01 10.01 0 0 0 4.2-2.36l.3-.28a4 4 0 0 0-4.88-6.19 1 1 0 0 0-.25.13" />
              <path d="M11 5.09a4.8 4.8 0 0 1 2 0" />
              <path d="M7.78 6.55a10 10 0 0 1 8.44 0" />
              <path d="M4.64 9.42a15 15 0 0 1 14.72 0" />
              <path d="M2 14.33a19 19 0 0 1 20 0" />
              <path d="M5.52 18.06c.4-.33.82-.64 1.25-.93" />
            </svg>
            <span>port-make</span>
          </div>

          <div className={s.formWrapper}>
            <div className={s.formHeader}>
              <h2 className={`${s.title} text-animate`}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className={`${s.subtitle} text-animate`}>
                {isLogin ? 'Enter your email and password to access your account' : 'Enter your details to create a new account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
              {!isLogin && (
                <div className={`${s.field} ${s.slideDown}`}>
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin} placeholder="Enter your full name" />
                </div>
              )}

              <div className={s.field}>
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
              </div>

              {!isLogin && (
                <div className={`${s.field} ${s.slideDown}`}>
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required={!isLogin} placeholder="Enter your phone number" />
                </div>
              )}

              <div className={s.field}>
                <label>Password</label>
                <div className={s.pwdWrapper}>
                  <input type={showPwd ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" />
                  {formData.password.length > 0 && (
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className={s.eyeBtn} title={showPwd ? "Hide Password" : "Show Password"}>
                      {showPwd ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isLogin && (
                <div className={`${s.field} ${s.slideDown}`}>
                  <label>Confirm Password</label>
                  <div className={s.pwdWrapper}>
                    <input type={showRePwd ? 'text' : 'password'} name="rePassword" value={formData.rePassword} onChange={handleChange} required={!isLogin} placeholder="Confirm your password" />
                    {formData.rePassword.length > 0 && (
                      <button type="button" onClick={() => setShowRePwd(!showRePwd)} className={s.eyeBtn} title={showRePwd ? "Hide Password" : "Show Password"}>
                        {showRePwd ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    )}
                  </div>
                  {/* FIX: Live password match indicator */}
                  {formData.rePassword.length > 0 && (
                    <small style={{ color: formData.password === formData.rePassword ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {formData.password === formData.rePassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </small>
                  )}
                </div>
              )}

              {isLogin && (
                <div className={s.optionsRow}>
                  <label className={s.remember}>
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me
                  </label>
                </div>
              )}

              {error && <div className={s.error} role="alert">{error}</div>}

              <button type="submit" className={s.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <div className={s.btnSpinner} />
                    <span>Processing...</span>
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>

            <div className={s.toggleWrap}>
              <span className={s.toggleText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button type="button" className={s.toggleBtn} onClick={toggleMode}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

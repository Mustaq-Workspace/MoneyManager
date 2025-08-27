import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, DollarSign } from 'lucide-react';
import { authService, API_BASE_URL } from '../services/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.request && !err.response) {
        setError(`Cannot reach API at ${API_BASE_URL}. Is the backend running?`);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    alert('Google sign-in is not configured yet.');
  };

  const handleMobile = async () => {
    alert('Mobile sign-in is not configured yet.');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo"><DollarSign className="brand-icon" /></div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="input-with-icon">
              <span className="input-icon"><Mail size={18} /></span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-with-icon">
              <span className="input-icon"><Lock size={18} /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input with-action"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="auth-divider"><span>or continue with</span></div>

          <div className="social-buttons">
            <button type="button" className="btn btn-google" onClick={handleGoogle}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="social-icon"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.083,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.64,6.053,29.083,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.281-7.946l-6.536,5.036C9.49,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.106,5.571c0.001-0.001,0.002-0.001,0.003-0.002 l6.19,5.238C36.983,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              Continue with Google
            </button>
            <button type="button" className="btn btn-mobile" onClick={handleMobile}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="social-icon"><path fill="currentColor" d="M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2m0 18H7V5h10z"/></svg>
              Continue with Mobile
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="link">Sign up here</Link>
            </p>
          </div>
        </form>

        <div className="back-link">
          <Link to="/" className="link-muted">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 
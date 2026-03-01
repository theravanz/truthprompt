import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Mail,
  Lock,
  LogIn,
  Github,
  Chrome,
  Eye,
  EyeOff,
  Shield,
  AlertCircle
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './Auth.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}. Please try again.`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Effects */}
      <div className="orb auth-orb-1"></div>
      <div className="orb auth-orb-2"></div>
      <div className="grid-overlay"></div>

      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <Brain size={32} />
          </div>
          <span>TruthPrompt</span>
        </Link>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>

        {/* Social Login */}
        <div className="auth-social">
          <button 
            className="auth-social-btn" 
            onClick={() => handleSocialLogin('google')}
            disabled={socialLoading !== null}
          >
            {socialLoading === 'google' ? (
              <div className="loading-spinner loading-spinner-small"></div>
            ) : (
              <>
                <Chrome size={20} />
                <span>Google</span>
              </>
            )}
          </button>
          <button 
            className="auth-social-btn" 
            onClick={() => handleSocialLogin('github')}
            disabled={socialLoading !== null}
          >
            {socialLoading === 'github' ? (
              <div className="loading-spinner loading-spinner-small"></div>
            ) : (
              <>
                <Github size={20} />
                <span>GitHub</span>
              </>
            )}
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="rava.dev@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={16} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input password-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="form-error" style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <LogIn size={18} />
                <span>Log in</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          By logging in, you agree to our{' '}
          <Link to="/terms" className="auth-link">Terms</Link>,{' '}
          <Link to="/acceptable-use" className="auth-link">Acceptable Use</Link>, and{' '}
          <Link to="/privacy" className="auth-link">Privacy Policy</Link>.
        </p>

        {/* Security Badge */}
        <div className="security-badge">
          <Shield size={14} />
          <span>100% secure • No data collection</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
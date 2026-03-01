import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Mail,
  Lock,
  User,
  Github,
  Chrome,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './Auth.css';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (error) throw error;
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // OAuth redirect - page will reload
    } catch (err: any) {
      setError(err.message || `Failed to sign up with ${provider}. Please try again.`);
      setSocialLoading(null);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = password === confirmPassword && password !== '';

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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Log in
            </Link>
          </p>
        </div>

        {/* Social Signup */}
        <div className="auth-social">
          <button 
            className="auth-social-btn" 
            onClick={() => handleSocialSignup('google')}
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
            onClick={() => handleSocialSignup('github')}
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
          <span>or sign up with email</span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={16} />
              Full name
            </label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="Rava Dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            
            {/* Password strength indicator */}
            {password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${
                        passwordStrength >= level ? `strength-${level}` : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="strength-text">
                  {passwordStrength === 0 && 'Too weak'}
                  {passwordStrength === 1 && 'Weak'}
                  {passwordStrength === 2 && 'Fair'}
                  {passwordStrength === 3 && 'Good'}
                  {passwordStrength === 4 && 'Strong'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock size={16} />
              Confirm password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={`form-input password-input ${
                  confirmPassword && !passwordsMatch ? 'error' : ''
                }`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <div className="password-match-error">
                <AlertCircle size={14} />
                <span>Passwords don't match</span>
              </div>
            )}
            {confirmPassword && passwordsMatch && (
              <div className="password-match-success">
                <CheckCircle size={14} />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          {error && (
            <div className="form-error" style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

        <div className="form-options">
            <label className="checkbox-label">
            <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
            />
            <span>
                I agree to the{' '}
                <Link to="/terms" className="auth-link">Terms</Link>,{' '}
                <Link to="/acceptable-use" className="auth-link">Acceptable Use</Link>, and{' '}
                <Link to="/privacy" className="auth-link">Privacy Policy</Link>
            </span>
            </label>
        </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading || !passwordsMatch || !agreeTerms}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="security-badge">
          <Shield size={14} />
          <span>100% secure • No data collection • Free during beta</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
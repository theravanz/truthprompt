import { useEffect, useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import * as Icons from 'lucide-react';
import Login from './login';
import Signup from './signup';

// Types
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Auth Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('truthprompt_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (_email: string, _password: string) => {
    // TODO: Replace with Supabase auth
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    const mockUser = { id: '1', email: _email, name: _email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('truthprompt_user', JSON.stringify(mockUser));
  };

  const signup = async (_name: string, _email: string, _password: string) => {
    // TODO: Replace with Supabase auth
    // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    const mockUser = { id: '1', email: _email, name: _name };
    setUser(mockUser);
    localStorage.setItem('truthprompt_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    // TODO: Replace with Supabase auth
    // await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('truthprompt_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Landing Page Component
function LandingPage() {
  useEffect(() => {
    // Smooth scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');

    const handleScroll = () => {
      if (window.pageYOffset > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Navbar entrance animation
    if (navbar) {
      (navbar as HTMLElement).style.opacity = '0';
      (navbar as HTMLElement).style.transform = 'translateX(-50%) translateY(-20px)';

      setTimeout(() => {
        (navbar as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease, all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        (navbar as HTMLElement).style.opacity = '1';
        (navbar as HTMLElement).style.transform = 'translateX(-50%) translateY(0)';
      }, 100);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Background Effects */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="grid-overlay"></div>

      <div className="container">
        {/* Navigation */}
        <nav className="navbar">
          <div className="navbar-inner">
            <a href="#" className="logo">
              <div className="logo-icon">
                <Icons.Brain size={24} />
              </div>
              TruthPrompt
            </a>
            <div className="nav-links">
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
              <a href="#examples" onClick={(e) => { e.preventDefault(); scrollToSection('examples'); }}>Examples</a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
            </div>
            <Link to="/app" className="btn btn-primary">Try Now</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="section" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
          <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            <span className="badge fade-up">
              <Icons.Rocket size={14} style={{ marginRight: '6px' }} />
              Early Access Open
            </span>

            <h1 className="fade-up delay-1" style={{ margin: '32px 0 24px' }}>
              AI Coding Mentor That Tells The <span className="text-gradient">Truth</span>
            </h1>

            <p className="fade-up delay-2" style={{ maxWidth: '650px', margin: '0 auto 40px' }}>
              TruthPrompt analyzes your AI prompts and checks generated code for vulnerabilities, performance issues, and fragile solutions before they reach production.
            </p>

            <div className="fade-up delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/app" className="btn btn-primary btn-large">
                <Icons.Zap size={18} />
                Start Free
              </Link>
              <a href="#" className="btn btn-secondary btn-large">
                <Icons.Github size={18} />
                GitHub
              </a>
            </div>

            <div className="fade-up delay-4" style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Icons.Monitor size={14} style={{ verticalAlign: 'middle', display: 'inline' }} /> Browser-based &nbsp;•&nbsp;
              <Icons.Shield size={14} style={{ verticalAlign: 'middle', display: 'inline' }} /> 100% Private &nbsp;•&nbsp;
              <Icons.Gift size={14} style={{ verticalAlign: 'middle', display: 'inline' }} /> Free
            </div>
          </div>

          {/* Code Demo */}
          <div className="fade-up delay-4" style={{ marginTop: '100px', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="editor-preview">
              <div className="editor-header">
                <div className="editor-dots">
                  <div className="editor-dot red"></div>
                  <div className="editor-dot yellow"></div>
                  <div className="editor-dot green"></div>
                </div>
                <div className="editor-title">
                  <Icons.Terminal size={14} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Real-time Code Analysis
                </div>
              </div>
              <div className="editor-body">
                <div className="code-block" style={{ margin: 0, border: 'none', background: 'transparent' }}>
                  <span className="code-comment">// ❌ Problem: users might be undefined</span><br />
                  <span className="code-keyword">const</span> <span className="code-function">user</span> <span className="code-operator">=</span> <span className="code-function">users</span><span className="code-operator">.</span><span className="code-function">find</span>(<span className="code-function">u</span> <span className="code-operator">=&gt;</span> <span className="code-function">u</span><span className="code-operator">.</span><span className="code-function">id</span> <span className="code-operator">===</span> <span className="code-function">id</span>);<br /><br />
                  <span className="code-comment">// 💡 TruthPrompt suggests:</span><br />
                  <span className="code-keyword">const</span> <span className="code-function">user</span> <span className="code-operator">=</span> <span className="code-function">users</span><span className="code-operator">?</span><span className="code-operator">.</span><span className="code-function">find</span>(<span className="code-function">u</span> <span className="code-operator">=&gt;</span> <span className="code-function">u</span><span className="code-operator">.</span><span className="code-function">id</span> <span className="code-operator">===</span> <span className="code-function">id</span>) <span className="code-operator">??</span> <span className="code-keyword">null</span>;<br /><br />
                  <span className="code-comment">// ✅ Safe: uses optional chaining and null coalescing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Logos */}
        <div className="logos-grid">
          <span className="logo-company">Vercel</span>
          <span className="logo-company">Stripe</span>
          <span className="logo-company">Linear</span>
          <span className="logo-company">Raycast</span>
          <span className="logo-company">Supabase</span>
          <span className="logo-company">GitHub</span>
        </div>

        {/* Features */}
        <section id="features" className="section">
          <div className="section-header">
            <span className="badge fade-up">Features</span>
            <h2 className="fade-up delay-1">Everything for AI-Powered Development</h2>
            <p className="fade-up delay-2">Catch problems before they reach production</p>
          </div>

          <div className="features-grid">
            <div className="card fade-up">
              <div className="feature-icon" style={{ marginBottom: '20px' }}>
                <Icons.Target size={28} />
              </div>
              <h3>Prompt Analysis with Score</h3>
              <p style={{ marginTop: '12px' }}>
                Score 0-100 across 4 criteria: clarity, completeness, context, testability. Specific recommendations to improve every prompt.
              </p>
            </div>

            <div className="card fade-up delay-1">
              <div className="feature-icon" style={{ marginBottom: '20px' }}>
                <Icons.ShieldCheck size={28} />
              </div>
              <h3>Code Review</h3>
              <p style={{ marginTop: '12px' }}>
                20+ check categories: eval(), XSS, SQL injection, N+1 queries, missing error handling, memory leaks.
              </p>
            </div>

            <div className="card fade-up delay-2">
              <div className="feature-icon" style={{ marginBottom: '20px' }}>
                <Icons.Trophy size={28} />
              </div>
              <h3>AI Hall of Shame</h3>
              <p style={{ marginTop: '12px' }}>
                Save worst AI code examples with breakdowns. Share with team. Track progress: "AI used to write this, now better".
              </p>
            </div>

            <div className="card fade-up">
              <div className="feature-icon" style={{ marginBottom: '20px' }}>
                <Icons.BookOpen size={28} />
              </div>
              <h3>Beginner Mode</h3>
              <p style={{ marginTop: '12px' }}>
                One-click term explanations. What is eval? Why is N+1 bad? Before/after examples for every issue.
              </p>
            </div>

            <div className="card fade-up delay-1">
              <div className="feature-icon" style={{ marginBottom: '20px' }}>
                <Icons.Zap size={28} />
              </div>
              <h3>Quick Templates</h3>
              <p style={{ marginTop: '12px' }}>
                Ready-made forms: "data fetch function", "React component", "unit test". Fill fields → get perfect prompt.
              </p>
            </div>

            <div className="card fade-up delay-2">
              <div className="feature-icon" style={{ marginBottom: '20px' }}>
                <Icons.Gamepad2 size={28} />
              </div>
              <h3>Gamification</h3>
              <p style={{ marginTop: '12px' }}>
                Badges: "Bug Hunter" (50 issues), "Prompt Master" (Score ≥ 90), "Security Guru". Progress tracking and stats.
              </p>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section id="examples" className="section">
          <div className="section-header">
            <span className="badge fade-up">Examples</span>
            <h2 className="fade-up delay-1">What TruthPrompt Catches</h2>
            <p className="fade-up delay-2">Real issues from AI-generated code</p>
          </div>

          <div className="code-example-section">
            <div className="fade-up">
              <h3 style={{ marginBottom: '16px' }}>Security</h3>
              <p>eval() executes any code — direct XSS vulnerability. TruthPrompt finds it and suggests safe alternatives.</p>
              <ul className="feature-list">
                <li><Icons.CircleCheck size={20} /> Detects eval(), Function(), setTimeout(string)</li>
                <li><Icons.CircleCheck size={20} /> Checks innerHTML and XSS</li>
                <li><Icons.CircleCheck size={20} /> Hardcoded secrets</li>
                <li><Icons.CircleCheck size={20} /> SQL injection via concatenation</li>
              </ul>
            </div>
            <div className="fade-up delay-1">
              <div className="comparison-grid" style={{ marginTop: 0 }}>
                <div className="comparison-card bad">
                  <div className="comparison-label bad">
                    <Icons.CircleX size={16} /> Problem
                  </div>
                  <div className="code-block" style={{ fontSize: '0.75rem', padding: '16px' }}>
                    <span className="code-keyword">const</span> data <span className="code-operator">=</span> <span className="code-function">eval</span>(userInput);
                  </div>
                </div>
                <div className="comparison-card good">
                  <div className="comparison-label good">
                    <Icons.CircleCheck size={16} /> Solution
                  </div>
                  <div className="code-block" style={{ fontSize: '0.75rem', padding: '16px' }}>
                    <span className="code-keyword">const</span> data <span className="code-operator">=</span> JSON.<span className="code-function">parse</span>(userInput);
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="code-example-section">
            <div className="fade-up">
              <div className="comparison-grid" style={{ marginTop: 0 }}>
                <div className="comparison-card bad">
                  <div className="comparison-label bad">
                    <Icons.CircleX size={16} /> Problem
                  </div>
                  <div className="code-block" style={{ fontSize: '0.75rem', padding: '16px' }}>
                    <span className="code-keyword">for</span> (<span className="code-keyword">const</span> user <span className="code-keyword">of</span> users) {'{'}<br />
                    &nbsp;&nbsp;<span className="code-keyword">await</span> fetch(<span className="code-string">{'`/api/profile/${user.id}`'}</span>);<br />
                    {'}'}
                  </div>
                </div>
                <div className="comparison-card good">
                  <div className="comparison-label good">
                    <Icons.CircleCheck size={16} /> Solution
                  </div>
                  <div className="code-block" style={{ fontSize: '0.75rem', padding: '16px' }}>
                    <span className="code-keyword">await</span> fetch(<span className="code-string">'/api/profiles?include=all'</span>);
                  </div>
                </div>
              </div>
            </div>
            <div className="fade-up delay-1">
              <h3 style={{ marginBottom: '16px' }}>Performance</h3>
              <p>N+1 queries in loops block event loop. TruthPrompt suggests loading all data in one request.</p>
              <ul className="feature-list">
                <li><Icons.CircleCheck size={20} /> N+1 queries in loops</li>
                <li><Icons.CircleCheck size={20} /> Missing caching</li>
                <li><Icons.CircleCheck size={20} /> Sync operations (readFileSync)</li>
                <li><Icons.CircleCheck size={20} /> Large loops without optimization</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section" style={{ background: 'rgba(255, 255, 255, 0.01)', margin: '0 -24px', paddingLeft: '24px', paddingRight: '24px', backdropFilter: 'blur(10px)' }}>
          <div className="section-header">
            <span className="badge fade-up">Process</span>
            <h2 className="fade-up delay-1">Simple Process — Better Results</h2>
          </div>

          <div className="steps">
            <div className="step fade-up">
              <div className="step-number">01</div>
              <div className="step-icon">
                <Icons.Pencil size={28} />
              </div>
              <h3>Enter Your Prompt</h3>
              <p style={{ marginTop: '12px' }}>
                Describe your task: "write a function to fetch users". TruthPrompt highlights vague parts and missing details.
              </p>
            </div>

            <div className="step fade-up delay-1">
              <div className="step-number">02</div>
              <div className="step-icon">
                <Icons.Sparkles size={28} />
              </div>
              <h3>Improve Your Prompt</h3>
              <p style={{ marginTop: '12px' }}>
                Get Score 0-100 and recommendations: "Add return format", "Specify error handling".
              </p>
            </div>

            <div className="step fade-up delay-2">
              <div className="step-number">03</div>
              <div className="step-icon">
                <Icons.CircleCheck size={28} />
              </div>
              <h3>Review Generated Code</h3>
              <p style={{ marginTop: '12px' }}>
                AI generate code → TruthPrompt finds issues → you get fixes and learn from mistakes.
              </p>
            </div>
          </div>
        </section>

        {/* Event Log */}
        <section className="section">
          <div className="section-header">
            <span className="badge fade-up">Test Mode</span>
            <h2 className="fade-up delay-1">Experiment Without Risk</h2>
            <p className="fade-up delay-2">Test prompts without affecting real code</p>
          </div>

          <div className="code-example-section">
            <div className="fade-up">
              <div className="editor-preview">
                <div className="editor-header">
                  <div className="editor-dots">
                    <div className="editor-dot red"></div>
                    <div className="editor-dot yellow"></div>
                    <div className="editor-dot green"></div>
                  </div>
                  <div className="editor-title">Recent Events</div>
                </div>
                <div className="event-log">
                  <div className="event-item">
                    <span className="event-status success">✓ improved</span>
                    <span className="event-message">"find user" → added optional chaining</span>
                    <span className="event-time">2m ago</span>
                  </div>
                  <div className="event-item">
                    <span className="event-status warning">⚠️ warning</span>
                    <span className="event-message">potential memory leak in useEffect</span>
                    <span className="event-time">15m ago</span>
                  </div>
                  <div className="event-item">
                    <span className="event-status info">ℹ️ info</span>
                    <span className="event-message">could replace .map with loop</span>
                    <span className="event-time">1h ago</span>
                  </div>
                  <div className="event-item">
                    <span className="event-status error">✕ error</span>
                    <span className="event-message">unhandled Promise in async</span>
                    <span className="event-time">yesterday</span>
                  </div>
                  <div className="event-item">
                    <span className="event-status success">✓ improved</span>
                    <span className="event-message">replaced eval with JSON.parse</span>
                    <span className="event-time">yesterday</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="fade-up delay-1">
              <h3 style={{ marginBottom: '16px' }}>Analysis History</h3>
              <p>All prompts and reviews saved locally. No telemetry — your data stays on your device.</p>
              <ul className="feature-list" style={{ marginTop: '24px' }}>
                <li><Icons.CircleCheck size={20} /> Full prompt history</li>
                <li><Icons.CircleCheck size={20} /> Improvement statistics</li>
                <li><Icons.CircleCheck size={20} /> Common mistakes and patterns</li>
                <li><Icons.CircleCheck size={20} /> Export to Markdown/JSON</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="section" style={{ background: 'rgba(255, 255, 255, 0.01)', margin: '0 -24px', padding: '80px 24px', backdropFilter: 'blur(10px)' }}>
          <div className="section-header">
            <span className="badge fade-up">Templates</span>
            <h2 className="fade-up delay-1">Ready-Made Forms for Common Tasks</h2>
            <p className="fade-up delay-2">Fill fields → get perfect prompt</p>
          </div>

          <div className="template-grid">
            <div className="template-card fade-up">
              <div className="template-name">
                <Icons.Download size={16} />
                Fetch Function
              </div>
              <div className="template-desc">GET request to API with error handling and timeout</div>
            </div>
            <div className="template-card fade-up delay-1">
              <div className="template-name">
                <Icons.FileJson size={16} />
                React Component
              </div>
              <div className="template-desc">Form with validation, state, and submit handling</div>
            </div>
            <div className="template-card fade-up delay-2">
              <div className="template-name">
                <Icons.CircleHelp size={16} />
                Unit Test
              </div>
              <div className="template-desc">Tests with mocks and edge case coverage</div>
            </div>
            <div className="template-card fade-up">
              <div className="template-name">
                <Icons.Database size={16} />
                SQL Query
              </div>
              <div className="template-desc">Safe query with parameters and error handling</div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section">
          <div className="stats-grid">
            <div className="fade-up">
              <div className="stat-value">6</div>
              <div className="stat-label">core features</div>
            </div>
            <div className="fade-up delay-1">
              <div className="stat-value">20+</div>
              <div className="stat-label">check categories</div>
            </div>
            <div className="fade-up delay-2">
              <div className="stat-value">100%</div>
              <div className="stat-label">privacy</div>
            </div>
            <div className="fade-up delay-3">
              <div className="stat-value">0</div>
              <div className="stat-label">data collection</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section" style={{ background: 'rgba(255, 255, 255, 0.01)', margin: '0 -24px', padding: '80px 24px', backdropFilter: 'blur(10px)' }}>
          <div className="section-header">
            <span className="badge fade-up">FAQ</span>
            <h2 className="fade-up delay-1">Frequently Asked Questions</h2>
            <p className="fade-up delay-2">Everything you need to know</p>
          </div>

          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gap: '16px' }}>
            <div className="card fade-up" style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>How does it work?</h3>
              <p style={{ fontSize: '0.9375rem' }}>
                Enter your AI prompt → TruthPrompt analyzes and gives Score → get improvement recommendations → send improved prompt to AI → check generated code for vulnerabilities.
              </p>
            </div>

            <div className="card fade-up delay-1" style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>Is it free?</h3>
              <p style={{ fontSize: '0.9375rem' }}>
                Yes, all features are free during early access. After launch, a free tier with basic features will remain.
              </p>
            </div>

            <div className="card fade-up delay-2" style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>Where is my data stored?</h3>
              <p style={{ fontSize: '0.9375rem' }}>
                All data is stored locally in your browser. No telemetry — your prompts and code never leave your device.
              </p>
            </div>

            <div className="card fade-up" style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>Which AI services are supported?</h3>
              <p style={{ fontSize: '0.9375rem' }}>
                TruthPrompt works with any AI: ChatGPT, Claude, Gemini, Qwen, and others. Analysis happens independently of which AI you use.
              </p>
            </div>

            <div className="card fade-up delay-1" style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>Do I need to sign up?</h3>
              <p style={{ fontSize: '0.9375rem' }}>
                No. TruthPrompt works without registration. Just open and start using.
              </p>
            </div>

            <div className="card fade-up delay-2" style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>Will there be a VS Code extension?</h3>
              <p style={{ fontSize: '0.9375rem' }}>
                Yes, extension is in development. We're launching web version first, then porting functionality to VS Code.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="cta-card fade-up">
            <span className="badge" style={{ marginBottom: '24px' }}>
              <Icons.Rocket size={14} style={{ marginRight: '6px' }} />
              Early Access
            </span>
            <h2 style={{ marginBottom: '16px' }}>Write Better Code with AI</h2>
            <p style={{ marginBottom: '32px' }}>
              TruthPrompt catches issues before they reach production. Save hours on debugging and learn to write quality code.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxWidth: '400px', margin: '0 auto 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Icons.Clock size={20} style={{ color: '#4ade80' }} />
                <span style={{ fontSize: '0.9375rem' }}>Save 5+ hours/week on debugging</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Icons.TrendingUp size={20} style={{ color: '#4ade80' }} />
                <span style={{ fontSize: '0.9375rem' }}>Improve code quality by 95%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Icons.ShieldCheck size={20} style={{ color: '#4ade80' }} />
                <span style={{ fontSize: '0.9375rem' }}>Find vulnerabilities before deploy</span>
              </div>
            </div>
            <Link to="/app" className="btn btn-primary btn-large" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}>
              <Icons.Zap size={18} />
              Try Free
            </Link>
            <p style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <Icons.Monitor size={14} style={{ verticalAlign: 'middle', display: 'inline' }} /> Browser-based •
              <Icons.Gift size={14} style={{ verticalAlign: 'middle', display: 'inline' }} /> Free during beta
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="logo">
                <div className="logo-icon">
                  <Icons.Brain size={24} />
                </div>
                TruthPrompt
              </a>
              <p>AI coding mentor that tells the truth — not just what you want to hear.</p>
            </div>

            <div>
              <div className="footer-title">Product</div>
              <ul className="footer-links">
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
                <li><a href="#examples" onClick={(e) => { e.preventDefault(); scrollToSection('examples'); }}>Examples</a></li>
                <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a></li>
                <li><a href="#roadmap" onClick={(e) => e.preventDefault()}>Roadmap</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-title">Resources</div>
              <ul className="footer-links">
                <li><a href="#" onClick={(e) => e.preventDefault()}>Documentation</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Blog</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Community</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Support</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-title">Company</div>
              <ul className="footer-links">
                <li><a href="#" onClick={(e) => e.preventDefault()}>About</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Terms</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 TruthPrompt. MIT License.</p>
            <div className="social-links">
              <a href="#" onClick={(e) => e.preventDefault()}><Icons.Github size={18} /></a>
              <a href="#" onClick={(e) => e.preventDefault()}><Icons.Twitter size={18} /></a>
              <a href="#" onClick={(e) => e.preventDefault()}><Icons.MessageCircle size={18} /></a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// App Page Component (Protected)
function AppPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Icons.Brain size={24} />
            </div>
            TruthPrompt
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {user?.email}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <section className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <h1 className="fade-up">TruthPrompt App</h1>
        <p className="fade-up delay-1" style={{ color: 'var(--text-muted)', marginTop: '16px' }}>
          Welcome, {user?.name}! Start analyzing your AI prompts here.
        </p>
        <div className="fade-up delay-2" style={{ marginTop: '40px', maxWidth: '600px', margin: '40px auto 0' }}>
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>🚀 Coming Soon</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              The main application interface is under development. 
              You'll be able to enter AI prompts, get analysis scores, and review generated code here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main App Component with Routes
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

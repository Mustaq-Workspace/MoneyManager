import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Smartphone, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container">
          <div className="landing-nav-inner">
            <div className="brand">
              <DollarSign className="brand-icon" />
              <span className="brand-text">Money Manager</span>
            </div>
            <div className="nav-actions">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-success">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Take Control of Your <span className="accent">Finances</span>
            </h1>
            <p className="hero-subtitle">
              Simple, intuitive expense tracking that helps you understand your spending patterns, 
              set budgets, and achieve your financial goals.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-success btn-lg hero-cta">
                <span>Start Free</span>
                <ArrowRight className="btn-icon" />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything you need to manage your money</h2>
            <p className="section-subtitle">Powerful features designed to make expense tracking simple and insightful</p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <TrendingUp />
              </div>
              <h3 className="feature-title">Smart Analytics</h3>
              <p className="feature-text">Get insights into your spending patterns with beautiful charts and detailed reports.</p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon feature-icon-blue">
                <PieChart />
              </div>
              <h3 className="feature-title">Category Tracking</h3>
              <p className="feature-text">Organize expenses by categories and see where your money goes each month.</p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon feature-icon-purple">
                <Smartphone />
              </div>
              <h3 className="feature-title">Cross-Platform</h3>
              <p className="feature-text">Access your data from anywhere - web, mobile, and tablet devices.</p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon feature-icon-red">
                <Shield />
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-text">Your financial data is encrypted and stored securely on your device.</p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon feature-icon-yellow">
                <Zap />
              </div>
              <h3 className="feature-title">Quick Entry</h3>
              <p className="feature-text">Add expenses in seconds with our streamlined interface and smart defaults.</p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon feature-icon-indigo">
                <CheckCircle />
              </div>
              <h3 className="feature-title">Budget Goals</h3>
              <p className="feature-text">Set monthly budgets and track your progress towards financial goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container cta-inner">
          <h2 className="cta-title">Ready to take control of your finances?</h2>
          <p className="cta-subtitle">Join thousands of users who are already managing their money smarter.</p>
          <Link to="/register" className="btn btn-light btn-lg cta-btn">
            <span>Get Started Free</span>
            <ArrowRight className="btn-icon" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <DollarSign className="footer-icon" />
            <span className="footer-text">Money Manager</span>
          </div>
          <p className="footer-tagline">Simple expense tracking for everyone</p>
          <div className="footer-links">
            <Link to="/login" className="footer-link">Login</Link>
            <Link to="/register" className="footer-link">Register</Link>
          </div>
          <div className="footer-copy">© 2024 Money Manager. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
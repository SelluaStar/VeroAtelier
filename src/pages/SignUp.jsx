import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Auth.css';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      // Generate 5-digit verification code
      const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Store verification code in database
      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt
        });

      if (insertError) throw insertError;

      // TODO: Send email with verification code
      // For now, we'll pass the code to the verification page for testing
      console.log('Verification code:', verificationCode);

      // Navigate to verification page
      navigate('/verify-email', {
        state: { email, password, fullName, tempCode: verificationCode }
      });
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-back">
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">VA</div>
            <h1>Create your account</h1>
            <p>Join VeroAtelier today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Continue'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

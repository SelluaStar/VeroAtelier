import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './VerifyEmail.css';

function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const password = location.state?.password || '';
  const fullName = location.state?.fullName || '';
  const tempCode = location.state?.tempCode || ''; // Temporary for testing
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
    // Show the code in console for testing
    if (tempCode) {
      console.log('Your verification code is:', tempCode);
    }
  }, [email, navigate, tempCode]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 5);
    const newCode = pastedData.split('');

    while (newCode.length < 5) {
      newCode.push('');
    }

    setCode(newCode.slice(0, 5));
    inputRefs.current[Math.min(pastedData.length, 4)]?.focus();
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt
        });

      if (insertError) throw insertError;

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 5) {
      setError('Please enter all 5 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data: verificationData, error: verifyError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', verificationCode)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verifyError || !verificationData) {
        setError('Invalid or expired verification code');
        setLoading(false);
        return;
      }

      await supabase
        .from('verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData?.user) {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/signup" className="auth-back">
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="verify-card">
          <div className="verify-header">
            <div className="verify-icon">
              <Mail size={32} />
            </div>
            <h1>Check your email</h1>
            <p>Enter the verification code sent to</p>
            <p className="verify-email">{email}</p>
            {tempCode && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#667eea'
              }}>
                Testing Mode: Your code is <strong>{tempCode}</strong>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="verify-form">
            {error && <div className="auth-error">{error}</div>}
            {resendSuccess && <div className="auth-success">Code sent successfully!</div>}

            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="code-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="resend-section">
              <span>Didn't get your code? </span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="resend-link"
              >
                {resendLoading ? 'Sending...' : 'Send a new Code'}
              </button>
            </div>

            <button type="submit" className="verify-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;

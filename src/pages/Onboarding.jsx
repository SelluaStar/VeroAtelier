import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Upload } from 'lucide-react';
import './Onboarding.css';

function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    phone: '',
    city: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const { user, loading: authLoading, createProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to signin if not authenticated after loading
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData((prev) => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('You must be signed in to complete onboarding.');
      navigate('/signin');
      return;
    }

    setLoading(true);
    try {
      await createProfile(formData);
      navigate('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.full_name.trim().length > 0;
    }
    return true;
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-container">
          <div className="onboarding-card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">Step {step} of 2</div>
          </div>

          <div className="onboarding-content">
            {step === 1 && (
              <div className="onboarding-step">
                <div className="step-header">
                  <div className="step-icon">
                    <User size={28} />
                  </div>
                  <h1>Tell us about yourself</h1>
                  <p>Let's personalize your experience</p>
                </div>

                <div className="step-form">
                  <div className="avatar-upload">
                    <div className="avatar-circle">
                      {avatarPreview || formData.avatar_url ? (
                        <img src={avatarPreview || formData.avatar_url} alt="Avatar" />
                      ) : (
                        <User size={32} />
                      )}
                    </div>
                    <label htmlFor="avatar-file" className="avatar-upload-btn">
                      <Upload size={16} />
                      Upload photo
                    </label>
                    <input
                      id="avatar-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="full_name">Full name</label>
                    <input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone number (optional)</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="onboarding-step">
                <div className="step-header">
                  <div className="step-icon">
                    <MapPin size={28} />
                  </div>
                  <h1>Where are you located?</h1>
                  <p>Help us personalize your shopping experience</p>
                </div>

                <div className="step-form">
                  <div className="form-group">
                    <label htmlFor="city">City (optional)</label>
                    <input
                      id="city"
                      type="text"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country (optional)</label>
                    <input
                      id="country"
                      type="text"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                    />
                  </div>

                  <div className="onboarding-note">
                    <p>
                      You can always update this information later in your account
                      settings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="onboarding-actions">
            {step > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                disabled={!isStepValid()}
                style={step === 1 ? { flex: 1 } : {}}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Completing...' : 'Complete setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;

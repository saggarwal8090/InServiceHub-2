import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [pendingGoogleData, setPendingGoogleData] = useState(null);
    const { login, loginWithGoogle, completeGoogleLogin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await login(email, password);
        if (res.success) {
            if (res.role === 'provider') {
                navigate('/provider-dashboard');
            } else {
                navigate('/');
            }
        } else {
            setError(res.message || 'Login failed. Check your email and password.');
        }
        setLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        const res = await loginWithGoogle(credentialResponse.credential);
        
        if (res.isNewUser) {
            setPendingGoogleData(res.googleData);
            setShowRoleSelector(true);
        } else if (res.success) {
            if (res.role === 'provider') {
                navigate('/provider-dashboard');
            } else {
                navigate('/');
            }
        } else {
            setError(res.message || 'Google Login failed.');
        }
        setLoading(false);
    };

    const handleRoleSelection = async (role) => {
        setLoading(true);
        const res = await completeGoogleLogin(pendingGoogleData.token, role);
        if (res.success) {
            if (res.role === 'provider') {
                navigate('/provider-dashboard');
            } else {
                navigate('/');
            }
        } else {
            setError(res.message);
            setShowRoleSelector(false);
        }
        setLoading(false);
    };

    if (showRoleSelector) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>One Last Step</h2>
                        <p className="auth-subtitle">How would you like to use InServiceHub?</p>
                    </div>
                    <div className="role-selection-options" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <button className="auth-btn" onClick={() => handleRoleSelection('customer')}>
                            I want to Hire Professionals
                        </button>
                        <button className="auth-btn provider-select-btn" onClick={() => handleRoleSelection('provider')} style={{ background: '#10b981' }}>
                            I want to Provide Services
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon-circle">
                        <LogIn size={24} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Log in to your InServiceHub account</p>
                </div>
                {error && <div className="error-msg">⚠️ {error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><Mail size={14} /> Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            id="login-email"
                        />
                    </div>
                    <div className="input-group">
                        <label><Lock size={14} /> Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                id="login-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading} id="login-submit">
                        {loading ? (
                            <><span className="btn-spinner"></span> Please wait...</>
                        ) : (
                            <><LogIn size={18} /> Login</>
                        )}
                    </button>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={() => setError('Google Login verification failed')} 
                        />
                    </div>
                    <p className="auth-switch">
                        Don't have an account? <span onClick={() => navigate('/register')}>Create one for free</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;

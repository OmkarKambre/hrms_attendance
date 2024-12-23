import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';
import companyLogo from './company-logo.png';
import { supabase } from '../../supabaseClient'; // Import the Supabase client

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('employee'); // Default to employee
  const [isAdminLogin, setIsAdminLogin] = useState(false); // State for admin login
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userType === 'employee') {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, name, email, password, pno, dept, position, created_at, leave_count')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (error || !data) {
          setError('Invalid credentials for Employee login.');
        } else {
          localStorage.setItem('employee', JSON.stringify(data));
          onLogin(true, 'employee');
          navigate('/MarkAttendance');
        }
      } catch (err) {
        setError('Unexpected error occurred.');
      }
    } else if (userType === 'admin') {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError('Invalid credentials for Admin login.');
        } else {
          localStorage.setItem('user', 'admin');
          onLogin(true, 'admin');
          navigate('/dashboard');
        }
      } catch (err) {
        setError('Unexpected error occurred.');
      }
    }
  };

  return (
    <div className="login-page-body">
      <div className="login-container">
        <img src={companyLogo} alt="Company Logo" className="company-logo-LoginForm" />
        <form onSubmit={handleSubmit} className="login-form">
          {isAdminLogin ? (
            <>
              <button 
                type="button" 
                className="back-button" 
                onClick={() => {
                  setIsAdminLogin(false);
                  setUserType('employee'); // Reset userType to employee
                  setEmail(''); // Reset email field
                  setPassword(''); // Reset password field
                  setError(''); // Clear any error messages
                }}
              >
                Back
              </button>
              <label htmlFor="email" className="login-label">Admin Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
              <label htmlFor="password" className="login-label">Admin Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </>
          ) : (
            <>
              <label htmlFor="email" className="login-label">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
              <label htmlFor="password" className="login-label">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </>
          )}
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">Login</button>
          <a 
            href="#"
            onClick={() => {
              setUserType('admin');
              setIsAdminLogin(true);
            }}
            className="login-as-admin-link"
          >
            Login as Admin
          </a>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

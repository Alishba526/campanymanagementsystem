'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Swal from 'sweetalert2';

export default function EmployeeLoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation effect on load
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        Swal.fire({
          title: 'Access Granted',
          text: 'Loading your personal portal...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: 'var(--bg2)',
          color: 'var(--text)',
          iconColor: 'var(--green)'
        });
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: 'The credentials you entered do not match our records.',
          icon: 'error',
          confirmButtonColor: 'var(--accent)',
          background: 'var(--bg2)',
          color: 'var(--text)'
        });
      }
    } catch (err) {
      Swal.fire('Connection Error', 'Please check your internet and try again.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, var(--accent) -80%, var(--bg) 60%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: 'inherit'
    }}>
      <div style={{ 
        background: 'var(--bg2)', 
        border: '1px solid var(--border)', 
        borderRadius: '32px', 
        padding: '60px 45px', 
        width: '100%', 
        maxWidth: '480px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
        textAlign: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Decorative Element */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent)', opacity: 0.03, borderRadius: '50%' }} />
        
        <div style={{ 
          width: '72px', 
          height: '72px', 
          background: 'linear-gradient(135deg, var(--accent), var(--primary))', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '32px', 
          margin: '0 auto 24px',
          boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.3)',
          color: '#fff'
        }}>
          👤
        </div>
        
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-1px' }}>
          Staff Login
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text3)', marginBottom: '45px', fontWeight: '500' }}>
          Sign in to access your attendance & records
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text2)', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Username or ID
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>🆔</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: 'var(--bg3)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px', 
                  padding: '16px 16px 16px 48px', 
                  color: 'var(--text)', 
                  fontSize: '15px', 
                  outline: 'none', 
                  transition: 'all 0.2s ease' 
                }}
                className="custom-input"
                placeholder="EMP-001"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text2)', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Secret Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>🔑</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: 'var(--bg3)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px', 
                  padding: '16px 48px 16px 48px', 
                  color: 'var(--text)', 
                  fontSize: '15px', 
                  outline: 'none', 
                  transition: 'all 0.2s ease' 
                }}
                className="custom-input"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.5 }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            style={{ 
              width: '100%', 
              background: 'var(--accent)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '16px', 
              padding: '20px', 
              fontSize: '16px', 
              fontWeight: '800', 
              cursor: isLoggingIn ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s ease', 
              boxShadow: '0 12px 24px rgba(var(--accent-rgb), 0.25)',
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {isLoggingIn ? (
              <>
                <div className="spinner" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Secure Login</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '45px', paddingTop: '25px', borderTop: '1px solid var(--border)' }}>
          <a 
            href="/" 
            style={{ color: 'var(--text3)', textDecoration: 'none', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
          >
            <span>🏠</span> Back to Admin Portal
          </a>
        </div>
      </div>

      <style jsx>{`
        .custom-input:focus {
          border-color: var(--accent) !important;
          background: var(--bg) !important;
          box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

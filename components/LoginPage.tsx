'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        Swal.fire({
          title: 'Welcome Back',
          text: 'Establishing secure session...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: 'var(--bg2)',
          color: 'var(--text)',
          iconColor: 'var(--accent)'
        });
      } else {
        Swal.fire({
          title: 'Access Denied',
          text: 'Invalid credentials. Please verify your details.',
          icon: 'error',
          confirmButtonColor: 'var(--accent)',
          background: 'var(--bg2)',
          color: 'var(--text)'
        });
      }
    } catch (err) {
      Swal.fire('System Error', 'Could not reach server. Please try again.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 0% 0%, var(--accent) -100%, var(--bg) 50%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px'
    }}>
      <div style={{ 
        background: 'var(--bg2)', 
        border: '1px solid var(--border)', 
        borderRadius: '35px', 
        padding: '50px 45px', 
        width: '100%', 
        maxWidth: '460px', 
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)', 
        textAlign: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', justifyContent: 'center' }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            background: 'linear-gradient(135deg, var(--accent), var(--primary))', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '26px',
            boxShadow: '0 8px 16px rgba(var(--accent-rgb), 0.3)',
            color: '#fff'
          }}>
            🚀
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text)', letterSpacing: '-0.5px' }}>GROWZIX</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Enterprise OS</div>
          </div>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>Secure Access</h2>
        <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '35px', fontWeight: '500' }}>Enter your credentials to manage your workspace</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text2)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '14px', padding: '15px', color: 'var(--text)', fontSize: '15px', outline: 'none', transition: '0.2s' }}
              placeholder="admin@growzix.com"
              required
              className="login-input"
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text2)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '14px', padding: '15px', color: 'var(--text)', fontSize: '15px', outline: 'none', transition: '0.2s' }}
              placeholder="••••••••"
              required
              className="login-input"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '15px', bottom: '13px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '18px' }}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            style={{ 
              width: '100%', 
              background: 'var(--accent)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '14px', 
              padding: '18px', 
              fontSize: '16px', 
              fontWeight: '800', 
              cursor: isLoggingIn ? 'not-allowed' : 'pointer', 
              transition: '0.3s', 
              boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.2)',
              marginTop: '10px'
            }}
          >
            {isLoggingIn ? '⌛ Authenticating...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '35px', padding: '15px', background: 'var(--bg3)', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>
          🛡️ This connection is encrypted and monitored for security.
        </div>
      </div>

      <style jsx>{`
        .login-input:focus {
          border-color: var(--accent) !important;
          background: var(--bg) !important;
        }
      `}</style>
    </div>
  );
}


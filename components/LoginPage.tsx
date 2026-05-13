'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const roleConfig = {
    admin: {
      icon: '👑',
      label: 'Admin',
      defaultEmail: 'admin@growzix.com',
      defaultPassword: 'Admin@2024#Secure'
    },
    ecommerce: {
      icon: '🛒',
      label: 'Manager Ecommerce',
      defaultEmail: 'ecommerce@growzix.com',
      defaultPassword: 'Ecom$Manager789'
    },
    marketing: {
      icon: '📢',
      label: 'Manager Marketing',
      defaultEmail: 'marketing@growzix.com',
      defaultPassword: 'Market!ng456Pro'
    },
    architecture: {
      icon: '🏗️',
      label: 'Manager Architecture',
      defaultEmail: 'architecture@growzix.com',
      defaultPassword: 'Arch#Tech321Mgr'
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(roleConfig[role].defaultEmail);
    setPassword(''); // Don't auto-fill password for security
    setError('');
  };

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        Swal.fire({
          title: 'Success!',
          text: 'Login successful',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        setError('Invalid email or password');
        Swal.fire({
          title: 'Error!',
          text: 'Invalid credentials',
          icon: 'error'
        });
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Connection error. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🚀
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)' }}>GROWZIX</div>
            <div style={{ fontSize: '11px', color: 'var(--text2)' }}>AI-Powered Enterprise System</div>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', marginBottom: '20px', width: '100%', justifyContent: 'center' }}>
          <span>🔒</span> Role-Based Secure Access
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text2)', textAlign: 'center', marginBottom: '28px' }}>Select your role to continue</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {(Object.keys(roleConfig) as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              style={{
                background: selectedRole === role ? 'var(--accentbg)' : 'var(--bg3)',
                border: selectedRole === role ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '14px 8px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: '.2s',
                color: selectedRole === role ? 'var(--text)' : 'var(--text2)'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{roleConfig[role].icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase' }}>
                {roleConfig[role].label}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
              placeholder="Enter your email"
              required
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
              placeholder="Enter your password"
              required
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{ background: 'var(--redbg)', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 'var(--radius)', padding: '12px 14px', fontSize: '13px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            style={{ width: '100%', background: isLoggingIn ? 'var(--accent2)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '13px', fontSize: '15px', fontWeight: '700', cursor: isLoggingIn ? 'not-allowed' : 'pointer', transition: '.2s', opacity: isLoggingIn ? 0.7 : 1 }}
            onMouseEnter={(e) => !isLoggingIn && (e.currentTarget.style.background = 'var(--accent2)')}
            onMouseLeave={(e) => !isLoggingIn && (e.currentTarget.style.background = 'var(--accent)')}
          >
            {isLoggingIn ? '⌛ Logging in...' : '🔐 Enter System'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius2)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
            🔐 Secure Login - Contact admin for credentials
          </div>
        </div>
      </div>
    </div>
  );
}

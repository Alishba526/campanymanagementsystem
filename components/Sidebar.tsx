'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import type { ThemeColor } from '@/context/AppContext';

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const { currentUser, logout, themeColor, themeMode, setThemeColor, setThemeMode } = useApp();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  if (!currentUser) return null;

  const navigation = {
    admin: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'analytics', icon: '📈', label: 'Department Reports' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' },
        { id: 'reports', icon: '📋', label: 'Business Reports' },
        { id: 'monthlyslips', icon: '📄', label: 'Employee Reports' },
        { id: 'audit', icon: '🔍', label: 'Activity Log' },
        { id: 'projects', icon: '📁', label: 'Client Projects' }
      ]},
      { section: 'HR Management', items: [
        { id: 'employees', icon: '👥', label: 'Employees' },
        { id: 'attendance', icon: '⏰', label: 'Daily Attendance' },
        { id: 'deptattendance', icon: '📊', label: 'Dept. Attendance' },
        { id: 'schedule', icon: '📅', label: 'Work Schedule' },
        { id: 'performance', icon: '🎯', label: 'Performance' },
        { id: 'leave', icon: '🏖️', label: 'Leave Requests' }
      ]},
      { section: 'Finance', items: [
        { id: 'financialoverview', icon: '📊', label: 'Financial Overview' },
        { id: 'finance', icon: '💰', label: 'Income & Profit' },
        { id: 'expenses', icon: '🧾', label: 'Expenses' },
        { id: 'expensesdept', icon: '🏢', label: 'Dept. Expenses' },
        { id: 'bills', icon: '📋', label: 'Company Bills' },
        { id: 'payroll', icon: '💳', label: 'Payroll' }
      ]}
    ],
    ecommerce: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' }
      ]},
      { section: 'Work', items: [
        { id: 'projects', icon: '📁', label: 'Active Projects' }
      ]},
      { section: 'Team Management', items: [
        { id: 'employees', icon: '👥', label: 'My Team' },
        { id: 'attendance', icon: '⏰', label: 'Attendance' },
        { id: 'performance', icon: '📈', label: 'Performance' },
        { id: 'leave', icon: '📅', label: 'Leave Requests' }
      ]}
    ],
    marketing: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' }
      ]},
      { section: 'Work', items: [
        { id: 'projects', icon: '📁', label: 'Active Projects' }
      ]},
      { section: 'Team Management', items: [
        { id: 'employees', icon: '👥', label: 'My Team' },
        { id: 'attendance', icon: '⏰', label: 'Attendance' },
        { id: 'performance', icon: '📈', label: 'Performance' },
        { id: 'leave', icon: '📅', label: 'Leave Requests' }
      ]}
    ],
    architecture: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' }
      ]},
      { section: 'Work', items: [
        { id: 'projects', icon: '📁', label: 'Active Projects' }
      ]},
      { section: 'Team Management', items: [
        { id: 'employees', icon: '👥', label: 'My Team' },
        { id: 'attendance', icon: '⏰', label: 'Attendance' },
        { id: 'performance', icon: '📈', label: 'Performance' },
        { id: 'leave', icon: '📅', label: 'Leave Requests' }
      ]}
    ]
  };

  const nav = navigation[currentUser.role];

  const themeOptions: { color: ThemeColor; label: string; icon: string }[] = [
    { color: 'purple', label: 'Purple', icon: '🟣' },
    { color: 'blue', label: 'Blue', icon: '🔵' },
    { color: 'green', label: 'Green', icon: '🟢' },
    { color: 'orange', label: 'Orange', icon: '🟠' },
    { color: 'red', label: 'Red', icon: '🔴' },
    { color: 'teal', label: 'Teal', icon: '🔷' },
    { color: 'light', label: 'Light', icon: '⚪' }
  ];

  return (
    <div style={{ width: '220px', minWidth: '220px', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
          🚀
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', letterSpacing: '1px' }}>GROWZIX</div>
          <div style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            v2.0 PRO
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {nav.map((section, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text2)', padding: '8px 10px 4px' }}>
              {section.section}
            </div>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  color: currentPage === item.id ? 'var(--accent)' : 'var(--text2)',
                  transition: '.2s',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: currentPage === item.id ? '700' : 'normal',
                  background: currentPage === item.id ? 'var(--accentbg)' : 'transparent',
                  border: currentPage === item.id ? '1px solid var(--accent)' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = 'var(--bg3)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text2)';
                  }
                }}
              >
                <span style={{ fontSize: '17px', minWidth: '17px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* User Info */}
      <div style={{ padding: '14px', borderTop: '1px solid var(--border)' }}>
        {/* Theme Selector */}
        <div style={{ marginBottom: '12px', position: 'relative' }}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', transition: '.15s', color: 'var(--text2)', fontSize: '12px' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎨 <span>Theme</span>
            </span>
            <span>{themeOptions.find(t => t.color === themeColor)?.icon}</span>
          </button>

          {showThemeMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowThemeMenu(false)} />
              <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '8px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '10px', padding: '6px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                {themeOptions.map(option => (
                  <button
                    key={option.color}
                    onClick={() => {
                      setThemeColor(option.color);
                      setShowThemeMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: themeColor === option.color ? 'var(--accentbg)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: '.15s',
                      color: themeColor === option.color ? 'var(--accent2)' : 'var(--text2)',
                      fontSize: '12px',
                      fontWeight: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (themeColor !== option.color) {
                        e.currentTarget.style.background = 'var(--bg3)';
                        e.currentTarget.style.color = 'var(--text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (themeColor !== option.color) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text2)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{option.icon}</span>
                    <span>{option.label}</span>
                    {themeColor === option.color && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dark/Light Mode Toggle */}
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', transition: '.15s', color: 'var(--text2)', fontSize: '12px' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {themeMode === 'light' ? '☀️' : '🌙'} <span>{themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            <span style={{ fontSize: '10px', fontWeight: 'normal' }}>Toggle</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'normal', background: 'var(--accentbg)', color: 'var(--accent2)' }}>
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              {currentUser.role}
            </div>
          </div>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '16px', transition: '.15s' }}
            title="Logout"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text2)'}
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}

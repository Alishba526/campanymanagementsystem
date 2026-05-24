'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import type { ThemeColor } from '@/context/AppContext';

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const { currentUser, logout, themeColor, themeMode, setThemeColor, setThemeMode, notifications, markCategoryNotificationsAsRead } = useApp();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  if (!currentUser) return null;

  const handleNavClick = (id: string) => {
    markCategoryNotificationsAsRead(id);
    onNavigate(id);
  };

  const getUnreadCount = (itemId: string) => {
    if (!notifications) return 0;
    // Filter notifications that are unread AND not sent by the current user
    const unread = notifications.filter(n => !n.read && n.sender !== currentUser.name);
    
    if (itemId === 'broadcast') return unread.filter(n => n.title.toLowerCase().includes('announcement')).length;
    if (itemId === 'leave') return unread.filter(n => n.title.toLowerCase().includes('leave')).length;
    if (itemId === 'attendance' || itemId === 'deptattendance') return unread.filter(n => n.title.toLowerCase().includes('attendance') || n.title.toLowerCase().includes('break')).length;
    if (itemId === 'employees') return unread.filter(n => n.title.toLowerCase().includes('employee')).length;
    
    if (itemId === 'dashboard') {
      // Dashboard shows general system alerts not covered by specific pages
      return unread.filter(n => 
        !n.title.toLowerCase().includes('announcement') && 
        !n.title.toLowerCase().includes('leave') && 
        !n.title.toLowerCase().includes('attendance') && 
        !n.title.toLowerCase().includes('break') &&
        !n.title.toLowerCase().includes('employee')
      ).length;
    }
    return 0;
  };

  const navigation = {
    admin: [
      { section: 'Overview', items: [
        { id: 'financialoverview', icon: '📊', label: 'Financial Overview' },
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'projects', icon: '📁', label: 'Client Projects' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' }
      ]},
      { section: 'HR Management', items: [
        { id: 'employees', icon: '👥', label: 'Employees' },
        { id: 'attendance', icon: '⏰', label: 'Daily Attendance' },
        { id: 'deptattendance', icon: '📊', label: 'Dept. Attendance' },
        { id: 'leave', icon: '🏖️', label: 'Leave Requests' },
        { id: 'performance', icon: '🎯', label: 'Performance' },
        { id: 'schedule', icon: '📅', label: 'Work Schedule' }
      ]},
      { section: 'Finance', items: [
        { id: 'payroll', icon: '💳', label: 'Payroll' },
        { id: 'finance', icon: '💰', label: 'Income & Profit' },
        { id: 'expenses', icon: '🧾', label: 'Expenses' },
        { id: 'expensesdept', icon: '🏢', label: 'Dept. Expenses' },
        { id: 'bills', icon: '📋', label: 'Company Bills' }
      ]},
      { section: 'Reports', items: [
        { id: 'analytics', icon: '📈', label: 'Department Reports' },
        { id: 'reports', icon: '📋', label: 'Business Reports' },
        { id: 'monthlyslips', icon: '📄', label: 'Employee Reports' }
      ]},
      { section: 'System', items: [
        { id: 'historical', icon: '📅', label: 'Historical Data' },
        { id: 'audit', icon: '🔍', label: 'Activity Log' },
        { id: 'deptsettings', icon: '⚙️', label: 'Dept. Settings' }
      ]}
    ],
    superadmin: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'projects', icon: '📁', label: 'Client Projects' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' }
      ]},
      { section: 'HR Management', items: [
        { id: 'employees', icon: '👥', label: 'Employees' },
        { id: 'attendance', icon: '⏰', label: 'Daily Attendance' },
        { id: 'deptattendance', icon: '📊', label: 'Dept. Attendance' },
        { id: 'leave', icon: '🏖️', label: 'Leave Requests' },
        { id: 'performance', icon: '🎯', label: 'Performance' },
        { id: 'schedule', icon: '📅', label: 'Work Schedule' }
      ]},
      { section: 'Finance', items: [
        { id: 'payroll', icon: '💳', label: 'Payroll' },
        { id: 'financialoverview', icon: '📊', label: 'Financial Overview' },
        { id: 'finance', icon: '💰', label: 'Income & Profit' },
        { id: 'expenses', icon: '🧾', label: 'Expenses' },
        { id: 'expensesdept', icon: '🏢', label: 'Dept. Expenses' },
        { id: 'bills', icon: '📋', label: 'Company Bills' }
      ]},
      { section: 'Reports', items: [
        { id: 'analytics', icon: '📈', label: 'Department Reports' },
        { id: 'reports', icon: '📋', label: 'Business Reports' },
        { id: 'monthlyslips', icon: '📄', label: 'Employee Reports' }
      ]},
      { section: 'System', items: [
        { id: 'historical', icon: '📅', label: 'Historical Data' },
        { id: 'audit', icon: '🔍', label: 'Activity Log' },
        { id: 'deptsettings', icon: '⚙️', label: 'Dept. Settings' }
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
        { id: 'deptattendance', icon: '📊', label: 'Team Attendance' },
        { id: 'schedule', icon: '📅', label: 'Work Schedule' },
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
        { id: 'deptattendance', icon: '📊', label: 'Team Attendance' },
        { id: 'schedule', icon: '📅', label: 'Work Schedule' },
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
        { id: 'deptattendance', icon: '📊', label: 'Team Attendance' },
        { id: 'schedule', icon: '📅', label: 'Work Schedule' },
        { id: 'performance', icon: '📈', label: 'Performance' },
        { id: 'leave', icon: '📅', label: 'Leave Requests' }
      ]}
    ],
    hrmanager: [
      { section: 'HR Overview', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'employees', icon: '👥', label: 'Employees' },
        { id: 'attendance', icon: '⏰', label: 'Attendance' },
        { id: 'leave', icon: '🏖️', label: 'Leave Management' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' }
      ]}
    ],
    teamleader: [
      { section: 'Team Leader', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'employees', icon: '👥', label: 'My Team' },
        { id: 'attendance', icon: '⏰', label: 'Attendance' },
        { id: 'performance', icon: '📈', label: 'Performance' },
        { id: 'projects', icon: '📁', label: 'Active Projects' }
      ]}
    ],
    employee: [
      { section: 'My Work', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'attendance', icon: '⏰', label: 'My Attendance' },
        { id: 'performance', icon: '📈', label: 'My Performance' },
        { id: 'leave', icon: '📅', label: 'My Leaves' },
        { id: 'broadcast', icon: '📢', label: 'Announcements' }
      ]}
    ],
    viewer: [
      { section: 'Reports', items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'reports', icon: '📋', label: 'View Reports' },
        { id: 'projects', icon: '📁', label: 'Project Status' }
      ]}
    ]
  };

  const isEmployee = currentUser.role === 'employee';
  const nav = isEmployee ? [] : (navigation[currentUser.role as keyof typeof navigation] || navigation.admin);

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
    <div style={{ 
      width: '240px', 
      minWidth: '240px', 
      background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)', 
      borderRight: '1px solid var(--border)', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '10px 0 30px rgba(0,0,0,0.05)',
      zIndex: 50
    }}>
      {/* Logo */}
      <div 
        onClick={() => onNavigate('dashboard')}
        style={{ 
          padding: '30px 24px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          cursor: 'pointer'
        }}
      >
        <div style={{ 
          width: '42px', 
          height: '42px', 
          background: 'linear-gradient(135deg, var(--accent), var(--primary))', 
          borderRadius: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '20px',
          boxShadow: '0 8px 16px rgba(var(--accent-rgb), 0.3)',
          color: '#fff'
        }}>
          🚀
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text)', letterSpacing: '-0.5px' }}>GROWZIX</div>
          <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            v2.0 PRO
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '15px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }} className="custom-scrollbar">
        {nav.map((section, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text3)', padding: '0 15px 10px', opacity: 0.6 }}>
              {section.section}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    color: currentPage === item.id ? '#fff' : 'var(--text2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '14px',
                    fontWeight: currentPage === item.id ? '700' : '600',
                    background: currentPage === item.id ? 'var(--accent)' : 'transparent',
                    border: 'none',
                    boxShadow: currentPage === item.id ? '0 10px 20px -5px rgba(var(--accent-rgb), 0.4)' : 'none',
                    position: 'relative',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== item.id) {
                      e.currentTarget.style.background = 'var(--bg3)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px', filter: currentPage === item.id ? 'brightness(0) invert(1)' : 'none' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  
                  {getUnreadCount(item.id) > 0 && (
                     <span style={{ 
                       background: '#ff4444', 
                       color: '#fff', 
                       fontSize: '10px', 
                       fontWeight: '900', 
                       padding: '2px 8px', 
                       borderRadius: '10px',
                       boxShadow: '0 4px 10px rgba(255,68,68,0.4)'
                     }}>
                       {getUnreadCount(item.id)}
                     </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Info / Footer Section */}
      <div style={{ 
        padding: '20px', 
        background: 'rgba(var(--bg3-rgb), 0.5)', 
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--border)',
        margin: '10px',
        borderRadius: '24px'
      }}>
        {/* Theme & Mode Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text2)', fontSize: '14px' }}
            >
              🎨 <span>Theme</span>
            </button>
            {showThemeMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowThemeMenu(false)} />
                <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '10px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '8px', zIndex: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                  {themeOptions.map(option => (
                    <button
                      key={option.color}
                      onClick={() => { setThemeColor(option.color); setShowThemeMenu(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: themeColor === option.color ? 'var(--accentbg)' : 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', color: themeColor === option.color ? 'var(--accent2)' : 'var(--text2)', fontSize: '13px' }}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text2)', fontSize: '14px' }}
          >
            {themeMode === 'light' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg3)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '14px', 
            fontWeight: '900', 
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))', 
            color: '#fff',
            boxShadow: '0 4px 10px rgba(var(--accent-rgb), 0.2)'
          }}>
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {currentUser.role}
            </div>
          </div>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px', transition: '.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
          >
            🚪
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); borderRadius: 10px; }
      `}</style>
    </div>
  );
}

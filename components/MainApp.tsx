'use client';

import { useApp } from '@/context/AppContext';
import { useState, ReactElement } from 'react';
import { formatDate } from '@/lib/dateUtils';
import Sidebar from './Sidebar';
import EnhancedDashboard from './EnhancedDashboard';
import EmployeesPage from './EmployeesPage';
import AttendancePage from './AttendancePage';
import PerformancePage from './PerformancePage';
import FinancePage from './FinancePage';
import ExpensesPage from './ExpensesPage';
import PayrollPage from './PayrollPage';
import AuditPage from './AuditPage';
import LeavePage from './LeavePage';
import ReportsPage from './ReportsPage';
import BroadcastPage from './BroadcastPage';
import ProjectsPage from './ProjectsPage';
import DepartmentAnalytics from './DepartmentAnalytics';
import SchedulePage from './SchedulePage';
import MonthlyReportSlip from './MonthlyReportSlip';
import DepartmentAttendance from './DepartmentAttendance';
import BillsPage from './BillsPage';
import FinancialOverviewPage from './FinancialOverviewPage';
import ExpensesDepartmentPage from './ExpensesDepartmentPage';
import HistoricalReportsPage from './HistoricalReportsPage';
import BreakPage from './BreakPage';
import DeptSettingsPage from './DeptSettingsPage';
import AdminManagementView from './AdminManagementView';

export default function MainApp() {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead, logout } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  // Filter notifications for current user
  const userNotifications = (notifications || []).filter(n => 
    n && (
      n.recipient === 'all' || 
      (isAdmin && n.recipient === 'admin') ||
      n.recipient === currentUser.role
    )
  );
  
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const pages: { [key: string]: ReactElement } = {
    dashboard: <EnhancedDashboard onNavigate={setCurrentPage} />,
    analytics: <DepartmentAnalytics />,
    employees: <EmployeesPage />,
    attendance: <AttendancePage />,
    management: <AdminManagementView />,
    deptattendance: <DepartmentAttendance />,
    schedule: <SchedulePage />,
    performance: <PerformancePage />,
    finance: <FinancePage />,
    expenses: <ExpensesPage />,
    expensesdept: <ExpensesDepartmentPage />,
    bills: <BillsPage />,
    financialoverview: <FinancialOverviewPage />,
    payroll: <PayrollPage />,
    audit: <AuditPage />,
    leave: <LeavePage />,
    break: <BreakPage />,
    deptsettings: <DeptSettingsPage />,
    reports: <ReportsPage />,
    historical: <HistoricalReportsPage />,
    monthlyslips: <MonthlyReportSlip />,
    broadcast: <BroadcastPage />,
    projects: <ProjectsPage />
  };

  const pageTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    analytics: 'Department Analytics & Insights',
    employees: 'Employee Management',
    attendance: 'Attendance Tracker',
    deptattendance: 'Department-wise Attendance Dashboard',
    schedule: 'Monthly Work Schedule',
    performance: 'Performance Analytics',
    finance: 'Finance — P&L Report',
    expenses: 'Expense Manager',
    expensesdept: 'Department Expenses',
    bills: 'Company Bills Management',
    financialoverview: 'Financial Overview',
    payroll: 'Payroll System',
    audit: 'Audit Log',
    leave: 'Leave Requests',
    break: 'Break Approval System',
    deptsettings: 'Department Settings',
    reports: 'Monthly Analytics Report',
    historical: 'Historical Reports & Profit/Loss',
    monthlyslips: 'Employee Monthly Report Slips',
    broadcast: 'Company Announcements',
    projects: 'Client Ledgers & Projects'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text)' }}>{pageTitles[currentPage]}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', outline: 'none' }}
              >
                <span style={{ fontSize: '18px' }}>🔔</span>
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--red)', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', fontWeight: '700', border: '2px solid var(--bg2)' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown (WhatsApp Style) */}
              {showNotifDropdown && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowNotifDropdown(false)} />
                  <div style={{ position: 'absolute', top: '48px', right: 0, width: '340px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: '0 20px 40px rgba(0,0,0,.4)', zIndex: 1000, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>System Notifications</div>
                      <button 
                        onClick={() => { markAllNotificationsAsRead(); setShowNotifDropdown(false); }} 
                        style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                      {userNotifications.length === 0 ? (
                        <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>
                          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📬</div>
                          No new activities found.
                        </div>
                      ) : (
                        userNotifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => { markNotificationAsRead(n.id); setShowNotifDropdown(false); }}
                            className={!n.read ? 'glow-unread' : ''}
                            style={{ 
                              padding: '16px 20px', 
                              borderBottom: '1px solid var(--border)', 
                              cursor: 'pointer', 
                              background: n.read ? 'transparent' : 'rgba(var(--accent-rgb), .1)',
                              borderLeft: n.read ? '4px solid transparent' : '4px solid var(--accent)',
                              display: 'flex',
                              gap: '14px',
                              transition: 'all .2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(var(--accent-rgb), .1)'}
                          >
                            <div style={{ fontSize: '24px', background: 'var(--bg3)', width: '46px', height: '46px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 8px rgba(0,0,0,.1)' }}>
                              {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'error' ? '❌' : 'ℹ️'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <div style={{ fontSize: '13px', fontWeight: n.read ? '600' : '800', color: 'var(--text)' }}>{n.title}</div>
                                {!n.read && <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 12px var(--accent)', marginTop: '4px' }} title="New Message" />}
                              </div>
                              <div style={{ fontSize: '12px', color: n.read ? 'var(--text2)' : 'var(--text)', lineHeight: '1.5', fontWeight: n.read ? '400' : '600' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{n.sender}</span>: {n.message}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>⏲️</span>
                                {new Date(n.createdAt).toLocaleString('en-PK', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📅</span>
              {formatDate(new Date().toISOString().split('T')[0])}
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize' }}>
              <span>
                {currentUser.role === 'superadmin' ? '🛡️' :
                 currentUser.role === 'admin' ? '👑' :
                 currentUser.role === 'ecommerce' ? '🛒' :
                 currentUser.role === 'marketing' ? '📢' : '🏗️'}
              </span>
              {currentUser.role}
            </div>
            <button 
              onClick={logout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text2)', display: 'flex', alignItems: 'center', transition: '.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text2)'}
            >
              🚪
            </button>
          </div>
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {pages[currentPage] || pages.dashboard}
        </div>
      </div>
    </div>
  );
}

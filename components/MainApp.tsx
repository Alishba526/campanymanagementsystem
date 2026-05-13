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

export default function MainApp() {
  const { currentUser } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!currentUser) return null;

  const pages: { [key: string]: ReactElement } = {
    dashboard: <EnhancedDashboard />,
    analytics: <DepartmentAnalytics />,
    employees: <EmployeesPage />,
    attendance: <AttendancePage />,
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
        <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text)' }}>{pageTitles[currentPage]}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📅</span>
              {formatDate(new Date().toISOString().split('T')[0])}
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize' }}>
              <span>
                {currentUser.role === 'admin' ? '👑' :
                 currentUser.role === 'ecommerce' ? '🛒' :
                 currentUser.role === 'marketing' ? '📢' : '🏗️'}
              </span>
              {currentUser.role}
            </div>
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

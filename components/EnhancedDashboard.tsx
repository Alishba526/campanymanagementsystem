'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function EnhancedDashboard({ onNavigate }: DashboardProps) {
  const { currentUser, employees, attendance, tasks, expenses, income, leaveRequests, projects, announcements, breakRequests } = useApp();
  const [alerts, setAlerts] = useState<any[]>([]);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const today = new Date().toISOString().split('T')[0];

  // Helper to ensure time is always displayed as AM/PM
  const formatTime = (timeStr: string | undefined | null) => {
    if (!timeStr || timeStr === '--' || timeStr === '0' || timeStr === '') return '--';
    try {
      if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Filter employees by department for managers
  const departmentEmployees = isAdmin
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  const deptEmpIds = new Set(departmentEmployees.map(e => e.id));

  // Calculate statistics (ONLY for Admins)
  const totalIncome = isAdmin ? income
    .filter(i => i.status === 'received')
    .reduce((sum, i) => sum + i.amount, 0) : 0;

  const pendingIncome = isAdmin ? income
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0) : 0;

  const totalExpenses = isAdmin ? expenses
    .reduce((sum, e) => sum + e.amount, 0) : 0;

  const totalSalariesPaid = isAdmin ? employees.reduce((sum, e) => sum + (e.salary || 0), 0) : 0;
  const totalCashOut = totalExpenses + totalSalariesPaid;
  const netProfit = totalIncome - totalCashOut;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const todayAttendance = attendance.filter(a => a.date === today && (isAdmin || deptEmpIds.has(a.employeeId)));
  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length;
  const lateToday = todayAttendance.filter(a => a.status === 'late').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = departmentEmployees.length > 0 ? Math.round((presentToday / departmentEmployees.length) * 100) : 0;

  const filteredTasks = tasks.filter(t => isAdmin || deptEmpIds.has(t.employeeId));
  const avgPerformance = filteredTasks.length > 0
    ? Math.round(filteredTasks.reduce((sum, t) => sum + t.score, 0) / filteredTasks.length)
    : 0;

  // Performance Ranking
  const performanceRanking = departmentEmployees.map(emp => {
    const empTasks = tasks.filter(t => t.employeeId === emp.id);
    const score = empTasks.length > 0 ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length) : 0;
    return { name: emp.name, score };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  const lowPerformanceAlerts = tasks.filter(t => t.score < 60 && (isAdmin || deptEmpIds.has(t.employeeId)));
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending' && (isAdmin || deptEmpIds.has(l.employeeId))).length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending' && (isAdmin || e.department === currentUser.role)).length;

  const activeProjects = projects.filter(p => p.status === 'active');
  const approvedProjects = projects.filter(p => p.status === 'approved' || p.status === 'completed').length;
  const pendingProjects = projects.filter(p => p.status === 'pending').length;

  // Generate Smart Alerts (ONLY ADMIN)
  useEffect(() => {
    if (!isAdmin) return;
    const newAlerts = [];
    if (netProfit < 0) {
      newAlerts.push({
        type: 'critical',
        icon: '🚨',
        title: 'Negative Profit Alert',
        message: `Company is running at a loss of Rs. ${Math.abs(netProfit).toLocaleString()}`,
        action: 'Review expenses and increase revenue'
      });
    }
    setAlerts(newAlerts);
  }, [isAdmin, netProfit]);

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical': return { bg: 'var(--redbg)', border: 'var(--red)', color: 'var(--red)' };
      case 'warning': return { bg: 'var(--amberbg)', border: 'var(--amber)', color: 'var(--amber)' };
      case 'success': return { bg: 'var(--greenbg)', border: 'var(--green)', color: 'var(--green)' };
      default: return { bg: 'var(--bluebg)', border: 'var(--blue)', color: 'var(--blue)' };
    }
  };

  // Quick Actions based on role
  const getQuickActions = (): QuickAction[] => {
    if (isAdmin) {
      return [
        { id: 'employees', icon: '👥', label: 'Add Employee', description: 'Register new team member', color: 'var(--blue)', bgColor: 'var(--bluebg)' },
        { id: 'attendance', icon: '⏰', label: 'Mark Attendance', description: 'Record daily attendance', color: 'var(--green)', bgColor: 'var(--greenbg)' },
        { id: 'expenses', icon: '💸', label: 'Add Expense', description: 'Log new expense', color: 'var(--red)', bgColor: 'var(--redbg)' },
        { id: 'finance', icon: '💰', label: 'Add Income', description: 'Record client payment', color: 'var(--green)', bgColor: 'var(--greenbg)' },
        { id: 'bills', icon: '📋', label: 'Manage Bills', description: 'Company bills & utilities', color: 'var(--amber)', bgColor: 'var(--amberbg)' },
        { id: 'historical', icon: '📊', label: 'View Reports', description: 'Historical data & analytics', color: 'var(--accent)', bgColor: 'var(--accentbg)' },
        { id: 'leave', icon: '📅', label: 'Leave Requests', description: `${pendingLeaves} pending approvals`, color: 'var(--amber)', bgColor: 'var(--amberbg)' },
        { id: 'projects', icon: '📁', label: 'Client Projects', description: `${activeProjects.length} active projects`, color: 'var(--blue)', bgColor: 'var(--bluebg)' }
      ];
    } else {
      return [
        { id: 'employees', icon: '👥', label: 'My Team', description: 'View team members', color: 'var(--blue)', bgColor: 'var(--bluebg)' },
        { id: 'attendance', icon: '⏰', label: 'Mark Attendance', description: 'Record team attendance', color: 'var(--green)', bgColor: 'var(--greenbg)' },
        { id: 'performance', icon: '📈', label: 'Performance', description: 'Track team performance', color: 'var(--accent)', bgColor: 'var(--accentbg)' },
        { id: 'leave', icon: '📅', label: 'Leave Requests', description: 'Manage team leaves', color: 'var(--amber)', bgColor: 'var(--amberbg)' },
        { id: 'projects', icon: '📁', label: 'Projects', description: 'Active projects', color: 'var(--blue)', bgColor: 'var(--bluebg)' },
        { id: 'broadcast', icon: '📢', label: 'Announcements', description: 'Company updates', color: 'var(--green)', bgColor: 'var(--greenbg)' }
      ];
    }
  };

  const quickActions = getQuickActions();
  const showAnnouncementsTop = !isAdmin && announcements.length > 0;

  // --- Dynamic Priority Feed Logic (ADMIN ONLY) ---
  const [priorityItems, setPriorityItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;

    // 1. Get recent attendance from today
    const recentAtt = attendance
      .filter(a => a.date === today)
      .map(a => ({ 
        id: `att-${a.id}`, 
        type: 'attendance', 
        title: 'Attendance Marked', 
        content: `${a.employeeName} (${a.status.toUpperCase()}) at ${a.checkIn}`,
        time: a.checkIn,
        icon: '⏰',
        color: 'var(--green)'
      }));

    // 2. Get recent break requests
    const recentBreaks = (breakRequests || [])
      .filter(b => b.date === today)
      .map(b => ({
        id: `break-${b.id}`,
        type: 'break',
        title: 'Break Update',
        content: `${b.employeeName} requested break at ${b.startTime}`,
        time: b.startTime,
        icon: '☕',
        color: 'var(--blue)'
      }));

    // 3. Get recent announcements
    const recentAnnouncements = announcements
      .slice(0, 3)
      .map(a => ({
        id: `ann-${a.id}`,
        type: 'announcement',
        title: 'Announcement',
        content: a.title,
        time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        icon: '📢',
        color: 'var(--accent)'
      }));

    // Combine and sort by "time" (approximate for feed effect)
    const combined = [...recentAtt, ...recentBreaks, ...recentAnnouncements]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 5);

    setPriorityItems(combined);
  }, [isAdmin, attendance, breakRequests, announcements, today]);

  // Real-time Break Logic
  const todayAttForBreak = attendance.find(a => 
    a.date === today && 
    (a.employeeId === currentUser.email || a.employeeName === currentUser.name)
  );

  const handleBreakIn = async () => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    if (todayAttForBreak) {
      await useApp().updateAttendance(todayAttForBreak.id, { breakIn: now });
      Swal.fire({ title: 'Break Started', text: `Break In recorded at ${now}.`, icon: 'success', timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ title: 'Error', text: 'Please mark your attendance first!', icon: 'error' });
    }
  };

  const handleBreakOut = async () => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    if (todayAttForBreak) {
      await useApp().updateAttendance(todayAttForBreak.id, { breakOut: now });
      Swal.fire({ title: 'Break Ended', text: `Break Out recorded at ${now}`, icon: 'success', timer: 2000, showConfirmButton: false });
    }
  };

  return (
    <div>
      {/* 0. Priority Activity Feed (ONLY ADMIN) - WhatsApp/TikTok Style Reordering */}
      {isAdmin && priorityItems.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔥</span> Priority Activity Feed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {priorityItems.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'var(--bg2)', 
                  border: `1px solid var(--border)`, 
                  borderLeft: `4px solid ${item.color}`,
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{item.content}</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600' }}>{item.time}</div>
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes slideIn {
              from { transform: translateY(-10px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* 1. Break Control Section (For non-admins to punch in/out) */}
      {!isAdmin && (
        <div style={{ marginBottom: '22px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>☕</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>Break Control</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
                {todayAttForBreak 
                  ? `Today's Break: ${todayAttForBreak.breakIn ? formatTime(todayAttForBreak.breakIn) : '--'} ${todayAttForBreak.breakOut ? `to ${formatTime(todayAttForBreak.breakOut)}` : (todayAttForBreak.breakIn ? '(On Break)' : '(Not Started)')}`
                  : 'Attendance not marked yet'
                }
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {todayAttForBreak && !todayAttForBreak.breakIn ? (
              <button onClick={handleBreakIn} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                Break In
              </button>
            ) : todayAttForBreak && !todayAttForBreak.breakOut ? (
              <button 
                onClick={handleBreakOut} 
                style={{ 
                  background: 'var(--red)', 
                  color: '#fff', 
                  border: 'none', padding: '8px 16px', borderRadius: '8px', 
                  cursor: 'pointer', fontSize: '13px' 
                }}
              >
                Break Out
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* 2. Dynamic Announcement Section (Top for Managers) */}
      {showAnnouncementsTop && (
        <div style={{ marginBottom: '22px', background: 'var(--accentbg)', border: '1px solid var(--accent)', borderRadius: 'var(--radius2)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent2)' }}>
            <span style={{ fontSize: '20px' }}>📢</span>
            <span style={{ fontWeight: '700' }}>Recent Announcements</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.slice(0, 2).map(a => (
              <div key={a.id} style={{ background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>{a.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>{a.content}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px' }}>By {a.author}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'normal', marginBottom: '12px', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡</span> Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate && onNavigate(action.id)}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius2)',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: '.15s',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = action.color;
                e.currentTarget.style.background = 'var(--bg3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg2)';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: action.bgColor,
                color: action.color,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}>
                {action.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 'normal', color: '#000', marginBottom: '4px' }}>
                  {action.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>
                  {action.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Alerts Section (ONLY ADMIN) */}
      {isAdmin && alerts.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', marginBottom: '12px', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔔</span> Smart Alerts & Insights
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {alerts.map((alert, idx) => {
              const style = getAlertStyle(alert.type);
              return (
                <div key={idx} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 'var(--radius2)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{alert.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 'normal', color: style.color, marginBottom: '4px' }}>{alert.title}</div>
                      <div style={{ fontSize: '13px', color: '#000', marginBottom: '6px', fontWeight: 'normal' }}>{alert.message}</div>
                      <div style={{ fontSize: '12px', color: '#333', fontStyle: 'italic', fontWeight: 'normal' }}>→ {alert.action}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {isAdmin ? (
          <>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: netProfit >= 0 ? 'var(--greenbg)' : 'var(--redbg)', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {netProfit >= 0 ? '📈' : '📉'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatCurrency(netProfit)}</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Net Profit</div>
              <div style={{ fontSize: '12px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', marginTop: '4px', fontWeight: 'normal' }}>Margin: {profitMargin}%</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--bluebg)', color: 'var(--blue)' }}>
                💰
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalIncome)}</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Total Income</div>
              <div style={{ fontSize: '12px', color: 'var(--amber)', marginTop: '4px', fontWeight: 'normal' }}>Pending: {formatCurrency(pendingIncome)}</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--redbg)', color: 'var(--red)' }}>
                💸
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalCashOut)}</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Total Cash Out</div>
              <div style={{ fontSize: '12px', color: 'var(--red)', marginTop: '4px', fontWeight: 'normal' }}>Exp + Salaries</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: attendanceRate >= 80 ? 'var(--greenbg)' : 'var(--amberbg)', color: attendanceRate >= 80 ? 'var(--green)' : 'var(--amber)' }}>
                👥
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{attendanceRate}%</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Attendance Rate</div>
              <div style={{ fontSize: '12px', color: '#333', marginTop: '4px', fontWeight: 'normal' }}>{presentToday}/{employees.length} present</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--greenbg)', color: 'var(--green)' }}>
                👥
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{departmentEmployees.length}</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Team Members</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--bluebg)', color: 'var(--blue)' }}>
                ⏰
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{presentToday}</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Present Today</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--amberbg)', color: 'var(--amber)' }}>
                📈
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{avgPerformance}</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Avg Performance</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--tealbg)', color: 'var(--teal)' }}>
                📅
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{pendingLeaves}</div>
              <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Pending Leaves</div>
            </div>
          </>
        )}
      </div>

      {/* 4. Department-wise Today Attendance (ONLY ADMIN) */}
      {isAdmin && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', marginBottom: '12px', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏢</span> Department-wise Today Attendance
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {Array.from(new Set(employees.map(e => e.department))).map(dept => {
              const deptEmps = employees.filter(e => e.department === dept);
              const deptAtt = attendance.filter(a => a.date === today && deptEmps.find(e => e.id === a.employeeId));
              const present = deptAtt.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day');
              const late = present.filter(a => a.status === 'late');
              const absentCount = deptEmps.length - present.length;
              
              return (
                <div key={dept} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', textTransform: 'capitalize' }}>{dept}</div>
                    <div style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: 'var(--bg3)', color: 'var(--text2)', fontWeight: '600' }}>
                      {present.length}/{deptEmps.length} Present
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${(present.length / deptEmps.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '10px' }} />
                  </div>

                  {/* Employee Names List */}
                  <div style={{ flex: 1, marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Present Today:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {present.length > 0 ? (
                        present.map(a => (
                          <span key={a.id} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--bg3)', borderRadius: '6px', color: 'var(--text)', border: '1px solid var(--border)' }}>
                            {a.employeeName} <span style={{ fontSize: '9px', color: a.status === 'late' ? 'var(--amber)' : 'var(--green)' }}>●</span>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic' }}>No attendance marked yet</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--bg3)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green)' }}>{present.length - late.length}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>On Time</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--amber)' }}>{late.length}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Late</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--red)' }}>{absentCount}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Absent</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Ranking and Admin Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1.5fr 1fr' : '1fr', gap: '20px', marginTop: '22px' }}>
        {isAdmin && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text)' }}>
                <span>📜</span> Recent <strong>System Activity</strong>
              </div>
            </div>
            <div style={{ padding: '10px' }}>
              {(useApp().auditLogs || [])
                .filter((log: any) => isAdmin || (!log.action.toLowerCase().includes('salary') && !log.action.toLowerCase().includes('expense') && !log.action.toLowerCase().includes('income') && !log.action.toLowerCase().includes('bill') && !log.action.toLowerCase().includes('payment')))
                .slice(0, 6).map((log: any) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid var(--bg3)', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--accent)', fontWeight: 'normal' }}>{log.user}:</span>
                    <span style={{ color: 'var(--text2)', marginLeft: '6px' }}>{log.action}</span>
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: '11px' }}>{log.timestamp.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text)' }}>
              <span>🏆</span> <strong>Performance</strong> Ranking
            </div>
          </div>
          <div style={{ padding: '10px' }}>
            {performanceRanking.map((emp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid var(--bg3)', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text3)', fontWeight: 'normal' }}>#{idx + 1}</span>
                  <span style={{ color: 'var(--text)' }}>{emp.name}</span>
                </div>
                <div style={{ color: emp.score >= 80 ? 'var(--green)' : 'var(--amber)', fontWeight: 'normal' }}>{emp.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

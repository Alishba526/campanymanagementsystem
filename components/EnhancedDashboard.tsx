'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function EnhancedDashboard({ onNavigate }: DashboardProps) {
  const { currentUser, employees, attendance, auditLogs, income, expenses, tasks, announcements, projects } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const today = new Date().toISOString().split('T')[0];

  const formatCurrency = (amount: number) => `Rs. ${(amount || 0).toLocaleString()}`;

  const todayAttendance = attendance.filter(a => a.date === today);

  // Manager Specific Data
  const managerDept = currentUser.role;
  const myDeptEmps = employees.filter(e => e.department === managerDept);
  const myDeptAtt = todayAttendance.filter(a => myDeptEmps.find(e => e.id === a.employeeId));
  const myDeptPresent = myDeptAtt.filter(a => a.status === 'present' || a.status === 'late').length;
  const myDeptProjects = projects.filter(p => p.department === managerDept);
  
  // Filter logs for my department
  const myDeptLogs = auditLogs.filter(log => {
    const isMyAction = log.user === currentUser.name;
    const isMyTeamAction = myDeptEmps.some(emp => log.action.includes(emp.name) || log.action.includes(emp.id));
    return isMyAction || isMyTeamAction;
  });

  const formattedDateDay = currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Admin Stats
  const totalIncome = income.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const totalCashOut = totalExpenses + totalSalaries;
  const netProfit = totalIncome - totalCashOut;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const attRate = employees.length > 0 ? Math.round((todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length / employees.length) * 100) : 0;

  const rankings = employees.map(emp => {
    const empTasks = tasks.filter(t => t.employeeId === emp.id);
    const score = empTasks.length > 0 ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length) : 0;
    return { name: emp.name, score };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  const myDeptScore = myDeptEmps.length > 0 
    ? Math.round(myDeptEmps.reduce((sum, emp) => {
        const empTasks = tasks.filter(t => t.employeeId === emp.id);
        return sum + (empTasks.length > 0 ? empTasks.reduce((s, t) => s + t.score, 0) / empTasks.length : 0);
      }, 0) / myDeptEmps.length) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. EXECUTIVE HEADER (Managers Only) */}
      {!isAdmin && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Department Management</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)' }}>{managerDept.toUpperCase()} Control Center</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>{formattedTime}</div>
            <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'bold' }}>{formattedDateDay}</div>
          </div>
        </div>
      )}

      {/* 2. KPI ROW (Managers) */}
      {!isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <KPICard title="Total Team" value={myDeptEmps.length} subtitle="Staff Members" icon="👥" color="#2563eb" />
          <KPICard title="Present Today" value={myDeptPresent} subtitle={`${myDeptEmps.length - myDeptPresent} Absent`} icon="✅" color="#059669" />
          <KPICard title="My Projects" value={myDeptProjects.length} subtitle="Active Milestones" icon="🚀" color="#6366f1" />
          <KPICard title="Team Score" value={`${myDeptScore}%`} subtitle="Avg performance" icon="🎯" color="#7c3aed" />
        </div>
      )}

      {/* 3. ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div style={{ background: 'var(--accentbg)', border: '2px solid #6366f1', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#6366f1', color: '#fff', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📢</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#4338ca' }}>ADMIN UPDATE: {announcements[0].title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '2px', fontWeight: '500' }}>{announcements[0].content}</div>
          </div>
          <button onClick={() => onNavigate?.('broadcast')} style={{ background: 'none', border: '2px solid #6366f1', color: '#6366f1', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>View All</button>
        </div>
      )}

      {/* 4. QUICK ACTIONS */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
         <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>⚡ {isAdmin ? 'Global Management' : 'Quick Controls'}</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <ActionCard icon="👥" label="Add Employee" desc="Register team member" onClick={() => onNavigate?.('employees')} />
            <ActionCard icon="⏰" label="Mark Attendance" desc="Daily team status" onClick={() => onNavigate?.('attendance')} />
            {isAdmin && <ActionCard icon="💸" label="Add Expense" desc="Log new expense" onClick={() => onNavigate?.('expenses')} />}
            {isAdmin && <ActionCard icon="💰" label="Add Income" desc="Record client payment" onClick={() => onNavigate?.('finance')} />}
            <ActionCard icon="📊" label="View Reports" desc="Analytics & Data" onClick={() => onNavigate?.('reports')} />
            <ActionCard icon="🏖️" label="Leave Requests" desc="Review team leaves" onClick={() => onNavigate?.('leaves')} />
            <ActionCard icon="🚀" label="Project Tracker" desc="Client milestones" onClick={() => onNavigate?.('projects')} />
            <ActionCard icon="📅" label="Work Schedule" desc="Shifts & Hours" onClick={() => onNavigate?.('schedule')} />
         </div>
      </div>

      {/* 5. KPI GRID (ADMIN ONLY) */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <KPICard title="Net Profit / Loss" value={formatCurrency(netProfit)} subtitle={netProfit >= 0 ? `Benefit Margin: ${profitMargin}%` : `Loss Margin: ${Math.abs(profitMargin)}%`} icon={netProfit >= 0 ? "📈" : "📉"} color={netProfit >= 0 ? "#059669" : "#dc2626"} highlight={true} />
          <KPICard title="Total Income" value={formatCurrency(totalIncome)} subtitle="Revenue Received" icon="💰" color="#059669" />
          <KPICard title="Total Cash Out" value={formatCurrency(totalCashOut)} subtitle="Exp + Salaries" icon="💸" color="#dc2626" />
          <KPICard title="Attendance Rate" value={`${attRate}%`} subtitle="System wide" icon="👥" color="#2563eb" />
        </div>
      )}

      {/* 6. TEAM ACTIVITY & RANKINGS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>📜 {isAdmin ? 'Recent System Activity' : 'My Team Activity'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {(isAdmin ? auditLogs : myDeptLogs).slice(0, 6).map((log, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                       <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>
                            <span style={{ color: '#6366f1', fontWeight: '900' }}>{log.user}</span>:
                            <span style={{ color: log.action.toLowerCase().includes('delete') ? '#dc2626' : log.action.toLowerCase().includes('add') ? '#059669' : 'var(--text2)', fontWeight: '800' }}> {log.action}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 'bold' }}>{log.timestamp}</div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>🏆 Performance Ranking</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {rankings.map((r, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'var(--bg3)', borderRadius: '12px', borderLeft: `5px solid ${i === 0 ? '#059669' : i === 1 ? '#6366f1' : 'var(--border)'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <span style={{ fontSize: '12px', fontWeight: '900', color: i === 0 ? '#059669' : 'var(--text2)' }}>#{i+1}</span>
                       <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>{r.name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: r.score >= 80 ? '#059669' : r.score >= 50 ? '#2563eb' : '#dc2626' }}>{r.score}%</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, desc, onClick }: any) {
  return (
    <button onClick={onClick} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '18px', padding: '15px', textAlign: 'left', cursor: 'pointer', transition: '0.2s', display: 'flex', flexDirection: 'column', gap: '5px' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
       <div style={{ fontSize: '20px', marginBottom: '5px' }}>{icon}</div>
       <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>{label}</div>
       <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.3', fontWeight: '600' }}>{desc}</div>
    </button>
  );
}

function KPICard({ title, value, subtitle, icon, color, highlight }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: highlight ? `2px solid ${color}` : '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{icon}</div>
       </div>
       <div style={{ fontSize: '18px', fontWeight: '900', color: color }}>{value}</div>
       <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>{title}</div>
       <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 'bold' }}>{subtitle}</div>
    </div>
  );
}

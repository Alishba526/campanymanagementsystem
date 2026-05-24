'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { formatTimeAMPM } from '@/lib/dateUtils';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function EnhancedDashboard({ onNavigate }: DashboardProps) {
  const { currentUser, employees, attendance, auditLogs, income, expenses, tasks, announcements, projects, bills } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Historical Filtering States
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const today = new Date().toISOString().split('T')[0];
  const filterPrefix = `${filterYear}-${filterMonth}`;

  const formatCurrency = (amount: number) => `Rs. ${(amount || 0).toLocaleString()}`;
  
  // Currency Conversion Rate (1 USD = 280 PKR)
  const USD_TO_PKR = 280;

  // Filtering Logic
  const displayAttendance = isFiltered 
    ? attendance.filter(a => a.date.startsWith(filterPrefix))
    : attendance.filter(a => a.date === today);

  const displayIncome = isFiltered
    ? income.filter(i => i.date.startsWith(filterPrefix) && i.status === 'received')
    : income.filter(i => i.status === 'received');

  const displayExpenses = isFiltered
    ? expenses.filter(e => e.date.startsWith(filterPrefix))
    : expenses;

  const displayTasks = isFiltered
    ? tasks.filter(t => t.date.startsWith(filterPrefix))
    : tasks;

  // Manager Specific Data
  const managerDept = currentUser.role;
  const myDeptEmps = employees.filter(e => e.department === managerDept);
  const myDeptAtt = displayAttendance.filter(a => myDeptEmps.find(e => e.id === a.employeeId));
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

  // Admin Stats Calculations (ALL IN PKR)
  const totalManualIncomePKR = displayIncome.reduce((sum, i) => sum + i.amount, 0);
  
  // Dynamic Project Income Calculation (Convert USD to PKR)
  const displayProjects = isFiltered 
    ? projects.filter(p => p.startDate.startsWith(filterPrefix))
    : projects;
    
  const totalProjectIncomeUSD = displayProjects.reduce((sum, p) => sum + (p.amountReceived || 0), 0);
  const totalProjectBudgetUSD = displayProjects.reduce((sum, p) => sum + (p.cost || 0), 0);
  const totalProjectIncomePKR = totalProjectIncomeUSD * USD_TO_PKR;
  
  const totalIncomePKR = totalManualIncomePKR + totalProjectIncomePKR;

  const totalExpensesPKR = displayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBillsPKR = isFiltered 
    ? bills.filter(b => b.date.startsWith(filterPrefix)).reduce((sum, b) => sum + b.amount, 0)
    : bills.reduce((sum, b) => sum + b.amount, 0);
  
  // Salaries for filtered month (assume base salary if filtered)
  const totalSalariesPKR = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  
  const totalCashOutPKR = totalExpensesPKR + totalSalariesPKR + totalBillsPKR;
  const netProfitPKR = totalIncomePKR - totalCashOutPKR;
  const profitMargin = totalIncomePKR > 0 ? Math.round((netProfitPKR / totalIncomePKR) * 100) : 0;
  
  const activeEmpsCount = employees.filter(e => e.status === 'active').length;
  const attRate = activeEmpsCount > 0 ? Math.round((displayAttendance.filter(a => a.status === 'present' || a.status === 'late').length / (isFiltered ? (activeEmpsCount * 22) : activeEmpsCount)) * 100) : 0;

  const myDeptScore = myDeptEmps.length > 0 
    ? Math.round(myDeptEmps.reduce((sum, emp) => {
        const empTasks = displayTasks.filter(t => t.employeeId === emp.id);
        return sum + (empTasks.length > 0 ? empTasks.reduce((s, t) => s + t.score, 0) / empTasks.length : 0);
      }, 0) / myDeptEmps.length) 
    : 0;

  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => (currentYearNum + 10 - i).toString());
  const months = [
    { v: '01', l: 'January' }, { v: '02', l: 'February' }, { v: '03', l: 'March' },
    { v: '04', l: 'April' }, { v: '05', l: 'May' }, { v: '06', l: 'June' },
    { v: '07', l: 'July' }, { v: '08', l: 'August' }, { v: '09', l: 'September' },
    { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
  ];

  const rankings = employees.map(emp => {
    const empTasks = displayTasks.filter(t => t.employeeId === emp.id);
    const score = empTasks.length > 0 ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length) : 0;
    return { name: emp.name, score };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  const formatUSD = (val: number) => `$ ${val.toLocaleString()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 0. HISTORICAL FILTER BAR */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 25px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔍</span>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>Global Search Engine:</div>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', color: 'var(--text)', outline: 'none', fontWeight: 'bold' }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', color: 'var(--text)', outline: 'none', fontWeight: 'bold' }}>
            {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
          <button 
            onClick={() => setIsFiltered(!isFiltered)}
            style={{ background: isFiltered ? 'var(--accent)' : 'var(--bg3)', color: isFiltered ? '#fff' : 'var(--text)', border: 'none', borderRadius: '10px', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
          >
            {isFiltered ? '✨ History Active' : 'Search Ledger'}
          </button>
        </div>
        {isFiltered && (
          <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold', background: 'var(--accent)22', padding: '5px 12px', borderRadius: '20px' }}>
            Retrieving records for {months.find(m => m.v === filterMonth)?.l} {filterYear}
          </div>
        )}
      </div>

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

      {/* 5. DUAL-CURRENCY KPI GRID (ADMIN ONLY) */}
      {isAdmin && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <KPICard title="Project Revenue" value={formatUSD(totalProjectIncomeUSD)} subtitle={`Budget: ${formatUSD(totalProjectBudgetUSD)}`} icon="💵" color="#6366f1" />
            <KPICard title="Staff Salaries" value={formatCurrency(totalSalariesPKR)} subtitle={`${employees.length} Employees`} icon="💳" color="#dc2626" />
            <KPICard title="Office Expenses" value={formatCurrency(totalExpensesPKR)} subtitle="Maintenance & Ops" icon="🧾" color="#f59e0b" />
            <KPICard title="Utility Bills" value={formatCurrency(totalBillsPKR)} subtitle="Electric, Rent, etc." icon="🏢" color="#2563eb" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <KPICard title="Overall Net Profit (PKR)" value={formatCurrency(netProfitPKR)} subtitle={netProfitPKR >= 0 ? `Benefit Margin: ${profitMargin}%` : `Loss Margin: ${Math.abs(profitMargin)}%`} icon={netProfitPKR >= 0 ? "📈" : "📉"} color={netProfitPKR >= 0 ? "#059669" : "#dc2626"} highlight={true} />
            <KPICard title="Combined Income (PKR)" value={formatCurrency(totalIncomePKR)} subtitle={`Incl. USD conversion @ ${USD_TO_PKR}`} icon="💰" color="#059669" />
          </div>
        </>
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
                          <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 'bold' }}>{log.timestamp.includes(',') ? `${log.timestamp.split(',')[0].split('/').reverse().join('/')}, ${formatTimeAMPM(log.timestamp.split(',')[1].trim().substring(0,5))}` : log.timestamp}</div>
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

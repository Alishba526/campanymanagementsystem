'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { formatTimeAMPM, formatDateShort } from '@/lib/dateUtils';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function EnhancedDashboard({ onNavigate }: DashboardProps) {
  const { currentUser, employees, attendance, auditLogs, income, expenses, tasks, announcements, projects, bills } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Filtering States
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

  const displayBills = isFiltered 
    ? bills.filter(b => b.date.startsWith(filterPrefix))
    : bills;

  const displayProjects = isFiltered 
    ? projects.filter(p => p.startDate.startsWith(filterPrefix))
    : projects;

  // Manager Specific Data
  const managerDept = currentUser.role;
  const myDeptEmps = employees.filter(e => e.department === managerDept);
  const myDeptAtt = displayAttendance.filter(a => myDeptEmps.find(e => e.id === a.employeeId));
  const myDeptPresent = myDeptAtt.filter(a => a.status === 'present' || a.status === 'late').length;
  
  const myDeptLogs = auditLogs.filter(log => {
    const isMyAction = log.user === currentUser.name;
    const isMyTeamAction = myDeptEmps.some(emp => log.action.includes(emp.name) || log.action.includes(emp.id));
    return isMyAction || isMyTeamAction;
  });

  const formattedDateDay = currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Admin Stats Calculations
  const totalManualIncomePKR = displayIncome.reduce((sum, i) => sum + i.amount, 0);
  
  // Dynamic Project Income Calculation (Convert USD to PKR)
  const totalProjectIncomeUSD = displayProjects.reduce((sum, p) => sum + (p.amountReceived || 0), 0);
  const totalProjectBudgetUSD = displayProjects.reduce((sum, p) => sum + (p.cost || 0), 0);
  const totalProjectIncomePKR = totalProjectIncomeUSD * USD_TO_PKR;
  
  const totalIncomePKR = totalManualIncomePKR + totalProjectIncomePKR;

  const totalExpensesPKR = displayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBillsPKR = displayBills.reduce((sum, b) => sum + b.amount, 0);
  const totalSalariesPKR = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  
  const totalCashOutPKR = totalExpensesPKR + totalSalariesPKR + totalBillsPKR;
  const netProfitPKR = totalIncomePKR - totalCashOutPKR;
  const profitMargin = totalIncomePKR > 0 ? Math.round((netProfitPKR / totalIncomePKR) * 100) : 0;
  
  const activeEmpsCount = employees.filter(e => e.status === 'active').length;
  const presentCount = displayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attRate = activeEmpsCount > 0 ? Math.round((presentCount / (isFiltered ? (activeEmpsCount * 22) : activeEmpsCount)) * 100) : 0;

  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => (currentYearNum + 10 - i).toString());
  const months = [
    { v: '01', l: 'January' }, { v: '02', l: 'February' }, { v: '03', l: 'March' },
    { v: '04', l: 'April' }, { v: '05', l: 'May' }, { v: '06', l: 'June' },
    { v: '07', l: 'July' }, { v: '08', l: 'August' }, { v: '09', l: 'September' },
    { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
  ];

  const rankings = employees.map(emp => {
    const empTasks = tasks.filter(t => t.employeeId === emp.id);
    const score = empTasks.length > 0 ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length) : 0;
    return { name: emp.name, score };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  const formatUSD = (val: number) => `$ ${val.toLocaleString()}`;

  // Active Attendance Logic (On Duty staff within 12h)
  const onDutyStaff = attendance.filter(a => {
    if (a.checkOut !== '--') return false;
    const [year, mon, day] = a.date.split('-').map(Number);
    const [h, m] = a.checkIn.split(':').map(Number);
    const checkInDateTime = new Date(year, mon - 1, day, h, m);
    const diff = (new Date().getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60);
    return diff <= 12; // Must be within 12 hours
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* 0. GLOBAL SEARCH ENGINE (ABSOLUTE TOP) */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 25px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔍</span>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Search Engine:</div>
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
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '900', background: 'var(--accent)15', padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--accent)33' }}>
            Viewing: {months.find(m => m.v === filterMonth)?.l} {filterYear}
          </div>
        )}
      </div>

      {/* 1. QUICK ACTIONS (SINGLE ROW) */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', boxShadow: 'var(--shadow)' }}>
         <h3 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '15px', opacity: 0.7 }}>⚡ Global Management</h3>
         <div style={{ 
           display: 'grid', 
           gridTemplateColumns: 'repeat(8, 1fr)', 
           gap: '12px',
           overflowX: 'auto',
           paddingBottom: '5px'
         }} className="custom-scrollbar">
            <ActionCard icon="👥" label="Staff" onClick={() => onNavigate?.('employees')} />
            <ActionCard icon="⏰" label="Attend" onClick={() => onNavigate?.('attendance')} />
            {isAdmin && <ActionCard icon="💸" label="Expense" onClick={() => onNavigate?.('expenses')} />}
            {isAdmin && <ActionCard icon="💰" label="Income" onClick={() => onNavigate?.('finance')} />}
            <ActionCard icon="📊" label="Reports" onClick={() => onNavigate?.('reports')} />
            <ActionCard icon="🏖️" label="Leaves" onClick={() => onNavigate?.('leaves')} />
            <ActionCard icon="🚀" label="Project" onClick={() => onNavigate?.('projects')} />
            <ActionCard icon="📅" label="Schedule" onClick={() => onNavigate?.('schedule')} />
         </div>
      </div>

      {/* 2. DUAL-CURRENCY KPI GRID (ADMIN STYLE - AS AT 1AM) */}
      {isAdmin && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <KPICard title="Project Revenue" value={formatUSD(totalProjectIncomeUSD)} subtitle={`Budget: ${formatUSD(totalProjectBudgetUSD)}`} icon="💵" color="#6366f1" />
            <KPICard title="Staff Salaries" value={formatCurrency(totalSalariesPKR)} subtitle={`${employees.length} Employees`} icon="💳" color="#ef4444" />
            <KPICard title="Office Expenses" value={formatCurrency(totalExpensesPKR)} subtitle="Maintenance & Ops" icon="🧾" color="#f59e0b" />
            <KPICard title="Utility Bills" value={formatCurrency(totalBillsPKR)} subtitle="Electric, Rent, etc." icon="🏢" color="#2563eb" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <KPICard title="Overall Net Profit (PKR)" value={formatCurrency(netProfitPKR)} subtitle={netProfitPKR >= 0 ? `Benefit Margin: ${profitMargin}%` : `Loss Margin: ${Math.abs(profitMargin)}%`} icon={netProfitPKR >= 0 ? "📈" : "📉"} color={netProfitPKR >= 0 ? "#10b981" : "#ef4444"} highlight={true} />
            <KPICard title="Combined Income (PKR)" value={formatCurrency(totalIncomePKR)} subtitle={`Incl. USD conversion @ ${USD_TO_PKR}`} icon="💰" color="#10b981" />
          </div>
        </>
      )}

      {/* 2.5 ACTIVE PROJECT MONITOR */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <div style={{ fontSize: '24px' }}>🚀</div>
          <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Project Monitor</h3>
          <div style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', padding: '2px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
            {projects.filter(p => ['Working on', 'New Project'].includes(p.status)).length} ONGOING
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }} className="custom-scrollbar">
          {projects
            .filter(p => ['Working on', 'New Project'].includes(p.status))
            .map(p => (
            <div key={p.id} onClick={() => onNavigate?.('projects')} style={{ minWidth: '240px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '18px', padding: '15px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)' }}>#{p.projectNo}</span>
                <span style={{ fontSize: '9px', background: p.status === 'New Project' ? '#f5f3ff' : '#eff6ff', color: p.status === 'New Project' ? '#7c3aed' : '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>{p.status.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', marginBottom: '4px' }}>{p.projectName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', marginBottom: '10px' }}>👤 {p.clientName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                 <span style={{ fontSize: '12px', fontWeight: '900', color: '#059669' }}>$ {(p.cost || 0).toLocaleString()}</span>
                 <span style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: '700' }}>⏳ {formatDateShort(p.deadline)}</span>
              </div>
            </div>
          ))}
          {projects.filter(p => (isAdmin || p.department === currentUser.role) && (['Working on', 'New Project'].includes(p.status))).length === 0 && (
            <div style={{ padding: '20px', color: 'var(--text3)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>No projects currently active.</div>
          )}
        </div>
      </div>

      {/* 2.6 ACTIVE ATTENDANCE MONITOR */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', boxShadow: 'var(--shadow)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <div style={{ fontSize: '24px' }}>⏰</div>
          <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Attendance Monitor</h3>
          <div style={{ marginLeft: 'auto', background: '#059669', color: '#fff', padding: '2px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
            {onDutyStaff.length} ON DUTY
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }} className="custom-scrollbar">
          {onDutyStaff.map(a => (
            <div key={a.id} onClick={() => onNavigate?.('attendance')} style={{ minWidth: '220px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '18px', padding: '15px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text3)' }}>{a.employeeId}</span>
                <span style={{ fontSize: '9px', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>ON DUTY</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', marginBottom: '4px' }}>{a.employeeName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                 <span style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 'bold' }}>IN:</span>
                 <span style={{ fontSize: '13px', fontWeight: '900', color: '#059669' }}>{formatTimeAMPM(a.checkIn)}</span>
              </div>
            </div>
          ))}
          {onDutyStaff.length === 0 && (
            <div style={{ padding: '20px', color: 'var(--text3)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>No staff members currently on duty.</div>
          )}
        </div>
      </div>

      {/* 3. ACTIVITY & RANKINGS (2 COLUMN) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '20px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📜 Recent System Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {(isAdmin ? auditLogs : myDeptLogs).slice(0, 6).map((log, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'var(--bg3)', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid var(--border)' }}>👤</div>
                       <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: '900' }}>{log.user}</span>: {log.action}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700', marginTop: '2px' }}>⏲️ {log.timestamp}</div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '20px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏆 Performance Ranking</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {rankings.map((r, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: 'var(--bg3)', borderRadius: '12px', borderLeft: `4px solid ${i === 0 ? '#10b981' : i === 1 ? '#6366f1' : 'var(--border)'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '12px', fontWeight: '900', color: i === 0 ? '#10b981' : 'var(--text3)' }}>#{i+1}</span>
                       <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)' }}>{r.name}</span>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: r.score >= 80 ? '#10b981' : r.score >= 50 ? '#2563eb' : '#ef4444' }}>{r.score}%</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '18px', padding: '12px 5px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)'; }}>
       <div style={{ fontSize: '22px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>{icon}</div>
       <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </button>
  );
}

function KPICard({ title, value, subtitle, icon, color, highlight }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: highlight ? `1.5px solid ${color}55` : '1px solid var(--border)', borderRadius: '28px', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: highlight ? `0 15px 30px -10px ${color}22` : 'var(--shadow)', transition: '0.3s' }}>
       <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '50px', opacity: 0.03, transform: 'rotate(-15deg)' }}>{icon}</div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: `1px solid ${color}33` }}>{icon}</div>
          {highlight && <div style={{ fontSize: '8px', fontWeight: '900', color: color, background: `${color}15`, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', border: `1px solid ${color}33` }}>Live Engine</div>}
       </div>
       <div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text)', letterSpacing: '-0.5px' }}>{value}</div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text2)', textTransform: 'uppercase', marginTop: '4px', opacity: 0.8 }}>{title}</div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '700', marginTop: '8px', background: 'var(--bg3)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>{subtitle}</div>
       </div>
    </div>
  );
}

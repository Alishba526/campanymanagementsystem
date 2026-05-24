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
  const [filterDay, setFilterDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [isFiltered, setIsFiltered] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const today = new Date().toISOString().split('T')[0];
  const filterPrefix = viewMode === 'monthly' ? `${filterYear}-${filterMonth}` : `${filterYear}-${filterMonth}-${filterDay}`;

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
  const totalProjectIncomeUSD = displayProjects.reduce((sum, p) => sum + (p.amountReceived || 0), 0);
  const totalIncomePKR = totalManualIncomePKR + (totalProjectIncomeUSD * USD_TO_PKR);

  const totalExpensesPKR = displayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBillsPKR = displayBills.reduce((sum, b) => sum + b.amount, 0);
  const totalSalariesPKR = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  
  const totalCashOutPKR = totalExpensesPKR + totalSalariesPKR + totalBillsPKR;
  const netProfitPKR = totalIncomePKR - totalCashOutPKR;
  const profitMargin = totalIncomePKR > 0 ? Math.round((netProfitPKR / totalIncomePKR) * 100) : 0;
  
  const activeEmpsCount = employees.filter(e => e.status === 'active').length;
  const presentCount = displayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attRate = activeEmpsCount > 0 ? Math.round((presentCount / (isFiltered && viewMode === 'monthly' ? (activeEmpsCount * 22) : activeEmpsCount)) * 100) : 0;

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 0. PREMIUM FILTER BAR */}
      <div style={{ background: 'linear-gradient(90deg, var(--bg2) 0%, var(--bg3) 100%)', border: '1px solid var(--border)', borderRadius: '24px', padding: '12px 25px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent)', color: '#fff', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🔍</div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Engine</div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 5px' }} />
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }}>
            {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
          <button 
            onClick={() => { setIsFiltered(!isFiltered); setViewMode('monthly'); }}
            style={{ background: isFiltered && viewMode === 'monthly' ? 'var(--accent)' : 'var(--bg2)', color: isFiltered && viewMode === 'monthly' ? '#fff' : 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 15px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', transition: '0.3s' }}
          >
            {isFiltered && viewMode === 'monthly' ? '✨ History ON' : 'Filter'}
          </button>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', background: 'var(--bg2)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border)' }}>
           {isFiltered ? `Data: ${filterPrefix}` : `Real-time Active Feed`}
        </div>
      </div>

      {/* 1. QUICK ACTIONS (STREAMLINED) */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px' }}>
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

      {/* 2. KPI GRID (ULTRA PREMIUM) */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <KPICard title="Net Profit / Loss" value={formatCurrency(netProfitPKR)} subtitle={netProfitPKR >= 0 ? `Margin: +${profitMargin}%` : `Loss: ${profitMargin}%`} icon={netProfitPKR >= 0 ? "📈" : "📉"} color={netProfitPKR >= 0 ? "#10b981" : "#ef4444"} highlight={true} />
          <KPICard title="Total Income" value={formatCurrency(totalIncomePKR)} subtitle="Gross Revenue" icon="💰" color="#10b981" />
          <KPICard title="Total Cash Out" value={formatCurrency(totalCashOutPKR)} subtitle="Costs + Payroll" icon="💸" color="#f59e0b" />
          <KPICard title="Attendance" value={`${attRate}%`} subtitle="Staff Presence" icon="👥" color="#6366f1" />
        </div>
      )}

      {/* 3. LOGS, RANKINGS & COMPACT CALENDAR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: '20px' }}>
         {/* System Activity */}
         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '15px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>📜 Activity Engine</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {(isAdmin ? auditLogs : myDeptLogs).slice(0, 5).map((log, i) => (
                 <div key={i} style={{ padding: '8px 12px', background: 'var(--bg3)', borderRadius: '12px', fontSize: '11px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: '900' }}>{log.user}</span>: {log.action}
                    <div style={{ fontSize: '9px', color: 'var(--text3)', marginTop: '3px', fontWeight: 'bold' }}>{log.timestamp}</div>
                 </div>
               ))}
            </div>
         </div>

         {/* Rankings */}
         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '15px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>🏆 Top Talent</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {rankings.map((r, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', background: 'var(--bg3)', borderRadius: '12px', borderLeft: `4px solid ${i === 0 ? '#10b981' : i === 1 ? '#6366f1' : 'var(--border)'}` }}>
                    <span style={{ fontSize: '12px', fontWeight: '800' }}>{r.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent)' }}>{r.score}%</span>
                 </div>
               ))}
            </div>
         </div>

         {/* COMPACT INTERACTIVE CALENDAR */}
         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)', maxHeight: '300px' }}>
            <Calendar 
               selectedDate={filterPrefix} 
               onDateClick={(day, month, year) => {
                 setFilterDay(day.toString().padStart(2, '0'));
                 setFilterMonth((month + 1).toString().padStart(2, '0'));
                 setFilterYear(year.toString());
                 setViewMode('daily');
                 setIsFiltered(true);
               }} 
            />
         </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '14px', padding: '10px 4px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'var(--bg2)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg3)'; }}>
       <div style={{ fontSize: '18px' }}>{icon}</div>
       <div style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </button>
  );
}

function KPICard({ title, value, subtitle, icon, color, highlight }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: highlight ? `1.5px solid ${color}44` : '1px solid var(--border)', borderRadius: '24px', padding: '20px', position: 'relative', overflow: 'hidden', boxShadow: highlight ? `0 10px 30px -10px ${color}22` : 'var(--shadow)', transition: '0.3s' }}>
       <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '50px', opacity: 0.03, transform: 'rotate(-15deg)' }}>{icon}</div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: `1px solid ${color}22` }}>{icon}</div>
          {highlight && <div style={{ fontSize: '8px', fontWeight: '900', color: color, background: `${color}10`, padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase', border: `1px solid ${color}22` }}>Live</div>}
       </div>
       <div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)', letterSpacing: '-0.5px' }}>{value}</div>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text2)', textTransform: 'uppercase', marginTop: '3px', opacity: 0.8 }}>{title}</div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '700', marginTop: '8px', background: 'var(--bg3)', padding: '3px 8px', borderRadius: '6px', display: 'inline-block' }}>{subtitle}</div>
       </div>
    </div>
  );
}

function Calendar({ selectedDate, onDateClick }: { selectedDate: string, onDateClick: (d: number, m: number, y: number) => void }) {
  const now = new Date();
  const [currMonth, setCurrMonth] = useState(now.getMonth());
  const [currYear, setCurrYear] = useState(now.getFullYear());
  
  const daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
  const firstDay = new Date(currYear, currMonth, 1).getDay();
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div style={{ scale: '0.95', origin: 'top left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
         <button onClick={() => setCurrMonth(prev => prev === 0 ? 11 : prev - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '10px' }}>◀</button>
         <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>{monthNames[currMonth]} {currYear}</div>
         <button onClick={() => setCurrMonth(prev => prev === 11 ? 0 : prev + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '10px' }}>▶</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center' }}>
         {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`dayname-${i}`} style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text3)' }}>{d}</div>)}
         {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
         {Array.from({ length: daysInMonth }).map((_, i) => {
           const day = i + 1;
           const isSelected = selectedDate === `${currYear}-${(currMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
           return (
             <div 
               key={`day-${day}`} 
               onClick={() => onDateClick(day, currMonth, currYear)}
               style={{ 
                 fontSize: '10px', 
                 padding: '6px 0', 
                 borderRadius: '8px', 
                 cursor: 'pointer', 
                 background: isSelected ? 'var(--accent)' : 'var(--bg3)',
                 color: isSelected ? '#fff' : 'var(--text)',
                 fontWeight: isSelected ? '900' : '700',
                 transition: '0.2s',
                 border: isSelected ? 'none' : '1px solid var(--border)'
               }}
             >
               {day}
             </div>
           );
         })}
      </div>
    </div>
  );
}

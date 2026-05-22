'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function EnhancedDashboard({ onNavigate }: DashboardProps) {
  const { currentUser, employees, attendance, auditLogs, income, expenses, tasks, announcements } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const today = new Date().toISOString().split('T')[0];

  const formatCurrency = (amount: number) => `Rs. ${(amount || 0).toLocaleString()}`;

  // Calculations
  const totalIncome = income.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const totalCashOut = totalExpenses + totalSalaries;
  const netProfit = totalIncome - totalCashOut;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const todayAttendance = attendance.filter(a => a.date === today);
  const attRate = employees.length > 0 ? Math.round((todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length / employees.length) * 100) : 0;

  const rankings = employees.map(emp => {
    const empTasks = tasks.filter(t => t.employeeId === emp.id);
    const score = empTasks.length > 0 ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length) : 0;
    return { name: emp.name, score };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. ANNOUNCEMENTS (Keep this for Managers/Realtime) */}
      {!isAdmin && announcements.length > 0 && (
        <div style={{ background: 'var(--accentbg)', border: '1px solid var(--accent)', borderRadius: '18px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--accent2)' }}>📢 Latest Announcements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             {announcements.slice(0, 2).map((a, i) => (
               <div key={i} style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{a.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>{a.message}</div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* 2. QUICK ACTIONS */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
         <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>⚡ Quick Actions</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <ActionCard icon="👥" label="Add Employee" desc="Register new team member" onClick={() => onNavigate?.('employees')} />
            <ActionCard icon="⏰" label="Mark Attendance" desc="Record daily attendance" onClick={() => onNavigate?.('attendance')} />
            {isAdmin && <ActionCard icon="💸" label="Add Expense" desc="Log new expense" onClick={() => onNavigate?.('expenses')} />}
            {isAdmin && <ActionCard icon="💰" label="Add Income" desc="Record client payment" onClick={() => onNavigate?.('finance')} />}
            {isAdmin && <ActionCard icon="📋" label="Manage Bills" desc="Company bills & utilities" onClick={() => onNavigate?.('bills')} />}
            <ActionCard icon="📊" label="View Reports" desc="Historical data & analytics" onClick={() => onNavigate?.('reports')} />
            <ActionCard icon="📅" label="Leave Requests" desc="0 pending approvals" onClick={() => onNavigate?.('leaves')} />
            <ActionCard icon="📁" label="Client Projects" desc="0 active projects" onClick={() => onNavigate?.('projects')} />
         </div>
      </div>

      {/* 3. KPI GRID */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <KPICard 
            title="Net Profit / Loss" 
            value={formatCurrency(netProfit)} 
            subtitle={netProfit >= 0 ? `Benefit Margin: ${profitMargin}%` : `Loss Margin: ${Math.abs(profitMargin)}%`} 
            icon={netProfit >= 0 ? "📈" : "📉"} 
            color={netProfit >= 0 ? "var(--green)" : "var(--red)"}
            highlight={true}
          />
          <KPICard title="Total Income" value={formatCurrency(totalIncome)} subtitle="Revenue Received" icon="💰" color="var(--green)" />
          <KPICard title="Total Cash Out" value={formatCurrency(totalCashOut)} subtitle="Exp + Salaries" icon="💸" color="var(--red)" />
          <KPICard title="Attendance Rate" value={`${attRate}%`} subtitle={`${todayAttendance.length}/${employees.length} present`} icon="👥" color="var(--blue)" />
        </div>
      )}

      {/* 4. DEPARTMENT WISE ATTENDANCE */}
      {isAdmin && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>🏢 Department-wise Today Attendance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
             {['ecommerce', 'marketing', 'architecture'].map(dept => {
                const deptEmps = employees.filter(e => e.department === dept);
                const deptAtt = todayAttendance.filter(a => deptEmps.find(e => e.id === a.employeeId));
                const present = deptAtt.filter(a => a.status === 'present' || a.status === 'late');
                const late = deptAtt.filter(a => a.status === 'late').length;
                const absent = deptEmps.length - present.length;

                return (
                  <div key={dept} style={{ background: 'var(--bg3)', borderRadius: '18px', padding: '20px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '4px' }}>{dept}</div>
                     <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '15px' }}>{present.length}/{deptEmps.length} Present</div>
                     
                     <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>Present Today:</div>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                        {present.map(p => (
                          <span key={p.id} style={{ fontSize: '12px', fontWeight: '500' }}>{p.employeeName} <span style={{ color: 'var(--green)' }}>●</span></span>
                        ))}
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', textAlign: 'center' }}>
                        <div style={{ background: 'var(--bg2)', padding: '8px', borderRadius: '10px' }}>
                           <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{present.length - late}</div>
                           <div style={{ fontSize: '9px', color: 'var(--text2)' }}>On Time</div>
                        </div>
                        <div style={{ background: 'var(--bg2)', padding: '8px', borderRadius: '10px' }}>
                           <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--amber)' }}>{late}</div>
                           <div style={{ fontSize: '9px', color: 'var(--text2)' }}>Late</div>
                        </div>
                        <div style={{ background: 'var(--bg2)', padding: '8px', borderRadius: '10px' }}>
                           <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)' }}>{absent}</div>
                           <div style={{ fontSize: '9px', color: 'var(--text2)' }}>Absent</div>
                        </div>
                     </div>
                  </div>
                );
             })}
          </div>
        </div>
      )}

      {/* 5. RECENT ACTIVITY & RANKING */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>📜 Recent System Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {auditLogs.slice(0, 6).map((log, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                       <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{log.user}:{log.action}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{log.timestamp}</div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>🏆 Performance Ranking</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {rankings.map((r, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'var(--bg3)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)' }}>#{i+1}</span>
                       <span style={{ fontSize: '14px', fontWeight: '600' }}>{r.name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)' }}>{r.score}%</span>
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
    <button onClick={onClick} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '18px', padding: '15px', textAlign: 'left', cursor: 'pointer', transition: '0.2s', display: 'flex', flexDirection: 'column', gap: '5px' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
       <div style={{ fontSize: '20px', marginBottom: '5px' }}>{icon}</div>
       <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>{label}</div>
       <div style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.3' }}>{desc}</div>
    </button>
  );
}

function KPICard({ title, value, subtitle, icon, color }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{icon}</div>
       </div>
       <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>{value}</div>
       <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{title}</div>
       <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{subtitle}</div>
    </div>
  );
}

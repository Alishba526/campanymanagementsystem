'use client';

import { useApp } from '@/context/AppContext';

export default function Dashboard() {
  const { currentUser, employees, attendance, tasks, expenses, income } = useApp();

  if (!currentUser) return null;

  // Filter employees by department for managers
  const departmentEmployees = currentUser.role === 'admin'
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  // Calculate statistics
  const totalIncome = income.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalariesPaid = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const totalCashOut = totalExpenses + totalSalariesPaid;
  const netProfit = totalIncome - totalCashOut;

  // Calculate Net Profit per department
  const getDeptNetProfit = (dept: string) => {
    // Filter income by status and the direct 'department' field
    const deptIncome = income.filter(i => i.status === 'received' && i.department === dept).reduce((sum, i) => sum + i.amount, 0);
    const deptExpenses = expenses.filter(e => e.department === dept).reduce((sum, e) => sum + e.amount, 0);
    const deptSalaries = employees.filter(e => e.department === dept).reduce((sum, e) => sum + (e.salary || 0), 0);
    return deptIncome - (deptExpenses + deptSalaries);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;

  const avgPerformance = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.score, 0) / tasks.length)
    : 0;

  const lowPerformanceAlerts = tasks.filter(t => t.score < 60);

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {currentUser.role === 'admin' ? (
          <>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--greenbg)', color: 'var(--green)' }}>
                📈
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--green)' }}>{formatCurrency(netProfit)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Company Net Profit</div>
              <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '4px' }}>Cash In - (Exp + Salary)</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--bluebg)', color: 'var(--blue)' }}>
                💰
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--text)' }}>{formatCurrency(totalIncome)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Total Client Income</div>
              <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '4px' }}>Client Transaction Tracking</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--redbg)', color: 'var(--red)' }}>
                🧾
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--text)' }}>{formatCurrency(totalSalariesPaid)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Monthly Salaries Paid</div>
              <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>Tracking Salary Cash Out</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--accentbg)', color: 'var(--accent)' }}>
                🏢
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--text)' }}>{formatCurrency(totalExpenses)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Operating Expenses</div>
              <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}>Rent, Utility, Software</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--greenbg)', color: 'var(--green)' }}>
                👥
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--text)' }}>{departmentEmployees.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Team Members</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--bluebg)', color: 'var(--blue)' }}>
                ⏰
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--text)' }}>{presentToday}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Present Today</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--amberbg)', color: 'var(--amber)' }}>
                📈
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--text)' }}>{avgPerformance}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Avg Performance</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--redbg)', color: 'var(--red)' }}>
                ⚠️
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', color: 'var(--text)' }}>{lowPerformanceAlerts.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Low Perf Alerts</div>
            </div>
          </>
        )}
      </div>

      {/* Low Performance Alerts */}
      {lowPerformanceAlerts.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          {lowPerformanceAlerts.map(task => (
            <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius)', marginBottom: '12px', fontSize: '13px', background: 'var(--redbg)', border: '1px solid var(--red)', color: 'var(--red)' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <div>
                <strong>Low Performance Alert:</strong> {task.employeeName} — "{task.task}" — Score: {task.score}/100
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Attendance */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', marginBottom: '18px' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>⏰</span>
            Today's Attendance
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Check In</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Check Out</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Hours</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAttendance.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 'normal' }}>{record.employeeName}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{record.checkIn}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{record.checkOut}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{record.hours}h</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 'normal',
                      background: record.status === 'present' ? 'var(--greenbg)' :
                                 record.status === 'late' ? 'var(--amberbg)' :
                                 record.status === 'leave' ? 'var(--bluebg)' : 'var(--redbg)',
                      color: record.status === 'present' ? 'var(--green)' :
                             record.status === 'late' ? 'var(--amber)' :
                             record.status === 'leave' ? 'var(--blue)' : 'var(--red)'
                    }}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Activity & Performance */}
      {currentUser.role === 'admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginTop: '22px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                <span>📜</span> Recent <strong>System Activity</strong>
              </div>
            </div>
            <div style={{ padding: '10px' }}>
              {(useApp().auditLogs || []).slice(0, 6).map((log: any) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid var(--bg3)', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{log.user}:</span>
                    <span style={{ color: 'var(--text2)', marginLeft: '6px' }}>{log.action}</span>
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: '11px' }}>{log.timestamp.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                <span>💰</span> <strong>Department</strong> Net Profit
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {['ecommerce', 'marketing', 'architecture'].map(dept => {
                const profit = getDeptNetProfit(dept);
                return (
                  <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text2)' }}>{dept}</span>
                    <span style={{ fontWeight: '600', color: profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatCurrency(profit)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

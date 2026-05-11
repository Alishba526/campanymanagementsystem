'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';

export default function EnhancedDashboard() {
  const { currentUser, employees, attendance, tasks, expenses, income, leaveRequests, projects } = useApp();
  const [alerts, setAlerts] = useState<any[]>([]);

  if (!currentUser) return null;

  // Filter employees by department for managers
  const departmentEmployees = currentUser.role === 'admin'
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  // Calculate statistics
  const totalIncome = income.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
  const pendingIncome = income.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalariesPaid = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const totalCashOut = totalExpenses + totalSalariesPaid;
  const netProfit = totalIncome - totalCashOut;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 0;

  const avgPerformance = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.score, 0) / tasks.length)
    : 0;

  const lowPerformanceAlerts = tasks.filter(t => t.score < 60);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

  // Active projects
  const activeProjects = projects.filter(p => p.status === 'active');
  const projectsWithPendingPayment = projects.filter(p => p.amountReceived < p.totalBudget);
  const totalPendingFromProjects = projectsWithPendingPayment.reduce((sum, p) => sum + (p.totalBudget - p.amountReceived), 0);

  // Generate Smart Alerts
  useEffect(() => {
    const newAlerts = [];

    // Financial Alerts
    if (netProfit < 0) {
      newAlerts.push({
        type: 'critical',
        icon: '🚨',
        title: 'Negative Profit Alert',
        message: `Company is running at a loss of Rs. ${Math.abs(netProfit).toLocaleString()}`,
        action: 'Review expenses and increase revenue'
      });
    }

    if (pendingIncome > totalIncome * 0.3) {
      newAlerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'High Pending Income',
        message: `Rs. ${pendingIncome.toLocaleString()} pending from clients`,
        action: 'Follow up with clients for payment'
      });
    }

    if (totalExpenses > totalIncome * 0.7) {
      newAlerts.push({
        type: 'warning',
        icon: '💸',
        title: 'High Expense Ratio',
        message: `Expenses are ${Math.round((totalExpenses/totalIncome)*100)}% of income`,
        action: 'Consider cost optimization'
      });
    }

    // HR Alerts
    if (absentToday > employees.length * 0.2) {
      newAlerts.push({
        type: 'warning',
        icon: '👥',
        title: 'High Absenteeism',
        message: `${absentToday} employees absent today (${Math.round((absentToday/employees.length)*100)}%)`,
        action: 'Check for issues or patterns'
      });
    }

    if (lowPerformanceAlerts.length > 0) {
      newAlerts.push({
        type: 'warning',
        icon: '📉',
        title: 'Low Performance Detected',
        message: `${lowPerformanceAlerts.length} employees with score < 60`,
        action: 'Schedule performance review meetings'
      });
    }

    if (pendingLeaves > 5) {
      newAlerts.push({
        type: 'info',
        icon: '📅',
        title: 'Pending Leave Requests',
        message: `${pendingLeaves} leave requests awaiting approval`,
        action: 'Review and approve/reject leaves'
      });
    }

    // Project Alerts
    if (totalPendingFromProjects > 0) {
      newAlerts.push({
        type: 'info',
        icon: '💰',
        title: 'Pending Project Payments',
        message: `Rs. ${totalPendingFromProjects.toLocaleString()} pending from ${projectsWithPendingPayment.length} projects`,
        action: 'Send payment reminders to clients'
      });
    }

    // Success Alerts
    if (profitMargin > 30) {
      newAlerts.push({
        type: 'success',
        icon: '🎉',
        title: 'Excellent Profit Margin',
        message: `${profitMargin}% profit margin - Great performance!`,
        action: 'Keep up the good work'
      });
    }

    if (avgPerformance > 85) {
      newAlerts.push({
        type: 'success',
        icon: '⭐',
        title: 'High Team Performance',
        message: `Average team score: ${avgPerformance}/100`,
        action: 'Consider team rewards'
      });
    }

    setAlerts(newAlerts);
  }, [netProfit, pendingIncome, totalExpenses, totalIncome, absentToday, employees.length, lowPerformanceAlerts.length, pendingLeaves, totalPendingFromProjects, profitMargin, avgPerformance, projectsWithPendingPayment.length]);

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return { bg: 'var(--redbg)', border: 'var(--red)', color: 'var(--red)' };
      case 'warning':
        return { bg: 'var(--amberbg)', border: 'var(--amber)', color: 'var(--amber)' };
      case 'success':
        return { bg: 'var(--greenbg)', border: 'var(--green)', color: 'var(--green)' };
      default:
        return { bg: 'var(--bluebg)', border: 'var(--blue)', color: 'var(--blue)' };
    }
  };

  return (
    <div>
      {/* Smart Alerts Section */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <div style={{ fontSize: '13px', fontWeight: 700, color: style.color, marginBottom: '4px' }}>{alert.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px' }}>{alert.message}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic' }}>→ {alert.action}</div>
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
        {currentUser.role === 'admin' ? (
          <>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: netProfit >= 0 ? 'var(--greenbg)' : 'var(--redbg)', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {netProfit >= 0 ? '📈' : '📉'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatCurrency(netProfit)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Net Profit</div>
              <div style={{ fontSize: '11px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', marginTop: '4px' }}>Margin: {profitMargin}%</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--bluebg)', color: 'var(--blue)' }}>
                💰
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{formatCurrency(totalIncome)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Income</div>
              <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '4px' }}>Pending: {formatCurrency(pendingIncome)}</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--redbg)', color: 'var(--red)' }}>
                💸
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{formatCurrency(totalCashOut)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Cash Out</div>
              <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>Exp + Salaries</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: attendanceRate >= 80 ? 'var(--greenbg)' : 'var(--amberbg)', color: attendanceRate >= 80 ? 'var(--green)' : 'var(--amber)' }}>
                👥
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{attendanceRate}%</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Attendance Rate</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{presentToday}/{employees.length} present</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--greenbg)', color: 'var(--green)' }}>
                👥
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{departmentEmployees.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Team Members</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--bluebg)', color: 'var(--blue)' }}>
                ⏰
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{presentToday}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Present Today</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--amberbg)', color: 'var(--amber)' }}>
                📈
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{avgPerformance}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Avg Performance</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px', background: 'var(--redbg)', color: 'var(--red)' }}>
                ⚠️
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{lowPerformanceAlerts.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Low Perf Alerts</div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions for Admin */}
      {currentUser.role === 'admin' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px', marginBottom: '22px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--text)' }}>⚡ Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: '.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg3)'}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📋</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>Pending Leaves</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--amber)', marginTop: '4px' }}>{pendingLeaves}</div>
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: '.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg3)'}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🧾</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>Pending Expenses</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--amber)', marginTop: '4px' }}>{pendingExpenses}</div>
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: '.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg3)'}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📁</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>Active Projects</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blue)', marginTop: '4px' }}>{activeProjects.length}</div>
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: '.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg3)'}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📉</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>Low Performers</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--red)', marginTop: '4px' }}>{lowPerformanceAlerts.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Attendance */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', marginBottom: '18px' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>⏰</span>
            Today's Attendance
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Check In</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Check Out</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Hours</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAttendance.slice(0, 8).map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{record.employeeName}</td>
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
                      fontWeight: 600,
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
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                <span>📜</span> Recent <strong>System Activity</strong>
              </div>
            </div>
            <div style={{ padding: '10px' }}>
              {(useApp().auditLogs || []).slice(0, 6).map((log: any) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid var(--bg3)', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{log.user}:</span>
                    <span style={{ color: 'var(--text2)', marginLeft: '6px' }}>{log.action}</span>
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: '11px' }}>{log.timestamp.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                <span>🏢</span> <strong>Department</strong> Performance
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {['ecommerce', 'marketing', 'architecture'].map(dept => {
                const deptTasks = tasks.filter(t => {
                  const emp = employees.find(e => e.id === t.employeeId);
                  return emp?.department === dept;
                });
                const deptScore = deptTasks.length > 0
                  ? Math.round(deptTasks.reduce((sum, t) => sum + t.score, 0) / deptTasks.length)
                  : 0;

                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text2)', fontWeight: 600 }}>{dept}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 700 }}>{deptScore}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${deptScore}%`, height: '100%', background: deptScore > 80 ? 'var(--green)' : 'var(--accent)' }} />
                    </div>
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

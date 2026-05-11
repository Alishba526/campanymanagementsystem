'use client';

import { useApp } from '@/context/AppContext';

export default function DepartmentAnalytics() {
  const { currentUser, employees, income, expenses, tasks } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Only Admin can view Department Analytics.</p>
        </div>
      </div>
    );
  }

  const departments = ['ecommerce', 'marketing', 'architecture'];

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  // Calculate department-wise metrics
  const deptMetrics = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptTasks = tasks.filter(t => {
      const emp = employees.find(e => e.id === t.employeeId);
      return emp?.department === dept;
    });

    // Calculate average performance
    const avgPerformance = deptTasks.length > 0
      ? Math.round(deptTasks.reduce((sum, t) => sum + t.score, 0) / deptTasks.length)
      : 0;

    // Calculate department expenses (salaries + operational expenses)
    const salaryExpense = deptEmployees.reduce((sum, e) => sum + e.salary, 0);
    const operationalExpense = expenses
      .filter(e => e.description.toLowerCase().includes(dept) ||
                   (dept === 'ecommerce' && e.category === 'Operations') ||
                   (dept === 'marketing' && e.category === 'Marketing') ||
                   (dept === 'architecture' && e.category === 'Infrastructure'))
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = salaryExpense + operationalExpense;

    // Calculate department revenue (income from projects)
    const deptRevenue = income
      .filter(i => i.status === 'received' &&
                   (i.project.toLowerCase().includes(dept) ||
                    i.project.toLowerCase().includes(dept === 'ecommerce' ? 'commerce' : dept)))
      .reduce((sum, i) => sum + i.amount, 0);

    const profit = deptRevenue - totalExpense;
    const roi = totalExpense > 0 ? Math.round((profit / totalExpense) * 100) : 0;

    return {
      name: dept,
      label: dept === 'ecommerce' ? 'E-Commerce' : dept === 'marketing' ? 'Marketing' : 'Architecture',
      icon: dept === 'ecommerce' ? '🛒' : dept === 'marketing' ? '📢' : '🏗️',
      employees: deptEmployees.length,
      avgPerformance,
      revenue: deptRevenue,
      expense: totalExpense,
      salaryExpense,
      operationalExpense,
      profit,
      roi,
      tasksCompleted: deptTasks.filter(t => t.completion === 100).length,
      totalTasks: deptTasks.length
    };
  });

  // Sort by profit
  const sortedByProfit = [...deptMetrics].sort((a, b) => b.profit - a.profit);
  const bestDept = sortedByProfit[0];
  const worstDept = sortedByProfit[sortedByProfit.length - 1];

  const totalRevenue = deptMetrics.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpense = deptMetrics.reduce((sum, d) => sum + d.expense, 0);
  const totalProfit = totalRevenue - totalExpense;

  return (
    <div>
      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            📈
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--green)' }}>{formatCurrency(totalProfit)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Company Profit</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            {bestDept.icon}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{bestDept.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Most Profitable Dept</div>
          <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '4px' }}>{formatCurrency(bestDept.profit)}</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--amberbg)', color: 'var(--amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⭐
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>
            {Math.max(...deptMetrics.map(d => d.avgPerformance))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Best Performance Score</div>
          <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '4px' }}>
            {deptMetrics.find(d => d.avgPerformance === Math.max(...deptMetrics.map(d => d.avgPerformance)))?.label}
          </div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--redbg)', color: 'var(--red)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⚠️
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{worstDept.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Needs Attention</div>
          <div style={{ fontSize: '11px', color: worstDept.profit < 0 ? 'var(--red)' : 'var(--amber)', marginTop: '4px' }}>
            {worstDept.profit < 0 ? 'Loss: ' : 'Low Profit: '}{formatCurrency(Math.abs(worstDept.profit))}
          </div>
        </div>
      </div>

      {/* Department Comparison */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', marginBottom: '18px' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>📊</span>
            Department Performance Comparison
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Department</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Employees</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Avg Score</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Revenue</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Expenses</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Profit/Loss</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>ROI</th>
              </tr>
            </thead>
            <tbody>
              {deptMetrics.map(dept => (
                <tr key={dept.name} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{dept.icon}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{dept.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{dept.employees}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: dept.avgPerformance >= 80 ? 'var(--greenbg)' : dept.avgPerformance >= 60 ? 'var(--amberbg)' : 'var(--redbg)',
                      color: dept.avgPerformance >= 80 ? 'var(--green)' : dept.avgPerformance >= 60 ? 'var(--amber)' : 'var(--red)'
                    }}>
                      {dept.avgPerformance}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>{formatCurrency(dept.revenue)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--red)' }}>{formatCurrency(dept.expense)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 700, color: dept.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {dept.profit >= 0 ? '+' : ''}{formatCurrency(dept.profit)}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: dept.roi >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {dept.roi >= 0 ? '+' : ''}{dept.roi}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {deptMetrics.map(dept => (
          <div key={dept.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>{dept.icon}</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{dept.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{dept.employees} Employees</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>Revenue</span>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>{formatCurrency(dept.revenue)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>Salary Cost</span>
                <span style={{ color: 'var(--text2)' }}>{formatCurrency(dept.salaryExpense)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>Operational Cost</span>
                <span style={{ color: 'var(--text2)' }}>{formatCurrency(dept.operationalExpense)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>Total Expense</span>
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>{formatCurrency(dept.expense)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>Net Profit</span>
                <span style={{ color: dept.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontSize: '14px' }}>
                  {formatCurrency(dept.profit)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>Performance</span>
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{dept.avgPerformance}/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text2)' }}>Tasks Done</span>
                <span style={{ color: 'var(--text2)' }}>{dept.tasksCompleted}/{dept.totalTasks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useApp } from '@/context/AppContext';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';

export default function FinancialOverviewPage() {
  const { currentUser, employees, expenses, income, bills } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Only admin can view financial overview.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  // Calculate totals
  const totalIncome = income.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const totalSalaries = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const totalBills = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);
  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);

  // Total cash out
  const totalCashOut = totalExpenses + totalSalaries + totalBills;

  // Net profit/loss
  const netProfit = totalIncome - totalCashOut;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Monthly breakdown
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', color: '#000', margin: 0, marginBottom: '8px' }}>📊 Financial Overview</h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', margin: 0 }}>Complete financial summary for {currentMonth}</p>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: netProfit >= 0 ? 'var(--greenbg)' : 'var(--redbg)', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            {netProfit >= 0 ? '📈' : '📉'}
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatCurrency(Math.abs(netProfit))}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>{netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</div>
          <div style={{ fontSize: '11px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', marginTop: '4px' }}>Margin: {profitMargin}%</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            💰
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalIncome)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Total Income</div>
          <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '4px' }}>Client Payments</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--redbg)', color: 'var(--red)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            💸
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalCashOut)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Total Cash Out</div>
          <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>All Expenses</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--amberbg)', color: 'var(--amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⏳
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(pendingBills)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Pending Bills</div>
          <div style={{ fontSize: '11px', color: 'var(--amber)', marginTop: '4px' }}>To Be Paid</div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
        {/* Cash Out Breakdown */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
              <span style={{ color: 'var(--red)' }}>💸</span>
              Cash Out Breakdown
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💳</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>Salaries</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(totalSalaries)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🧾</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>Operating Expenses</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(totalExpenses)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📋</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>Bills Paid</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(totalBills)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💸</span>
                <span style={{ fontSize: '15px', fontWeight: 'normal', color: '#000' }}>Total Cash Out</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(totalCashOut)}</span>
            </div>
          </div>
        </div>

        {/* Profit/Loss Analysis */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
              <span style={{ color: 'var(--accent)' }}>📊</span>
              Profit & Loss Analysis
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Total Income</span>
                <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--green)' }}>{formatCurrency(totalIncome)}</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--green)', borderRadius: '99px', width: '100%' }} />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Total Expenses</span>
                <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(totalCashOut)}</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--red)', borderRadius: '99px', width: `${totalIncome > 0 ? Math.min((totalCashOut / totalIncome) * 100, 100) : 0}%` }} />
              </div>
            </div>
            <div style={{ background: netProfit >= 0 ? 'var(--greenbg)' : 'var(--redbg)', borderRadius: '12px', padding: '16px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', marginBottom: '4px' }}>
                    {netProfit >= 0 ? '✅ PROFIT' : '⚠️ LOSS'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'normal', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {formatCurrency(Math.abs(netProfit))}
                  </div>
                </div>
                <div style={{ fontSize: '32px' }}>{netProfit >= 0 ? '📈' : '📉'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
            <span style={{ color: 'var(--accent)' }}>📑</span>
            Detailed Financial Summary
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '13px', fontWeight: 'normal', color: '#000' }}>Category</th>
                <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '13px', fontWeight: 'normal', color: '#000' }}>Amount</th>
                <th style={{ padding: '12px 0', textAlign: 'right', fontSize: '13px', fontWeight: 'normal', color: '#000' }}>% of Income</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '14px', color: 'var(--green)', fontWeight: 'normal' }}>💰 Total Income</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--green)', fontWeight: 'normal' }}>{formatCurrency(totalIncome)}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--green)' }}>100%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '14px', color: 'var(--text2)' }}>💳 Employee Salaries</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--text)' }}>{formatCurrency(totalSalaries)}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--text2)' }}>{totalIncome > 0 ? Math.round((totalSalaries / totalIncome) * 100) : 0}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '14px', color: 'var(--text2)' }}>🧾 Operating Expenses</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--text)' }}>{formatCurrency(totalExpenses)}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--text2)' }}>{totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '14px', color: 'var(--text2)' }}>📋 Company Bills</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--text)' }}>{formatCurrency(totalBills)}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--text2)' }}>{totalIncome > 0 ? Math.round((totalBills / totalIncome) * 100) : 0}%</td>
              </tr>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <td style={{ padding: '12px 0', fontSize: '14px', color: 'var(--red)', fontWeight: 'normal' }}>💸 Total Cash Out</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--red)', fontWeight: 'normal' }}>{formatCurrency(totalCashOut)}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: 'var(--red)' }}>{totalIncome > 0 ? Math.round((totalCashOut / totalIncome) * 100) : 0}%</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0', fontSize: '16px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 'normal' }}>
                  {netProfit >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '16px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 'normal' }}>
                  {formatCurrency(Math.abs(netProfit))}
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '16px', color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 'normal' }}>
                  {profitMargin}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

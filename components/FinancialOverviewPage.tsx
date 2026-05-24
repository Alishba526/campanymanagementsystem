'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function FinancialOverviewPage() {
  const { currentUser, employees, expenses, income, bills, projects } = useApp();
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Only admin can view financial overview.</p>
      </div>
    );
  }

  const USD_TO_PKR = 280;
  const formatPKR = (amount: number) => `Rs. ${(amount || 0).toLocaleString()}`;
  const currentMonthPrefix = getCurrentDate().substring(0, 7);

  // Archive Grouping
  const allMonths = Array.from(new Set([
    ...income.map(i => i.date.substring(0, 7)),
    ...expenses.map(e => e.date.substring(0, 7)),
    ...bills.map(b => b.date.substring(0, 7))
  ])).filter(m => m !== currentMonthPrefix).sort().reverse();

  const getFinancialData = (prefix: string) => {
    const monthIncome = income.filter(i => i.date.startsWith(prefix) && i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
    const projectIncomeUSD = projects.filter(p => p.startDate.startsWith(prefix)).reduce((sum, p) => sum + (p.amountReceived || 0), 0);
    const totalIncome = monthIncome + (projectIncomeUSD * USD_TO_PKR);

    const monthExpenses = expenses.filter(e => e.date.startsWith(prefix)).reduce((sum, e) => sum + e.amount, 0);
    const monthBills = bills.filter(b => b.date.startsWith(prefix)).reduce((sum, b) => sum + b.amount, 0);
    const totalSalaries = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
    
    const totalCashOut = monthExpenses + monthBills + totalSalaries;
    const netProfit = totalIncome - totalCashOut;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    return { totalIncome, totalCashOut, netProfit, profitMargin, monthExpenses, monthBills, totalSalaries, projectIncomeUSD };
  };

  const activeData = getFinancialData(currentMonthPrefix);
  const displayData = selectedArchiveMonth ? getFinancialData(selectedArchiveMonth) : activeData;

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>📊</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>Advanced Financial Hub</h2>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>{viewTab === 'active' ? `Real-time summary for ${getMonthName(currentMonthPrefix)}` : 'Browsing historical financial records'}</div>
          </div>
        </div>
      </div>

      {/* View Toggles */}
      <div style={{ display: 'flex', gap: '10px', padding: '5px', background: 'var(--bg2)', borderRadius: '15px', border: '1px solid var(--border)', width: 'fit-content' }}>
        <button 
          onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }}
          style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >⚡ Current Month</button>
        <button 
          onClick={() => setViewTab('archives')}
          style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >📁 Financial Archives</button>
      </div>

      {viewTab === 'archives' && !selectedArchiveMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {allMonths.map(month => {
            const data = getFinancialData(month);
            return (
              <div 
                key={month} 
                onClick={() => setSelectedArchiveMonth(month)}
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', cursor: 'pointer', transition: '0.3s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '60px', opacity: 0.05 }}>📂</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '15px' }}>{getMonthName(month)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text3)', fontWeight: 'bold' }}>INCOME:</span>
                    <span style={{ color: 'var(--green)', fontWeight: '900' }}>{formatPKR(data.totalIncome)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text3)', fontWeight: 'bold' }}>EXPENSES:</span>
                    <span style={{ color: 'var(--red)', fontWeight: '900' }}>{formatPKR(data.totalCashOut)}</span>
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: data.netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {data.netProfit >= 0 ? 'PROFIT' : 'LOSS'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: data.netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {formatPKR(Math.abs(data.netProfit))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(viewTab === 'active' || selectedArchiveMonth) && (
        <>
          {selectedArchiveMonth && (
            <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold', width: 'fit-content' }}>← Back to Archives</button>
          )}

          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <KPICard title={displayData.netProfit >= 0 ? 'Net Profit' : 'Net Loss'} value={formatPKR(Math.abs(displayData.netProfit))} subtitle={displayData.netProfit >= 0 ? `Margin: +${displayData.profitMargin}%` : `Deficit: ${displayData.profitMargin}%`} icon={displayData.netProfit >= 0 ? "📈" : "📉"} color={displayData.netProfit >= 0 ? "#10b981" : "#ef4444"} highlight={true} />
            <KPICard title="Total Income" value={formatPKR(displayData.totalIncome)} subtitle={`Incl. $${displayData.projectIncomeUSD} projects`} icon="💰" color="#10b981" />
            <KPICard title="Total Cash Out" value={formatPKR(displayData.totalCashOut)} subtitle="Salaries + Expenses" icon="💸" color="#ef4444" />
            <KPICard title="Utility Bills" value={formatPKR(displayData.monthBills)} subtitle="Fixed Costs" icon="🏢" color="#6366f1" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Breakdown Card */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '28px', padding: '25px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>💸 Cash Out Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <BreakdownItem label="Staff Salaries" amount={displayData.totalSalaries} icon="💳" color="#6366f1" />
                <BreakdownItem label="Operating Expenses" amount={displayData.monthExpenses} icon="🧾" color="#f59e0b" />
                <BreakdownItem label="Utility & Other Bills" amount={displayData.monthBills} icon="🏢" color="#2563eb" />
                <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)' }}>GRAND TOTAL</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>{formatPKR(displayData.totalCashOut)}</span>
                </div>
              </div>
            </div>

            {/* Analysis Card */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '28px', padding: '25px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>📊 Profit & Loss Analysis</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text2)' }}>TOTAL INCOME</span>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#10b981' }}>{formatPKR(displayData.totalIncome)}</span>
                  </div>
                  <div style={{ height: '10px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#10b981', width: '100%', borderRadius: '10px' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text2)' }}>TOTAL EXPENSES</span>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#ef4444' }}>{formatPKR(displayData.totalCashOut)}</span>
                  </div>
                  <div style={{ height: '10px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#ef4444', width: `${displayData.totalIncome > 0 ? Math.min((displayData.totalCashOut / displayData.totalIncome) * 100, 100) : 0}%`, borderRadius: '10px' }} />
                  </div>
                </div>
                <div style={{ marginTop: '10px', padding: '20px', background: displayData.netProfit >= 0 ? '#ecfdf5' : '#fef2f2', borderRadius: '20px', border: `1px solid ${displayData.netProfit >= 0 ? '#10b98133' : '#ef444433'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: displayData.netProfit >= 0 ? '#059669' : '#dc2626', textTransform: 'uppercase' }}>Current Balance</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: displayData.netProfit >= 0 ? '#059669' : '#dc2626' }}>{formatPKR(displayData.netProfit)}</div>
                    </div>
                    <div style={{ fontSize: '40px' }}>{displayData.netProfit >= 0 ? '💰' : '💸'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ title, value, subtitle, icon, color, highlight }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: highlight ? `1.5px solid ${color}44` : '1px solid var(--border)', borderRadius: '28px', padding: '20px', position: 'relative', overflow: 'hidden', boxShadow: highlight ? `0 10px 30px -10px ${color}22` : 'var(--shadow)', transition: '0.3s' }}>
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

function BreakdownItem({ label, amount, icon, color }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'var(--bg3)', borderRadius: '15px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{icon}</div>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{label}</span>
      </div>
      <span style={{ fontSize: '14px', fontWeight: '900', color: '#ef4444' }}>Rs. {amount.toLocaleString()}</span>
    </div>
  );
}

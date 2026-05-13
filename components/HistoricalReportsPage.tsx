'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { formatDateShort } from '@/lib/dateUtils';

export default function HistoricalReportsPage() {
  const { currentUser, expenses, income, bills, employees, attendance } = useApp();
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Only admin can view historical reports.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  // Filter data based on selected period
  const filterByPeriod = (dateStr: string) => {
    if (viewMode === 'daily') {
      return dateStr === selectedDate;
    } else if (viewMode === 'monthly') {
      return dateStr.startsWith(selectedMonth);
    } else {
      return dateStr.startsWith(selectedYear);
    }
  };

  // Calculate filtered data
  const filteredIncome = income.filter(i => filterByPeriod(i.date) && i.status === 'received');
  const filteredExpenses = expenses.filter(e => filterByPeriod(e.date) && e.status === 'approved');
  const filteredBills = bills.filter(b => b.paidDate && filterByPeriod(b.paidDate) && b.status === 'paid');
  const filteredAttendance = attendance.filter(a => filterByPeriod(a.date));

  // Calculate totals
  const totalIncome = filteredIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBills = filteredBills.reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);
  const totalSalaries = employees.reduce((sum, e) => sum + (e.salary || 0), 0);

  // For monthly/yearly view, calculate proportional salaries
  let proportionalSalaries = totalSalaries;
  if (viewMode === 'daily') {
    proportionalSalaries = Math.round(totalSalaries / 30); // Daily average
  } else if (viewMode === 'yearly') {
    proportionalSalaries = totalSalaries * 12; // Yearly total
  }

  const totalCashOut = totalExpenses + totalBills + proportionalSalaries;
  const netProfit = totalIncome - totalCashOut;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Attendance stats
  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  const attendanceRate = filteredAttendance.length > 0 ? Math.round((presentCount / filteredAttendance.length) * 100) : 0;

  // Get period label
  const getPeriodLabel = () => {
    if (viewMode === 'daily') {
      return new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (viewMode === 'monthly') {
      return new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } else {
      return selectedYear;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', color: '#000', margin: 0, marginBottom: '8px' }}>📊 Historical Reports</h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', margin: 0 }}>View past financial data and performance metrics</p>
      </div>

      {/* Period Selector */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('daily')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: viewMode === 'daily' ? 'var(--accent)' : 'var(--bg3)',
                color: viewMode === 'daily' ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'normal',
                transition: '.15s'
              }}
            >
              📅 Daily
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: viewMode === 'monthly' ? 'var(--accent)' : 'var(--bg3)',
                color: viewMode === 'monthly' ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'normal',
                transition: '.15s'
              }}
            >
              📆 Monthly
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: viewMode === 'yearly' ? 'var(--accent)' : 'var(--bg3)',
                color: viewMode === 'yearly' ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'normal',
                transition: '.15s'
              }}
            >
              📊 Yearly
            </button>
          </div>

          <div style={{ flex: 1 }} />

          {viewMode === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg3)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          )}

          {viewMode === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg3)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          )}

          {viewMode === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--bg3)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {[2024, 2025, 2026, 2027, 2028].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--accentbg)', borderRadius: '8px', border: '1px solid var(--accent)' }}>
          <div style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 'normal' }}>
            📍 Viewing: <strong>{getPeriodLabel()}</strong>
          </div>
        </div>
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
          <div style={{ width: '38px', height: '38px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            💰
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalIncome)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Total Income</div>
          <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '4px' }}>{filteredIncome.length} transactions</div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--redbg)', color: 'var(--red)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            💸
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalCashOut)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Total Cash Out</div>
          <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>All expenses</div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⏰
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{attendanceRate}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Attendance Rate</div>
          <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '4px' }}>{presentCount} present</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
        {/* Income Breakdown */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
              <span style={{ color: 'var(--green)' }}>💰</span>
              Income Details
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>Total Received</span>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--green)' }}>{formatCurrency(totalIncome)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>Transactions</span>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text)' }}>{filteredIncome.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>Average per Transaction</span>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text)' }}>
                {filteredIncome.length > 0 ? formatCurrency(Math.round(totalIncome / filteredIncome.length)) : 'Rs. 0'}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
              <span style={{ color: 'var(--red)' }}>💸</span>
              Expense Details
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>Operating Expenses</span>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(totalExpenses)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>Bills Paid</span>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(totalBills)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>Salaries</span>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--red)' }}>{formatCurrency(proportionalSalaries)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
            <span style={{ color: 'var(--blue)' }}>⏰</span>
            Attendance Summary
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'normal', color: 'var(--blue)', marginBottom: '4px' }}>{filteredAttendance.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Records</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'normal', color: 'var(--green)', marginBottom: '4px' }}>{presentCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Present</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'normal', color: 'var(--red)', marginBottom: '4px' }}>{absentCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Absent</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'normal', color: 'var(--amber)', marginBottom: '4px' }}>{lateCount}</div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Late</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

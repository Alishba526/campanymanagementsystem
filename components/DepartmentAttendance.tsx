'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';

export default function DepartmentAttendance() {
  const { currentUser, employees, attendance } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  if (!currentUser || currentUser.role !== 'admin') {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Access Restricted to Admin</div>;
  }

  const departments = ['ecommerce', 'marketing', 'architecture'];

  // Calculate month range
  const monthStart = selectedMonth + '-01';
  const monthEnd = new Date(selectedMonth + '-01');
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  const monthEndStr = monthEnd.toISOString().slice(0, 10);

  // Filter attendance for selected month
  const monthAttendance = attendance.filter(a =>
    a.date >= monthStart && a.date < monthEndStr
  );

  // Calculate department statistics
  const getDepartmentStats = (dept: string) => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptAttendance = monthAttendance.filter(a =>
      deptEmployees.some(e => e.id === a.employeeId)
    );

    const present = deptAttendance.filter(a => a.status === 'present').length;
    const absent = deptAttendance.filter(a => a.status === 'absent').length;
    const late = deptAttendance.filter(a => a.status === 'late').length;
    const leave = deptAttendance.filter(a => a.status === 'leave').length;
    const total = deptAttendance.length;

    const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      employeeCount: deptEmployees.length,
      present,
      absent,
      late,
      leave,
      total,
      presentRate,
      employees: deptEmployees.map(emp => {
        const empAttendance = monthAttendance.filter(a => a.employeeId === emp.id);
        const empPresent = empAttendance.filter(a => a.status === 'present').length;
        const empAbsent = empAttendance.filter(a => a.status === 'absent').length;
        const empLate = empAttendance.filter(a => a.status === 'late').length;
        const empLeave = empAttendance.filter(a => a.status === 'leave').length;
        const empTotal = empAttendance.length;
        const empRate = empTotal > 0 ? Math.round((empPresent / empTotal) * 100) : 0;

        return {
          ...emp,
          present: empPresent,
          absent: empAbsent,
          late: empLate,
          leave: empLeave,
          total: empTotal,
          rate: empRate
        };
      })
    };
  };

  const deptIcons: { [key: string]: string } = {
    ecommerce: '🛒',
    marketing: '📢',
    architecture: '🏗️'
  };

  const deptColors: { [key: string]: string } = {
    ecommerce: 'var(--blue)',
    marketing: 'var(--orange)',
    architecture: 'var(--teal)'
  };

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px', marginBottom: '22px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
          📊 Department-wise Attendance Dashboard
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px' }}>
          View and analyze attendance data for all departments on a monthly basis. Historical data is preserved for each month.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)' }}>
            Select Month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
          />
          <div style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>
            {monthName}
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {departments.map(dept => {
          const stats = getDepartmentStats(dept);
          return (
            <div key={dept} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px' }}>{deptIcons[dept]}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
                    {dept}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {stats.employeeCount} Employees
                  </div>
                </div>
              </div>

              {/* Attendance Rate */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Attendance Rate</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: deptColors[dept] }}>
                    {stats.presentRate}%
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats.presentRate}%`, background: deptColors[dept], transition: '.3s' }} />
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--greenbg)', border: '1px solid var(--green)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)' }}>{stats.present}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Present</div>
                </div>
                <div style={{ background: 'var(--redbg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--red)' }}>{stats.absent}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Absent</div>
                </div>
                <div style={{ background: 'var(--amberbg)', border: '1px solid var(--amber)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--amber)' }}>{stats.late}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Late</div>
                </div>
                <div style={{ background: 'var(--bluebg)', border: '1px solid var(--blue)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--blue)' }}>{stats.leave}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Leave</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Employee Breakdown */}
      {departments.map(dept => {
        const stats = getDepartmentStats(dept);
        return (
          <div key={dept} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', marginBottom: '20px' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{deptIcons[dept]}</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
                {dept} Department - Employee Details
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Employee</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Position</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Present</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Absent</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Late</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Leave</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{emp.name}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.position}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--green)', fontWeight: 600, textAlign: 'center' }}>{emp.present}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--red)', fontWeight: 600, textAlign: 'center' }}>{emp.absent}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--amber)', fontWeight: 600, textAlign: 'center' }}>{emp.late}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--blue)', fontWeight: 600, textAlign: 'center' }}>{emp.leave}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: emp.rate >= 90 ? 'var(--greenbg)' : emp.rate >= 75 ? 'var(--bluebg)' : emp.rate >= 60 ? 'var(--amberbg)' : 'var(--redbg)',
                          color: emp.rate >= 90 ? 'var(--green)' : emp.rate >= 75 ? 'var(--blue)' : emp.rate >= 60 ? 'var(--amber)' : 'var(--red)'
                        }}>
                          {emp.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Info Box */}
      <div style={{ background: 'var(--bluebg)', border: '1px solid var(--blue)', borderRadius: 'var(--radius2)', padding: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          <strong style={{ color: 'var(--blue)' }}>ℹ️ How it works:</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '12px', lineHeight: '1.8' }}>
            <li>Select any month to view historical attendance data</li>
            <li>All attendance records are preserved month-by-month</li>
            <li>Department cards show overall statistics</li>
            <li>Employee tables show individual breakdown</li>
            <li>Attendance rate color-coded: Green (90%+), Blue (75%+), Amber (60%+), Red (&lt;60%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

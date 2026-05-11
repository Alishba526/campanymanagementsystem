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
        <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', color: '#000' }}>
          📊 Department Attendance Report
        </div>
        <div style={{ fontSize: '14px', color: '#333', marginBottom: '16px', fontWeight: 600 }}>
          View attendance data for all departments. Select month to see historical records.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#000' }}>
            Select Month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: '#000', fontSize: '14px', fontWeight: 600, outline: 'none' }}
          />
          <div style={{ marginLeft: 'auto', fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>
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
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#000', textTransform: 'capitalize' }}>
                    {dept}
                  </div>
                  <div style={{ fontSize: '13px', color: '#333', fontWeight: 600 }}>
                    {stats.employeeCount} Employees
                  </div>
                </div>
              </div>

              {/* Attendance Rate */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#000', fontWeight: 700 }}>Attendance Rate</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: deptColors[dept] }}>
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
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green)' }}>{stats.present}</div>
                  <div style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Present</div>
                </div>
                <div style={{ background: 'var(--redbg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--red)' }}>{stats.absent}</div>
                  <div style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Absent</div>
                </div>
                <div style={{ background: 'var(--amberbg)', border: '1px solid var(--amber)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--amber)' }}>{stats.late}</div>
                  <div style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Late</div>
                </div>
                <div style={{ background: 'var(--bluebg)', border: '1px solid var(--blue)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--blue)' }}>{stats.leave}</div>
                  <div style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700 }}>Leave</div>
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
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#000', textTransform: 'capitalize' }}>
                {dept} Department - Employee Details
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Employee</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Position</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Present</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Absent</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Late</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Leave</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', fontSize: '14px', color: '#000', fontWeight: 700 }}>{emp.name}</td>
                      <td style={{ padding: '10px 16px', fontSize: '14px', color: '#333', fontWeight: 600 }}>{emp.position}</td>
                      <td style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--green)', fontWeight: 800, textAlign: 'center' }}>{emp.present}</td>
                      <td style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--red)', fontWeight: 800, textAlign: 'center' }}>{emp.absent}</td>
                      <td style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--amber)', fontWeight: 800, textAlign: 'center' }}>{emp.late}</td>
                      <td style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--blue)', fontWeight: 800, textAlign: 'center' }}>{emp.leave}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 800,
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
        <div style={{ fontSize: '14px', color: '#000' }}>
          <strong style={{ color: 'var(--blue)', fontWeight: 800 }}>ℹ️ How it works:</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '13px', lineHeight: '1.8', fontWeight: 600, color: '#000' }}>
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

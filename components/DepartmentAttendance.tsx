'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { getCurrentDate } from '@/lib/dateUtils';

export default function DepartmentAttendance() {
  const { currentUser, employees, attendance } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentDate().substring(0, 7));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());
  const [viewTab, setViewTab] = useState<'current' | 'archives'>('current');

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const managerDept = currentUser.role;

  // Filter departments based on access
  const availableDepts = isAdmin 
    ? ['ecommerce', 'marketing', 'architecture'] 
    : [managerDept].filter(d => ['ecommerce', 'marketing', 'architecture'].includes(d));

  if (availableDepts.length === 0) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Access Restricted</h2>
        <p>This view is only available to Department Managers and Admins.</p>
      </div>
    );
  }

  // Calculate statistics
  const getDepartmentStats = (dept: string) => {
    const deptEmployees = employees.filter(e => e.department === dept);
    
    const targetMonth = viewTab === 'current' ? getCurrentDate().substring(0, 7) : selectedMonth;
    
    // Search Filter logic
    const searchLower = searchQuery.toLowerCase();
    const filteredDeptEmps = deptEmployees.filter(emp => 
       !searchQuery || emp.name.toLowerCase().includes(searchLower) || emp.id.toLowerCase().includes(searchLower)
    );

    const monthAttendance = attendance.filter(a => a.date.startsWith(targetMonth));
    const deptMonthAttendance = monthAttendance.filter(a => deptEmployees.some(e => e.id === a.employeeId));

    const employeeStatsMap = new Map<string, { present: number, absent: number, late: number, leave: number, total: number }>();

    deptMonthAttendance.forEach(att => {
      if (!employeeStatsMap.has(att.employeeId)) {
        employeeStatsMap.set(att.employeeId, { present: 0, absent: 0, late: 0, leave: 0, total: 0 });
      }
      const stats = employeeStatsMap.get(att.employeeId)!;
      stats.total++;
      if (att.status === 'present') stats.present++;
      else if (att.status === 'absent') stats.absent++;
      else if (att.status === 'late') stats.late++;
      else if (att.status === 'leave') stats.leave++;
    });

    const detailedEmployees = filteredDeptEmps.map(emp => {
      const stats = employeeStatsMap.get(emp.id) || { present: 0, absent: 0, late: 0, leave: 0, total: 0 };
      const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
      return { ...emp, ...stats, rate };
    });

    let totalP = 0, totalA = 0, totalL = 0, totalLv = 0;
    employeeStatsMap.forEach(s => { totalP += s.present; totalA += s.absent; totalL += s.late; totalLv += s.leave; });
    const overallRate = deptMonthAttendance.length > 0 ? Math.round((totalP / deptMonthAttendance.length) * 100) : 0;

    return {
      employeeCount: deptEmployees.length,
      present: totalP,
      absent: totalA,
      late: totalL,
      leave: totalLv,
      presentRate: overallRate,
      employees: detailedEmployees
    };
  };

  const deptIcons: { [key: string]: string } = { ecommerce: '🛒', marketing: '📢', architecture: '🏗️' };
  const deptColors: { [key: string]: string } = { ecommerce: '#2563eb', marketing: '#ea580c', architecture: '#059669' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Standardized Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>📊</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Department Analytics</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Reviewing {availableDepts.length} active sectors</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px 8px 30px', color: 'var(--text)', outline: 'none', width: '180px', fontSize: '12px' }}
            />
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
          <button onClick={() => setViewTab('current')} style={{ background: viewTab === 'current' ? 'var(--accent)' : 'transparent', color: viewTab === 'current' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>Monthly Real-time</button>
          <button onClick={() => setViewTab('archives')} style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>Archives Lookup</button>
        </div>

        {viewTab === 'archives' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg2)', padding: '15px 20px', borderRadius: '20px', border: '1px solid var(--border)', width: 'fit-content' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text3)' }}>History Month:</span>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
          </div>
        )}

        {/* Dept Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          {availableDepts.map(dept => {
            const stats = getDepartmentStats(dept);
            return (
              <div key={dept} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '24px' }}>{deptIcons[dept]}</div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase' }}>{dept}</h3>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold' }}>{stats.employeeCount} Staff Members</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: deptColors[dept] }}>{stats.presentRate}%</div>
                    <div style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text3)', textTransform: 'uppercase' }}>Month Avg</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  <StatsBox label="Pres" val={stats.present} color="var(--green)" />
                  <StatsBox label="Abs" val={stats.absent} color="var(--red)" />
                  <StatsBox label="Late" val={stats.late} color="var(--amber)" />
                  <StatsBox label="Leave" val={stats.leave} color="var(--blue)" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table */}
        {availableDepts.map(dept => {
          const stats = getDepartmentStats(dept);
          return (
            <div key={dept} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase' }}>🏢 {dept} Performance Ledger</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Employee</th>
                      <th style={{ padding: '10px 15px', textAlign: 'center', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Present</th>
                      <th style={{ padding: '10px 15px', textAlign: 'center', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Absent</th>
                      <th style={{ padding: '10px 15px', textAlign: 'center', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Late</th>
                      <th style={{ padding: '10px 15px', textAlign: 'center', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Leave</th>
                      <th style={{ padding: '10px 15px', textAlign: 'right', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.employees.map(emp => (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '8px 15px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>{emp.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{emp.id}</div>
                        </td>
                        <td style={{ padding: '8px 15px', textAlign: 'center', fontSize: '13px', color: 'var(--green)', fontWeight: '900' }}>{emp.present}</td>
                        <td style={{ padding: '8px 15px', textAlign: 'center', fontSize: '13px', color: 'var(--red)', fontWeight: '900' }}>{emp.absent}</td>
                        <td style={{ padding: '8px 15px', textAlign: 'center', fontSize: '13px', color: 'var(--amber)', fontWeight: '900' }}>{emp.late}</td>
                        <td style={{ padding: '8px 15px', textAlign: 'center', fontSize: '13px', color: 'var(--blue)', fontWeight: '900' }}>{emp.leave}</td>
                        <td style={{ padding: '8px 15px', textAlign: 'right' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', background: emp.rate >= 80 ? 'var(--greenbg)' : '#fef2f2', color: emp.rate >= 80 ? 'var(--green)' : '#dc2626', border: `1px solid ${emp.rate >= 80 ? 'var(--green)' : '#ef4444'}33` }}>
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
      </div>
    </div>
  );
}

function StatsBox({ label, val, color }: any) {
  return (
    <div style={{ background: 'var(--bg3)', padding: '10px 5px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '15px', fontWeight: '900', color: color }}>{val}</div>
      <div style={{ fontSize: '8px', fontWeight: '900', color: 'var(--text3)', textTransform: 'uppercase', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

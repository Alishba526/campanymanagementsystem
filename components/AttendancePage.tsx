'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { AttendanceRecord } from '@/types';
import { formatDateShort, getCurrentDate, formatTimeAMPM } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function AttendancePage() {
  const { currentUser, employees, attendance, addAttendance, updateAttendance, deleteAttendance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(getCurrentDate());

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = attendance.reduce((groups: Record<string, AttendanceRecord[]>, a) => {
    const month = a.date.substring(0, 7);
    if (month === currentMonthPrefix) return groups; // Don't archive current month yet
    if (!groups[month]) groups[month] = [];
    groups[month].push(a);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const handleMarkAttendance = () => {
    setEditingRecord(null);
    setFormData({
      date: getCurrentDate(),
      status: 'present',
      checkIn: '09:00',
      checkOut: '--'
    });
    setShowModal(true);
  };

  const handleEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setFormData(rec);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.employeeId || !formData.date) {
      Swal.fire('Error', 'Employee and Date are required!', 'error');
      return;
    }

    const emp = employees.find(e => e.id === formData.employeeId);
    const recordData: AttendanceRecord = {
      id: editingRecord?.id || `ATT-${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Unknown',
      date: formData.date,
      status: formData.status as any || 'present',
      checkIn: formData.checkIn || '09:00',
      checkOut: formData.checkOut || '--',
      hours: Number(formData.hours) || 0,
      overtime: Number(formData.overtime) || 0,
      lateEntry: formData.lateEntry || '00:00',
      earlyExit: formData.earlyExit || '00:00'
    };

    if (editingRecord) {
      updateAttendance(editingRecord.id, recordData);
      Swal.fire({ title: 'Updated', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
    } else {
      addAttendance(recordData);
      Swal.fire({ title: 'Recorded', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAttendance(id);
        Swal.fire('Deleted', 'Record removed', 'success');
      }
    });
  };

  // Filter Attendance
  const displayAttendance = attendance.filter(a => {
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      a.employeeName.toLowerCase().includes(searchLower) ||
      a.employeeId.toLowerCase().includes(searchLower) ||
      a.status.toLowerCase().includes(searchLower);

    const isDeptMatch = isAdmin || employees.find(e => e.id === a.employeeId)?.department === currentUser.role;

    if (viewTab === 'active') {
      // Active shows current month or specific filtered date
      const isCurrentMonth = a.date.startsWith(currentMonthPrefix);
      const isSpecificDate = a.date === filterDate;
      return isDeptMatch && (isSpecificDate || isCurrentMonth) && isSearchMatch;
    } else {
      // Archive view
      if (selectedArchiveMonth) {
        return isDeptMatch && a.date.startsWith(selectedArchiveMonth) && isSearchMatch;
      }
      return false;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'var(--green)';
      case 'late': return 'var(--amber)';
      case 'absent': return 'var(--red)';
      case 'half-day': return 'var(--blue)';
      case 'leave': return 'var(--purple)';
      default: return 'var(--text2)';
    }
  };

  const departments = [
    { id: 'ecommerce', label: 'E-Commerce', tagline: 'Digital storefront & online operations' },
    { id: 'marketing', label: 'Marketing', tagline: 'Brand awareness & lead generation' },
    { id: 'architecture', label: 'Architecture', tagline: 'System design & infrastructure' }
  ];

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Search Engine Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>⏰</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>Attendance Search Engine</h2>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>Tracking {displayAttendance.length} records in current view</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>👤</span>
            <input 
              type="text" 
              placeholder="Search staff or status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 15px 12px 35px', color: 'var(--text)', outline: 'none', width: '220px', fontSize: '13px' }}
            />
          </div>
          {viewTab === 'active' && (
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none', fontSize: '13px', fontWeight: 'bold' }} />
          )}
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
        >📁 Past Archives</button>
      </div>

      {viewTab === 'archives' && !selectedArchiveMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {sortedArchiveMonths.map(month => {
            const monthRecords = archiveGroups[month];
            const present = monthRecords.filter(r => r.status === 'present' || r.status === 'late').length;
            const rate = Math.round((present / monthRecords.length) * 100) || 0;
            
            return (
              <div 
                key={month} 
                onClick={() => setSelectedArchiveMonth(month)}
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>{getMonthName(month)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📊 {monthRecords.length} TOTAL LOGS</div>
                  <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>📈 {rate}% ATTENDANCE RATE</div>
                </div>
              </div>
            );
          })}
          {sortedArchiveMonths.length === 0 && (
             <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No completed months to archive yet.</div>
          )}
        </div>
      )}

      {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedArchiveMonth ? (
               <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold' }}>← Back to Archives</button>
            ) : <div />}
            {viewTab === 'active' && isAdmin && (
              <button onClick={handleMarkAttendance} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Manual Entry</button>
            )}
          </div>

          {departments.map(dept => {
            if (!isAdmin && currentUser.role !== dept.id) return null;
            const deptAttendance = displayAttendance.filter(a => employees.find(e => e.id === a.employeeId)?.department === dept.id);

            return (
              <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--accent)' }}>🏢</span> {dept.label} {viewTab === 'active' ? 'Active Records' : 'Archive'}
                    </h3>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Date (DD/MM/YYYY)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Employee</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Timings (AM/PM)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Hours</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Late/Early</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptAttendance.map(rec => (
                        <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 'bold' }}>{formatDateShort(rec.date)}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>{rec.employeeName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{rec.employeeId}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                             <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>In: {formatTimeAMPM(rec.checkIn)}</div>
                             <div style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 'bold' }}>Out: {formatTimeAMPM(rec.checkOut)}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', background: `${getStatusColor(rec.status)}15`, color: getStatusColor(rec.status), border: `1px solid ${getStatusColor(rec.status)}33` }}>
                              {rec.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text)' }}>{rec.hours?.toFixed(2)}h</td>
                          <td style={{ padding: '14px 16px' }}>
                             <div style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 'bold' }}>Late: {rec.lateEntry}</div>
                             <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Early: {rec.earlyExit}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => handleEdit(rec)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                              {isAdmin && <button onClick={() => handleDelete(rec.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {deptAttendance.length === 0 && (
                        <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>No records found in this view.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Attendance Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>{editingRecord ? 'Edit Attendance' : 'Mark Attendance'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '5px' }}>Select Employee</label>
                <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                  <option value="">Choose...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '5px' }}>Date</label>
                  <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '5px' }}>Status</label>
                  <select value={formData.status || 'present'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} style={{ width: '100%', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '5px' }}>Check In</label>
                  <input type="time" value={formData.checkIn || ''} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '5px' }}>Check Out</label>
                  <input type="time" value={formData.checkOut || ''} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '10px 30px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{editingRecord ? 'Update' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { AttendanceRecord } from '@/types';
import { formatDateShort, getCurrentDate, formatTimeAMPM } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function AttendancePage() {
  const { currentUser, employees, attendance, breakRequests, addAttendance, updateAttendance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [filterDate, setFilterDate] = useState(getCurrentDate());
  const [targetDept, setTargetDept] = useState<string>('');

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  const handleMarkAttendance = () => {
    setEditingRecord(null);
    setTargetDept(isManager ? currentUser.role : 'ecommerce');
    setFormData({
      date: filterDate,
      status: 'present',
      checkIn: '09:00',
      checkOut: '18:00',
      breakIn: '',
      breakOut: '',
      lateEntry: '00:00',
      earlyExit: '00:00',
      overtime: 0
    });
    setShowModal(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setTargetDept(employees.find(e => e.id === record.employeeId)?.department || 'ecommerce');
    setFormData(record);
    setShowModal(true);
  };

  const handleRealtimeBreak = async (record: AttendanceRecord, type: 'in' | 'out') => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const updates = type === 'in' ? { breakIn: now } : { breakOut: now };
    await updateAttendance(record.id, updates);
    Swal.fire({ title: `Break ${type === 'in' ? 'Started' : 'Ended'}`, text: `Time recorded: ${now}`, icon: 'success', timer: 1500, showConfirmButton: false });
  };

  const handleSave = () => {
    if (!formData.employeeId || !formData.date) {
      Swal.fire('Error', 'Please select an employee and date', 'error');
      return;
    }

    if (!editingRecord && attendance.some(a => a.employeeId === formData.employeeId && a.date === formData.date)) {
      Swal.fire('Already Marked', 'Attendance for this employee on this date is already recorded.', 'warning');
      return;
    }

    const emp = employees.find(e => e.id === formData.employeeId);
    
    // Calculate hours if not provided
    const checkIn = formData.checkIn || '09:00';
    const checkOut = formData.checkOut || '18:00';
    let calculatedHours = 0;
    if (checkIn !== '--' && checkOut !== '--') {
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        calculatedHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
    }

    const record = { 
      ...formData, 
      employeeName: emp?.name || '',
      hours: formData.hours || calculatedHours || 0,
      overtime: Number(formData.overtime) || 0,
      lateEntry: formData.lateEntry || '00:00',
      earlyExit: formData.earlyExit || '00:00',
      breakIn: formData.breakIn || '',
      breakOut: formData.breakOut || ''
    } as AttendanceRecord;
    
    if (editingRecord) {
      updateAttendance(editingRecord.id, record);
      Swal.fire('Updated', 'Record updated successfully', 'success');
    } else {
      addAttendance({ ...record, id: `ATT${Date.now()}` });
      Swal.fire('Success', 'Attendance marked successfully', 'success');
    }
    setShowModal(false);
  };

  const filteredAttendance = attendance.filter(a => {
    const isDateMatch = a.date === filterDate;
    const isDeptMatch = isAdmin || employees.find(e => e.id === a.employeeId)?.department === currentUser.role;
    return isDateMatch && isDeptMatch;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Control Bar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>⏰</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>Daily Attendance</h2>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Tracking presence for {formatDateShort(filterDate)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg3)', padding: '8px 15px', borderRadius: '10px', border: '1px solid var(--border)' }}>
             <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'bold' }}>📅 Date:</span>
             <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '13px' }} />
           </div>
        </div>
      </div>

      {/* 3 Department Portions */}
      {departments.map(dept => {
        // Isolation: Non-admins only see their own department portion
        if (!isAdmin && currentUser.role !== dept.id) return null;

        const deptAtt = filteredAttendance.filter(a => employees.find(e => e.id === a.employeeId)?.department === dept.id);

        return (
          <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>🏢</span> {dept.label} Attendance
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '2px' }}>{dept.tagline}</div>
              </div>
              {(isAdmin || currentUser.role === dept.id) && (
                <button onClick={() => { setTargetDept(dept.id); handleMarkAttendance(); }} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>+ Mark Attendance</button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Employee</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>In / Out</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Break</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Late/Early</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>OT/Hours</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptAtt.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{a.employeeName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>ID: {a.employeeId}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        <div style={{ color: 'var(--green)', fontWeight: 'bold' }}>In: {formatTimeAMPM(a.checkIn)}</div>
                        <div style={{ color: 'var(--red)', fontWeight: 'bold' }}>Out: {formatTimeAMPM(a.checkOut)}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           {!a.breakIn ? (
                             <button onClick={() => handleRealtimeBreak(a, 'in')} style={{ padding: '4px 10px', background: 'var(--bluebg)', color: 'var(--blue)', border: '1px solid var(--blue)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Start Break</button>
                           ) : !a.breakOut ? (
                             <button onClick={() => handleRealtimeBreak(a, 'out')} style={{ padding: '4px 10px', background: 'var(--redbg)', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>End Break</button>
                           ) : (
                             <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 'bold' }}>{formatTimeAMPM(a.breakIn)} - {formatTimeAMPM(a.breakOut)}</div>
                           )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--amber)', fontWeight: 'bold' }}>Late: {a.lateEntry}</div>
                        <div style={{ fontSize: '12px', color: 'var(--purple)', fontWeight: 'bold' }}>Early: {a.earlyExit}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>{a.hours.toFixed(1)} hrs</div>
                        <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 'bold' }}>OT: {a.overtime}h</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '10px', background: `${getStatusColor(a.status)}22`, color: getStatusColor(a.status), fontWeight: 'bold', textTransform: 'uppercase', border: `1px solid ${getStatusColor(a.status)}44` }}>
                          {a.status.replace('-', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => handleEdit(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                      </td>
                    </tr>
                  ))}
                  {deptAtt.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No records for this department on this date.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Attendance Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{editingRecord ? '📝' : '🕒'}</span>
                {editingRecord ? 'Update Attendance' : 'Mark Attendance'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
            </div>
            
            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Select Employee</label>
                <select value={formData.employeeId || ''} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                  <option value="">Choose an employee...</option>
                  {employees.filter(e => isAdmin || e.department === currentUser.role).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Check In</label>
                  <input type="time" value={formData.checkIn || ''} onChange={e => setFormData({ ...formData, checkIn: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Check Out</label>
                  <input type="time" value={formData.checkOut || ''} onChange={e => setFormData({ ...formData, checkOut: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Late Entry (HH:MM)</label>
                  <input type="text" value={formData.lateEntry || '00:00'} onChange={e => setFormData({ ...formData, lateEntry: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="00:00" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Early Exit (HH:MM)</label>
                  <input type="text" value={formData.earlyExit || '00:00'} onChange={e => setFormData({ ...formData, earlyExit: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="00:00" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Overtime (Hours)</label>
                  <input type="number" value={formData.overtime || 0} onChange={e => setFormData({ ...formData, overtime: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Status</label>
                  <select value={formData.status || 'present'} onChange={e => setFormData({ ...formData, status: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                    <option value="leave">Leave Record</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', color: 'var(--text)', fontWeight: 'bold', fontSize: '14px' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 40px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(var(--accent-rgb), 0.3)' }}>{editingRecord ? 'Update' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { AttendanceRecord } from '@/types';
import Swal from 'sweetalert2';

export default function AttendancePage() {
  const { currentUser, employees, attendance, addAttendance, updateAttendance, deleteAttendance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Helper to ensure time is always displayed as AM/PM in the UI
  const formatTime = (timeStr: string) => {
    if (!timeStr || timeStr === '--' || timeStr === '0' || timeStr === '') return '--';
    try {
      if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const canManage = isAdmin || ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);
  const today = new Date().toISOString().split('T')[0];

  const departmentEmployees = isAdmin
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  const filteredAttendance = attendance.filter(a => {
    if (isAdmin) {
      if (selectedDept === 'all') return true;
      const employee = employees.find(e => e.id === a.employeeId);
      return employee?.department === selectedDept;
    }
    const employee = employees.find(e => e.id === a.employeeId);
    return employee?.department === currentUser.role;
  }).filter(a => viewMode === 'today' ? a.date === today : true);

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({
      date: today,
      checkIn: '09:00',
      checkOut: '18:00',
      breakIn: '',
      breakOut: '',
      overtime: 0,
      status: 'present',
      hours: 9
    });
    setShowModal(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.employeeId) {
      Swal.fire({ icon: 'warning', title: 'Attention', text: 'Please select an employee' });
      return;
    }

    // --- STRICT VALIDATION: ONE ATTENDANCE PER DAY ---
    if (!editingRecord) {
      const alreadyMarked = attendance.find(a => a.employeeId === formData.employeeId && a.date === (formData.date || today));
      if (alreadyMarked) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Entry',
          text: `Attendance for ${alreadyMarked.employeeName} has already been marked for today!`,
          confirmButtonColor: 'var(--accent)'
        });
        return;
      }
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const record: AttendanceRecord = {
      id: editingRecord?.id || `AT${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee.name,
      date: formData.date || today,
      checkIn: formData.status === 'absent' || formData.status === 'leave' ? '--' : formData.checkIn || '09:00',
      checkOut: formData.status === 'absent' || formData.status === 'leave' ? '--' : formData.checkOut || '18:00',
      breakIn: formData.breakIn || '',
      breakOut: formData.breakOut || '',
      lateEntry: formData.lateEntry || '',
      earlyExit: formData.earlyExit || '',
      overtime: formData.overtime || 0,
      status: formData.status as any || 'present',
      hours: formData.status === 'absent' || formData.status === 'leave' ? 0 : formData.hours || 9
    };

    if (editingRecord) {
      updateAttendance(editingRecord.id, record);
      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Attendance record updated', timer: 1500, showConfirmButton: false });
    } else {
      addAttendance(record);
      Swal.fire({ icon: 'success', title: 'Added!', text: 'Attendance record added', timer: 1500, showConfirmButton: false });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAttendance(id);
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px' }}>
            <button onClick={() => setViewMode('today')} style={{ padding: '8px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '14px', background: viewMode === 'today' ? 'var(--accentbg)' : 'transparent', color: viewMode === 'today' ? 'var(--accent2)' : '#333', border: 'none' }}>Today</button>
            <button onClick={() => setViewMode('all')} style={{ padding: '8px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '14px', background: viewMode === 'all' ? 'var(--accentbg)' : 'transparent', color: viewMode === 'all' ? 'var(--accent2)' : '#333', border: 'none' }}>All Records</button>
          </div>
        </div>
        {canManage && <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '9px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', border: 'none' }}>Mark Attendance</button>}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>Attendance Records</div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{filteredAttendance.length} records</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Employee</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Check In</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Check Out</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Breaks</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Late/Early</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>OT</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Status</th>
                {canManage && <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)' }}>{record.date}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{record.employeeName}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{formatTime(record.checkIn)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{formatTime(record.checkOut)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text3)' }}>{formatTime(record.breakIn)} - {formatTime(record.breakOut)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--red)' }}>L:{record.lateEntry || '0'} / E:{record.earlyExit || '0'}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--green)' }}>{record.overtime || 0}h</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: '600', background: record.status === 'present' ? 'var(--greenbg)' : 'var(--amberbg)', color: record.status === 'present' ? 'var(--green)' : 'var(--amber)' }}>
                      {record.status}
                    </span>
                  </td>
                  {canManage && (
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {!record.breakIn ? (
                          <button 
                            onClick={() => updateAttendance(record.id, { breakIn: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }) })}
                            style={{ background: 'var(--accentbg)', border: '1px solid var(--accent)', color: 'var(--accent2)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Start Break"
                          >
                            ☕ In
                          </button>
                        ) : !record.breakOut ? (
                          <button 
                            onClick={() => updateAttendance(record.id, { breakOut: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }) })}
                            style={{ background: 'var(--redbg)', border: '1px solid var(--red)', color: 'var(--red)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="End Break"
                          >
                            🏃 Out
                          </button>
                        ) : null}
                        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />
                        <button onClick={() => handleEdit(record)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        {isAdmin && <button onClick={() => handleDelete(record.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>{editingRecord ? 'Edit Attendance' : 'Mark Attendance'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} disabled={!!editingRecord}>
                  <option value="">Select Employee</option>
                  {departmentEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
                <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '11px' }}>Check In</label><input type="time" value={formData.checkIn || ''} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} /></div>
                <div><label style={{ fontSize: '11px' }}>Check Out</label><input type="time" value={formData.checkOut || ''} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '11px' }}>Break In</label><input type="time" value={formData.breakIn || ''} onChange={(e) => setFormData({ ...formData, breakIn: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} /></div>
                <div><label style={{ fontSize: '11px' }}>Break Out</label><input type="time" value={formData.breakOut || ''} onChange={(e) => setFormData({ ...formData, breakOut: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Late Entry (min)" value={formData.lateEntry || ''} onChange={(e) => setFormData({ ...formData, lateEntry: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} />
                <input type="text" placeholder="Early Exit (min)" value={formData.earlyExit || ''} onChange={(e) => setFormData({ ...formData, earlyExit: e.target.value })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="number" placeholder="Overtime (hrs)" value={formData.overtime || ''} onChange={(e) => setFormData({ ...formData, overtime: parseFloat(e.target.value) || 0 })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }} />
                <select value={formData.status || ''} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} style={{ padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }}>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                  <option value="half-day">Half Day</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

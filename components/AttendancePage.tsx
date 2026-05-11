'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { AttendanceRecord } from '@/types';

export default function AttendancePage() {
  const { currentUser, employees, attendance, addAttendance, updateAttendance, deleteAttendance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  if (!currentUser) return null;

  const canManage = currentUser.role === 'admin' || ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Filter employees by department for managers
  const departmentEmployees = currentUser.role === 'admin'
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  // Filter attendance records based on user role and department
  const filteredAttendance = attendance.filter(a => {
    // Admin can see everything or filter by department
    if (currentUser.role === 'admin') {
      if (selectedDept === 'all') return true;
      const employee = employees.find(e => e.id === a.employeeId);
      return employee?.department === selectedDept;
    }

    // Manager sees only their department's employees
    const employee = employees.find(e => e.id === a.employeeId);
    return employee?.department === currentUser.role;
  }).filter(a => {
    // Further filter by time (today vs all)
    if (viewMode === 'today') return a.date === new Date().toISOString().split('T')[0];
    return true;
  });

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({
      date: today,
      checkIn: '09:00',
      checkOut: '18:00',
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
      alert('Please select an employee');
      return;
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
      status: formData.status || 'present',
      hours: formData.status === 'absent' || formData.status === 'leave' ? 0 : formData.hours || 9
    };

    if (editingRecord) {
      updateAttendance(editingRecord.id, record);
    } else {
      addAttendance(record);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      deleteAttendance(id);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px' }}>
            <button
              onClick={() => setViewMode('today')}
              style={{
                padding: '7px 16px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: '.15s',
                background: viewMode === 'today' ? 'var(--accentbg)' : 'transparent',
                color: viewMode === 'today' ? 'var(--accent2)' : 'var(--text2)',
                border: 'none'
              }}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: '7px 16px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: '.15s',
                background: viewMode === 'all' ? 'var(--accentbg)' : 'transparent',
                color: viewMode === 'all' ? 'var(--accent2)' : 'var(--text2)',
                border: 'none'
              }}
            >
              All Records
            </button>
          </div>
          {currentUser.role === 'admin' && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '7px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Departments</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="marketing">Marketing</option>
              <option value="architecture">Architecture</option>
            </select>
          )}
        </div>
        {canManage && (
          <button
            onClick={handleAdd}
            style={{ background: 'var(--accent)', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <span>⏰</span> Mark Attendance
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>⏰</span>
            Attendance Records
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{filteredAttendance.length} records</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Employee</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Check In</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Check Out</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Hours</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Status</th>
                {canManage && (
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{record.date}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{record.employeeName}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{record.checkIn}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{record.checkOut}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{record.hours ? `${record.hours}h` : '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: record.status === 'present' ? 'var(--greenbg)' :
                                 record.status === 'late' ? 'var(--amberbg)' :
                                 record.status === 'leave' ? 'var(--bluebg)' : 'var(--redbg)',
                      color: record.status === 'present' ? 'var(--green)' :
                             record.status === 'late' ? 'var(--amber)' :
                             record.status === 'leave' ? 'var(--blue)' : 'var(--red)'
                    }}>
                      {record.status}
                    </span>
                  </td>
                  {canManage && (
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(record)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                        >
                          ✏️
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--red)', transition: '.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                {editingRecord ? 'Edit Attendance' : 'Mark Attendance'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Employee</label>
                  <select
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    disabled={!!editingRecord}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">Select Employee</option>
                    {departmentEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Check In</label>
                  <input
                    type="time"
                    value={formData.checkIn || ''}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Check Out</label>
                  <input
                    type="time"
                    value={formData.checkOut || ''}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Status</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--accent)', transition: '.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

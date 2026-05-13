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
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Please select an employee'
      });
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
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Attendance record updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      addAttendance(record);
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Attendance record added successfully',
        timer: 1500,
        showConfirmButton: false
      });
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
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The attendance record has been deleted.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px' }}>
            <button
              onClick={() => setViewMode('today')}
              style={{
                padding: '8px 18px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal',
                transition: '.15s',
                background: viewMode === 'today' ? 'var(--accentbg)' : 'transparent',
                color: viewMode === 'today' ? 'var(--accent2)' : '#333',
                border: 'none'
              }}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: '8px 18px',
                borderRadius: '7px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal',
                transition: '.15s',
                background: viewMode === 'all' ? 'var(--accentbg)' : 'transparent',
                color: viewMode === 'all' ? 'var(--accent2)' : '#333',
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
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 18px', fontSize: '14px', fontWeight: 'normal', color: '#000', outline: 'none', cursor: 'pointer' }}
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
            style={{ background: 'var(--accent)', color: '#fff', padding: '9px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <span>⏰</span> Mark Attendance
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
            <span style={{ color: 'var(--accent)' }}>⏰</span>
            Attendance Records
          </div>
          <div style={{ fontSize: '13px', color: '#000', fontWeight: '500' }}>{filteredAttendance.length} records</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Employee</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Check In</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Check Out</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Hours</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Status</th>
                {canManage && (
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#333', fontWeight: 'normal' }}>{record.date}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#000', fontWeight: '500' }}>{record.employeeName}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#333', fontWeight: 'normal' }}>{record.checkIn}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#333', fontWeight: 'normal' }}>{record.checkOut}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#333', fontWeight: 'normal' }}>{record.hours ? `${record.hours}h` : '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '12px',
                      fontWeight: '600',
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
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: '#000', transition: '.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                        >
                          ✏️ Edit
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--red)', transition: '.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                          >
                            🗑️ Delete
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
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
                {editingRecord ? 'Edit Attendance' : 'Mark Attendance'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Employee</label>
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
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Date</label>
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
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Check In</label>
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
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Check Out</label>
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
                <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Status</label>
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
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: '1px solid var(--accent)', transition: '.15s' }}
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

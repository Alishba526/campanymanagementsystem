'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';

interface MonthlySchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  weeklyOffs?: string; // e.g., "Saturday,Sunday"
}

export default function SchedulePage() {
  const { currentUser, employees, schedules, addMonthlySchedule, updateMonthlySchedule, deleteMonthlySchedule } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MonthlySchedule | null>(null);
  const [formData, setFormData] = useState<Partial<MonthlySchedule>>({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    startTime: '09:00',
    endTime: '18:00',
    totalHours: 176
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Only Admin can manage monthly schedules.</p>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    setEditingSchedule(null);
    setFormData({
      month: new Date().toISOString().slice(0, 7),
      startTime: '09:00',
      endTime: '18:00',
      totalHours: 176,
      weeklyOffs: 'Sunday'
    });
    setShowModal(true);
  };

  const handleEdit = (schedule: MonthlySchedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setShowModal(true);
  };

  const calculateTotalHours = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const dailyHours = (endHour + endMin / 60) - (startHour + startMin / 60);

    // Assuming 22 working days per month (30 days - 8 weekly offs)
    const workingDays = 22;
    return Math.round(dailyHours * workingDays * 10) / 10;
  };

  const handleSave = async () => {
    if (!formData.employeeId || !formData.month) {
      alert('Please select employee and month');
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const totalHours = calculateTotalHours(formData.startTime || '09:00', formData.endTime || '18:00');

    const schedule: MonthlySchedule = {
      id: editingSchedule?.id || `SCH${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee.name,
      month: formData.month,
      startTime: formData.startTime || '09:00',
      endTime: formData.endTime || '18:00',
      totalHours,
      weeklyOffs: formData.weeklyOffs
    };

    if (editingSchedule) {
      await updateMonthlySchedule(editingSchedule.id, schedule);
    } else {
      await addMonthlySchedule(schedule);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      await deleteMonthlySchedule(id);
    }
  };

  // Group schedules by month
  const schedulesByMonth = schedules.reduce((acc: any, schedule: any) => {
    if (!acc[schedule.month]) {
      acc[schedule.month] = [];
    }
    acc[schedule.month].push(schedule);
    return acc;
  }, {});

  const months = Object.keys(schedulesByMonth).sort().reverse();

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            📅
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{schedules.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Schedules</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            👥
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{employees.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Active Employees</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--amberbg)', color: 'var(--amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⏰
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>176</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Standard Monthly Hours</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--accentbg)', color: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            🏖️
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>8</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Weekly Offs/Month</div>
        </div>
      </div>

      {/* Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Manage employee work schedules and weekly offs</div>
        <button
          onClick={handleAdd}
          style={{ background: 'var(--accent)', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          <span>➕</span> Add Schedule
        </button>
      </div>

      {/* Schedules by Month */}
      {months.length === 0 ? (
        <div style={{ background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius2)', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <div style={{ fontSize: '14px', color: 'var(--text3)' }}>No schedules created yet. Click "Add Schedule" to get started.</div>
        </div>
      ) : (
        months.map(month => (
          <div key={month} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', marginBottom: '18px' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                <span style={{ color: 'var(--accent)' }}>📅</span>
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{schedulesByMonth[month].length} employees</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Employee</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Work Hours</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Monthly Hours</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Weekly Offs</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedulesByMonth[month].map((schedule: any) => (
                    <tr key={schedule.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{schedule.employeeName}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{schedule.startTime} - {schedule.endTime}</td>
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>{schedule.totalHours}h</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: 600 }}>
                          {schedule.weeklyOffs || 'Sunday'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(schedule)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--red)', transition: '.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                {editingSchedule ? 'Edit Schedule' : 'Add Monthly Schedule'}
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
                    disabled={!!editingSchedule}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Month</label>
                  <input
                    type="month"
                    value={formData.month || ''}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>End Time</label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Weekly Offs</label>
                <select
                  value={formData.weeklyOffs || 'Sunday'}
                  onChange={(e) => setFormData({ ...formData, weeklyOffs: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Saturday,Sunday">Saturday & Sunday</option>
                  <option value="Friday">Friday</option>
                  <option value="Friday,Saturday">Friday & Saturday</option>
                </select>
              </div>
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--accentbg)', borderRadius: '8px', fontSize: '12px', color: 'var(--text2)' }}>
                <strong>Estimated Monthly Hours:</strong> {calculateTotalHours(formData.startTime || '09:00', formData.endTime || '18:00')}h
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
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

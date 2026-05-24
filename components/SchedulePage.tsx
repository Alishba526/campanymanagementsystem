'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { getCurrentDate, formatTimeAMPM } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

interface MonthlySchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  weeklyOffs?: string;
}

export default function SchedulePage() {
  const { currentUser, employees, schedules, addMonthlySchedule, updateMonthlySchedule, deleteMonthlySchedule } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MonthlySchedule | null>(null);
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<MonthlySchedule>>({
    month: new Date().toISOString().slice(0, 7),
    startTime: '09:00',
    endTime: '18:00',
    totalHours: 176
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Only Admin can manage monthly schedules.</p>
      </div>
    );
  }

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = schedules.reduce((groups: Record<string, MonthlySchedule[]>, sch) => {
    if (sch.month === currentMonthPrefix) return groups;
    if (!groups[sch.month]) groups[sch.month] = [];
    groups[sch.month].push(sch);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const handleAdd = () => {
    setEditingSchedule(null);
    setFormData({
      month: getCurrentDate().substring(0, 7),
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
    const workingDays = 22;
    return Math.round(dailyHours * workingDays * 10) / 10;
  };

  const handleSave = async () => {
    if (!formData.employeeId || !formData.month) {
      Swal.fire('Error', 'Please select employee and month', 'error');
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
      updateMonthlySchedule(editingSchedule.id, schedule);
    } else {
      addMonthlySchedule(schedule);
    }
    setShowModal(false);
    Swal.fire({ title: 'Schedule Saved', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'Delete Schedule?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)'
    }).then(r => {
      if (r.isConfirmed) deleteMonthlySchedule(id);
    });
  };

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const displaySchedules = schedules.filter(sch => {
    if (viewTab === 'active') return sch.month === currentMonthPrefix;
    return sch.month === selectedArchiveMonth;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>📅</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>Shift Planning Engine</h2>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>Organizing {schedules.length} monthly schedules</div>
          </div>
        </div>
        <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '12px 30px', borderRadius: '12px', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)' }}>+ Create Schedule</button>
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
          {sortedArchiveMonths.map(month => (
            <div 
              key={month} 
              onClick={() => setSelectedArchiveMonth(month)}
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>{getMonthName(month)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>🗓️ {archiveGroups[month].length} SHIFT RECORDS</div>
            </div>
          ))}
          {sortedArchiveMonths.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No previous months to archive yet.</div>
          )}
        </div>
      )}

      {(viewTab === 'active' || selectedArchiveMonth) && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>
              {viewTab === 'active' ? `⚡ Active Schedules: ${getMonthName(currentMonthPrefix)}` : `🗓️ Shift Log: ${getMonthName(selectedArchiveMonth!)}`}
            </div>
            {selectedArchiveMonth && (
              <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close Archive</button>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Employee</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Work Hours (AM/PM)</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Target Hours</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Weekly Offs</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displaySchedules.map(sch => (
                  <tr key={sch.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)', fontWeight: 'bold' }}>{sch.employeeName}</td>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)' }}>{formatTimeAMPM(sch.startTime)} - {formatTimeAMPM(sch.endTime)}</td>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--green)', fontWeight: 'bold' }}>{sch.totalHours}h</td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: 'var(--bluebg)', color: 'var(--blue)', border: '1px solid var(--blue)44' }}>{sch.weeklyOffs || 'Sunday'}</span>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleEdit(sch)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        <button onClick={() => handleDelete(sch.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--red)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displaySchedules.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No schedules found for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal code remains largely same but updated with standard UI */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', width: '90%', maxWidth: '550px', padding: '30px' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text)' }}>Plan Monthly Shift</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Staff Member</label>
                      <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }}>
                         <option value="">Select Employee</option>
                         {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Select Month</label>
                      <input type="month" value={formData.month || ''} onChange={(e) => setFormData({ ...formData, month: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }} />
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Start Time</label>
                      <input type="time" value={formData.startTime || ''} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }} />
                   </div>
                   <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>End Time</label>
                      <input type="time" value={formData.endTime || ''} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }} />
                   </div>
                </div>
                <div>
                   <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Weekly Offs</label>
                   <select value={formData.weeklyOffs || 'Sunday'} onChange={(e) => setFormData({ ...formData, weeklyOffs: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }}>
                      <option value="Sunday">Sunday</option>
                      <option value="Saturday,Sunday">Saturday & Sunday</option>
                      <option value="Friday">Friday</option>
                      <option value="Friday,Saturday">Friday & Saturday</option>
                   </select>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                   <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text)', fontWeight: 'bold' }}>Cancel</button>
                   <button onClick={handleSave} style={{ flex: 2, background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)' }}>💾 Save Shift Schedule</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

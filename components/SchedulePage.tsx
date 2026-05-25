'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { getCurrentDate, formatTimeAMPM, formatDateShort } from '@/lib/dateUtils';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());
  
  const [formData, setFormData] = useState<Partial<MonthlySchedule>>({
    month: getCurrentDate().substring(0, 7),
    startTime: '09:00',
    endTime: '18:00',
    totalHours: 176
  });

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  if (!isAdmin && !isManager) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Only Department Managers and Admins can manage work schedules.</p>
      </div>
    );
  }

  // Filter employees for the modal based on department access
  const availableEmployees = isAdmin 
    ? employees 
    : employees.filter(e => e.department === currentUser.role);

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = schedules.reduce((groups: Record<string, MonthlySchedule[]>, sch) => {
    // Only group schedules the current user has access to
    const emp = employees.find(e => e.id === sch.employeeId);
    if (!isAdmin && emp?.department !== currentUser.role) return groups;

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
    const emp = employees.find(e => e.id === sch.employeeId);
    const isDeptMatch = isAdmin || emp?.department === currentUser.role;

    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      sch.employeeName.toLowerCase().includes(searchLower) ||
      sch.employeeId.toLowerCase().includes(searchLower);

    if (viewTab === 'active') {
      return isDeptMatch && sch.month === currentMonthPrefix && isSearchMatch;
    } else {
      return isDeptMatch && sch.month === selectedArchiveMonth && isSearchMatch;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Standardized Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>📅</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Shift Search Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Planning {displaySchedules.length} employee cycles</div>
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
        {/* View Toggles */}
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
          <button 
            onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }}
            style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}
          >⚡ Current Month</button>
          <button 
            onClick={() => setViewTab('archives')}
            style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}
          >📁 Past Archives</button>
        </div>

        {viewTab === 'archives' && !selectedArchiveMonth && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
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
          </div>
        )}

        {(viewTab === 'active' || selectedArchiveMonth) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedArchiveMonth ? (
                 <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold', fontSize: '11px' }}>← Back to Archives</button>
              ) : <div />}
              <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 25px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '12px' }}>+ Create Schedule</button>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '15px 25px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)' }}>
                  {viewTab === 'active' ? `⚡ Active Schedules: ${getMonthName(currentMonthPrefix)}` : `🗓️ Shift Log: ${getMonthName(selectedArchiveMonth!)}`}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Employee</th>
                      <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Work Hours (AM/PM)</th>
                      <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Target Hours</th>
                      <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Weekly Offs</th>
                      <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySchedules.map(sch => (
                      <tr key={sch.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '6px 15px', fontSize: '13px', color: 'var(--text)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{sch.employeeName}</td>
                        <td style={{ padding: '6px 15px', fontSize: '12px', color: 'var(--text)' }}>
                          <span style={{ fontWeight: '900', color: '#059669' }}>{formatTimeAMPM(sch.startTime)}</span> 
                          <span style={{ margin: '0 6px', color: 'var(--border)' }}>—</span> 
                          <span style={{ fontWeight: '900', color: '#dc2626' }}>{formatTimeAMPM(sch.endTime)}</span>
                        </td>
                        <td style={{ padding: '6px 15px', fontSize: '12px', color: 'var(--text)', fontWeight: '900' }}>{sch.totalHours}h</td>
                        <td style={{ padding: '6px 15px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold', background: 'var(--bluebg)', color: 'var(--blue)', border: '1px solid var(--blue)44' }}>{sch.weeklyOffs || 'Sunday'}</span>
                        </td>
                        <td style={{ padding: '6px 15px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleEdit(sch)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
                            <button onClick={() => handleDelete(sch.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--red)' }}>🗑️</button>
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
          </div>
        )}
      </div>

      {/* Modal Overlay */}
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
                         {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
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
                   <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text)', fontWeight: 'bold' }}>Cancel</button>
                   <button onClick={handleSave} style={{ flex: 2, background: 'var(--accent)', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>💾 Save Schedule</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

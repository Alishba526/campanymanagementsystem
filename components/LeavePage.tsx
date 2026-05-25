'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { LeaveRequest } from '@/types';
import { getCurrentDate, formatDateShort } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function LeavePage() {
  const { currentUser, leaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, employees, fetchData } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    type: 'sick',
    status: 'pending'
  });

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const currentMonthPrefix = getCurrentDate().substring(0, 7);

  // Filter Logic
  const displayRequests = leaveRequests.filter(req => {
    const emp = employees.find(e => e.id === req.employeeId);
    const isDeptMatch = isAdmin || emp?.department === currentUser.role;
    if (!isDeptMatch) return false;

    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      req.employeeName.toLowerCase().includes(searchLower) ||
      req.employeeId.toLowerCase().includes(searchLower) ||
      req.reason?.toLowerCase().includes(searchLower) ||
      req.type.toLowerCase().includes(searchLower);

    // UNIVERSAL SEARCH: If searching, bypass date/archive filters
    if (searchQuery) return isSearchMatch;

    if (viewTab === 'active') {
       const isCurrentMonth = req.startDate.startsWith(currentMonthPrefix);
       const isDateMatch = !filterDate || req.startDate === filterDate;
       return isCurrentMonth || isDateMatch;
    } else {
       return selectedArchiveMonth ? req.startDate.startsWith(selectedArchiveMonth) : false;
    }
  });

  // Archive Grouping
  const archiveGroups = leaveRequests.reduce((groups: Record<string, LeaveRequest[]>, a) => {
    const month = a.startDate.substring(0, 7);
    if (month === currentMonthPrefix) return groups;
    if (!groups[month]) groups[month] = [];
    groups[month].push(a);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const handleAddRequest = () => {
    setFormData({
      type: 'sick',
      status: 'pending',
      startDate: getCurrentDate(),
      endDate: getCurrentDate()
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    const newRequest: LeaveRequest = {
      id: `LR${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee?.name || 'Unknown',
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      type: formData.type as any,
      status: 'pending',
      reason: formData.reason
    };

    await addLeaveRequest(newRequest);
    Swal.fire({ title: 'Request Sent', icon: 'success', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
    fetchData(); // Background sync
    setShowModal(false);
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await updateLeaveRequest(id, { status, approvedBy: currentUser.name });
    Swal.fire({ title: `Leave ${status}`, icon: 'success', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
    fetchData(); // Sync
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#059669';
      case 'rejected': return '#dc2626';
      default: return '#d97706';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Premium Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>🏖️</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Leave Search Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Live Tracking: {displayRequests.length} requests found</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search staff or reason..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px 8px 30px', color: 'var(--text)', outline: 'none', width: '200px', fontSize: '12px' }}
            />
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
          <button onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }} style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>Active Requests</button>
          <button onClick={() => setViewTab('archives')} style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>Past Archives</button>
        </div>

        {viewTab === 'archives' && !selectedArchiveMonth && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
             {sortedArchiveMonths.map(month => (
                <div key={month} onClick={() => setSelectedArchiveMonth(month)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>{month} Archives</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold', marginTop: '5px' }}>{archiveGroups[month].length} Total Requests</div>
                </div>
             ))}
           </div>
        )}

        {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)' }}>
                {selectedArchiveMonth ? `📅 ${selectedArchiveMonth} History` : '📋 Recent Leave Requests'}
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedArchiveMonth && <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>← Back</button>}
                <button onClick={handleAddRequest} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ New Request</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Employee</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Period</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Reason</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRequests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 15px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>{req.employeeName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold' }}>{req.employeeId}</div>
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '12px', color: 'var(--text2)', fontWeight: '600' }}>
                        {formatDateShort(req.startDate)} → {formatDateShort(req.endDate)}
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#4338ca', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{req.type}</span>
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '12px', color: 'var(--text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.reason || '—'}
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{ background: `${getStatusColor(req.status)}15`, color: getStatusColor(req.status), padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', border: `1px solid ${getStatusColor(req.status)}33` }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {req.status === 'pending' && isAdmin && (
                            <>
                              <button onClick={() => handleStatusChange(req.id, 'approved')} style={{ background: '#059669', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                              <button onClick={() => handleStatusChange(req.id, 'rejected')} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                            </>
                          )}
                          <button onClick={() => deleteLeaveRequest(req.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayRequests.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>No requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', width: '90%', maxWidth: '450px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>Request Leave</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Select Employee</label>
                <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                  <option value="">Select Employee</option>
                  {employees.filter(e => isAdmin || e.department === currentUser.role).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Start Date</label>
                  <input type="date" value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>End Date</label>
                  <input type="date" value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Leave Type</label>
                <select value={formData.type || 'sick'} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="paid">Paid Leave</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Reason</label>
                <textarea value={formData.reason || ''} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} style={{ width: '100%', height: '80px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none', resize: 'none' }} placeholder="Why are you taking leave?" />
              </div>
              <button onClick={handleSave} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

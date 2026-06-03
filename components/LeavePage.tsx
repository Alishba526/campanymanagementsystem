'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { LeaveRequest } from '@/types';
import { getCurrentDate, formatDateShort } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function LeavePage() {
  const { currentUser, leaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, employees, fetchData } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    type: 'sick',
    status: 'pending'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const currentMonthPrefix = getCurrentDate().substring(0, 7);

  const handleAddRequest = () => {
    setEditingRequest(null);
    setFormData({
      type: 'sick',
      status: 'pending',
      startDate: getCurrentDate(),
      endDate: getCurrentDate()
    });
    setShowModal(true);
  };

  const handleEdit = (req: LeaveRequest) => {
    setEditingRequest(req);
    setFormData(req);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    const requestData: LeaveRequest = {
      id: editingRequest?.id || `LR${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee?.name || 'Unknown',
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      type: formData.type as any,
      status: (formData.status as any) || 'pending',
      reason: formData.reason || ''
    };

    if (editingRequest) {
      await updateLeaveRequest(editingRequest.id, requestData);
    } else {
      await addLeaveRequest(requestData);
    }
    
    Swal.fire({ title: 'Request Saved', icon: 'success', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
    fetchData(); 
    setShowModal(false);
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await updateLeaveRequest(id, { status, approvedBy: currentUser.name });
    Swal.fire('Success', `Request ${status}`, 'success');
  };

  // Filter Logic
  const displayRequests = leaveRequests.filter(req => {
    const emp = employees.find(e => e.id === req.employeeId);
    const isDeptMatch = isAdmin || emp?.department === currentUser.role;
    if (!isDeptMatch) return false;

    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      req.employeeName.toLowerCase().includes(searchLower) ||
      req.employeeId.toLowerCase().includes(searchLower) ||
      req.reason?.toLowerCase().includes(searchLower);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>🏖️</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Leave Management System</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Live Tracking: {displayRequests.length} requests found</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', color: 'var(--text)', outline: 'none', width: '150px', fontSize: '12px' }} />
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }} style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>Active Requests</button>
          <button onClick={() => setViewTab('archives')} style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>Past Archives</button>
      </div>

      {viewTab === 'archives' && !selectedArchiveMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
             {sortedArchiveMonths.map(month => (
                <div key={month} onClick={() => setSelectedArchiveMonth(month)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>{month}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold', marginTop: '5px' }}>{archiveGroups[month].length} Total Requests</div>
                </div>
             ))}
        </div>
      )}

      {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)' }}>
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>
                {selectedArchiveMonth ? `📅 ${selectedArchiveMonth} History` : '📋 Recent Leave Requests'}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                {selectedArchiveMonth && <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>← Back</button>}
                {viewTab === 'active' && <button onClick={handleAddRequest} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ New Request</button>}
                </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Employee</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Period</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Reason</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800' }}>{req.employeeName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{req.employeeId}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{formatDateShort(req.startDate)} - {formatDateShort(req.endDate)}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '10px', background: 'var(--bg3)', fontWeight: 'bold', textTransform: 'uppercase' }}>{req.type}</span>
                    </td>
                    <td style={{ padding: '10px', fontSize: '12px', color: 'var(--text2)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.reason}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', background: req.status === 'approved' ? '#ecfdf5' : req.status === 'rejected' ? '#fef2f2' : '#fff7ed', color: req.status === 'approved' ? '#059669' : req.status === 'rejected' ? '#dc2626' : '#ea580c', fontWeight: '900', textTransform: 'uppercase' }}>{req.status}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {req.status === 'pending' && isAdmin && (
                            <>
                              <button onClick={() => handleStatusChange(req.id, 'approved')} style={{ background: '#059669', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                              <button onClick={() => handleStatusChange(req.id, 'rejected')} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                            </>
                          )}
                          <button onClick={() => handleEdit(req)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
                          <button onClick={() => deleteLeaveRequest(req.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--red)' }}>🗑️</button>
                        </div>
                    </td>
                  </tr>
                ))}
                {displayRequests.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>No matching records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>{editingRequest ? 'Update Leave Request' : 'Submit Leave Request'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '-10px' }}>Select Employee</label>
                <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                  <option value="">-- Choose Staff --</option>
                  {employees.filter(e => isAdmin || e.department === currentUser.role).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Start Date</label>
                    <input type="date" value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>End Date</label>
                    <input type="date" value={formData.endDate || ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                </div>

                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '-10px' }}>Leave Type</label>
                <select value={formData.type || 'sick'} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="other">Other</option>
                </select>

                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '-10px' }}>Reason</label>
                <textarea value={formData.reason || ''} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} style={{ width: '100%', height: '80px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none', resize: 'none' }} placeholder="Why are you taking leave?" />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button onClick={handleSave} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{editingRequest ? 'Update Request' : 'Submit Request'}</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

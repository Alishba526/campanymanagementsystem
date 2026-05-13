'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { LeaveRequest } from '@/types';

export default function LeavePage() {
  const { currentUser, leaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, employees } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    type: 'sick',
    status: 'pending'
  });

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  
  const filteredRequests = isAdmin
    ? leaveRequests
    : leaveRequests.filter(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        return emp?.department === currentUser.role;
      });

  const handleAddRequest = () => {
    if (isAdmin) {
      alert("Admins don't need to request leave here. This is for team members.");
      return;
    }
    
    // For managers, we'll assume they are requesting for themselves or someone in their team
    // But usually, managers should be able to select an employee from their team
    setFormData({
      type: 'sick',
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      alert('Please fill all required fields');
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
    setShowModal(false);
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await updateLeaveRequest(id, { status, approvedBy: currentUser.name });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'var(--green)';
      case 'rejected': return 'var(--red)';
      default: return 'var(--amber)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'approved': return 'var(--greenbg)';
      case 'rejected': return 'var(--redbg)';
      default: return 'var(--amberbg)';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{filteredRequests.length} leave requests</div>
        {!isAdmin && (
          <button
            onClick={handleAddRequest}
            style={{ background: 'var(--accent)', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📅</span> Request Leave
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
            <span style={{ color: 'var(--accent)' }}>📋</span>
            Leave Requests
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px' }}>Employee</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px' }}>Period</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px' }}>Type</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px' }}>Reason</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px' }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: '#000', textTransform: 'uppercase', letterSpacing: '.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text)' }}>{req.employeeName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>ID: {req.employeeId}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text2)' }}>
                    {req.startDate} to {req.endDate}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text2)', textTransform: 'capitalize' }}>
                    {req.type}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.reason || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: getStatusBg(req.status), color: getStatusColor(req.status), padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'normal', textTransform: 'uppercase' }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {req.status === 'pending' && (isAdmin || currentUser.role !== 'admin') && (
                        <>
                          <button
                            onClick={() => handleStatusChange(req.id, 'approved')}
                            style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'normal', cursor: 'pointer', border: 'none', background: 'var(--green)', color: '#fff' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(req.id, 'rejected')}
                            style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'normal', cursor: 'pointer', border: 'none', background: 'var(--red)', color: '#fff' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteLeaveRequest(req.id)}
                        style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)', fontSize: '13px' }}>
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '400px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: 'normal', color: '#000' }}>Request Leave</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Select Employee</label>
                <select
                  value={formData.employeeId || ''}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                >
                  <option value="">Select Employee</option>
                  {employees.filter(e => isAdmin || e.department === currentUser.role).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Leave Type</label>
                <select
                  value={formData.type || 'sick'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Reason (Optional)</label>
                <textarea
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', resize: 'none', height: '80px' }}
                  placeholder="Why are you taking leave?"
                />
              </div>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer', border: 'none', marginTop: '10px' }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

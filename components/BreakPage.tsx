'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function BreakPage() {
  const { currentUser, breakRequests, employees, addBreakRequest, updateBreakRequest } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState('13:00');

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  
  const filteredRequests = isAdmin 
    ? breakRequests 
    : breakRequests.filter(r => r.employeeId === currentUser.email || r.employeeName === currentUser.name);

  const handleRequest = async () => {
    const newReq = {
      id: `BR${Date.now()}`,
      employeeId: currentUser.email,
      employeeName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      startTime: startTime,
      status: 'pending' as const
    };
    await addBreakRequest(newReq as any);
    setShowModal(false);
    Swal.fire('Requested', 'Your break request has been sent for approval', 'success');
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    await updateBreakRequest(id, { status, approvedBy: currentUser.name });
    Swal.fire(status.toUpperCase(), `Break request has been ${status}`, 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'normal' }}>Break Management</h2>
        {!isAdmin && (
          <button onClick={() => setShowModal(true)} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            Request Break
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Employee</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Time</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Status</th>
              {isAdmin && <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontSize: '14px' }}>{r.employeeName}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{r.startTime}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                    background: r.status === 'approved' ? 'var(--greenbg)' : r.status === 'rejected' ? 'var(--redbg)' : 'var(--amberbg)',
                    color: r.status === 'approved' ? 'var(--green)' : r.status === 'rejected' ? 'var(--red)' : 'var(--amber)'
                  }}>{r.status}</span>
                </td>
                {isAdmin && r.status === 'pending' && (
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAction(r.id, 'approved')} style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
                      <button onClick={() => handleAction(r.id, 'rejected')} style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '12px', width: '300px' }}>
            <h3 style={{ marginBottom: '15px' }}>Request Break</h3>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'var(--bg3)', border: 'none', borderRadius: '8px' }}>Cancel</button>
              <button onClick={handleRequest} style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px' }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useApp } from '@/context/AppContext';

export default function AuditPage() {
  const { currentUser, auditLogs } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Your role does not have permission to view this data.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
            <span style={{ color: 'var(--accent)' }}>📋</span>
            System Audit Log
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '500' }}>{auditLogs.length} entries</span>
        </div>
        <div style={{ padding: '20px' }}>
          <div>
            {auditLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '5px', minWidth: '8px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{log.action}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                    {log.user} · {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

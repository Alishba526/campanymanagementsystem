'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { getCurrentDate } from '@/lib/dateUtils';

export default function AuditPage() {
  const { currentUser, auditLogs } = useApp();
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Your role does not have permission to view this data.</p>
      </div>
    );
  }

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = auditLogs.reduce((groups: Record<string, any[]>, log) => {
    // Assuming log.timestamp format is "DD/MM/YYYY, HH:MM AM/PM" or similar from my recent updates
    // Or if it's the old ISO format, we extract YYYY-MM
    let month = '';
    if (log.timestamp.includes('/')) {
      const parts = log.timestamp.split(',')[0].split('/');
      month = `${parts[2]}-${parts[1]}`; // YYYY-MM
    } else {
      month = log.timestamp.substring(0, 7);
    }
    
    if (month === currentMonthPrefix) return groups;
    if (!groups[month]) groups[month] = [];
    groups[month].push(log);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const displayLogs = auditLogs.filter(log => {
    let month = '';
    if (log.timestamp.includes('/')) {
      const parts = log.timestamp.split(',')[0].split('/');
      month = `${parts[2]}-${parts[1]}`;
    } else {
      month = log.timestamp.substring(0, 7);
    }

    if (viewTab === 'active') {
      return month === currentMonthPrefix;
    } else {
      return month === selectedArchiveMonth;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>🔍</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>System Activity Engine</h2>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>{auditLogs.length} total actions recorded</div>
          </div>
        </div>
      </div>

      {/* View Toggles */}
      <div style={{ display: 'flex', gap: '10px', padding: '5px', background: 'var(--bg2)', borderRadius: '15px', border: '1px solid var(--border)', width: 'fit-content' }}>
        <button 
          onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }}
          style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >⚡ Recent Logs</button>
        <button 
          onClick={() => setViewTab('archives')}
          style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >📁 Activity Archives</button>
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
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📜 {archiveGroups[month].length} SYSTEM ACTIONS</div>
            </div>
          ))}
        </div>
      )}

      {(viewTab === 'active' || selectedArchiveMonth) && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
          <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)', borderRadius: '24px 24px 0 0' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
              {viewTab === 'active' ? '⚡ Recent System Activity' : `📜 Activity Log: ${getMonthName(selectedArchiveMonth!)}`}
            </div>
            {selectedArchiveMonth && (
              <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>✕ Close Archive</button>
            )}
          </div>
          <div style={{ padding: '20px' }}>
            {displayLogs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No activities found for this period.</div>
            ) : (
              displayLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 'bold' }}>
                      <span style={{ color: 'var(--accent)' }}>{log.user}</span>: {log.action}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px', fontWeight: '600' }}>
                      ⏲️ {log.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

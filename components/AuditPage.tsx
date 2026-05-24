'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { getCurrentDate, formatDateShort } from '@/lib/dateUtils';

export default function AuditPage() {
  const { currentUser, auditLogs } = useApp();
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());

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
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      log.user.toLowerCase().includes(searchLower) || 
      log.action.toLowerCase().includes(searchLower);

    let logMonth = '';
    let logDate = '';
    if (log.timestamp.includes('/')) {
      const parts = log.timestamp.split(',')[0].split('/');
      logMonth = `${parts[2]}-${parts[1]}`;
      logDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    } else {
      logMonth = log.timestamp.substring(0, 7);
      logDate = log.timestamp.substring(0, 10);
    }

    const isDateMatch = !filterDate || logDate === filterDate;

    if (viewTab === 'active') {
      return logMonth === currentMonthPrefix && isSearchMatch && isDateMatch;
    } else {
      return logMonth === selectedArchiveMonth && isSearchMatch;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Standardized Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>🔍</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>System Activity Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Tracing {auditLogs.length} security actions</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search activity..." 
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
          >⚡ Recent Logs</button>
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
                <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📜 {archiveGroups[month].length} SYSTEM ACTIONS</div>
              </div>
            ))}
          </div>
        )}

        {(viewTab === 'active' || selectedArchiveMonth) && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{ padding: '15px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)' }}>
                {viewTab === 'active' ? '⚡ Recent Activity Stream' : `📜 Activity Log: ${getMonthName(selectedArchiveMonth!)}`}
              </div>
              {selectedArchiveMonth && (
                <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>✕ Close Archive</button>
              )}
            </div>
            <div style={{ padding: '10px' }}>
              {displayLogs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>No activities found in this view.</div>
              ) : (
                displayLogs.map(log => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '8px 15px', borderBottom: '1px solid var(--border)', transition: '0.1s' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: '900' }}>{log.user}</span>: <span style={{ color: 'var(--text2)' }}>{log.action}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '800', whiteSpace: 'nowrap' }}>
                      ⏲️ {log.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

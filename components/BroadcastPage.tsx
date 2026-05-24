'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { Announcement } from '@/types';
import Swal from 'sweetalert2';
import { getCurrentDate } from '@/lib/dateUtils';

export default function BroadcastPage() {
  const { currentUser, announcements, addAnnouncement, deleteAnnouncement, markAnnouncementAsRead, markCategoryNotificationsAsRead } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());
  
  const [formData, setFormData] = useState<Partial<Announcement>>({
    priority: 'normal'
  });

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = announcements.reduce((groups: Record<string, Announcement[]>, ann) => {
    const month = new Date(ann.createdAt).toISOString().substring(0, 7);
    if (month === currentMonthPrefix) return groups;
    if (!groups[month]) groups[month] = [];
    groups[month].push(ann);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const displayAnnouncements = announcements.filter(ann => {
    const annMonth = new Date(ann.createdAt).toISOString().substring(0, 7);
    const annDate = new Date(ann.createdAt).toISOString().substring(0, 10);
    
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      ann.title.toLowerCase().includes(searchLower) || 
      ann.content.toLowerCase().includes(searchLower);

    const isDateMatch = !filterDate || annDate === filterDate;

    if (viewTab === 'active') {
      return annMonth === currentMonthPrefix && isSearchMatch && isDateMatch;
    } else {
      return annMonth === selectedArchiveMonth && isSearchMatch;
    }
  });

  // Auto-mark as read for managers
  useEffect(() => {
    if (!isAdmin && announcements.length > 0) {
      markCategoryNotificationsAsRead('broadcast');
      const unread = announcements.filter(ann => !ann.seenBy?.includes(currentUser.name));
      if (unread.length > 0) {
        unread.forEach(ann => {
          markAnnouncementAsRead(ann.id, currentUser.name, currentUser.role);
        });
      }
    }
  }, [announcements.length, isAdmin, currentUser.name, currentUser.role]); 

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      Swal.fire('Error', 'Title and Content are required', 'error');
      return;
    }

    const newAnnounce: Announcement = {
      id: `AN${Date.now()}`,
      title: formData.title,
      content: formData.content,
      author: currentUser.name,
      priority: (formData.priority as any) || 'normal',
      createdAt: new Date()
    };

    await addAnnouncement(newAnnounce);
    setShowModal(false);
    setFormData({ priority: 'normal' });
    Swal.fire('Posted!', 'Broadcast sent successfully.', 'success');
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete this broadcast?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626'
    }).then(r => {
      if (r.isConfirmed) deleteAnnouncement(id);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Standardized Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>📢</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Announcement Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Active Broadcasts: {displayAnnouncements.length} updates found</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search notices..." 
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
          >🔔 Latest Posts</button>
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
                <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📢 {archiveGroups[month].length} ANNOUNCEMENTS</div>
              </div>
            ))}
          </div>
        )}

        {(viewTab === 'active' || selectedArchiveMonth) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedArchiveMonth ? (
                 <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold', fontSize: '11px' }}>← Back to Archives</button>
              ) : <div />}
              {viewTab === 'active' && isAdmin && (
                <button onClick={() => setShowModal(true)} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 25px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>+ New Broadcast</button>
              )}
            </div>

            {displayAnnouncements.map(ann => (
              <div key={ann.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', position: 'relative', borderLeft: `6px solid ${ann.priority === 'high' ? '#ef4444' : 'var(--accent)'}`, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ background: ann.priority === 'high' ? '#fee2e2' : '#eef2ff', color: ann.priority === 'high' ? '#dc2626' : '#4338ca', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '20px' }}>{ann.priority}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '600' }}>By <strong style={{ color: 'var(--accent)' }}>{ann.author}</strong> • {new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>{ann.title}</h3>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(ann.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text3)' }}>🗑️</button>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ann.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal remains same but updated with standard UI */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: '24px', width: '90%', maxWidth: '550px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text)' }}>Create Broadcast Message</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>SUBJECT / TITLE</label>
                <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Company Meeting" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>MESSAGE DETAILS</label>
                <textarea value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', color: 'var(--text)', outline: 'none', height: '120px', resize: 'none' }} placeholder="Enter message..." />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text)', fontWeight: 'bold' }}>Cancel</button>
                <button onClick={handleSave} style={{ flex: 2, background: 'var(--accent)', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>📢 Send Broadcast</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

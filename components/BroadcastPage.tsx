'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { Announcement } from '@/types';
import Swal from 'sweetalert2';

export default function BroadcastPage() {
  const { currentUser, announcements, addAnnouncement, deleteAnnouncement, markAnnouncementAsRead, markCategoryNotificationsAsRead } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    priority: 'normal'
  });

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  // Auto-mark as read for managers when they see this page
  useEffect(() => {
    if (!isAdmin && announcements.length > 0) {
      // 1. Clear Sidebar Badge numbers instantly
      markCategoryNotificationsAsRead('broadcast');

      // 2. Mark specific announcements as "Seen" for Admin
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Company Broadcasts</h2>
          <p style={{ fontSize: '13px', color: 'var(--text2)' }}>Manage official announcements and track read receipts.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--accent)', color: '#fff', padding: '10px 25px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📢 New Broadcast
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {announcements.map(ann => (
          <div key={ann.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', position: 'relative', borderLeft: `6px solid ${ann.priority === 'high' ? '#ef4444' : 'var(--accent)'}`, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ background: ann.priority === 'high' ? '#fee2e2' : '#eef2ff', color: ann.priority === 'high' ? '#dc2626' : '#4338ca', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px' }}>{ann.priority}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>Posted by <strong style={{ color: 'var(--accent)' }}>{ann.author}</strong></span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>{ann.title}</h3>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(ann.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text3)' }}>🗑️</button>
              )}
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{ann.content}</p>

            {/* Read Receipts for Admin (Department Focused) */}
            {isAdmin && ann.seenBy && (
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👁️</span> VIEWED BY DEPARTMENTS:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                  {ann.seenBy.split('\n').map((receipt, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold', background: '#ecfdf5', padding: '8px 12px', borderRadius: '10px', border: '1px solid #10b98133', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>✅</span> {receipt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {announcements.length === 0 && (
          <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--bg2)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>📭</div>
            <h3 style={{ color: 'var(--text2)', fontWeight: 'bold' }}>No Broadcasts Posted</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Important updates will appear here when posted by Admin.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: '24px', width: '90%', maxWidth: '550px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>Create Broadcast Message</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
            </div>
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>SUBJECT / TITLE</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', color: 'var(--text)', outline: 'none' }}
                  placeholder="e.g. Company Meeting Tomorrow"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>MESSAGE DETAILS</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', color: 'var(--text)', outline: 'none', height: '150px', resize: 'none', lineHeight: '1.6' }}
                  placeholder="Enter your message here..."
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>PRIORITY LEVEL</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', color: 'var(--text)', outline: 'none' }}
                >
                  <option value="normal">Normal Priority</option>
                  <option value="high">High / Urgent Notice</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text)', fontWeight: 'bold' }}>Cancel</button>
                <button
                  onClick={handleSave}
                  style={{ flex: 2, background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', border: 'none', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)' }}
                >
                  📢 Broadcast to All Managers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

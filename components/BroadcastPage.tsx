'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Announcement } from '@/types';

export default function BroadcastPage() {
  const { currentUser, announcements, addAnnouncement, deleteAnnouncement } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    priority: 'normal'
  });

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Title and Content are required');
      return;
    }

    const newAnnounce: Announcement = {
      id: `AN${Date.now()}`,
      title: formData.title,
      content: formData.content,
      author: currentUser.name,
      priority: formData.priority as any
    };

    await addAnnouncement(newAnnounce);
    setShowModal(false);
    setFormData({ priority: 'normal' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>Company <strong>Broadcasts</strong></h2>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>📢</span> Post Announcement
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map(ann => (
          <div key={ann.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', position: 'relative' }}>
            {isAdmin && (
              <button 
                onClick={() => deleteAnnouncement(ann.id)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                🗑️
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ 
                background: ann.priority === 'high' ? 'var(--redbg)' : 'var(--bluebg)', 
                color: ann.priority === 'high' ? 'var(--red)' : 'var(--blue)',
                fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px' 
              }}>
                {ann.priority}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                Posted by <strong>{ann.author}</strong>
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{ann.title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.6' }}>{ann.content}</p>
          </div>
        ))}

        {announcements.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg2)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📭</div>
            <p style={{ color: 'var(--text3)' }}>No announcements posted yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '500px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Create <strong>Broadcast</strong></div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Subject / Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                  placeholder="e.g. Eid Holidays Notice"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Message Content</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none', height: '120px', resize: 'none' }}
                  placeholder="Type your message here..."
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High / Urgent</option>
                </select>
              </div>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', marginTop: '10px' }}
              >
                📢 Broadcast to All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Project } from '@/types';

export default function ProjectsPage() {
  const { currentUser, projects, addProject, updateProject, deleteProject } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'active',
    amountReceived: 0
  });

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  const handleSave = async () => {
    if (!formData.clientName || !formData.projectName || !formData.totalBudget) {
      alert('Missing required fields');
      return;
    }

    if (formData.id) {
      await updateProject(formData.id, formData);
    } else {
      const newProj: Project = {
        id: `PRJ${Date.now()}`,
        clientName: formData.clientName,
        projectName: formData.projectName,
        scope: formData.scope || '',
        totalBudget: formData.totalBudget,
        amountReceived: formData.amountReceived || 0,
        status: formData.status as any,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        deadline: formData.deadline || ''
      };
      await addProject(newProj);
    }
    setShowModal(false);
    setFormData({ status: 'active', amountReceived: 0 });
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'normal', color: 'var(--text)' }}>Client Projects & Ledgers</h2>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            New Project
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)' }}>Client & Project</th>
                {isAdmin && (
                  <>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)' }}>Financials</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)' }}>Balance</th>
                  </>
                )}
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)' }}>Status</th>
                {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const balance = p.totalBudget - p.amountReceived;
                const progress = Math.round((p.amountReceived / p.totalBudget) * 100);
                
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', color: 'var(--text)' }}>{p.projectName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Client: {p.clientName}</div>
                    </td>
                    {isAdmin && (
                      <>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Budget: {formatCurrency(p.totalBudget)}</div>
                          <div style={{ fontSize: '13px', color: 'var(--green)' }}>Received: {formatCurrency(p.amountReceived)}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: '13px', color: balance > 0 ? 'var(--red)' : 'var(--green)' }}>
                            {balance > 0 ? formatCurrency(balance) : 'Paid Full'}
                          </div>
                        </td>
                      </>
                    )}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', color: p.status === 'completed' ? 'var(--green)' : 'var(--accent)' }}>{p.status}</span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setFormData(p); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                          <button onClick={() => deleteProject(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '500px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 'normal', color: 'var(--text)' }}>Project <strong>Ledger</strong> Entry</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName || ''}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Project Title</label>
                  <input
                    type="text"
                    value={formData.projectName || ''}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Total Budget (Lia)</label>
                  <input
                    type="number"
                    value={formData.totalBudget || ''}
                    onChange={(e) => setFormData({ ...formData, totalBudget: parseInt(e.target.value) })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Amount Received (Dia)</label>
                  <input
                    type="number"
                    value={formData.amountReceived || ''}
                    onChange={(e) => setFormData({ ...formData, amountReceived: parseInt(e.target.value) })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Project Scope</label>
                <textarea
                  value={formData.scope || ''}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none', minHeight: '80px', fontFamily: 'inherit' }}
                  placeholder="e.g. Website development, 5 pages, with payment integration"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer', border: 'none', marginTop: '10px' }}
              >
                💾 Save Project Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

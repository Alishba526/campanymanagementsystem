'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Project } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function ProjectsPage() {
  const { currentUser, projects, addProject, updateProject, deleteProject, employees } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'active',
    paymentStatus: 'upfront_50',
    cost: 0,
    amountReceived: 0,
    workingDays: 0,
    startDate: getCurrentDate()
  });

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      status: 'active',
      paymentStatus: 'upfront_50',
      cost: 0,
      amountReceived: 0,
      workingDays: 0,
      startDate: getCurrentDate(),
      managerName: currentUser.name,
      managerEmail: currentUser.email,
      department: isManager ? currentUser.role : 'ecommerce'
    });
    setShowModal(true);
  };

  const handleEdit = (p: Project) => {
    setEditingProject(p);
    setFormData(p);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.projectName || !formData.clientName || !formData.projectNo) {
      Swal.fire('Error', 'Project Name, Client Name, and Project No are required!', 'error');
      return;
    }

    const projectData: Project = {
      id: editingProject?.id || `PRJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectNo: formData.projectNo || '',
      projectName: formData.projectName || '',
      employeeName: formData.employeeName || '',
      scope: formData.scope || '',
      cost: Number(formData.cost) || 0,
      totalBudget: Number(formData.cost) || 0,
      amountReceived: Number(formData.amountReceived) || 0,
      paymentStatus: formData.paymentStatus || 'upfront_50',
      paymentMethod: formData.paymentMethod || '',
      workingDays: Number(formData.workingDays) || 0,
      startDate: formData.startDate || getCurrentDate(),
      deadline: formData.deadline || '',
      clientName: formData.clientName || '',
      clientEmail: formData.clientEmail || '',
      managerName: formData.managerName || currentUser.name,
      managerEmail: formData.managerEmail || currentUser.email,
      department: formData.department || (isManager ? currentUser.role : 'ecommerce'),
      status: (formData.status as any) || 'active'
    };

    if (editingProject) {
      await updateProject(editingProject.id, projectData);
      Swal.fire({ title: 'Updated', text: 'Project details updated successfully', icon: 'success', timer: 1500 });
    } else {
      await addProject(projectData);
      Swal.fire({ title: 'Added', text: 'New project added successfully', icon: 'success', timer: 1500 });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Project?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProject(id);
        Swal.fire('Deleted!', 'Project has been removed.', 'success');
      }
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number') return '$ 0';
    return `$ ${amount.toLocaleString()}`;
  };

  const filteredProjects = projects.filter(p => {
    const isDeptMatch = isAdmin || p.department === currentUser.role;
    const isDateMatch = !filterDate || p.startDate === filterDate;
    return isDeptMatch && isDateMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Section */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>📁</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>Project Management</h2>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{filteredProjects.length} active projects</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg3)', padding: '8px 15px', borderRadius: '10px', border: '1px solid var(--border)' }}>
             <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'bold' }}>📅 Start Date:</span>
             <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '13px' }} />
           </div>
           {(isAdmin || isManager) && (
             <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(var(--accent-rgb), 0.3)' }}>+ Add New Project</button>
           )}
        </div>
      </div>

      {/* Projects Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '25px', boxShadow: 'var(--shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Project Details</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Financials</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Timeline</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Manager</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)' }}>{p.projectNo || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', background: 'var(--accentbg)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>{p.projectName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Scope: {p.scope}</div>
                    <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 'bold', background: 'var(--bluebg)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>Staff: {p.employeeName || '—'}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--purple)', background: 'var(--accentbg)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>{p.clientName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', marginTop: '4px' }}>{p.clientEmail}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--green)', background: 'var(--greenbg)', borderRadius: '6px', textAlign: 'center', padding: '4px' }}>{formatCurrency(p.cost || p.totalBudget)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '4px' }}>{(p.paymentStatus || '').replace('_', ' ')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 'bold' }}>Via: {p.paymentMethod || '—'}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 'bold' }}>Start: {p.startDate}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>Days: {p.workingDays}</div>
                    <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold', background: 'var(--redbg)', padding: '2px 5px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>Due: {formatDateShort(p.deadline)}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold' }}>{p.managerName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold' }}>{p.managerEmail}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 'bold' }}>{p.department}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '10px', background: p.status === 'completed' ? 'var(--greenbg)' : 'var(--accentbg)', color: p.status === 'completed' ? 'var(--green)' : 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', border: `1px solid ${p.status === 'completed' ? 'var(--green)' : 'var(--accent)'}44` }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                      {(isAdmin || p.managerEmail === currentUser.email) && (
                        <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--red)' }}>🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📂</div>
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '24px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{editingProject ? '📝' : '🚀'}</span>
                {editingProject ? 'Update Project Details' : 'Add New Project'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
            </div>
            
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Date</label>
                  <input type="date" value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Project No (rewritable)</label>
                  <input type="text" value={formData.projectNo || ''} onChange={(e) => setFormData({ ...formData, projectNo: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. 1342" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Employee Name (rewritable)</label>
                  <input type="text" value={formData.employeeName || ''} onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Ali" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Project Name (rewritable)</label>
                  <input type="text" value={formData.projectName || ''} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. TMWA" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Scope of Work (rewritable)</label>
                  <input type="text" value={formData.scope || ''} onChange={(e) => setFormData({ ...formData, scope: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. MEP" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Project Cost ($)</label>
                  <input type="number" value={formData.cost || 0} onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="$ 120" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Payment Method</label>
                  <input type="text" value={formData.paymentMethod || ''} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="Paypal / Bank" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Total Working Days</label>
                  <input type="number" value={formData.workingDays || 0} onChange={(e) => setFormData({ ...formData, workingDays: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. 4" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Payment Status</label>
                  <select value={formData.paymentStatus || 'upfront_50'} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                    <option value="upfront_50">upfront 50% Received</option>
                    <option value="remaining_50">remaining 50% Received</option>
                    <option value="100_received">100% received</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Submit Last Date (Deadline)</label>
                  <input type="date" value={formData.deadline || ''} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Client Name</label>
                  <input type="text" value={formData.clientName || ''} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="Adam" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Client Email</label>
                  <input type="email" value={formData.clientEmail || ''} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="example@gmail.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>My Name (Manager)</label>
                  <input type="text" value={formData.managerName || ''} onChange={(e) => setFormData({ ...formData, managerName: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="Tom" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>My Email (Manager)</label>
                  <input type="email" value={formData.managerEmail || ''} onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="example@gmail.com" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', color: 'var(--text)', fontWeight: 'bold', fontSize: '14px' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 40px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(var(--accent-rgb), 0.3)' }}>{editingProject ? 'Update Project' : 'Add Project'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

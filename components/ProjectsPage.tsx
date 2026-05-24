'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Project } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function ProjectsPage() {
  const { currentUser, projects, addProject, updateProject, deleteProject } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'Working on',
    paymentStatus: 'upfront_50',
    cost: 0,
    amountReceived: 0,
    workingDays: 0,
    startDate: getCurrentDate()
  });

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  // Grouping logic for Archives
  const archiveGroups = projects.reduce((groups: Record<string, Project[]>, p) => {
    const month = p.startDate.substring(0, 7); // YYYY-MM
    if (!groups[month]) groups[month] = [];
    groups[month].push(p);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      status: 'Working on',
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
      status: (formData.status as any) || 'Working on'
    };

    if (editingProject) {
      updateProject(editingProject.id, projectData);
      Swal.fire({ title: 'Updated', text: 'Project details updated successfully', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
    } else {
      addProject(projectData);
      Swal.fire({ title: 'Added', text: 'New project added successfully', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
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

  // Filter projects based on the current view
  const displayProjects = projects.filter(p => {
    const isDeptMatch = isAdmin || p.department === currentUser.role;
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      p.projectName.toLowerCase().includes(searchLower) ||
      p.clientName.toLowerCase().includes(searchLower) ||
      p.projectNo.toLowerCase().includes(searchLower);

    if (viewTab === 'active') {
      // REQUIREMENT: Show all 'Working on' and 'Submited' projects, no matter how old they are
      const isActiveStatus = ['Working on', 'Submited'].includes(p.status);
      return isDeptMatch && isActiveStatus && isSearchMatch;
    } else {
      // ARCHIVES view
      if (selectedArchiveMonth) {
        return isDeptMatch && p.startDate.startsWith(selectedArchiveMonth) && isSearchMatch;
      }
      return false; // Will show the folder grid
    }
  });

  // REAL-TIME USD CALCULATIONS
  const totalUSDBudget = displayProjects.reduce((sum, p) => sum + (p.cost || 0), 0);
  const totalUSDReceived = displayProjects.reduce((sum, p) => sum + (p.amountReceived || 0), 0);

  const departments = [
    { id: 'ecommerce', label: 'E-Commerce', tagline: 'Digital storefront & online operations' },
    { id: 'marketing', label: 'Marketing', tagline: 'Brand awareness & lead generation' },
    { id: 'architecture', label: 'Architecture', tagline: 'System design & infrastructure' }
  ];

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Section */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>📁</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>Project Management</h2>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{displayProjects.length} projects in view</div>
          </div>
        </div>

        {/* Real-time USD Summary */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Budget</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text)' }}>$ {totalUSDBudget.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--greenbg)', border: '1px solid var(--green)44', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Received</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--green)' }}>$ {totalUSDReceived.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
           <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
             <span style={{ position: 'absolute', left: '12px', fontSize: '14px', opacity: 0.6 }}>🔍</span>
             <input 
               type="text" 
               placeholder="Search ledger..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 15px 10px 35px', color: 'var(--text)', outline: 'none', fontSize: '13px', width: '220px' }}
             />
           </div>
        </div>
      </div>

      {/* View Toggles */}
      <div style={{ display: 'flex', gap: '10px', padding: '5px', background: 'var(--bg2)', borderRadius: '15px', border: '1px solid var(--border)', width: 'fit-content' }}>
        <button 
          onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }}
          style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' }}
        >🚀 Active Ledger</button>
        <button 
          onClick={() => setViewTab('archives')}
          style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' }}
        >📁 Monthly Archives</button>
      </div>

      {viewTab === 'archives' && !selectedArchiveMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {sortedArchiveMonths.map(month => {
            const monthProjects = projects.filter(p => p.startDate.startsWith(month));
            const approved = monthProjects.filter(p => p.status === 'Submited').length;
            const revenue = monthProjects.reduce((sum, p) => sum + (p.amountReceived || 0), 0);
            
            return (
              <div 
                key={month} 
                onClick={() => setSelectedArchiveMonth(month)}
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>{getMonthName(month)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📊 {monthProjects.length} TOTAL PROJECTS</div>
                  <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>✅ {approved} SUBMISSIONS</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '900', marginTop: '5px' }}>💰 REVENUE: $ {revenue.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
        <>
          {selectedArchiveMonth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '-10px' }}>
              <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold' }}>← Back to Folders</button>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>Archive: {getMonthName(selectedArchiveMonth)}</div>
            </div>
          )}

          {/* 3 Department Portions */}
          {departments.map(dept => {
            if (!isAdmin && currentUser.role !== dept.id) return null;
            const deptProjects = displayProjects.filter(p => p.department === dept.id);
            if (viewTab === 'archives' && deptProjects.length === 0) return null;

            return (
              <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '25px', boxShadow: 'var(--shadow)' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--accent)' }}>🏢</span> {dept.label} {viewTab === 'active' ? 'Active Projects' : 'Archive'}
                    </h3>
                  </div>
                  {viewTab === 'active' && (isAdmin || currentUser.role === dept.id) && (
                    <button onClick={() => { 
                      setFormData({ ...formData, department: dept.id });
                      handleAdd(); 
                    }} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>+ New Project</button>
                  )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>No</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Project Details</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Client</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Financials</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Timeline (DD/MM/YYYY)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Manager</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptProjects.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)' }}>{p.projectNo || '—'}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#4338ca', background: '#eef2ff', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', border: '1px solid #c7d2fe' }}>{p.projectName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px', fontWeight: '500' }}>{p.scope || 'No scope specified'}</div>
                            <div style={{ fontSize: '11px', color: '#4338ca', fontWeight: '800', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Staff: {p.employeeName || '—'}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '900', color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', border: '1px solid #ddd6fe' }}>{p.clientName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{p.clientEmail || 'No email'}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#059669', marginBottom: '4px' }}>{formatCurrency(p.cost || p.totalBudget)}</div>
                            <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: '900', textTransform: 'uppercase' }}>
                              {p.paymentStatus === 'upfront_50' ? '50% Upfront' : 
                               p.paymentStatus === 'remaining_50' ? '50% Remaining' : 
                               '100% Paid'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>via {p.paymentMethod || '—'}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '600' }}>Start: {formatDateShort(p.startDate)}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Duration: {p.workingDays} days</div>
                            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '900', background: '#fef2f2', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '8px', border: '1px solid #fecaca' }}>Due: {formatDateShort(p.deadline)}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '13px', color: '#4338ca', fontWeight: '900' }}>{p.managerName}</div>
                            <div style={{ fontSize: '10px', color: '#4f46e5', textTransform: 'uppercase', fontWeight: '900', marginTop: '4px' }}>{p.department}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <select 
                              value={p.status} 
                              onChange={(e) => updateProject(p.id, { status: e.target.value as any })}
                              style={{ 
                                fontSize: '10px', 
                                padding: '5px 8px', 
                                borderRadius: '12px', 
                                background: p.status === 'Submited' ? '#ecfdf5' : 
                                           p.status === 'Working on' ? '#eff6ff' :
                                           p.status === 'on hold' ? '#fff7ed' : 
                                           p.status === 'Close' ? '#f3f4f6' : '#fef3c7', 
                                color: p.status === 'Submited' ? '#059669' : 
                                       p.status === 'Working on' ? '#2563eb' :
                                       p.status === 'on hold' ? '#ea580c' :
                                       p.status === 'Close' ? '#4b5563' : '#d97706', 
                                fontWeight: '900', 
                                textTransform: 'uppercase', 
                                border: `2px solid ${
                                        p.status === 'Submited' ? '#10b981' : 
                                        p.status === 'Working on' ? '#3b82f6' :
                                        p.status === 'on hold' ? '#f97316' :
                                        p.status === 'Close' ? '#6b7280' : '#f59e0b'
                                      }44`,
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                textAlign: 'center',
                                width: 'auto'
                              }}
                            >
                              <option value="Working on">Working on</option>
                              <option value="Submited">Submited</option>
                              <option value="Close">Close</option>
                              <option value="on hold">on hold</option>
                            </select>
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
                      {deptProjects.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No projects in this view.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}

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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Project Cost (USD $)</label>
                  <input type="number" value={formData.cost || 0} onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="$ 120" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Amount Received (USD $)</label>
                  <input type="number" value={formData.amountReceived || 0} onChange={(e) => setFormData({ ...formData, amountReceived: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--green)', borderRadius: '10px', padding: '12px', color: 'var(--green)', fontWeight: 'bold', outline: 'none' }} placeholder="$ 60" />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Payment Status</label>
                  <select value={formData.paymentStatus || 'upfront_50'} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                    <option value="upfront_50">upfront 50% Received</option>
                    <option value="remaining_50">remaining 50% Received</option>
                    <option value="100_received">100% received</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Project Status</label>
                  <select value={formData.status || 'Working on'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                    <option value="Working on">Working on</option>
                    <option value="Submited">Submited</option>
                    <option value="Close">Close</option>
                    <option value="on hold">on hold</option>
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

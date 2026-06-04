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
  const [filterDate, setFilterDate] = useState(getCurrentDate());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
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

  const departments = [
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'architecture', label: 'Architecture' }
  ];

  // 📂 AUTHORIZED PROJECTS (The source of truth for this user)
  const authProjects = projects.filter(p => isAdmin || p.department === currentUser.role);

  // Grouping logic for Archives (Filtered)
  const archiveGroups = authProjects.reduce((groups: Record<string, Project[]>, p) => {
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
      Swal.fire({ title: 'Updated', text: 'Project details updated successfully', icon: 'success', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
    } else {
      addProject(projectData);
      Swal.fire({ title: 'Added', text: 'New project added successfully', icon: 'success', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Project?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
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

  // 📂 UNIVERSAL FILTERING LOGIC
  const displayProjects = projects.filter(p => {
    const isDeptMatch = isAdmin || p.department === currentUser.role;
    if (!isDeptMatch) return false;

    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      p.projectName.toLowerCase().includes(searchLower) ||
      p.clientName.toLowerCase().includes(searchLower) ||
      p.projectNo.toLowerCase().includes(searchLower);

    if (searchQuery) return isSearchMatch;

    if (viewTab === 'archives') {
      return selectedArchiveMonth ? p.startDate.startsWith(selectedArchiveMonth) : false;
    }

    if (viewTab === 'active') {
      if (statusFilter === 'all') return true;
      return p.status === statusFilter;
    }
    
    return false;
  });

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Standardized Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>📁</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Project Master Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Live Entries: {displayProjects.length} records found</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg3)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
           <StatusToggle label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} color="var(--accent)" />
           <StatusToggle label="Working" active={statusFilter === 'Working on'} onClick={() => setStatusFilter('Working on')} color="#2563eb" />
           <StatusToggle label="New" active={statusFilter === 'New Project'} onClick={() => setStatusFilter('New Project')} color="#7c3aed" />
           <StatusToggle label="Submited" active={statusFilter === 'Submited'} onClick={() => setStatusFilter('Submited')} color="#059669" />
           <StatusToggle label="Close" active={statusFilter === 'Close'} onClick={() => setStatusFilter('Close')} color="#4b5563" />
           <StatusToggle label="On Hold" active={statusFilter === 'on hold'} onClick={() => setStatusFilter('on hold')} color="#ea580c" />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
           <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px 8px 30px', color: 'var(--text)', outline: 'none', fontSize: '12px', width: '150px' }}
             />
           </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
          <button onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }} style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Current Ledger</button>
          <button onClick={() => setViewTab('archives')} style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>History Archives</button>
        </div>

        {viewTab === 'archives' && !selectedArchiveMonth && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '10px' }}>
            {sortedArchiveMonths.map(month => {
              const monthProjects = authProjects.filter(p => p.startDate.startsWith(month));
              return (
                <div key={month} onClick={() => setSelectedArchiveMonth(month)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: '0.2s' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📂</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text)' }}>{getMonthName(month)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold', marginTop: '5px' }}>{monthProjects.length} Projects in Archive</div>
                </div>
              );
            })}
          </div>
        )}

        {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedArchiveMonth ? <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold', fontSize: '11px' }}>← Back</button> : <div />}
              {viewTab === 'active' && (isAdmin || isManager) && (
                <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ New Project</button>
              )}
            </div>

            {searchQuery ? (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
                <ProjectTable projects={displayProjects} formatCurrency={formatCurrency} formatDateShort={formatDateShort} updateProject={updateProject} handleEdit={handleEdit} handleDelete={handleDelete} isAdmin={isAdmin} currentUser={currentUser} />
              </div>
            ) : (
              departments.map(dept => {
                if (!isAdmin && currentUser.role !== dept.id) return null;
                const deptProjects = displayProjects.filter(p => p.department === dept.id);
                if (viewTab === 'archives' && deptProjects.length === 0) return null;
                return (
                  <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--accent)' }}>🏢</span> {dept.label} Unit 
                      {viewTab === 'active' && <span style={{fontSize:'10px', background:'var(--accent)', color:'#fff', padding:'2px 8px', borderRadius:'10px', marginLeft:'10px'}}>{deptProjects.length} RECORDS</span>}
                    </h3>
                    <ProjectTable projects={deptProjects} formatCurrency={formatCurrency} formatDateShort={formatDateShort} updateProject={updateProject} handleEdit={handleEdit} handleDelete={handleDelete} isAdmin={isAdmin} currentUser={currentUser} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '32px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>{editingProject ? '📝 Update Project' : '🚀 New Registration'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
            </div>
            <div style={{ padding: '30px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <input type="date" value={formData.startDate || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} style={{ padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} />
                  <input type="text" value={formData.projectNo || ''} onChange={(e) => setFormData({ ...formData, projectNo: e.target.value })} placeholder="Project No" style={{ padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} />
                  <input type="text" value={formData.employeeName || ''} onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })} placeholder="Assign Staff" style={{ padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <input type="text" value={formData.projectName || ''} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="Project Name" style={{ padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} />
                  <input type="text" value={formData.scope || ''} onChange={(e) => setFormData({ ...formData, scope: e.target.value })} placeholder="Scope (e.g. MEP)" style={{ padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} />
               </div>
               <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: '10px 30px', borderRadius: '15px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 'bold' }}>Discard</button>
                  <button onClick={handleSave} style={{ padding: '10px 50px', borderRadius: '15px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)' }}>Finalize</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusToggle({ label, active, onClick, color }: any) {
    return (
        <button onClick={onClick} style={{ background: active ? color : 'transparent', color: active ? '#fff' : 'var(--text2)', border: 'none', padding: '6px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', transition: '0.2s' }}>{label}</button>
    );
}

function ProjectTable({ projects, formatCurrency, formatDateShort, updateProject, handleEdit, handleDelete, isAdmin, currentUser }: any) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
        <thead>
          <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>No</th>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Project Details</th>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Client</th>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Financials</th>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Timeline</th>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Manager</th>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p: Project) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 10px', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent)' }}>{p.projectNo || '—'}</td>
              <td style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#111827' }}>{p.projectName}</div>
                <div style={{ fontSize: '10px', color: '#4338ca', fontWeight: 'bold' }}>Staff: {p.employeeName || '—'}</div>
              </td>
              <td style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827' }}>{p.clientName}</div>
              </td>
              <td style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#059669' }}>{formatCurrency(p.cost || p.totalBudget)}</div>
              </td>
              <td style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#111827' }}>S: {formatDateShort(p.startDate)}</div>
                <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 'bold' }}>D: {formatDateShort(p.deadline)}</div>
              </td>
              <td style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: '11px', color: '#111827', fontWeight: 'bold' }}>{p.managerName}</div>
              </td>
              <td style={{ padding: '8px 10px' }}>
                <select value={p.status} onChange={(e) => updateProject(p.id, { status: e.target.value as any })} style={{ fontSize: '9px', padding: '4px 8px', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <option value="Working on">Working on</option>
                  <option value="New Project">New Project</option>
                  <option value="Submited">Submited</option>
                  <option value="Close">Close</option>
                  <option value="on hold">on hold</option>
                </select>
              </td>
              <td style={{ padding: '8px 10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--red)' }}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

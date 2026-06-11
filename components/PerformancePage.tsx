'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { TaskLog, Employee, Project } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function PerformancePage() {
  const { currentUser, employees, tasks, addTask, updateTask, deleteTask, projects } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskLog | null>(null);
  const [formData, setFormData] = useState<Partial<TaskLog>>({});
  
  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);
  const isEmployee = currentUser.role === 'employee';
  const userDept = currentUser.role;

  // 🔒 Find the Employee Profile if logged in as employee
  const currentEmpProfile = employees.find(e => 
    e.id === currentUser.name || e.email === currentUser.email || e.id === currentUser.email
  );
  
  const isEcomEmployee = currentEmpProfile?.department === 'ecommerce';

  // Filter employees for Manager/Admin views
  const departmentEmployees = isAdmin
    ? employees
    : employees.filter(e => e.department === (isEmployee ? currentEmpProfile?.department : userDept));

  // 🛡️ DATA VISIBILITY LOCKDOWN (E-Commerce Specialty)
  const filteredTasks = tasks.filter(t => {
      if (isAdmin) return true;
      if (isManager) return departmentEmployees.some(e => e.id === t.employeeId);
      if (isEmployee) {
          // 🔒 Employee strictly sees only their OWN records (by name or ID)
          return t.employeeId === currentEmpProfile?.id || t.employeeName === currentEmpProfile?.name;
      }
      return false;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Get accounts assigned to this specific user (Handlers/Placers)
  const myAssignedAccounts = projects.filter(p => 
    p.department === 'ecommerce' && (p.handlerId === currentEmpProfile?.id || p.placerId === currentEmpProfile?.id)
  );

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({
      employeeId: isEmployee ? currentEmpProfile?.id : '',
      date: getCurrentDate(),
      category: isEcomEmployee ? 'ecommerce' : (isManager ? userDept : 'general'),
      workingDays: 1,
      quality: 80,
      sales: 0,
      netProfit: 0,
      listings: 0,
      accountName: myAssignedAccounts.length > 0 ? myAssignedAccounts[0].projectName : 'General'
    });
    setShowModal(true);
  };

  const handleEdit = (task: TaskLog) => {
      // 🔒 LOCK: Employees cannot edit existing records. Only Manager/Admin can.
      if (isEmployee) {
          Swal.fire('Restricted', 'Only Managers can verify or edit performance records.', 'warning');
          return;
      }
      setEditingTask(task);
      setFormData(task);
      setShowModal(true);
  };

  const handleSave = () => {
    const targetEmpId = isEmployee ? currentEmpProfile?.id : formData.employeeId;
    if (!targetEmpId) {
      Swal.fire('Error', 'Staff ID is required.', 'error');
      return;
    }

    const targetEmp = employees.find(e => e.id === targetEmpId);
    if (!targetEmp) return;

    // Performance score logic
    const profit = Number(formData.netProfit) || 0;
    const sales = Number(formData.sales) || 0;
    const roi = sales > 0 ? (profit / sales) * 100 : 0;
    const score = targetEmp.department === 'ecommerce' 
        ? Math.round(Math.min(roi / 25, 1) * 70 + 20)
        : 80;

    const task: TaskLog = {
      id: editingTask?.id || `TK${Date.now()}`,
      employeeId: targetEmpId,
      employeeName: targetEmp.name,
      date: formData.date || getCurrentDate(),
      task: formData.task || (targetEmp.department === 'ecommerce' ? `Daily Report: ${formData.accountName}` : 'Performance Milestone'),
      category: targetEmp.department,
      workingDays: 1,
      quality: formData.quality || 80,
      score,
      projectsAssigned: 0, projectsCompleted: 0, pendingProjects: 0, approvedProjects: 0, rejectedProjects: 0, clientResponses: 0, leadsGenerated: 0, emailsSent: 0, conversionRatio: 0,
      sales: Number(formData.sales) || 0,
      netProfit: Number(formData.netProfit) || 0,
      listings: Number(formData.listings) || 0,
      accountName: formData.accountName || 'General',
      targetProfit: 5000
    };

    if (editingTask) updateTask(editingTask.id, task);
    else addTask(task);
    
    setShowModal(false);
    Swal.fire({ title: 'Performance Logged', icon: 'success', timer: 1000, showConfirmButton: false, toast: true });
  };

  const accountSummaries = filteredTasks.reduce((acc: any, t) => {
    const key = t.accountName || 'Others';
    if (!acc[key]) acc[key] = { sales: 0, profit: 0, count: 0 };
    acc[key].sales += (t.sales || 0);
    acc[key].profit += (t.netProfit || 0);
    acc[key].count++;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🚀 EXECUTIVE HEADER */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f2b42' }}>
            {isEcomEmployee || userDept === 'ecommerce' ? '🛍️ Account Performance Ledger' : '🎯 Performance Center'}
          </h2>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', marginTop: '4px' }}>
             {isEmployee ? `STAFF VIEW: ${currentUser.name.toUpperCase()}` : `MANAGER VIEW: ${userDept.toUpperCase()} SECTOR`}
          </div>
        </div>
        {/* Unlocking "New Entry" for E-Commerce Employees + Managers */}
        {(isEcomEmployee || !isEmployee) && (
            <button onClick={handleAdd} style={{ background: '#1e3a5f', color: '#fff', padding: '10px 25px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                + New Daily Entry
            </button>
        )}
      </div>

      {/* 📊 PERFORMANCE TABLE (Read-Only for Staff, Editable for Manager) */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
         <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Account / Store</th>
                  <th style={thStyle}>💰 Total Sales</th>
                  <th style={thStyle}>📈 Net Profit</th>
                  <th style={thStyle}>📊 ROI %</th>
                  <th style={thStyle}>Listings</th>
                  {!isEmployee && <th style={thStyle}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: 'var(--accent)' }}>{formatDateShort(t.date)}</td>
                    <td style={tdStyle}><strong>{t.accountName}</strong></td>
                    <td style={tdStyle}>$ {t.sales?.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#059669', fontWeight: '900' }}>$ {t.netProfit?.toLocaleString()}</td>
                    <td style={tdStyle}>{t.sales && t.sales > 0 ? ((t.netProfit! / t.sales!) * 100).toFixed(1) : 0}%</td>
                    <td style={tdStyle}>{t.listings || 0}</td>
                    {!isEmployee && (
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEdit(t)} title="Verify & Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize:'14px' }}>✏️</button>
                          <button onClick={() => deleteTask(t.id)} title="Remove Entry" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize:'14px' }}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>

      {/* 📊 SUMMARY BOXES (Filtered) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
         {Object.entries(accountSummaries).map(([name, data]: [string, any]) => (
            <div key={name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
               <h4 style={{ fontSize: '12px', color: '#1e3a5f', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', fontWeight:'900' }}>📁 {name.toUpperCase()}</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={sumRow}><span>Total Sales:</span> <strong style={{color:'#1e3a5f'}}>$ {data.sales.toLocaleString()}</strong></div>
                  <div style={sumRow}><span>Net Profit:</span> <strong style={{color:'#059669'}}>$ {data.profit.toLocaleString()}</strong></div>
                  <div style={sumRow}><span>Avg ROI:</span> <strong style={{color:'var(--accent)'}}>{data.sales > 0 ? ((data.profit / data.sales) * 100).toFixed(1) : 0}%</strong></div>
               </div>
            </div>
         ))}
      </div>

      {/* --- ENTRY MODAL --- */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '550px', padding: '35px', boxShadow:'0 25px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f2b42', marginBottom: '25px' }}>
                {editingTask ? '📝 Update Performance Record' : '💰 Log New Daily Performance'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label style={labelStyle}>REPORT DATE</label>
                    <input type="date" value={formData.date || getCurrentDate()} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>SELECT ACCOUNT</label>
                    <select value={formData.accountName || ''} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} style={inputStyle}>
                        <option value="">Choose Store Account...</option>
                        {isEcomEmployee ? (
                            myAssignedAccounts.map(p => <option key={p.id} value={p.projectName}>{p.projectName}</option>)
                        ) : (
                            projects.filter(p => isAdmin || p.department === userDept).map(p => <option key={p.id} value={p.projectName}>{p.projectName}</option>)
                        )}
                        <option value="General">General / Other</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div>
                    <label style={labelStyle}>GROSS SALE ($)</label>
                    <input type="number" value={formData.sales || 0} onChange={(e) => setFormData({ ...formData, sales: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>NET PROFIT ($)</label>
                    <input type="number" value={formData.netProfit || 0} onChange={(e) => setFormData({ ...formData, netProfit: Number(e.target.value) })} style={{ ...inputStyle, color: '#059669', borderColor:'#059669' }} />
                </div>
                <div>
                    <label style={labelStyle}>LISTINGS ADDED</label>
                    <input type="number" value={formData.listings || 0} onChange={(e) => setFormData({ ...formData, listings: Number(e.target.value) })} style={inputStyle} />
                </div>
            </div>

            {!isEmployee && (
                 <div style={{ marginBottom: '25px', background:'#f8fafc', padding:'15px', borderRadius:'12px', border:'1px solid #e2e8f0' }}>
                    <label style={{...labelStyle, color:'#1e40af'}}>STAFF VERIFICATION</label>
                    <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={inputStyle}>
                       <option value="">Verify for Staff Member...</option>
                       {departmentEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                 </div>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 30px', borderRadius: '15px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color:'#64748b', fontWeight:'bold' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 40px', borderRadius: '15px', background: '#0f2b42', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(15,43,66,0.2)' }}>
                    {isEmployee ? 'Submit Record' : 'Save & Verify'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 15px', textAlign: 'left' as const, fontSize: '11px', color: '#64748b', fontWeight: '900' as const, textTransform: 'uppercase' as const };
const tdStyle = { padding: '12px 15px', fontSize: '13px', color: '#0f172a' };
const labelStyle = { fontSize: '10px', fontWeight: '900' as const, color: '#4a627a', marginBottom: '8px', display: 'block' };
const inputStyle = { width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #cfdfed', borderRadius: '12px', outline: 'none', fontSize: '14px', fontWeight: 'bold' as const };
const sumRow = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' };

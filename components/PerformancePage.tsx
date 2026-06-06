'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { TaskLog } from '@/types';
import { formatDateShort, formatTimeAMPM } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function PerformancePage() {
  const { currentUser, employees, tasks, addTask, updateTask, deleteTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskLog | null>(null);
  const [formData, setFormData] = useState<Partial<TaskLog>>({});
  const [selectedEmployeeLogs, setSelectedEmployeeLogs] = useState<string | null>(null);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);
  const userDept = currentUser.role;

  // Filter employees by department for managers
  const departmentEmployees = isAdmin
    ? employees
    : employees.filter(e => e.department === userDept);

  // 🔒 SECURITY: Filter logs so managers only see their own team's tasks
  const filteredTasks = tasks.filter(t => isAdmin || departmentEmployees.some(e => e.id === t.employeeId));

  // Calculate performance summaries
  const performanceSummary = departmentEmployees.map(emp => {
    const empTasks = filteredTasks.filter(t => t.employeeId === emp.id);
    const avgScore = empTasks.length > 0
      ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length)
      : 0;
    
    // E-Commerce Specific Stats
    const totalOrders = empTasks.reduce((sum, t) => sum + (t.ordersHandled || 0), 0);
    const totalProfit = empTasks.reduce((sum, t) => sum + (t.netProfit || 0), 0);

    return {
      employee: emp,
      avgScore,
      totalTasks: empTasks.length,
      totalOrders,
      totalProfit,
      rating: avgScore >= 90 ? 'Excellent' : avgScore >= 75 ? 'Good' : avgScore >= 60 ? 'Average' : 'Low'
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const lowPerformers = performanceSummary.filter(p => p.avgScore < 60);

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: userDept === 'ecommerce' ? 'e-commerce' : 'development',
      workingDays: 1,
      quality: 80,
      ordersHandled: 0,
      netProfit: 0
    });
    setShowModal(true);
  };

  const handleEdit = (task: TaskLog) => {
    setEditingTask(task);
    setFormData(task);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.employeeId || (!formData.task && userDept !== 'ecommerce')) {
      Swal.fire('Error', 'Please select an employee and details', 'error');
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const quality = formData.quality || 0;
    const workingDays = formData.workingDays || 0;
    const orders = formData.ordersHandled || 0;
    const profit = formData.netProfit || 0;
    
    // Score calculation (weighted)
    let score = 0;
    if (employee.department === 'ecommerce') {
        // E-commerce weighting: Orders (40%) + Profit (40%) + Quality (20%)
        score = Math.round(
            (Math.min(orders / 50, 1) * 40) + 
            (Math.min(profit / 500, 1) * 40) + 
            (quality * 0.2)
        );
    } else {
        // Architecture/Estimation weighting: Quality (40%) + Days (20%) + Projects (40%)
        score = Math.round(
            (quality * 0.4) + 
            (Math.min(workingDays / 22, 1) * 100 * 0.2) +
            (Math.min((formData.projectsCompleted || 0) / 2, 1) * 100 * 0.4)
        );
    }

    const task: TaskLog = {
      id: editingTask?.id || `TK${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee.name,
      date: formData.date || new Date().toISOString().split('T')[0],
      task: formData.task || (employee.department === 'ecommerce' ? `Order Cycle: ${orders} Orders` : ''),
      category: formData.category || (employee.department === 'ecommerce' ? 'e-commerce' : 'development'),
      workingDays,
      quality,
      score,
      projectsAssigned: formData.projectsAssigned || 0,
      projectsCompleted: formData.projectsCompleted || 0,
      pendingProjects: formData.pendingProjects || 0,
      approvedProjects: formData.approvedProjects || 0,
      rejectedProjects: formData.rejectedProjects || 0,
      clientResponses: formData.clientResponses || 0,
      leadsGenerated: formData.leadsGenerated || 0,
      emailsSent: formData.emailsSent || 0,
      conversionRatio: formData.conversionRatio || 0,
      ordersHandled: orders,
      netProfit: profit
    };

    if (editingTask) {
      updateTask(editingTask.id, task);
    } else {
      addTask(task);
    }
    setShowModal(false);
    Swal.fire({ title: 'Performance Logged', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete this log?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444'
    }).then(r => {
      if (r.isConfirmed) deleteTask(id);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
            {userDept === 'ecommerce' ? '🚀 Team Profit & Order Center' : '📈 Performance Master Engine'}
          </h2>
          <p style={{ fontSize: '11px', color: '#1e40af', fontWeight: '900' }}>
            {userDept === 'ecommerce' ? 'Tracking store orders and net profit margins' : 'Tracking project milestones and quality scores'}
          </p>
        </div>
        {(isAdmin || isManager) && (
          <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 25px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(var(--accent-rgb), 0.3)' }}>
            {userDept === 'ecommerce' ? '+ Log Orders' : '+ Log Performance'}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Top Performer</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e40af' }}>{performanceSummary[0]?.employee.name || '—'}</div>
          <div style={{ fontSize: '11px', fontWeight: '900', color: '#3b82f6', marginTop: '4px' }}>Score: {performanceSummary[0]?.avgScore || 0}%</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Total {userDept === 'ecommerce' ? 'Orders' : 'Tasks'}</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
            {userDept === 'ecommerce' 
              ? performanceSummary.reduce((sum, p) => sum + p.totalOrders, 0)
              : filteredTasks.length}
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Team Average</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#059669' }}>
            {performanceSummary.length > 0 ? Math.round(performanceSummary.reduce((sum, p) => sum + p.avgScore, 0) / performanceSummary.length) : 0}%
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{lowPerformers.length}</div>
          <div style={{ fontSize: '10px', fontWeight: '900', color: '#ef4444' }}>Below 60% Score</div>
        </div>
      </div>

      {/* Main Performance Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#111827', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
          📋 Monthly Performance Statement
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Dept</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Score</th>
                {userDept === 'ecommerce' ? (
                  <>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Orders Handled</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Net Profit</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Tasks Logged</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Rating</th>
                  </>
                )}
                <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '10px', color: '#1e293b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {performanceSummary.map(perf => (
                <tr key={perf.employee.id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 15px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e40af' }}>{perf.employee.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>ID: {perf.employee.id}</div>
                  </td>
                  <td style={{ padding: '10px 15px', fontSize: '11px', color: '#475569', fontWeight: '900', textTransform: 'uppercase' }}>{perf.employee.department}</td>
                  <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid', borderColor: perf.avgScore >= 80 ? '#10b981' : perf.avgScore >= 60 ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', color: '#0f172a', margin: '0 auto' }}>
                      {perf.avgScore}
                    </div>
                  </td>
                  {userDept === 'ecommerce' ? (
                    <>
                      <td style={{ padding: '10px 15px', fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{perf.totalOrders} Orders</td>
                      <td style={{ padding: '10px 15px', fontSize: '13px', fontWeight: '900', color: '#059669' }}>$ {perf.totalProfit.toLocaleString()}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '10px 15px', fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{perf.totalTasks} Tasks</td>
                      <td style={{ padding: '10px 15px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '900', padding: '3px 10px', borderRadius: '6px', background: perf.avgScore >= 80 ? '#ecfdf5' : '#fff7ed', color: perf.avgScore >= 80 ? '#059669' : '#ea580c' }}>{perf.rating.toUpperCase()}</span>
                      </td>
                    </>
                  )}
                  <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                     <button onClick={() => { setSelectedEmployeeLogs(perf.employee.id); }} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>View History</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal for Logging Performance */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', width: '90%', maxWidth: '600px', padding: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '25px', color: '#0f172a' }}>
              {userDept === 'ecommerce' ? '📦 Log Order Details' : '📈 Log Performance Score'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
               <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'block' }}>STAFF MEMBER</label>
                  <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#000', fontWeight: '900', outline: 'none' }}>
                    <option value="">Select Employee</option>
                    {departmentEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'block' }}>LOG DATE</label>
                  <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#000', fontWeight: '900', outline: 'none' }} />
               </div>
            </div>

            {userDept === 'ecommerce' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'block' }}>ORDERS HANDLED</label>
                    <input type="number" value={formData.ordersHandled || 0} onChange={(e) => setFormData({ ...formData, ordersHandled: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#000', fontWeight: '900', outline: 'none' }} placeholder="e.g. 25" />
                 </div>
                 <div>
                    <label style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'block' }}>NET ORDER PROFIT ($)</label>
                    <input type="number" value={formData.netProfit || 0} onChange={(e) => setFormData({ ...formData, netProfit: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px', color: '#059669', fontWeight: '900', outline: 'none' }} placeholder="e.g. 150" />
                 </div>
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                 <label style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'block' }}>TASK DESCRIPTION</label>
                 <textarea value={formData.task || ''} onChange={(e) => setFormData({ ...formData, task: e.target.value })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#000', fontWeight: '900', outline: 'none', height: '80px' }} placeholder="Detail of tasks completed..." />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
               <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'block' }}>QUALITY SCORE (0-100)</label>
                  <input type="number" value={formData.quality || 0} onChange={(e) => setFormData({ ...formData, quality: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#000', fontWeight: '900', outline: 'none' }} />
               </div>
               <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', marginBottom: '8px', display: 'block' }}>WORKING DAYS</label>
                  <input type="number" value={formData.workingDays || 0} onChange={(e) => setFormData({ ...formData, workingDays: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#000', fontWeight: '900', outline: 'none' }} />
               </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '12px 30px', borderRadius: '15px', border: '1px solid #e2e8f0', background: 'transparent', color: '#1e293b', cursor: 'pointer', fontWeight: 'bold' }}>Discard</button>
              <button onClick={handleSave} style={{ padding: '12px 50px', borderRadius: '15px', background: '#1e293b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>Secure Save</button>
            </div>
          </div>
        </div>
      )}

      {/* History Ledger View */}
      {selectedEmployeeLogs && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
           <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', width: '95%', maxWidth: '1000px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Performance History Ledger</h3>
                <button onClick={() => setSelectedEmployeeLogs(null)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900' }}>Close Ledger</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#1e293b' }}>DATE</th>
                      <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#1e293b' }}>{userDept === 'ecommerce' ? 'LOG TYPE' : 'TASK'}</th>
                      <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', color: '#1e293b' }}>SCORE</th>
                      {userDept === 'ecommerce' && <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: '#1e293b' }}>PROFIT</th>}
                      <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', color: '#1e293b' }}>OPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.filter(t => t.employeeId === selectedEmployeeLogs).map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', fontSize: '12px', fontWeight: '900' }}>{formatDateShort(t.date)}</td>
                        <td style={{ padding: '10px', fontSize: '12px', fontWeight: '700' }}>{t.task}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: t.score >= 80 ? '#059669' : '#ea580c' }}>{t.score}%</span>
                        </td>
                        {userDept === 'ecommerce' && <td style={{ padding: '10px', fontSize: '12px', fontWeight: '900', color: '#059669' }}>$ {t.netProfit?.toLocaleString() || '0'}</td>}
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                           <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

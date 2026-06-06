'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { TaskLog, Employee } from '@/types';
import { formatDateShort, getCurrentDate, formatTimeAMPM } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function PerformancePage() {
  const { currentUser, employees, tasks, addTask, updateTask, deleteTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskLog | null>(null);
  const [formData, setFormData] = useState<Partial<TaskLog>>({});
  const [selectedEmployeeLedger, setSelectedEmployeeLedger] = useState<string | null>(null);
  
  // E-Commerce Specific States
  const [ecomTab, setEcomTab] = useState<'accounts' | 'orders'>('accounts');
  const [avgProfitPerOrder, setAvgProfitPerOrder] = useState(8.5);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);
  const userDept = currentUser.role;

  // Filter employees by department
  const departmentEmployees = isAdmin
    ? employees
    : employees.filter(e => e.department === userDept);

  const filteredTasks = tasks.filter(t => isAdmin || departmentEmployees.some(e => e.id === t.employeeId));

  // --- E-COMMERCE CALCULATIONS ---
  const ecomTasks = filteredTasks.filter(t => {
      const emp = employees.find(e => e.id === t.employeeId);
      return emp?.department === 'ecommerce';
  });

  const monthProfit = ecomTasks.reduce((sum, t) => sum + (t.netProfit || 0), 0);
  const totalOrders = ecomTasks.reduce((sum, t) => sum + (t.ordersHandled || 0), 0);

  // Performance Summaries (Main Table)
  const performanceSummary = departmentEmployees.map(emp => {
    const empTasks = filteredTasks.filter(t => t.employeeId === emp.id);
    const avgScore = empTasks.length > 0
      ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length)
      : 0;
    
    const empProfit = empTasks.reduce((sum, t) => sum + (t.netProfit || 0), 0);
    const empSales = empTasks.reduce((sum, t) => sum + (t.sales || 0), 0);
    const target = empTasks[0]?.targetProfit || 5000; 

    return {
      employee: emp,
      avgScore,
      totalTasks: empTasks.length,
      totalProfit: empProfit,
      totalSales: empSales,
      target,
      achievement: target > 0 ? Math.round((empProfit / target) * 100) : 0,
      rating: avgScore >= 90 ? 'Excellent' : avgScore >= 75 ? 'Good' : avgScore >= 60 ? 'Average' : 'Low'
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({
      date: getCurrentDate(),
      category: userDept === 'ecommerce' ? 'ecommerce' : 'development',
      workingDays: 1,
      quality: 80,
      ordersHandled: 0,
      netProfit: 0,
      sales: 0,
      listings: 0,
      targetProfit: 5000,
      accountName: userDept === 'ecommerce' ? 'Amazon' : ''
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.employeeId) {
      Swal.fire('Error', 'Please select a staff member', 'error');
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const quality = formData.quality || 0;
    const profit = formData.netProfit || 0;
    const sales = formData.sales || 0;
    const orders = formData.ordersHandled || 0;

    let score = 0;
    if (employee.department === 'ecommerce') {
        // ROI = (Profit / Sales) * 100
        const roi = sales > 0 ? (profit / sales) * 100 : 0;
        // E-commerce Score: ROI (50%) + Orders (30%) + Quality (20%)
        score = Math.round((Math.min(roi / 30, 1) * 50) + (Math.min(orders / 50, 1) * 30) + (quality * 0.2));
    } else {
        score = Math.round((quality * 0.4) + (Math.min((formData.workingDays || 0) / 22, 1) * 20) + (Math.min((formData.projectsCompleted || 0) / 2, 1) * 40));
    }

    const task: TaskLog = {
      id: editingTask?.id || `TK${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee.name,
      date: formData.date || getCurrentDate(),
      task: formData.task || (employee.department === 'ecommerce' ? `${formData.accountName} Entry` : 'Project Milestone'),
      category: employee.department,
      workingDays: formData.workingDays || 1,
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
      netProfit: profit,
      sales,
      listings: formData.listings || 0,
      accountName: formData.accountName || '',
      targetProfit: formData.targetProfit || 5000,
      trackingSet: formData.trackingSet || false
    };

    if (editingTask) updateTask(editingTask.id, task);
    else addTask(task);
    
    setShowModal(false);
    Swal.fire({ title: 'Record Saved', icon: 'success', timer: 1000, showConfirmButton: false, toast: true });
  };

  const handlePushToProfit = (empId: string, accountName: string, orders: number) => {
      const employee = employees.find(e => e.id === empId);
      if (!employee) return;

      const addedProfit = orders * avgProfitPerOrder;
      const addedSales = addedProfit * 1.5; 

      const newTask: TaskLog = {
          id: `TK${Date.now()}`,
          employeeId: empId,
          employeeName: employee.name,
          date: getCurrentDate(),
          task: `Sync: ${orders} Orders`,
          category: 'ecommerce',
          workingDays: 1,
          quality: 100,
          score: 100,
          projectsAssigned: 0, projectsCompleted: 0, pendingProjects: 0, approvedProjects: 0, rejectedProjects: 0, clientResponses: 0, leadsGenerated: 0, emailsSent: 0, conversionRatio: 0,
          ordersHandled: orders,
          netProfit: addedProfit,
          sales: addedSales,
          accountName: accountName,
          targetProfit: 5000
      };

      addTask(newTask);
      Swal.fire({ title: 'Profit Synced', text: `$${addedProfit.toFixed(2)} added to Ledger`, icon: 'success', timer: 1500, showConfirmButton: false, toast: true });
  };

  // --- LEDGER VIEW LOGIC ---
  const selectedEmp = employees.find(e => e.id === selectedEmployeeLedger);
  const empLedgerTasks = filteredTasks.filter(t => t.employeeId === selectedEmployeeLedger).sort((a, b) => b.date.localeCompare(a.date));
  
  // Group by Account for Summary
  const accountSummaries = empLedgerTasks.reduce((acc: any, t) => {
    const key = t.accountName || 'General';
    if (!acc[key]) acc[key] = { sales: 0, profit: 0, listings: 0 };
    acc[key].sales += (t.sales || 0);
    acc[key].profit += (t.netProfit || 0);
    acc[key].listings += (t.listings || 0);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🚀 EXECUTIVE HEADER */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#0f2b42' }}>
            {userDept === 'ecommerce' ? '📋 Monthly Account Performance Tracker' : '📈 Performance Master Ledger'}
          </h1>
          <div style={{ fontSize: '11px', color: '#4a627a', borderLeft: '3px solid #3b82f6', paddingLeft: '8px', marginTop: '4px' }}>
            {userDept === 'ecommerce' ? '📌 Date‑wise tracking: Sales, Profit, Listings & ROI' : '📌 Tracking project milestones and staff efficiency scores'}
          </div>
        </div>
        <button onClick={handleAdd} style={{ background: '#1e3a5f', color: '#fff', padding: '10px 25px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            {userDept === 'ecommerce' ? '+ New Daily Entry' : '+ Log Performance'}
        </button>
      </div>

      {/* 📊 E-COMMERCE TABS */}
      {(userDept === 'ecommerce' || isAdmin) && (
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '10px' }}>
           <button onClick={() => setEcomTab('accounts')} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: ecomTab === 'accounts' ? '3px solid #1E3A5F' : 'none', color: ecomTab === 'accounts' ? '#1E3A5F' : '#4a5568', fontWeight: 'bold', cursor: 'pointer' }}>💰 Performance Ledger</button>
           <button onClick={() => setEcomTab('orders')} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: ecomTab === 'orders' ? '3px solid #1E3A5F' : 'none', color: ecomTab === 'orders' ? '#1E3A5F' : '#4a5568', fontWeight: 'bold', cursor: 'pointer' }}>📦 Order Sync Desk</button>
        </div>
      )}

      {/* 💼 MAIN LEDGER PANEL */}
      {ecomTab === 'accounts' ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
             <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0f2b42' }}>📊 Team Monthly Statement</h3>
             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', background: '#f8fafc', padding: '5px 15px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
               Total Team Profit: <span style={{color:'#059669'}}>$ {monthProfit.toLocaleString()}</span>
             </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={thStyle}>Employee / Member</th>
                  <th style={thStyle}>Total Sales ($)</th>
                  <th style={thStyle}>Total Profit ($)</th>
                  <th style={thStyle}>Listings Done</th>
                  <th style={thStyle}>Avg ROI %</th>
                  <th style={thStyle}>🎯 Target Achievement</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Full Report</th>
                </tr>
              </thead>
              <tbody>
                {performanceSummary.map(s => (
                  <tr key={s.employee.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                    <td style={tdStyle}>
                       <strong>{s.employee.name}</strong>
                       <div style={{fontSize:'10px', color:'#4a627a'}}>{s.employee.position}</div>
                    </td>
                    <td style={tdStyle}>$ {s.totalSales.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#059669', fontWeight: 'bold' }}>$ {s.totalProfit.toLocaleString()}</td>
                    <td style={tdStyle}>{s.totalTasks * 10}</td>
                    <td style={tdStyle}>{s.totalSales > 0 ? ((s.totalProfit/s.totalSales)*100).toFixed(1) : 0}%</td>
                    <td style={tdStyle}>
                       <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', marginBottom:'4px' }}>
                          <span style={{fontWeight:'900'}}>{s.achievement}%</span>
                          <span style={{color:'#64748b'}}>$ {s.target.toLocaleString()}</span>
                       </div>
                       <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ background: s.achievement >= 100 ? '#10b981' : '#3b82f6', height: '100%', width: `${Math.min(s.achievement, 100)}%` }}></div>
                       </div>
                    </td>
                    <td style={tdStyle}>
                       <span style={{ fontSize: '9px', fontWeight: '900', padding: '3px 10px', borderRadius: '6px', background: s.achievement >= 100 ? '#ecfdf5' : '#fff7ed', color: s.achievement >= 100 ? '#059669' : '#ea580c', border: '1px solid currentColor' }}>
                         {s.achievement >= 100 ? 'TARGET HIT' : 'IN PROGRESS'}
                       </span>
                    </td>
                    <td style={tdStyle}>
                       <button onClick={() => setSelectedEmployeeLedger(s.employee.id)} style={{ background: '#1e3a5f', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>View Monthly Report</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- ORDER SYNC DESK --- */
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '25px', boxShadow: 'var(--shadow)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0f2b42' }}>📦 Order Placement → Sync to Ledger</h3>
            <div style={{ background: '#f8fafc', padding: '10px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', border:'1px solid #e2e8f0' }}>
               <span style={{ fontSize: '12px', fontWeight: 'bold', color:'#1e3a5f' }}>💰 Automatic Profit per order: $</span>
               <input type="number" value={avgProfitPerOrder} onChange={(e) => setAvgProfitPerOrder(Number(e.target.value))} style={{ width: '70px', padding: '6px', borderRadius: '10px', border: '1px solid #cfdfed', fontWeight:'900' }} />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
             <thead>
               <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                 <th style={thStyle}>Staff Member</th>
                 <th style={thStyle}>Default Account</th>
                 <th style={thStyle}>Orders Processed Today</th>
                 <th style={thStyle}>Tracking Set</th>
                 <th style={thStyle}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {departmentEmployees.map(e => (
                 <tr key={e.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                   <td style={tdStyle}><strong>{e.name}</strong></td>
                   <td style={tdStyle}><input type="text" id={`acc-${e.id}`} defaultValue="Store-01" style={{ width: '120px', padding: '8px', borderRadius:'10px', border:'1px solid #cfdfed' }} /></td>
                   <td style={tdStyle}><input type="number" id={`orders-${e.id}`} defaultValue="0" style={{ width: '100px', padding: '8px', borderRadius:'10px', border:'1px solid #cfdfed', fontWeight:'900' }} /></td>
                   <td style={tdStyle}>
                      <select id={`track-${e.id}`} style={{ width: '100px', padding: '8px', borderRadius:'10px', border:'1px solid #cfdfed' }}>
                        <option value="yes">YES (SET)</option>
                        <option value="no">NO</option>
                      </select>
                   </td>
                   <td style={tdStyle}>
                      <button 
                        onClick={() => {
                          const val = (document.getElementById(`orders-${e.id}`) as HTMLInputElement).value;
                          const acc = (document.getElementById(`acc-${e.id}`) as HTMLInputElement).value;
                          handlePushToProfit(e.id, acc, Number(val));
                        }}
                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                      >🚀 Push to Ledger</button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      )}

      {/* --- 📅 FULL MONTHLY PERFORMANCE REPORT (OVERLAY) --- */}
      {selectedEmployeeLedger && selectedEmp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 43, 66, 0.95)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding:'20px' }}>
           <div style={{ background: '#eef2f9', borderRadius: '32px', width: '100%', maxWidth: '1200px', height:'95vh', padding: '30px', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                 <div>
                   <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f2b42' }}>📆 Monthly Performance Report — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
                   <div style={{ fontSize: '12px', color: '#4a627a', borderLeft: '4px solid #3b82f6', paddingLeft: '10px', marginTop: '5px' }}>
                     👤 Staff Member: <strong>{selectedEmp.name}</strong> | ID: {selectedEmp.id}
                   </div>
                 </div>
                 <button onClick={() => setSelectedEmployeeLedger(null)} style={{ background: '#0f2b42', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '30px', cursor: 'pointer', fontWeight: '900' }}>✕ Close Report</button>
              </div>

              <div style={{ background: '#fff', borderRadius: '24px', padding: '20px', border: '1px solid #e9edf2', marginBottom: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ background: '#f1f5f9' }}>
                       <th style={{ ...thStyle, background: '#fefce8' }}>📅 Date</th>
                       <th style={thStyle}>Account / Store</th>
                       <th style={thStyle}>💰 Sales ($)</th>
                       <th style={thStyle}>📈 Profit ($)</th>
                       <th style={thStyle}>📋 Listings</th>
                       <th style={{ ...thStyle, textAlign: 'center' }}>📊 ROI (%)</th>
                       <th style={thStyle}>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {empLedgerTasks.map(t => {
                       const roi = t.sales && t.sales > 0 ? ((t.netProfit! / t.sales!) * 100).toFixed(1) : '0';
                       return (
                         <tr key={t.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                           <td style={{ ...tdStyle, background: '#fefce8', fontWeight: '900' }}>{formatDateShort(t.date)}</td>
                           <td style={tdStyle}><strong>{t.accountName || 'Store'}</strong></td>
                           <td style={tdStyle}>$ {t.sales?.toLocaleString()}</td>
                           <td style={{ ...tdStyle, color: '#059669', fontWeight: 'bold' }}>$ {t.netProfit?.toLocaleString()}</td>
                           <td style={tdStyle}>{t.listings || 0}</td>
                           <td style={{ ...tdStyle, textAlign: 'center' }}>
                             <span style={{ background: '#f1f9fe', padding: '4px 12px', borderRadius: '20px', fontWeight: '900', color: '#1e40af' }}>{roi}%</span>
                           </td>
                           <td style={tdStyle}>
                              <button onClick={() => deleteTask(t.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                           </td>
                         </tr>
                       );
                     })}
                     {empLedgerTasks.length === 0 && (
                       <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No daily records logged for this month.</td></tr>
                     )}
                   </tbody>
                </table>
              </div>

              {/* 📊 SUMMARY CARDS (Mimicking HTML) */}
              <h3 style={{ marginBottom: '15px', color: '#0f2b42', fontWeight: '900' }}>📊 Monthly Totals Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                 {Object.entries(accountSummaries).map(([accName, totals]: [string, any]) => (
                   <div key={accName} style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #e2edf2', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                      <h4 style={{ fontSize: '13px', color: '#2c3e66', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>📁 {accName}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <SummaryLine label="Total Sales" value={`$ ${totals.sales.toLocaleString()}`} />
                        <SummaryLine label="Total Profit" value={`$ ${totals.profit.toLocaleString()}`} color="#059669" />
                        <SummaryLine label="Total Listings" value={totals.listings.toString()} />
                        <SummaryLine label="Avg ROI" value={`${totals.sales > 0 ? ((totals.profit/totals.sales)*100).toFixed(1) : 0}%`} color="#3b82f1" />
                      </div>
                   </div>
                 ))}
                 <div style={{ background: '#eef2ff', padding: '20px', borderRadius: '20px', border: '2px solid #3b82f6', boxShadow: '0 4px 15px rgba(59,130,246,0.1)' }}>
                    <h4 style={{ fontSize: '14px', color: '#0f2b42', marginBottom: '12px', fontWeight: '900' }}>🏆 GRAND TOTAL</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f2b42' }}>Profit: $ {empLedgerTasks.reduce((sum, t) => sum + (t.netProfit || 0), 0).toLocaleString()}</div>
                      <div style={{ fontSize: '14px', color: '#4a627a' }}>Sales: $ {empLedgerTasks.reduce((sum, t) => sum + (t.sales || 0), 0).toLocaleString()}</div>
                      <div style={{ fontSize: '14px', color: '#4a627a' }}>ROI: {empLedgerTasks.reduce((sum, t) => sum + (t.sales || 0), 0) > 0 ? ((empLedgerTasks.reduce((sum, t) => sum + (t.netProfit || 0), 0) / empLedgerTasks.reduce((sum, t) => sum + (t.sales || 0), 0)) * 100).toFixed(1) : 0}%</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- 💰 DAILY ENTRY MODAL --- */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
           <div style={{ background: '#fff', borderRadius: '32px', width: '90%', maxWidth: '650px', padding: '35px', boxShadow: '0 30px 70px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f2b42' }}>{userDept === 'ecommerce' ? '💰 Daily Account Profit Entry' : '📊 Log Performance'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                 <div>
                    <label style={labelStyle}>SELECT STAFF MEMBER</label>
                    <select value={formData.employeeId || ''} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} style={inputStyle}>
                       <option value="">Choose Employee...</option>
                       {departmentEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label style={labelStyle}>LOG DATE</label>
                    <input type="date" value={formData.date || getCurrentDate()} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />
                 </div>
              </div>

              {userDept === 'ecommerce' ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>ACCOUNT / STORE NAME</label>
                    <input type="text" value={formData.accountName || ''} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} style={inputStyle} placeholder="e.g. Amazon Electronics" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div>
                        <label style={labelStyle}>DAILY SALE ($)</label>
                        <input type="number" value={formData.sales || 0} onChange={(e) => setFormData({ ...formData, sales: Number(e.target.value) })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>DAILY PROFIT ($)</label>
                        <input type="number" value={formData.netProfit || 0} onChange={(e) => setFormData({ ...formData, netProfit: Number(e.target.value) })} style={{ ...inputStyle, borderColor: '#10b981', color: '#059669' }} />
                    </div>
                    <div>
                        <label style={labelStyle}>LISTINGS</label>
                        <input type="number" value={formData.listings || 0} onChange={(e) => setFormData({ ...formData, listings: Number(e.target.value) })} style={inputStyle} />
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                   <label style={labelStyle}>TASK / PROJECT DETAIL</label>
                   <textarea value={formData.task || ''} onChange={(e) => setFormData({ ...formData, task: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'none' }} placeholder="Summary of work completed..." />
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
                 <button onClick={() => setShowModal(false)} style={btnOutline}>Discard</button>
                 <button onClick={handleSave} style={{ ...btnPrimary, background: '#0f2b42' }}>Finalize & Log Entry</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function SummaryLine({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
      <span style={{ color: '#4a627a', fontWeight: '600' }}>{label}:</span>
      <span style={{ fontWeight: '900', color: color || '#0f2b42' }}>{value}</span>
    </div>
  );
}

const thStyle = { padding: '12px 15px', textAlign: 'left' as const, fontSize: '11px', color: '#1e3a5f', fontWeight: '900' as const, textTransform: 'uppercase' as const };
const tdStyle = { padding: '12px 15px', fontSize: '13px', color: '#0f172a' };
const labelStyle = { fontSize: '10px', fontWeight: '900' as const, color: '#1e3a5f', marginBottom: '8px', display: 'block' };
const inputStyle = { width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #cfdfed', borderRadius: '12px', outline: 'none', fontSize: '14px', fontWeight: 'bold' as const };
const btnPrimary = { background: '#1e3a5f', color: '#fff', border: 'none', padding: '12px 40px', borderRadius: '30px', fontWeight: 'bold' as const, cursor: 'pointer', boxShadow: '0 10px 20px rgba(30,58,95,0.2)' };
const btnOutline = { background: '#fff', border: '1px solid #cbd5e1', padding: '12px 30px', borderRadius: '30px', color: '#1e3a5f', fontWeight: 'bold' as const, cursor: 'pointer' };

function StatCard({ title, value, icon }: any) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2edf2', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ fontSize: '11px', fontWeight: '900', color: '#4b6b8f', textTransform: 'uppercase', marginBottom: '10px' }}>{icon} {title}</div>
      <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f2b42' }}>{value}</div>
    </div>
  );
}

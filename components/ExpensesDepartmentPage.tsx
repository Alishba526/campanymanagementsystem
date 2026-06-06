'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Expense } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function ExpensesDepartmentPage() {
  const { currentUser, expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({});
  const [selectedDept, setSelectedDept] = useState<string>('all');

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  if (!isAdmin && !isManager) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Personnel role does not have permission to view this data.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  // 🔒 SECURITY SOURCE FILTERING
  const ecommerceExpenses = isAdmin || currentUser.role === 'ecommerce' ? expenses.filter(e => e.department === 'ecommerce') : [];
  const marketingExpenses = isAdmin || currentUser.role === 'marketing' ? expenses.filter(e => e.department === 'marketing') : [];
  const architectureExpenses = isAdmin || currentUser.role === 'architecture' ? expenses.filter(e => e.department === 'architecture') : [];

  const ecommerceTotal = ecommerceExpenses.reduce((sum, e) => sum + e.amount, 0);
  const marketingTotal = marketingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const architectureTotal = architectureExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = ecommerceTotal + marketingTotal + architectureTotal;

  // Filter expenses based on selected department (Strictly enforced)
  const displayExpenses = isAdmin 
    ? (selectedDept === 'all' ? expenses : expenses.filter(e => e.department === selectedDept))
    : expenses.filter(e => e.department === currentUser.role);

  const handleAdd = () => {
    setEditingExpense(null);
    setFormData({
      date: getCurrentDate(),
      status: 'approved',
      department: isAdmin ? 'ecommerce' : currentUser.role as string,
      submittedBy: currentUser.name
    });
    setShowModal(true);
  };

  const handleEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData(exp);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.category || !formData.description || !formData.amount || !formData.department) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const expenseData: Expense = {
      id: editingExpense?.id || `EX${Date.now()}`,
      date: formData.date || getCurrentDate(),
      category: formData.category || 'Other',
      description: formData.description || '',
      amount: Number(formData.amount) || 0,
      status: 'approved',
      approvedBy: editingExpense?.approvedBy || currentUser.name,
      submittedBy: editingExpense?.submittedBy || currentUser.name,
      department: formData.department
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      Swal.fire({ title: 'Updated', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
    } else {
      addExpense(expenseData);
      Swal.fire({ title: 'Expense Added', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete this expense?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete'
    }).then(r => {
      if (r.isConfirmed) deleteExpense(id);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>🧾</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Departmental Overhead Master</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Live Tracking: {displayExpenses.length} overhead records</div>
          </div>
        </div>
        <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 25px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(var(--accent-rgb), 0.3)' }}>+ Log New Expense</button>
      </div>

      {/* Dept Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <StatCard icon="🛒" label="E-Commerce" value={formatCurrency(ecommerceTotal)} count={ecommerceExpenses.length} color="#6366f1" />
        <StatCard icon="📢" label="Marketing" value={formatCurrency(marketingTotal)} count={marketingExpenses.length} color="#ec4899" />
        <StatCard icon="🏗️" label="Architecture" value={formatCurrency(architectureTotal)} count={architectureExpenses.length} color="#10b981" />
        <StatCard icon="💸" label="Total Flow" value={formatCurrency(totalExpenses)} count={expenses.length} color="var(--accent)" />
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)' }}>📋 Expense Flow Ledger</h3>
          {isAdmin && (
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 12px', color: 'var(--text)', fontSize: '12px', outline: 'none' }}>
              <option value="all">All Departments</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="marketing">Marketing</option>
              <option value="architecture">Architecture</option>
            </select>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Description</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayExpenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 15px', fontSize: '13px', color: 'var(--text)' }}>{formatDateShort(exp.date)}</td>
                  <td style={{ padding: '10px 15px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', background: 'var(--accent)15', color: 'var(--accent)', textTransform: 'uppercase' }}>{exp.department}</span>
                  </td>
                  <td style={{ padding: '10px 15px', fontSize: '12px', fontWeight: '800', color: 'var(--text2)' }}>{exp.category}</td>
                  <td style={{ padding: '10px 15px', fontSize: '13px', color: 'var(--text)' }}>{exp.description}</td>
                  <td style={{ padding: '10px 15px', fontSize: '14px', color: '#dc2626', fontWeight: '900' }}>{formatCurrency(exp.amount)}</td>
                  <td style={{ padding: '10px 15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <button onClick={() => handleEdit(exp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                       <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ef4444' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '32px', width: '90%', maxWidth: '500px', padding: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '25px', color: 'var(--text)' }}>{editingExpense ? '📝 Update Overhead' : '🧾 Log New Overhead'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text3)', marginBottom: '8px', display: 'block' }}>DEPARTMENT</label>
                    <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} disabled={!isAdmin}>
                      <option value="ecommerce">E-Commerce</option>
                      <option value="marketing">Marketing</option>
                      <option value="architecture">Architecture</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text3)', marginBottom: '8px', display: 'block' }}>OVERHEAD DATE</label>
                    <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} />
                  </div>
               </div>
               <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text3)', marginBottom: '8px', display: 'block' }}>CATEGORY</label>
                  <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }}>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Software">Software</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Food">Food / Messing</option>
                    <option value="Travel">Travel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text3)', marginBottom: '8px', display: 'block' }}>DESCRIPTION</label>
                  <input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }} placeholder="Detail of expense..." />
               </div>
               <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text3)', marginBottom: '8px', display: 'block' }}>AMOUNT (PKR Rs.)</label>
                  <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid #dc262633', borderRadius: '12px', color: '#dc2626', fontWeight: '900', outline: 'none' }} placeholder="Rs. 5,000" />
               </div>
               <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '15px' }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: '12px 30px', borderRadius: '15px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 'bold', cursor: 'pointer' }}>Discard</button>
                  <button onClick={handleSave} style={{ padding: '12px 50px', borderRadius: '15px', background: '#1e293b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{editingExpense ? 'Update Record' : 'Save Overhead'}</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, count, color }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
       <div style={{ width: '36px', height: '36px', background: `${color}15`, color: color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{icon}</div>
       <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>{value}</div>
       <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '900', textTransform: 'uppercase', marginTop: '4px' }}>{label} ({count})</div>
    </div>
  );
}

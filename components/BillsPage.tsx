'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Bill } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';

export default function BillsPage() {
  const { currentUser, bills, addBill, updateBill, deleteBill } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState<Partial<Bill>>({});

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Only admin can manage company bills.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidBills = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.paidAmount || b.amount), 0);
  const pendingBills = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
  const overdueBills = bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);

  const handleAdd = () => {
    setEditingBill(null);
    setFormData({
      date: getCurrentDate(),
      dueDate: getCurrentDate(),
      status: 'pending'
    });
    setShowModal(true);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData(bill);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.billType || !formData.description || !formData.amount || !formData.dueDate) {
      alert('Please fill all required fields');
      return;
    }

    if (editingBill) {
      updateBill(editingBill.id, formData);
    } else {
      const newBill: Bill = {
        id: `BILL${Date.now()}`,
        date: formData.date || getCurrentDate(),
        billType: formData.billType,
        description: formData.description,
        amount: formData.amount,
        dueDate: formData.dueDate,
        status: formData.status || 'pending',
        paidDate: formData.paidDate,
        paidAmount: formData.paidAmount,
        notes: formData.notes
      };
      addBill(newBill);
    }
    setShowModal(false);
  };

  const handleMarkPaid = (bill: Bill) => {
    updateBill(bill.id, {
      status: 'paid',
      paidDate: getCurrentDate(),
      paidAmount: bill.amount
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      deleteBill(id);
    }
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            📋
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalBills)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Total Bills</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ✅
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(paidBills)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Paid Bills</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--amberbg)', color: 'var(--amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⏳
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(pendingBills)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Pending Bills</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--redbg)', color: 'var(--red)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⚠️
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(overdueBills)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Overdue Bills</div>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
          <span style={{ color: 'var(--accent)' }}>🧾</span>
          Company Bills Management
        </div>
        <button
          onClick={handleAdd}
          style={{ background: 'var(--accent)', color: '#fff', padding: '9px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          <span>➕</span> Add Bill
        </button>
      </div>

      {/* Bills Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Bill Type</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Description</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Amount</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Due Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)' }}>{formatDateShort(bill.date)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--accentbg)', color: 'var(--accent)', borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: 'bold' }}>
                      {bill.billType}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)' }}>{bill.description}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--red)', fontWeight: 'bold' }}>{formatCurrency(bill.amount)}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{formatDateShort(bill.dueDate)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: bill.status === 'paid' ? 'var(--greenbg)' : bill.status === 'overdue' ? 'var(--redbg)' : 'var(--amberbg)',
                      color: bill.status === 'paid' ? 'var(--green)' : bill.status === 'overdue' ? 'var(--red)' : 'var(--amber)'
                    }}>
                      {bill.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {bill.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(bill)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--green)', transition: '.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                        >
                          ✓ Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(bill)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(bill.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--red)', transition: '.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: 'normal', color: '#000' }}>{editingBill ? 'Edit Bill' : 'Add Bill'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#000', marginBottom: '6px', display: 'block' }}>Bill Type</label>
                  <select
                    value={formData.billType || ''}
                    onChange={(e) => setFormData({ ...formData, billType: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">Select Type</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Rent">Rent</option>
                    <option value="Internet">Internet</option>
                    <option value="Water">Water</option>
                    <option value="Gas">Gas</option>
                    <option value="Phone">Phone</option>
                    <option value="Software">Software Subscription</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#000', marginBottom: '6px', display: 'block' }}>Amount (Rs.)</label>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="15000"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#000', marginBottom: '6px', display: 'block' }}>Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                  placeholder="Monthly office electricity bill"
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#000', marginBottom: '6px', display: 'block' }}>Bill Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#000', marginBottom: '6px', display: 'block' }}>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: '#000', marginBottom: '6px', display: 'block' }}>Notes (Optional)</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)', minHeight: '60px' }}
                  placeholder="Additional notes..."
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--accent)', transition: '.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

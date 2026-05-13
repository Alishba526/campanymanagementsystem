'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Income } from '@/types';

export default function FinancePage() {
  const { currentUser, income, expenses, addIncome, deleteIncome } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Income>>({});

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Your role does not have permission to view this data.</p>
        </div>
      </div>
    );
  }

  const totalIncome = income.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
  const pendingIncome = income.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 0;

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const handleAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      status: 'received'
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.client || !formData.project || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }

    const newIncome: Income = {
      id: `IN${Date.now()}`,
      date: formData.date || new Date().toISOString().split('T')[0],
      client: formData.client,
      project: formData.project,
      amount: formData.amount,
      status: formData.status || 'received'
    };

    addIncome(newIncome);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this income record?')) {
      deleteIncome(id);
    }
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            📈
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: 'var(--green)' }}>{formatCurrency(profit)}</div>
          <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Net Profit</div>
          <div style={{ fontSize: '12px', color: 'var(--green)', marginTop: '4px', fontWeight: 'normal' }}>Margin: {margin}%</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            💰
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalIncome)}</div>
          <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Total Income</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--redbg)', color: 'var(--red)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            🧾
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(totalExpenses)}</div>
          <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Total Expenses</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--amberbg)', color: 'var(--amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⏳
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{formatCurrency(pendingIncome)}</div>
          <div style={{ fontSize: '13px', color: '#000', fontWeight: 'normal' }}>Pending Income</div>
        </div>
      </div>

      {/* Income Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
          <span style={{ color: 'var(--accent)' }}>💰</span>
          Client Income — <span style={{ color: 'var(--red)' }}>🔒 ADMIN ONLY</span>
        </div>
        <button
          onClick={handleAdd}
          style={{ background: 'var(--accent)', color: '#fff', padding: '9px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          <span>➕</span> Add Income
        </button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', marginBottom: '18px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Client</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Project</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Amount</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {income.map(inc => (
                <tr key={inc.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#000', fontWeight: 'normal' }}>{inc.client}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#333', fontWeight: 'normal' }}>{inc.project}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: '#333', fontWeight: 'normal' }}>{inc.date}</td>
                  <td style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--green)', fontWeight: 'normal' }}>{formatCurrency(inc.amount)}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '12px',
                      fontWeight: 'normal',
                      background: inc.status === 'received' ? 'var(--greenbg)' : 'var(--amberbg)',
                      color: inc.status === 'received' ? 'var(--green)' : 'var(--amber)'
                    }}>
                      {inc.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <button
                      onClick={() => handleDelete(inc.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--red)', transition: '.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* P&L Breakdown */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
            <span style={{ color: 'var(--accent)' }}>📊</span>
            P&L Breakdown
          </div>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: '#000', fontWeight: 'normal' }}>Income</span>
              <span style={{ color: 'var(--green)', fontWeight: 'normal' }}>{formatCurrency(totalIncome)}</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--green)', borderRadius: '99px', width: '100%' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: '#000', fontWeight: 'normal' }}>Expenses</span>
              <span style={{ color: 'var(--red)', fontWeight: 'normal' }}>{formatCurrency(totalExpenses)}</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--red)', borderRadius: '99px', width: `${Math.round((totalExpenses / totalIncome) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: '#000', fontWeight: 'normal' }}>Profit</span>
              <span style={{ color: 'var(--amber)', fontWeight: 'normal' }}>{formatCurrency(profit)} ({margin}%)</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--amber)', borderRadius: '99px', width: `${margin}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 'normal', color: 'var(--text)' }}>Add Income Record</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Client Name</label>
                  <input
                    type="text"
                    value={formData.client || ''}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="TechCorp Solutions"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Project</label>
                  <input
                    type="text"
                    value={formData.project || ''}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="E-Commerce Platform"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Amount (Rs.)</label>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="350000"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Date</label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
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

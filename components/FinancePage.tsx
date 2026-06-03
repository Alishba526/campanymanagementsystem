'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Income, Expense } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function FinancePage() {
  const { currentUser, income, expenses, addIncome, updateIncome, deleteIncome } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState<Partial<Income>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(getCurrentDate());

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Your role does not have permission to view this data.</p>
      </div>
    );
  }

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = income.reduce((groups: Record<string, Income[]>, inc) => {
    const month = inc.date.substring(0, 7);
    if (month === currentMonthPrefix) return groups;
    if (!groups[month]) groups[month] = [];
    groups[month].push(inc);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleAdd = () => {
    setEditingIncome(null);
    setFormData({
      date: getCurrentDate(),
      status: 'received'
    });
    setShowModal(true);
  };

  const handleEdit = (inc: Income) => {
    setEditingIncome(inc);
    setFormData(inc);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.client || !formData.project || !formData.amount) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const incomeData: Income = {
      id: editingIncome?.id || `IN${Date.now()}`,
      date: formData.date || getCurrentDate(),
      client: formData.client || '',
      project: formData.project || '',
      amount: formData.amount || 0,
      status: (formData.status as any) || 'received'
    };

    if (editingIncome) {
      await updateIncome(editingIncome.id, incomeData);
    } else {
      await addIncome(incomeData);
    }
    
    setShowModal(false);
    Swal.fire({ title: 'Income Saved', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)'
    }).then(r => {
      if (r.isConfirmed) deleteIncome(id);
    });
  };

  const displayIncome = income.filter(inc => {
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      inc.client.toLowerCase().includes(searchLower) || 
      inc.project.toLowerCase().includes(searchLower);

    if (searchQuery) return isSearchMatch;

    const isDateMatch = !filterDate || inc.date === filterDate;

    if (viewTab === 'active') {
      return inc.date.startsWith(currentMonthPrefix) && isDateMatch;
    } else {
      if (selectedArchiveMonth) {
        return inc.date.startsWith(selectedArchiveMonth);
      }
      return false;
    }
  });

  const totalIncome = displayIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix)).reduce((sum, e) => sum + e.amount, 0);

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>💰</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Finance & Revenue Master</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Active Period: {getMonthName(currentMonthPrefix)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search income..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px 8px 30px', color: 'var(--text)', outline: 'none', width: '180px', fontSize: '12px' }}
            />
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* View Toggles */}
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
          <button 
            onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }}
            style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}
          >💰 Income Ledger</button>
          <button 
            onClick={() => setViewTab('archives')}
            style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}
          >📁 History Archives</button>
        </div>

        {viewTab === 'archives' && !selectedArchiveMonth && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
            {sortedArchiveMonths.map(month => {
              const monthInc = archiveGroups[month];
              const total = monthInc.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);  
              return (
                <div 
                  key={month} 
                  onClick={() => setSelectedArchiveMonth(month)}
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>{getMonthName(month)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>Total Income: {formatCurrency(total)}</div>
                </div>
              );
            })}
          </div>
        )}

        {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {selectedArchiveMonth ? (
                 <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold', fontSize: '11px' }}>← Back to Archives</button>
              ) : null}
              {viewTab === 'active' && (
                <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ Log Income</button>
              )}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--accent)' }}>🧾</span> {viewTab === 'active' ? 'Income Ledger' : `Archive: ${getMonthName(selectedArchiveMonth!)}`}
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Client</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Project</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayIncome.map(inc => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)' }}>{formatDateShort(inc.date)}</td>
                      <td style={{ padding: '10px', fontSize: '13px', fontWeight: '800' }}>{inc.client}</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>{inc.project}</td>
                      <td style={{ padding: '10px', fontSize: '13px', fontWeight: '900', color: 'var(--green)' }}>{formatCurrency(inc.amount)}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', fontWeight: '900', textTransform: 'uppercase' }}>{inc.status}</span>
                      </td>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleEdit(inc)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                          <button onClick={() => handleDelete(inc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--red)' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayIncome.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>No records found in this view.</td></tr>
                  )}
                </tbody>
                <tfoot>
                   <tr style={{ background: 'var(--bg3)', fontWeight: '900' }}>
                      <td colSpan={3} style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>PAGE TOTAL:</td>
                      <td style={{ padding: '12px', color: 'var(--green)', fontSize: '14px' }}>{formatCurrency(totalIncome)}</td>
                      <td colSpan={2}></td>
                   </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text)' }}>{editingIncome ? 'Edit Income Detail' : 'Add Income Record'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Client Name</label>
                <input type="text" value={formData.client || ''} onChange={(e) => setFormData({ ...formData, client: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Aim Global" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Project Details</label>
                <input type="text" value={formData.project || ''} onChange={(e) => setFormData({ ...formData, project: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Web Development" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Amount (PKR Rs.)</label>
                  <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="Rs. 50,000" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Date</label>
                  <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 35px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{editingIncome ? 'Update Record' : 'Save Record'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

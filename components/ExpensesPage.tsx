'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Expense } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function ExpensesPage() {
  const { currentUser, expenses, addExpense, deleteExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(getCurrentDate());

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = expenses.reduce((groups: Record<string, Expense[]>, exp) => {
    const month = exp.date.substring(0, 7);
    if (month === currentMonthPrefix) return groups;
    if (!groups[month]) groups[month] = [];
    groups[month].push(exp);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const handleAdd = () => {
    setFormData({
      date: getCurrentDate(),
      category: 'office'
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.description || !formData.amount) {
      Swal.fire('Error', 'Description and Amount are required!', 'error');
      return;
    }

    const newExpense: Expense = {
      id: `EXP${Date.now()}`,
      description: formData.description,
      amount: formData.amount,
      category: formData.category || 'office',
      date: formData.date || getCurrentDate(),
      status: 'approved',
      approvedBy: currentUser.name,
      submittedBy: currentUser.name
    };

    addExpense(newExpense);
    setShowModal(false);
    Swal.fire({ title: 'Expense Logged', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Expense?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteExpense(id);
        Swal.fire('Deleted', 'Expense removed', 'success');
      }
    });
  };

  // Filter Logic
  const displayExpenses = expenses.filter(exp => {
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      exp.description.toLowerCase().includes(searchLower) || 
      exp.category.toLowerCase().includes(searchLower);

    const isDateMatch = !filterDate || exp.date === filterDate;

    if (viewTab === 'active') {
      return exp.date.startsWith(currentMonthPrefix) && isSearchMatch && isDateMatch;
    } else {
      if (selectedArchiveMonth) {
        return exp.date.startsWith(selectedArchiveMonth) && isSearchMatch;
      }
      return false;
    }
  });

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Standardized Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>🧾</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Expense Search Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Active Costs: {displayExpenses.length} records found</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search expenses..." 
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
          >Current Month</button>
          <button 
            onClick={() => setViewTab('archives')}
            style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}
          >Past Archives</button>
        </div>

        {viewTab === 'archives' && !selectedArchiveMonth && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
            {sortedArchiveMonths.map(month => {
              const monthExp = archiveGroups[month];
              const total = monthExp.reduce((sum, e) => sum + e.amount, 0);
              
              return (
                <div 
                  key={month} 
                  onClick={() => setSelectedArchiveMonth(month)}
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>{getMonthName(month)}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📊 {monthExp.length} LOG ENTRIES</div>
                    <div style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 'bold' }}>📉 Rs. {total.toLocaleString()} TOTAL EXPENSE</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedArchiveMonth ? (
                 <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold', fontSize: '11px' }}>← Back to Archives</button>
              ) : <div />}
              {viewTab === 'active' && isAdmin && (
                <button onClick={handleAdd} style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ New Expense</button>
              )}
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Date (DD/MM/YYYY)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Category</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Amount (PKR Rs.)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayExpenses.map(exp => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--text)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatDateShort(exp.date)}</td>
                      <td style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{exp.description}</td>
                      <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{exp.category.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '6px 10px', fontSize: '13px', color: '#dc2626', fontWeight: '900', whiteSpace: 'nowrap' }}>Rs. {exp.amount.toLocaleString()}</td>
                      <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Expense Modal remains same but with compact styles */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text)' }}>Log New Expense</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Description</label>
                <input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Office Rent" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Amount (PKR Rs.)</label>
                  <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="Rs. 5,000" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Category</label>
                  <select value={formData.category || 'office'} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }}>
                    <option value="office">Office</option>
                    <option value="travel">Travel</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Date</label>
                <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 35px', borderRadius: '10px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Log Expense</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

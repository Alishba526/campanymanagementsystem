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
    if (!formData.title || !formData.amount) {
      Swal.fire('Error', 'Title and Amount are required!', 'error');
      return;
    }

    const newExpense: Expense = {
      id: `EXP${Date.now()}`,
      title: formData.title,
      amount: formData.amount,
      category: formData.category || 'office',
      date: formData.date || getCurrentDate(),
      description: formData.description || ''
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
      exp.title.toLowerCase().includes(searchLower) || 
      exp.category.toLowerCase().includes(searchLower);

    if (viewTab === 'active') {
      return exp.date.startsWith(currentMonthPrefix) && isSearchMatch;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>🧾</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>Expense Search Engine</h2>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>Monitoring {expenses.length} logs in real-time</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search title or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 15px 12px 35px', color: 'var(--text)', outline: 'none', width: '250px', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* View Toggles */}
      <div style={{ display: 'flex', gap: '10px', padding: '5px', background: 'var(--bg2)', borderRadius: '15px', border: '1px solid var(--border)', width: 'fit-content' }}>
        <button 
          onClick={() => { setViewTab('active'); setSelectedArchiveMonth(null); }}
          style={{ background: viewTab === 'active' ? 'var(--accent)' : 'transparent', color: viewTab === 'active' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >⚡ Current Month</button>
        <button 
          onClick={() => setViewTab('archives')}
          style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >📁 Expense Archives</button>
      </div>

      {viewTab === 'archives' && !selectedArchiveMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
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
          {sortedArchiveMonths.length === 0 && (
             <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No past months to archive yet.</div>
          )}
        </div>
      )}

      {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedArchiveMonth ? (
               <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold' }}>← Back to Archives</button>
            ) : <div />}
            {viewTab === 'active' && isAdmin && (
              <button onClick={handleAdd} style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ New Expense</button>
            )}
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Date (DD/MM/YYYY)</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Title</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Amount (PKR Rs.)</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayExpenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)', fontWeight: 'bold' }}>{formatDateShort(exp.date)}</td>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)' }}>{exp.title}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{exp.category.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--red)', fontWeight: 'bold' }}>Rs. {exp.amount.toLocaleString()}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <button onClick={() => handleDelete(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Expense Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text)' }}>Log New Expense</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Title</label>
                <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Office Rent" />
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

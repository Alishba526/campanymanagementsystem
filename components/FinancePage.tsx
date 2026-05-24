'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Income } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function FinancePage() {
  const { currentUser, income, expenses, addIncome, deleteIncome } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Income>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
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

  const handleAdd = () => {
    setFormData({
      date: getCurrentDate(),
      status: 'received'
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.client || !formData.project || !formData.amount) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const newIncome: Income = {
      id: `IN${Date.now()}`,
      date: formData.date || getCurrentDate(),
      client: formData.client,
      project: formData.project,
      amount: formData.amount,
      status: formData.status || 'received'
    };

    addIncome(newIncome);
    setShowModal(false);
    Swal.fire({ title: 'Income Saved', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteIncome(id);
        Swal.fire('Deleted', 'Record removed', 'success');
      }
    });
  };

  // Filter Income
  const displayIncome = income.filter(inc => {
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      inc.client.toLowerCase().includes(searchLower) || 
      inc.project.toLowerCase().includes(searchLower);

    if (viewTab === 'active') {
      return inc.date.startsWith(currentMonthPrefix) && isSearchMatch;
    } else {
      if (selectedArchiveMonth) {
        return inc.date.startsWith(selectedArchiveMonth) && isSearchMatch;
      }
      return false;
    }
  });

  const formatPKR = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Finance Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>💰</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>Financial Search Engine</h2>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>Archiving {income.length} records securely</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>💼</span>
            <input 
              type="text" 
              placeholder="Search Client or Project..." 
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
        >⚡ Current Ledger</button>
        <button 
          onClick={() => setViewTab('archives')}
          style={{ background: viewTab === 'archives' ? 'var(--accent)' : 'transparent', color: viewTab === 'archives' ? '#fff' : 'var(--text2)', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >📁 Financial Archives</button>
      </div>

      {viewTab === 'archives' && !selectedArchiveMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📊 {monthInc.length} INCOME ENTRIES</div>
                  <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 'bold' }}>💰 {formatPKR(total)} TOTAL</div>
                </div>
              </div>
            );
          })}
          {sortedArchiveMonths.length === 0 && (
             <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No previous financial months to archive yet.</div>
          )}
        </div>
      )}

      {(viewTab === 'active' || (viewTab === 'archives' && selectedArchiveMonth)) && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedArchiveMonth ? (
               <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold' }}>← Back to Archives</button>
            ) : <div />}
            {viewTab === 'active' && (
              <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Add Income</button>
            )}
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: '24px 24px 0 0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent)' }}>🧾</span> {viewTab === 'active' ? 'Current Month Income' : `Income Log: ${getMonthName(selectedArchiveMonth!)}`}
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Date (DD/MM/YYYY)</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Client</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Project</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayIncome.map(inc => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)', fontWeight: 'bold' }}>{formatDateShort(inc.date)}</td>
                      <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)' }}>{inc.client}</td>
                      <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text2)' }}>{inc.project}</td>
                      <td style={{ padding: '15px 20px', fontSize: '15px', color: 'var(--green)', fontWeight: 'bold' }}>{formatPKR(inc.amount)}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: inc.status === 'received' ? 'var(--greenbg)' : 'var(--amberbg)', color: inc.status === 'received' ? 'var(--green)' : 'var(--amber)' }}>
                          {inc.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <button onClick={() => handleDelete(inc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--red)' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {displayIncome.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No financial records found in this view.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Income Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text)' }}>Add Income Record</h3>
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
                <button onClick={handleSave} style={{ padding: '12px 35px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

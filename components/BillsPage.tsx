'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Bill } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function BillsPage() {
  const { currentUser, bills, addBill, updateBill, deleteBill } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState<Partial<Bill>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archives'>('active');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Only admin can manage company bills.</p>
      </div>
    );
  }

  // Archive Grouping
  const currentMonthPrefix = getCurrentDate().substring(0, 7);
  const archiveGroups = bills.reduce((groups: Record<string, Bill[]>, bill) => {
    const month = bill.date.substring(0, 7);
    if (month === currentMonthPrefix) return groups;
    if (!groups[month]) groups[month] = [];
    groups[month].push(bill);
    return groups;
  }, {});

  const sortedArchiveMonths = Object.keys(archiveGroups).sort().reverse();

  const handleAdd = () => {
    setEditingBill(null);
    setFormData({
      date: getCurrentDate(),
      dueDate: getCurrentDate(),
      status: 'pending',
      billType: 'Electricity'
    });
    setShowModal(true);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData(bill);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.billType || !formData.amount || !formData.dueDate) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    if (editingBill) {
      updateBill(editingBill.id, formData);
    } else {
      const newBill: Bill = {
        id: `BILL${Date.now()}`,
        date: formData.date || getCurrentDate(),
        billType: formData.billType || 'Other',
        description: formData.description || '',
        amount: Number(formData.amount) || 0,
        dueDate: formData.dueDate || getCurrentDate(),
        status: formData.status || 'pending',
        paidDate: formData.paidDate,
        paidAmount: formData.paidAmount,
        notes: formData.notes
      };
      addBill(newBill);
    }
    setShowModal(false);
    Swal.fire({ title: 'Bill Saved', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  const handleMarkPaid = (bill: Bill) => {
    updateBill(bill.id, {
      status: 'paid',
      paidDate: getCurrentDate(),
      paidAmount: bill.amount
    });
    Swal.fire({ title: 'Paid', icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Bill?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBill(id);
        Swal.fire('Deleted', 'Bill record removed', 'success');
      }
    });
  };

  const displayBills = bills.filter(bill => {
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      bill.billType.toLowerCase().includes(searchLower) || 
      bill.description.toLowerCase().includes(searchLower);

    if (viewTab === 'active') {
      return bill.date.startsWith(currentMonthPrefix) && isSearchMatch;
    } else {
      if (selectedArchiveMonth) {
        return bill.date.startsWith(selectedArchiveMonth) && isSearchMatch;
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

  const currentPaid = displayBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
  const currentPending = displayBills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>📋</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>Utility & Bills Ledger</h2>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>Real-time monitoring of {bills.length} company bills</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search bill type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 15px 12px 35px', color: 'var(--text)', outline: 'none', width: '220px', fontSize: '13px' }}
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
        >📁 Bill Archives</button>
      </div>

      {viewTab === 'archives' && !selectedArchiveMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {sortedArchiveMonths.map(month => {
            const monthBills = archiveGroups[month];
            const total = monthBills.reduce((sum, b) => sum + b.amount, 0);
            
            return (
              <div 
                key={month} 
                onClick={() => setSelectedArchiveMonth(month)}
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '25px', cursor: 'pointer', transition: '0.3s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--blue)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginBottom: '10px' }}>{getMonthName(month)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>📊 {monthBills.length} BILL ENTRIES</div>
                  <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 'bold' }}>📉 {formatPKR(total)} TOTAL</div>
                </div>
              </div>
            );
          })}
          {sortedArchiveMonths.length === 0 && (
             <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No past bills archived yet.</div>
          )}
        </div>
      )}

      {(viewTab === 'active' || selectedArchiveMonth) && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedArchiveMonth ? (
               <button onClick={() => setSelectedArchiveMonth(null)} style={{ background: 'var(--bg3)', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text2)', fontWeight: 'bold' }}>← Back to Archives</button>
            ) : <div />}
            
            <div style={{ display: 'flex', gap: '15px' }}>
               <div style={{ background: 'var(--bg2)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--text3)' }}>PAID: </span><span style={{ color: 'var(--green)' }}>{formatPKR(currentPaid)}</span>
               </div>
               <div style={{ background: 'var(--bg2)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--text3)' }}>PENDING: </span><span style={{ color: 'var(--amber)' }}>{formatPKR(currentPending)}</span>
               </div>
               {viewTab === 'active' && (
                 <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Add Bill</button>
               )}
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Date (DD/MM/YYYY)</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Description</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Amount (PKR)</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayBills.map(bill => (
                  <tr key={bill.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)', fontWeight: 'bold' }}>{formatDateShort(bill.date)}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: 'var(--accentbg)', color: 'var(--accent)', border: '1px solid var(--accent)33' }}>{bill.billType}</span>
                    </td>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: 'var(--text)' }}>{bill.description}</td>
                    <td style={{ padding: '15px 20px', fontSize: '15px', color: '#dc2626', fontWeight: 'bold' }}>{formatPKR(bill.amount)}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', background: bill.status === 'paid' ? 'var(--greenbg)' : 'var(--amberbg)', color: bill.status === 'paid' ? 'var(--green)' : 'var(--amber)' }}>{bill.status}</span>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {bill.status !== 'paid' && <button onClick={() => handleMarkPaid(bill)} style={{ border: 'none', background: 'var(--green)', color: '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>✓ Paid</button>}
                        <button onClick={() => handleEdit(bill)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                        <button onClick={() => handleDelete(bill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--red)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Bill Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: 'var(--text)' }}>{editingBill ? 'Edit Bill Detail' : 'Log New Company Bill'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Bill Type</label>
                  <select value={formData.billType || ''} onChange={(e) => setFormData({ ...formData, billType: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }}>
                    <option value="Electricity">Electricity</option>
                    <option value="Rent">Rent</option>
                    <option value="Internet">Internet</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Software">Software</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Amount (PKR Rs.)</label>
                  <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="Rs. 15,000" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Short Description</label>
                <input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} placeholder="Monthly office rent for..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Bill Date</label>
                  <input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Due Date</label>
                  <input type="date" value={formData.dueDate || ''} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 35px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save Bill</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

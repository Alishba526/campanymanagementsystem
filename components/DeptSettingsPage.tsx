'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function DeptSettingsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const [newName, setNewName] = useState('');

  const handleRename = async (id: string, oldName: string) => {
    const { value: name } = await Swal.fire({
      title: 'Rename Department',
      input: 'text',
      inputValue: oldName,
      showCancelButton: true
    });
    if (name) {
      await updateDepartment(id, name);
      Swal.fire('Updated', 'Department name changed successfully', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "This will remove the department category!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete'
    });
    if (confirm.isConfirmed) {
      await deleteDepartment(id);
      Swal.fire('Deleted', 'Department removed', 'success');
    }
  };

  const handleAdd = async () => {
    if (!newName) return;
    await addDepartment(newName);
    setNewName('');
    Swal.fire('Added', 'New department created', 'success');
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'normal', marginBottom: '20px' }}>Department Settings (Management)</h2>
      
      <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: 'var(--radius2)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="e.g. Ecommerce or Marketing" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}
          />
          <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add Department
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>Department Name</th>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '15px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>{d.name}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleRename(d.id, d.name)} style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text2)', fontSize: '13px' }}>
                      ✏️ Rename
                    </button>
                    <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: '1px solid #ef444444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', fontSize: '13px' }}>
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr><td colSpan={2} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>No departments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function DeptSettingsPage() {
  const { departments, addDepartment, updateDepartment } = useApp();
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

  const handleAdd = async () => {
    if (!newName) return;
    await addDepartment(newName);
    setNewName('');
    Swal.fire('Added', 'New department created', 'success');
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'normal', marginBottom: '20px' }}>Department Settings (Rename Option)</h2>
      
      <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: 'var(--radius2)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="e.g. Dept 1 or Marketing" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)' }}
          />
          <button onClick={handleAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Add Department
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Department Name</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '15px', fontSize: '14px' }}>{d.name}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleRename(d.id, d.name)} style={{ background: 'none', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                    ✏️ Rename
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

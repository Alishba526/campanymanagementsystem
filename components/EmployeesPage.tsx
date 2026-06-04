'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { Employee, User } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';
import * as actions from '@/lib/actions';

export default function EmployeesPage() {
  const { currentUser, users, employees, addEmployee, updateEmployee, deleteEmployee, tasks, fetchData } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  
  const handleManageAccessActual = async (emp: Employee) => {
     const existingUser = users.find((u: any) => 
        u.role === 'employee' ? (u.name === emp.id) : (u.email === emp.email)
     );

     if (existingUser) {
       const result = await Swal.fire({
         title: `Access Control: ${emp.name}`,
         html: `<div style="text-align:left; font-size:14px; background:var(--bg3); padding:15px; border-radius:10px; border:1px solid var(--border)">
                  <div style="margin-bottom:8px"><b>User ID:</b> <span style="color:var(--accent)">${existingUser.email}</span></div>
                  <div style="margin-bottom:8px"><b>Portal Status:</b> <span style="color:var(--green)">Active Access</span></div>
                  <div style="padding-top:10px; border-top:1px solid var(--border); color:var(--accent); font-weight:bold">Current Password: ${existingUser.password}</div>
                </div>`,
         icon: 'info',
         showCancelButton: true,
         showDenyButton: true,
         confirmButtonText: '🔑 Change Password',
         denyButtonText: '🗑️ Revoke Access',
         cancelButtonText: 'Close',
         confirmButtonColor: 'var(--accent)',
         denyButtonColor: 'var(--red)',
       });

       if (result.isConfirmed) {
         const { value: newPassword } = await Swal.fire({
           title: 'Set New Password',
           input: 'text',
           inputPlaceholder: 'Enter new password',
           showCancelButton: true,
           confirmButtonColor: 'var(--accent)',
         });
         
         if (newPassword) {
           await actions.updateUserAction(existingUser.id, { password: newPassword });
           await fetchData(); 
           Swal.fire({ title: 'Updated', text: 'Password changed successfully', icon: 'success', timer: 1000, showConfirmButton: false, toast: true });
         }
       } else if (result.isDenied) {
         const confirm = await Swal.fire({
           title: 'Revoke Access?',
           text: `${emp.name} will no longer be able to log in.`,
           icon: 'warning',
           showCancelButton: true,
           confirmButtonColor: 'var(--red)',
           confirmButtonText: 'Yes, Revoke'
         });
         if (confirm.isConfirmed) {
           await actions.deleteUserAction(existingUser.id);
           await fetchData(); 
           Swal.fire('Revoked', 'Employee access removed.', 'success');
         }
       }
     } else {
       const { value: formValues } = await Swal.fire({
         title: `Grant Portal Access`,
         html: `
           <div style="text-align:left; font-size:14px; margin-bottom:15px">
             <label style="display:block; margin-bottom:5px; font-weight:bold">Employee ID: ${emp.id}</label>
             <label style="display:block; margin-bottom:5px; font-weight:bold">Set Login ID (Username):</label>
             <input id="swal-username" class="swal2-input" style="margin:0; width:100%" value="${emp.name.toLowerCase().replace(/\s/g, '')}" placeholder="Username">
             <label style="display:block; margin-top:15px; margin-bottom:5px; font-weight:bold">Set Password:</label>
             <input id="swal-password" type="text" class="swal2-input" style="margin:0; width:100%" placeholder="Password">
           </div>
         `,
         focusConfirm: false,
         showCancelButton: true,
         confirmButtonText: 'Create Account',
         confirmButtonColor: 'var(--green)',
         preConfirm: () => {
           return [
             (document.getElementById('swal-username') as HTMLInputElement).value,
             (document.getElementById('swal-password') as HTMLInputElement).value
           ]
         }
       });

       if (formValues && formValues[0] && formValues[1]) {
         const [username, password] = formValues;
         if (users.some((u: any) => u.email === username)) {
           Swal.fire('Error', 'Username already taken.', 'error');
           return;
         }
         await actions.addUserAction({
           email: username, 
           password: password,
           name: emp.id, 
           role: 'employee'
         });
         await fetchData();
         Swal.fire('Success', 'Access granted.', 'success');
       }
     }
  };

  const getAvgScore = (empId: string) => {
    const empTasks = tasks.filter(t => t.employeeId === empId);
    if (empTasks.length === 0) return 0;
    return Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length);
  };

  const handleUpdateSalary = async (emp: Employee) => {
    const { value: newSalary } = await Swal.fire({
      title: `Update Salary: ${emp.name}`,
      input: 'number',
      inputValue: emp.salary || 0,
      inputLabel: 'Enter monthly salary (PKR)',
      showCancelButton: true,
      confirmButtonColor: 'var(--accent)',
    });

    if (newSalary !== undefined && newSalary !== null && newSalary !== '') {
      await updateEmployee(emp.id, { salary: parseInt(newSalary) });
      Swal.fire('Updated!', 'Salary has been updated.', 'success');
    }
  };

  const handleAdd = (deptId: string) => {
    setEditingEmployee(null);
    setFormData({
      status: 'active',
      joinDate: getCurrentDate(),
      monthlyHours: 176,
      salary: 0,
      department: deptId
    });
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData(emp);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.id) {
      Swal.fire('Error', 'Name and ID are required!', 'error');
      return;
    }
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
        Swal.fire('Updated', 'Profile updated successfully', 'success');
      } else {
        if (employees.some(e => e.id === formData.id)) {
          Swal.fire('Conflict', 'ID already in use.', 'warning');
          return;
        }
        await addEmployee(formData as Employee);
        Swal.fire('Added', 'Employee registered successfully', 'success');
      }
      await fetchData(); 
      setShowModal(false);
    } catch (e) {
      Swal.fire('Error', 'Failed to save record', 'error');
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete Employee?',
      text: "Permanent action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEmployee(id);
        Swal.fire('Deleted!', 'Record removed.', 'success');
      }
    });
  };

  const departments = [
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'architecture', label: 'Architecture' }
  ];

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    return !searchQuery || 
      emp.name.toLowerCase().includes(searchLower) ||
      emp.id.toLowerCase().includes(searchLower) ||
      emp.cnic?.includes(searchQuery) ||
      emp.fatherName?.toLowerCase().includes(searchLower);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>👥 Employee Search Engine (All Details)</h2>
        <input 
          type="text" 
          placeholder="Search staff, CNIC, Father Name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 15px', color: 'var(--text)', outline: 'none', width: '250px', fontSize: '12px' }}
        />
      </div>

      {departments.map(dept => {
        if (!isAdmin && currentUser.role !== dept.id) return null;
        const deptEmps = filteredEmployees.filter(e => e.department === dept.id);

        return (
          <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow)', marginBottom: '10px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>🏢 {dept.label} Department</h3>
              <button onClick={() => handleAdd(dept.id)} style={{ background: 'var(--accent)', color: '#fff', padding: '6px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ Add Employee</button>
            </div>

            <div style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ width: '60px', padding: '10px', textAlign: 'left', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ width: '180px', padding: '10px', textAlign: 'left', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>Name / Father</th>
                    <th style={{ width: '160px', padding: '10px', textAlign: 'left', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>Identity / Position</th>
                    <th style={{ width: '150px', padding: '10px', textAlign: 'left', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>Contact Info</th>
                    <th style={{ width: '160px', padding: '10px', textAlign: 'left', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>Credentials</th>
                    <th style={{ width: '150px', padding: '10px', textAlign: 'left', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>Salary / Hours</th>
                    <th style={{ width: '120px', padding: '10px', textAlign: 'center', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>Status / Perf</th>
                    <th style={{ width: '140px', padding: '10px', textAlign: 'center', fontSize: '10px', color: '#374151', fontWeight: '900', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptEmps.map(emp => {
                    const user = users.find((u: any) => u.role === 'employee' ? (u.name === emp.id) : (u.email === emp.email));
                    return (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        {/* ID */}
                        <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '2px' }}>SERIAL ID</div>
                           <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent)' }}>{emp.id}</div>
                        </td>

                        {/* Name & Father */}
                        <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '2px' }}>FULL NAME</div>
                           <div style={{ fontSize: '14px', fontWeight: '900', color: '#111827' }}>{emp.name}</div>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginTop: '4px' }}>FATHER NAME (S/O)</div>
                           <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{emp.fatherName || '--'}</div>
                        </td>

                        {/* Identity & Position */}
                        <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '2px' }}>CNIC NUMBER</div>
                           <div style={{ fontSize: '12px', fontWeight: '900', color: '#111827', fontFamily: 'monospace' }}>{emp.cnic || '--'}</div>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginTop: '4px' }}>DESIGNATION</div>
                           <div style={{ fontSize: '11px', fontWeight: '900', color: '#374151', textTransform: 'uppercase' }}>{emp.position}</div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '2px' }}>PHONE</div>
                           <div style={{ fontSize: '12px', fontWeight: '900', color: '#111827' }}>{emp.phone || '--'}</div>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginTop: '4px' }}>RESIDENTIAL ADDRESS</div>
                           <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={emp.address}>{emp.address || '--'}</div>
                        </td>

                        {/* Credentials */}
                        <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '2px' }}>PORTAL LOGIN ID</div>
                           <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent)' }}>{user?.email || '—'}</div>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginTop: '4px' }}>PORTAL PASSWORD</div>
                           <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4338ca' }}>{user?.password || '—'}</div>
                        </td>

                        {/* Salary & Hours */}
                        <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '2px' }}>MONTHLY SALARY</div>
                           <div style={{ fontSize: '14px', fontWeight: '900', color: '#059669' }}>Rs. {(emp.salary || 0).toLocaleString()}</div>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginTop: '4px' }}>MONTHLY TARGET</div>
                           <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151' }}>{emp.monthlyHours} HRS / MO</div>
                        </td>

                        {/* Status & Perf */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}>CURRENT STATUS</div>
                           <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: emp.status === 'active' ? '#ecfdf5' : '#fef2f2', color: emp.status === 'active' ? '#059669' : '#dc2626', fontWeight: '900', textTransform: 'uppercase' }}>{emp.status}</span>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginTop: '6px' }}>PERFORMANCE</div>
                           <div style={{ fontSize: '12px', fontWeight: '900', color: '#111827' }}>{getAvgScore(emp.id)}% SCORE</div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', verticalAlign: 'top' }}>
                           <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold', marginBottom: '10px' }}>CONTROL PANEL</div>
                           <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button onClick={() => handleEdit(emp)} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Edit">✏️</button>
                              <button onClick={() => handleManageAccessActual(emp)} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Key">🔑</button>
                              <button onClick={() => handleUpdateSalary(emp)} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} title="Salary">💰</button>
                              <button onClick={() => handleDelete(emp.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: 'var(--red)' }} title="Delete">🗑️</button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>{editingEmployee ? 'Update Profile' : `Add New Employee`}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <input type="text" value={formData.fatherName || ''} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} placeholder="Father Name" style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <input type="text" value={formData.cnic || ''} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} placeholder="CNIC" style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <input type="text" value={formData.id || ''} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!editingEmployee} placeholder="Employee ID" style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                <option value="ecommerce">E-Commerce</option>
                <option value="marketing">Marketing</option>
                <option value="architecture">Architecture</option>
              </select>
              <input type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Position" style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <input type="number" value={formData.monthlyHours || 176} onChange={(e) => setFormData({ ...formData, monthlyHours: Number(e.target.value) })} placeholder="Monthly Hours" style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <input type="date" value={formData.joinDate || ''} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              <div style={{ gridColumn: 'span 2' }}>
                <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address" style={{ width: '100%', padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '8px 30px', borderRadius: '6px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 'bold' }}>Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

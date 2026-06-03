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
     // Find user linked to this specific Employee ID (we store it in User.name for 'employee' role)
     const existingUser = users.find((u: any) => 
        u.role === 'employee' ? (u.name === emp.id) : (u.email === emp.email)
     );

     if (existingUser) {
       const result = await Swal.fire({
         title: `Access Control: ${emp.name}`,
         html: `<div style="text-align:left; font-size:14px; background:var(--bg3); padding:15px; border-radius:10px; border:1px solid var(--border)">
                  <div style="margin-bottom:8px"><b>User ID (Login):</b> <span style="color:var(--accent)">${existingUser.email}</span></div>
                  <div style="margin-bottom:8px"><b>Linked Emp ID:</b> <span style="color:var(--text2)">${emp.id}</span></div>
                  <div style="margin-bottom:8px"><b>Status:</b> <span style="color:var(--green)">Active Portal Access</span></div>
                  <div style="padding-top:10px; border-top:1px solid var(--border); color:var(--accent); font-weight:bold">Password: ${existingUser.password}</div>
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
           text: `${emp.name} will no longer be able to log in to their portal.`,
           icon: 'warning',
           showCancelButton: true,
           confirmButtonColor: 'var(--red)',
           confirmButtonText: 'Yes, Revoke'
         });
         if (confirm.isConfirmed) {
           await actions.deleteUserAction(existingUser.id);
           await fetchData(); 
           Swal.fire('Revoked', 'Employee access has been removed.', 'success');
         }
       }
     } else {
       const { value: formValues } = await Swal.fire({
         title: `Grant Portal Access`,
         html: `
           <div style="text-align:left; font-size:14px; margin-bottom:15px">
             <label style="display:block; margin-bottom:5px; font-weight:bold">Employee:</label>
             <div style="padding:10px; background:var(--bg3); border-radius:8px; margin-bottom:15px">${emp.name} (${emp.id})</div>
             
             <label style="display:block; margin-bottom:5px; font-weight:bold">Set Login ID (Username):</label>
             <input id="swal-username" class="swal2-input" style="margin:0; width:100%" value="${emp.name.toLowerCase().replace(/\s/g, '')}" placeholder="e.g. jibran">
             
             <label style="display:block; margin-top:15px; margin-bottom:5px; font-weight:bold">Set Password:</label>
             <input id="swal-password" type="text" class="swal2-input" style="margin:0; width:100%" placeholder="e.g. Pass123">
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
           Swal.fire('Error', 'This Login ID is already taken.', 'error');
           return;
         }
         await actions.addUserAction({
           email: username, 
           password: password,
           name: emp.id, 
           role: 'employee'
         });
         await fetchData();
         Swal.fire('Success', 'Portal access granted.', 'success');
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
      Swal.fire('Error', 'Name and Employee ID are required!', 'error');
      return;
    }

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
        Swal.fire('Updated', 'Profile updated successfully', 'success');
      } else {
        if (employees.some(e => e.id === formData.id)) {
          Swal.fire('Conflict', `ID "${formData.id}" is already in use.`, 'warning');
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
      text: "This record will be permanently removed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEmployee(id);
        Swal.fire('Deleted!', 'Record removed.', 'success');
      }
    });
  };

  const departments = [
    { id: 'ecommerce', label: 'E-Commerce', tagline: 'Digital storefront & online operations' },
    { id: 'marketing', label: 'Marketing', tagline: 'Brand awareness & lead generation' },
    { id: 'architecture', label: 'Architecture', tagline: 'System design & infrastructure' }
  ];

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || 
      emp.name.toLowerCase().includes(searchLower) ||
      emp.id.toLowerCase().includes(searchLower);
    if (searchQuery) return isSearchMatch;
    const isDateMatch = !filterDate || emp.joinDate === filterDate;
    return isSearchMatch && isDateMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>👥</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Employee Search Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Live Tracking: {filteredEmployees.length} profiles listed</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search staff..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', color: 'var(--text)', outline: 'none', width: '180px', fontSize: '12px' }}
          />
        </div>
      </div>

      {departments.map(dept => {
        if (!isAdmin && currentUser.role !== dept.id) return null;
        const deptEmps = filteredEmployees.filter(e => e.department === dept.id);

        return (
          <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)', marginBottom: '10px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>🏢 {dept.label} Department</h3>
              <button onClick={() => handleAdd(dept.id)} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ Add Employee</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Phone</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Portal ID</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Salary</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Perf.</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptEmps.map(emp => {
                    const user = users.find((u: any) => u.role === 'employee' ? (u.name === emp.id) : (u.email === emp.email));
                    return (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '10px', fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)' }}>{emp.id}</td>
                        <td style={{ padding: '10px', fontSize: '13px', fontWeight: '800' }}>{emp.name}</td>
                        <td style={{ padding: '10px', fontSize: '12px', fontWeight: '600' }}>{emp.phone || '--'}</td>
                        <td style={{ padding: '10px', fontSize: '12px', color: 'var(--accent)', fontWeight: '900' }}>{user?.email || '—'}</td>
                        <td style={{ padding: '10px', fontSize: '12px' }}>Rs. {(emp.salary || 0).toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '6px', background: emp.status === 'active' ? '#ecfdf5' : '#fef2f2', color: emp.status === 'active' ? '#059669' : '#dc2626', fontWeight: '900', textTransform: 'uppercase' }}>{emp.status}</span>
                        </td>
                        <td style={{ padding: '10px', fontSize: '11px', fontWeight: '900', color: '#059669' }}>{getAvgScore(emp.id)}%</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                             <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                             <button onClick={() => handleManageAccessActual(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🔑</button>
                             <button onClick={() => handleUpdateSalary(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>💰</button>
                             <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--red)' }}>🗑️</button>
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
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', maxWidth: '550px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{editingEmployee ? '📝' : '👤'}</span>
                {editingEmployee ? 'Update Profile' : `Add New Employee`}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
            </div>
            
            <div style={{ padding: '25px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Full Name</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }} placeholder="Full Name" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Father Name</label>
                  <input type="text" value={formData.fatherName || ''} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }} placeholder="Father's Name" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Employee ID</label>
                  <input type="text" value={formData.id || ''} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!editingEmployee} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none', opacity: editingEmployee ? 0.7 : 1 }} placeholder="EMP-001" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Phone</label>
                  <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }} placeholder="03xx-xxxxxxx" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Department</label>
                  <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }}>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="marketing">Marketing</option>
                    <option value="architecture">Architecture</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Position</label>
                  <input type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Designer" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Joining Date</label>
                  <input type="date" value={formData.joinDate || ''} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Status</label>
                  <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Address</label>
                <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', outline: 'none' }} placeholder="Residential Address" />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 25px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '10px 40px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

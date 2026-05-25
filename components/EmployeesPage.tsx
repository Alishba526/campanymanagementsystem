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
     // Find user by either email or a specific format like "EMP_ID"
     const existingUser = users.find((u: any) => u.email === emp.id || u.email === emp.email);

     // Restriction: Managers' credentials only manageable by Admin
     if (existingUser && existingUser.role !== 'employee' && !isAdmin) {
        Swal.fire('Restricted', 'Manager credentials can only be updated by the System Admin.', 'warning');
        return;
     }

     if (existingUser) {
       const result = await Swal.fire({
         title: `Access Control: ${emp.name}`,
         html: `<div style="text-align:left; font-size:14px; background:var(--bg3); padding:15px; border-radius:10px; border:1px solid var(--border)">
                  <div style="margin-bottom:8px"><b>User ID:</b> <span style="color:var(--accent)">${existingUser.email}</span></div>
                  <div style="margin-bottom:8px"><b>Status:</b> <span style="color:var(--green)">Active Portal Access</span></div>
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
           // Validation: Unique Password check for update
           if (users.some((u: any) => u.id !== existingUser.id && u.password === newPassword)) {
             Swal.fire('Error', 'This password is already in use by another user.', 'error');
             return;
           }

           await actions.updateUserAction(existingUser.id, { password: newPassword });
           fetchData(); // Sync in background
           Swal.fire({ title: 'Updated', text: 'Password changed successfully', icon: 'success', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
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
           fetchData(); // Force refresh in background
           Swal.fire({ title: 'Revoked', text: 'Employee access has been removed.', icon: 'success', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
         }
       }
     } else {
       const { value: formValues } = await Swal.fire({
         title: `Grant Portal Access`,
         html: `
           <div style="text-align:left; font-size:14px; margin-bottom:15px">
             <label style="display:block; margin-bottom:5px; font-weight:bold">Employee:</label>
             <div style="padding:10px; background:var(--bg3); border-radius:8px; margin-bottom:15px">${emp.name} (${emp.id})</div>
             
             <label style="display:block; margin-bottom:5px; font-weight:bold">Set User ID (Username):</label>
             <input id="swal-username" class="swal2-input" style="margin:0; width:100%" value="${emp.id}" placeholder="e.g. user123">
             
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
         
         // Validation: Unique User ID
         if (users.some((u: any) => u.email === username)) {
           Swal.fire('Error', 'This User ID is already taken. Please use a unique ID.', 'error');
           return;
         }

         // Validation: Unique Password (per user request)
         if (users.some((u: any) => u.password === password)) {
           Swal.fire('Error', 'This password is already in use by another user. Please choose a unique password.', 'error');
           return;
         }

         await actions.addUserAction({
           email: username, 
           password: password,
           name: emp.name,
           role: 'employee'
         });
         
         Swal.fire({
           title: 'Access Granted!',
           html: `Employee can now login using:<br><b>ID:</b> ${username}<br><b>Pass:</b> ${password}`,
           icon: 'success'
         });

         fetchData(); // Sync in background
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
      department: deptId,
      // @ts-ignore
      portalUsername: '',
      // @ts-ignore
      portalPassword: ''
    });
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    const user = users.find(u => u.email === emp.id || u.email === emp.email);
    setEditingEmployee(emp);
    setFormData({
      ...emp,
      // @ts-ignore
      portalUsername: user?.email || '',
      // @ts-ignore
      portalPassword: user?.password || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.id) {
      Swal.fire('Error', 'Name and Employee ID are required!', 'error');
      return;
    }
    if (!editingEmployee && employees.some(e => e.id === formData.id)) {
      Swal.fire('Conflict', `ID "${formData.id}" is already in use.`, 'warning');
      return;
    }

    // @ts-ignore
    const { portalUsername, portalPassword, ...empData } = formData;
    
    // SECURITY: If not admin, ensure salary cannot be modified via this form
    if (!isAdmin) {
       delete empData.salary;
    }

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, empData);
        
        // Handle User Credential Update if provided
        if (portalUsername && portalPassword) {
          const existingUser = users.find(u => u.email === (editingEmployee.id || editingEmployee.email) || u.email === portalUsername);
          
          if (existingUser) {
             // Restriction: Managers' credentials only manageable by Admin
             if (existingUser.role !== 'employee' && !isAdmin) {
                // Skip user update but save employee data
             } else {
                // Validation: Unique Password check for update (excluding self)
                if (users.some((u: any) => u.id !== existingUser.id && u.password === portalPassword)) {
                  Swal.fire('Error', 'This password is already in use by another user.', 'error');
                  return;
                }
                await actions.updateUserAction(existingUser.id, { email: portalUsername, password: portalPassword });
             }
          } else {
             // Create new user if didn't exist
             if (users.some((u: any) => u.email === portalUsername)) {
                Swal.fire('Error', 'This User ID is already taken.', 'error');
                return;
             }
             if (users.some((u: any) => u.password === portalPassword)) {
                Swal.fire('Error', 'This password is already in use.', 'error');
                return;
             }
             await actions.addUserAction({ email: portalUsername, password: portalPassword, name: formData.name!, role: 'employee' });
          }
        }
        Swal.fire('Updated', 'Profile updated successfully', 'success');
      } else {
        await addEmployee(empData as Employee);
        
        // Handle User Credential Creation if provided
        if (portalUsername && portalPassword) {
           if (users.some((u: any) => u.email === portalUsername)) {
              Swal.fire('Error', 'User ID taken, but employee registered. Set credentials via Key icon.', 'warning');
           } else if (users.some((u: any) => u.password === portalPassword)) {
              Swal.fire('Error', 'Password taken, but employee registered. Set credentials via Key icon.', 'warning');
           } else {
              await actions.addUserAction({ email: portalUsername, password: portalPassword, name: formData.name!, role: 'employee' });
           }
        }
        Swal.fire('Added', 'Employee registered successfully', 'success');
      }
      await fetchData(); // Refresh global state
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
      emp.id.toLowerCase().includes(searchLower) ||
      emp.position?.toLowerCase().includes(searchLower);
      
    // If searching, do a Universal Search (ignore date)
    if (searchQuery) return isSearchMatch;

    const isDateMatch = !filterDate || emp.joinDate === filterDate;
    return isSearchMatch && isDateMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search Engine Header (Standardized) */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>👥</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Employee Search Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Live Tracking: {filteredEmployees.length} profiles listed</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px 8px 30px', color: 'var(--text)', outline: 'none', width: '180px', fontSize: '12px' }}
            />
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }} />
        </div>
      </div>

      {/* 3 Department Portions */}
      {departments.map(dept => {
        if (!isAdmin && currentUser.role !== dept.id) return null;
        const deptEmps = filteredEmployees.filter(e => e.department === dept.id);

        return (
          <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)', marginBottom: '10px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>🏢</span> {dept.label} Department
                </h3>
              </div>
              {(isAdmin || currentUser.role === dept.id) && (
                <button onClick={() => handleAdd(dept.id)} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+ Add Employee</button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>ID</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Father</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Phone</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Position</th>
                    {isAdmin && (
                      <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Portal ID</th>
                    )}
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Address</th>
                    {isAdmin && <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Salary</th>}
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Join Date</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Perf.</th>
                    <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptEmps.map(emp => {
                    const user = users.find(u => u.email === emp.id || u.email === emp.email);
                    return (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{emp.id}</td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#4338ca', background: 'var(--accentbg)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{emp.name}</div>
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text)', fontWeight: '700', whiteSpace: 'nowrap' }}>{emp.fatherName || '--'}</td>
                        <td style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text)', fontWeight: '700', whiteSpace: 'nowrap' }}>{emp.phone || '--'}</td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <div style={{ 
                            fontSize: '10px', 
                            fontWeight: '900', 
                            color: emp.position?.toLowerCase().includes('senior') ? '#059669' : '#2563eb', 
                            background: emp.position?.toLowerCase().includes('senior') ? '#ecfdf5' : '#eff6ff', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            display: 'inline-block',
                            border: `1px solid ${emp.position?.toLowerCase().includes('senior') ? '#10b981' : '#3b82f6'}44`
                          }}>{emp.position}</div>
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{user?.email || '—'}</td>
                        )}
                        <td style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text2)', fontWeight: '600', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={emp.address}>{emp.address || '--'}</td>
                        {isAdmin && <td style={{ padding: '8px 10px', fontSize: '11px', color: '#059669', fontWeight: '900', whiteSpace: 'nowrap' }}>Rs. {(emp.salary || 0).toLocaleString()}</td>}
                        <td style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text)', fontWeight: '700', whiteSpace: 'nowrap' }}>{formatDateShort(emp.joinDate)}</td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '6px', background: emp.status === 'active' ? '#ecfdf5' : '#fef2f2', color: emp.status === 'active' ? '#059669' : '#dc2626', fontWeight: '900', textTransform: 'uppercase', border: `1px solid ${emp.status === 'active' ? '#10b981' : '#ef4444'}44` }}>{emp.status}</span>
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '11px', fontWeight: '900', color: getAvgScore(emp.id) >= 80 ? '#059669' : getAvgScore(emp.id) >= 50 ? '#d97706' : '#dc2626' }}>{getAvgScore(emp.id)}%</div>
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                             <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
                             {(isAdmin || (currentUser.role === emp.department)) && (
                                <button onClick={() => handleManageAccessActual(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🔑</button>
                             )}
                             {isAdmin && <button onClick={() => handleUpdateSalary(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>💰</button>}
                             {(isAdmin || (currentUser.role === emp.department)) && <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--red)' }}>🗑️</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {deptEmps.length === 0 && (
                    <tr><td colSpan={12} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>No employees found in this view.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Modal Overlay */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '24px', width: '100%', maxWidth: '550px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{editingEmployee ? '📝' : '👤'}</span>
                {editingEmployee ? 'Update Profile' : `Add New Employee`}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
            </div>
            
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Full Name</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Ali Ahmed" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Father Name</label>
                  <input type="text" value={formData.fatherName || ''} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="Father's Name" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Employee ID / Serial</label>
                  <input type="text" value={formData.id || ''} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!editingEmployee} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none', opacity: editingEmployee ? 0.7 : 1 }} placeholder="EMP-001" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Phone Number</label>
                  <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="03xx-xxxxxxx" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Department</label>
                  <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="marketing">Marketing</option>
                    <option value="architecture">Architecture</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Position / Designation</label>
                  <input type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="e.g. Senior Developer" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Joining Date</label>
                  <input type="date" value={formData.joinDate || ''} onChange={(e) => setFilterDate(e.target.value)} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Current Status</label>
                  <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Residential Address</label>
                <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} placeholder="Complete Address" />
              </div>

              {/* Portal Access Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px', marginBottom: '25px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span>🔐</span> Portal Access Control
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Portal User ID (Username)</label>
                    <input 
                      type="text" 
                      // @ts-ignore
                      value={formData.portalUsername || ''} 
                      // @ts-ignore
                      onChange={(e) => setFormData({ ...formData, portalUsername: e.target.value })} 
                      // Disable if editing a manager and current user is not admin
                      disabled={!!(editingEmployee && users.find(u => (u.email === editingEmployee?.id || u.email === editingEmployee?.email) && u.role !== 'employee') && !isAdmin)}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none', opacity: (editingEmployee && users.find(u => (u.email === editingEmployee?.id || u.email === editingEmployee?.email) && u.role !== 'employee') && !isAdmin) ? 0.7 : 1 }} 
                      placeholder="e.g. EMP-001" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px', display: 'block' }}>Portal Password</label>
                    <input 
                      type="text" 
                      // @ts-ignore
                      value={formData.portalPassword || ''} 
                      // @ts-ignore
                      onChange={(e) => setFormData({ ...formData, portalPassword: e.target.value })} 
                      // Disable if editing a manager and current user is not admin
                      disabled={!!(editingEmployee && users.find(u => (u.email === editingEmployee?.id || u.email === editingEmployee?.email) && u.role !== 'employee') && !isAdmin)}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none', opacity: (editingEmployee && users.find(u => (u.email === editingEmployee?.id || u.email === editingEmployee?.email) && u.role !== 'employee') && !isAdmin) ? 0.7 : 1 }} 
                      placeholder="Enter unique password" 
                    />
                  </div>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '10px' }}>* Leave blank if you don't want to grant portal access yet.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 25px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', color: 'var(--text)', fontWeight: 'bold', fontSize: '14px' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 40px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(var(--accent-rgb), 0.3)' }}>{editingEmployee ? 'Update' : 'Register'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

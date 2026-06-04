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
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>(''); // For specific calendar lookup

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  
  const handleManageAccessActual = async (emp: Employee) => {
     const existingUser = users.find((u: any) => 
        u.role === 'employee' ? (u.name === emp.id) : (u.email === emp.email)
     );

     if (existingUser) {
       const result = await Swal.fire({
         title: `Access Control: ${emp.name}`,
         html: `<div style="text-align:left; font-size:14px; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0">
                  <div style="margin-bottom:8px; color:#1e293b"><b>Username:</b> <span style="color:var(--accent)">${existingUser.email}</span></div>
                  <div style="margin-bottom:8px; color:#1e293b"><b>Password:</b> <span style="color:#4f46e5; font-weight:900">${existingUser.password}</span></div>
                </div>`,
         icon: 'info',
         showCancelButton: true,
         showDenyButton: true,
         confirmButtonText: '🔑 Change Password',
         denyButtonText: '🗑️ Revoke Access',
         cancelButtonText: 'Close',
         confirmButtonColor: 'var(--accent)',
         denyButtonColor: '#ef4444',
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
           confirmButtonColor: '#ef4444',
           confirmButtonText: 'Yes, Revoke'
         });
         if (confirm.isConfirmed) {
           await actions.deleteUserAction(existingUser.id);
           await fetchData(); 
           Swal.fire('Revoked', 'Access removed.', 'success');
         }
       }
     } else {
       const { value: formValues } = await Swal.fire({
         title: `Grant Portal Access`,
         html: `
           <div style="text-align:left; font-size:14px; margin-bottom:15px">
             <label style="display:block; margin-bottom:5px; font-weight:bold; color:#1e293b">Setting Access for ID: ${emp.id}</label>
             <input id="swal-username" class="swal2-input" style="margin:0; width:100%" value="${emp.name.toLowerCase().replace(/\s/g, '')}" placeholder="Username">
             <input id="swal-password" type="text" class="swal2-input" style="margin-top:10px; width:100%" placeholder="Set Password">
           </div>
         `,
         focusConfirm: false,
         showCancelButton: true,
         confirmButtonText: 'Create Account',
         confirmButtonColor: '#10b981',
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
      confirmButtonColor: '#ef4444',
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

  const years = ['all'];
  const startYear = 2010;
  const currentYear = new Date().getFullYear();
  for(let y = currentYear; y >= startYear; y--) years.push(y.toString());

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      emp.name.toLowerCase().includes(searchLower) ||
      emp.id.toLowerCase().includes(searchLower) ||
      emp.cnic?.includes(searchQuery) ||
      emp.fatherName?.toLowerCase().includes(searchLower);
    
    const matchesYear = selectedYear === 'all' || (emp.joinDate && emp.joinDate.startsWith(selectedYear));
    const matchesDate = !filterDate || emp.joinDate === filterDate;
    
    return matchesSearch && matchesYear && matchesDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Premium Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
           <div style={{fontSize:'28px'}}>📑</div>
           <div>
             <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Employee Master Ledger</h2>
             <div style={{fontSize:'10px', color:'#1e40af', fontWeight:'900'}}>DATABASE TRACKING: {employees.length} PERSONNEL REGISTERED</div>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Calendar Picker (Like Attendance) */}
          <div style={{background:'#f1f5f9', padding:'4px 10px', borderRadius:'10px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'8px'}}>
             <span style={{fontSize:'10px', fontWeight:'900', color:'#1e293b'}}>CALENDAR SEARCH:</span>
             <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#1e40af', fontWeight: '900', fontSize: '12px', outline: 'none', cursor:'pointer' }}
             />
             {filterDate && <button onClick={() => setFilterDate('')} style={{background:'none', border:'none', color:'#ef4444', fontWeight:'900', cursor:'pointer', fontSize:'12px'}}>✕</button>}
          </div>
        </div>
      </div>

      {departments.map(dept => {
        // 🔒 SECURITY: Manager only sees their own department. Admin sees all.
        const isAuthorized = isAdmin || currentUser.role === dept.id;
        if (!isAuthorized) return null;
        
        const deptEmps = filteredEmployees.filter(e => e.department === dept.id);

        return (
          <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)', marginBottom: '10px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <div style={{width:'8px', height:'24px', background: dept.id === 'ecommerce' ? '#6366f1' : dept.id === 'marketing' ? '#ec4899' : '#10b981', borderRadius:'4px'}}></div>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#111827' }}>{dept.label} Operations</h3>
              </div>
              <button onClick={() => handleAdd(dept.id)} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', boxShadow:'0 4px 10px rgba(var(--accent-rgb), 0.3)' }}>+ Enroll New Staff</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {deptEmps.map(emp => {
                const user = users.find((u: any) => u.role === 'employee' ? (u.name === emp.id) : (u.email === emp.email));
                return (
                  <div key={emp.id} style={{ 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    padding: '4px 15px', 
                    display: 'grid', 
                    gridTemplateColumns: '70px 1.4fr 1.1fr 1.1fr 1.3fr 1.3fr 1.1fr 0.9fr 130px',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                    transition: '0.1s'
                  }}>
                    {/* 1. ID Block */}
                    <div style={{textAlign:'center'}}>
                      <div style={{ fontSize: '7px', color: '#1e293b', fontWeight: '900', textTransform: 'uppercase' }}>ID</div>
                      <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent)' }}>{emp.id}</div>
                    </div>

                    {/* 2. Full Profile */}
                    <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '3px 10px', border: '1px solid #dbeafe' }}>
                       <div style={{ fontSize: '7px', color: '#1e40af', fontWeight: '900', textTransform: 'uppercase' }}>Employee / S/O</div>
                       <div style={{ fontSize: '12px', fontWeight: '900', color: '#1e40af', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{emp.name}</div>
                       <div style={{ fontSize: '10px', fontWeight: '900', color: '#3b82f6', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{emp.fatherName || '--'}</div>
                    </div>

                    {/* 3. Identity & Role */}
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '3px 10px', border: '1px solid #e2e8f0' }}>
                       <div style={{ fontSize: '7px', color: '#0f172a', fontWeight: '900', textTransform: 'uppercase' }}>CNIC / Post</div>
                       <div style={{ fontSize: '11px', fontWeight: '900', color: '#000', fontFamily: 'monospace' }}>{emp.cnic || '--'}</div>
                       <div style={{ fontSize: '10px', fontWeight: '900', color: '#334155', textTransform: 'uppercase', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{emp.position}</div>
                    </div>

                    {/* 4. Timeline */}
                    <div style={{ background: '#f5f3ff', borderRadius: '8px', padding: '3px 10px', border: '1px solid #ddd6fe' }}>
                       <div style={{ fontSize: '7px', color: '#4338ca', fontWeight: '900', textTransform: 'uppercase' }}>Join Date</div>
                       <div style={{ fontSize: '11px', fontWeight: '900', color: '#4338ca' }}>{formatDateShort(emp.joinDate)}</div>
                    </div>

                    {/* 5. Contact Details */}
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '3px 10px', border: '1px solid #f1f5f9' }}>
                       <div style={{ fontSize: '7px', color: '#000', fontWeight: '900', textTransform: 'uppercase' }}>Contact / Address</div>
                       <div style={{ fontSize: '11px', fontWeight: '900', color: '#000' }}>{emp.phone || '--'}</div>
                       <div style={{ fontSize: '9px', fontWeight: '900', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.address || '--'}</div>
                    </div>

                    {/* 6. Credentials */}
                    <div style={{ background: '#faf5ff', borderRadius: '8px', padding: '3px 10px', border: '1px solid #f3e8ff' }}>
                       <div style={{ fontSize: '7px', color: '#7c3aed', fontWeight: '900', textTransform: 'uppercase' }}>User / Pass</div>
                       <div style={{ fontSize: '10px', fontWeight: '900', color: '#4338ca' }}>U: {user?.email || '—'}</div>
                       <div style={{ fontSize: '10px', fontWeight: '900', color: '#9333ea' }}>P: {user?.password || '—'}</div>
                    </div>

                    {/* 7. Financials */}
                    <div style={{ background: '#ecfdf5', borderRadius: '8px', padding: '3px 10px', border: '1px solid #d1fae5' }}>
                       <div style={{ fontSize: '7px', color: '#059669', fontWeight: '900', textTransform: 'uppercase' }}>Salary / Target</div>
                       <div style={{ fontSize: '12px', fontWeight: '900', color: '#059669' }}>Rs. {(emp.salary || 0).toLocaleString()}</div>
                       <div style={{ fontSize: '9px', fontWeight: '900', color: '#10b981' }}>{emp.monthlyHours}H/MO</div>
                    </div>

                    {/* 8. Status */}
                    <div style={{textAlign:'center'}}>
                       <div style={{ fontSize: '7px', color: '#1e293b', fontWeight: '900', textTransform: 'uppercase' }}>Status / Perf</div>
                       <span style={{ fontSize: '8px', fontWeight: '900', padding: '0px 6px', borderRadius: '3px', background: emp.status === 'active' ? '#059669' : '#ef4444', color: '#fff', textTransform: 'uppercase' }}>{emp.status}</span>
                       <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b' }}>{getAvgScore(emp.id)}%</div>
                    </div>

                    {/* 9. Operations */}
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                       <button onClick={() => handleEdit(emp)} style={{ width: '26px', height: '26px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:'12px' }} title="Edit">✏️</button>
                       <button onClick={() => handleManageAccessActual(emp)} style={{ width: '26px', height: '26px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:'12px' }} title="Access">🔑</button>
                       <button onClick={() => handleUpdateSalary(emp)} style={{ width: '26px', height: '26px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:'12px' }} title="Salary">💰</button>
                       <button onClick={() => handleDelete(emp.id)} style={{ width: '26px', height: '26px', background: '#fff', border: '1px solid #fee2e2', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:'12px', color: '#ef4444' }} title="Delete">🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
              {deptEmps.length === 0 && (
                <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: '#0f172a', fontWeight:'900', border: '1px dashed #e2e8f0' }}>No personnel records found for the selected unit/year/date.</div>
              )}
          </div>
        );
      })}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', width: '100%', maxWidth: '650px', padding: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '25px', color: '#0f172a' }}>{editingEmployee ? '📝 Update Staff Profile' : `👤 Enroll New Staff`}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              <input type="text" value={formData.fatherName || ''} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} placeholder="Father Name" style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              <input type="text" value={formData.cnic || ''} onChange={(e) => setFormData({ ...formData, cnic: e.target.value })} placeholder="CNIC Number" style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone Number" style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              <input type="text" value={formData.id || ''} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!editingEmployee} placeholder="Employee ID" style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900', opacity: editingEmployee ? 0.6 : 1 }} />
              <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }}>
                <option value="ecommerce">E-Commerce</option>
                <option value="marketing">Marketing</option>
                <option value="architecture">Architecture</option>
              </select>
              <input type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Position / Designation" style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              <input type="number" value={formData.monthlyHours || 176} onChange={(e) => setFormData({ ...formData, monthlyHours: Number(e.target.value) })} placeholder="Monthly Hours" style={{ padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              <input type="date" value={formData.joinDate || ''} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              <div style={{ gridColumn: 'span 2' }}>
                <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Residential Address" style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', outline: 'none', fontWeight:'900' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '25px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '12px 30px', borderRadius: '15px', border: '1px solid #e2e8f0', background: 'transparent', color: '#1e293b', cursor: 'pointer', fontWeight: 'bold' }}>Discard</button>
              <button onClick={handleSave} style={{ padding: '12px 50px', borderRadius: '15px', background: '#1e293b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>Finalize Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

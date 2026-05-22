'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Employee } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function EmployeesPage() {
  const { currentUser, employees, addEmployee, updateEmployee, deleteEmployee, tasks } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  
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

  const handleSave = () => {
    if (!formData.name || !formData.id) {
      Swal.fire('Error', 'Name and Employee ID are required!', 'error');
      return;
    }
    if (!editingEmployee && employees.some(e => e.id === formData.id)) {
      Swal.fire('Conflict', `ID "${formData.id}" is already in use.`, 'warning');
      return;
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
      Swal.fire('Updated', 'Profile updated successfully', 'success');
    } else {
      addEmployee(formData as Employee);
      Swal.fire('Added', 'Employee registered successfully', 'success');
    }
    setShowModal(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Header Bar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>👥</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>Employee Management</h2>
            <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{employees.length} total employees registered</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>🔍</span>
             <input type="text" placeholder="Search employees..." style={{ padding: '10px 15px 10px 35px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', width: '250px', fontSize: '13px' }} />
           </div>
        </div>
      </div>

      {/* 3 Department Portions */}
      {departments.map(dept => {
        // Isolation: Non-admins only see their own department portion
        if (!isAdmin && currentUser.role !== dept.id) return null;

        const deptEmps = employees.filter(e => e.department === dept.id);

        return (
          <div key={dept.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '25px', boxShadow: 'var(--shadow)' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>🏢</span> {dept.label} Department
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '2px' }}>{dept.tagline}</div>
              </div>
              {(isAdmin || currentUser.role === dept.id) && (
                <button onClick={() => handleAdd(dept.id)} style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>+ Add Employee</button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Father Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</th>
                    {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary</th>}
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Join Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Perf.</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptEmps.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)' }}>{emp.id}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#4338ca', background: 'var(--accentbg)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>{emp.name}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: '800' }}>{emp.fatherName || '--'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: '800' }}>{emp.phone || '--'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: '900', 
                          color: emp.position?.toLowerCase().includes('senior') ? '#059669' : '#2563eb', 
                          background: emp.position?.toLowerCase().includes('senior') ? '#ecfdf5' : '#eff6ff', 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          display: 'inline-block',
                          border: `1px solid ${emp.position?.toLowerCase().includes('senior') ? '#10b981' : '#3b82f6'}44`
                        }}>{emp.position}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text2)', fontWeight: '700', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={emp.address}>{emp.address || '--'}</td>
                      {isAdmin && <td style={{ padding: '14px 16px', fontSize: '13px', color: '#059669', fontWeight: '900', background: '#ecfdf5', borderRadius: '8px', textAlign: 'center', border: '1px solid #10b98133' }}>Rs. {(emp.salary || 0).toLocaleString()}</td>}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: '800' }}>{formatDateShort(emp.joinDate)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '10px', background: emp.status === 'active' ? '#ecfdf5' : '#fef2f2', color: emp.status === 'active' ? '#059669' : '#dc2626', fontWeight: '900', textTransform: 'uppercase', border: `2px solid ${emp.status === 'active' ? '#10b981' : '#ef4444'}44` }}>{emp.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: getAvgScore(emp.id) >= 80 ? '#059669' : getAvgScore(emp.id) >= 50 ? '#d97706' : '#dc2626' }}>{getAvgScore(emp.id)}%</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text2)' }} title="Edit">✏️</button>
                           {isAdmin && <button onClick={() => handleUpdateSalary(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--green)' }} title="Salary">💰</button>}
                           {isAdmin && <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--red)' }} title="Delete">🗑️</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {deptEmps.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No employees in this department.</td>
                    </tr>
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
                  <input type="date" value={formData.joinDate || ''} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', outline: 'none' }} />
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

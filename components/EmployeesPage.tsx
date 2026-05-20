'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Employee } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function EmployeesPage() {
  const { currentUser, employees, addEmployee, updateEmployee, deleteEmployee, tasks, departments } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  // Filter employees by department for managers
  let departmentEmployees = isAdmin
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  // Apply search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    departmentEmployees = departmentEmployees.filter(e => {
      if (!e) return false;
      const name = (e.name || '').toLowerCase();
      const id = (e.id || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      const position = (e.position || '').toLowerCase();
      return name.includes(q) || id.includes(q) || email.includes(q) || position.includes(q);
    });
  }

  // Apply department filter
  if (filterDepartment !== 'all') {
    departmentEmployees = departmentEmployees.filter(e => e.department === filterDepartment);
  }

  // Apply status filter
  if (filterStatus !== 'all') {
    departmentEmployees = departmentEmployees.filter(e => e.status === filterStatus);
  }

  const canManage = isAdmin || ['ecommerce', 'marketing', 'architecture', 'hrmanager', 'teamleader'].includes(currentUser.role);

  const getAvgScore = (empId: string) => {
    const empTasks = tasks.filter(t => t.employeeId === empId);
    if (empTasks.length === 0) return 0;
    return Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      status: 'active',
      joinDate: getCurrentDate(),
      monthlyHours: 176,
      salary: 0,
      department: isAdmin ? 'ecommerce' : currentUser.role
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

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
      Swal.fire('Updated', 'Employee details updated successfully', 'success');
    } else {
      addEmployee(formData as Employee);
      Swal.fire('Added', 'New employee added successfully', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Employee record will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEmployee(id);
        Swal.fire('Deleted!', 'Employee has been removed.', 'success');
      }
    });
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number') return 'Rs. 0';
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="🔍 Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
            />
          </div>
          {isAdmin && (
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: 'var(--text2)' }}>{departmentEmployees.length} total employees</div>
        {canManage && (
          <button
            onClick={handleAdd}
            style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
          >
            + Add Employee
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Position</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Address</th>
                {isAdmin && (
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Salary</th>
                )}
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Join Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Performance</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departmentEmployees.map(emp => {
                const avgScore = getAvgScore(emp.id);
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)' }}>{emp.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>
                       <div>{emp.name}</div>
                       <div style={{ fontSize: '11px', color: 'var(--text3)' }}>F: {emp.fatherName || '--'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)', textTransform: 'capitalize' }}>{emp.department}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.position}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.address}</td>
                    {isAdmin && (
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--green)', fontWeight: '600' }}>{formatCurrency(emp.salary)}</td>
                    )}
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>{formatDateShort(emp.joinDate)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: emp.status === 'active' ? 'var(--greenbg)' : 'var(--redbg)', color: emp.status === 'active' ? 'var(--green)' : 'var(--red)', fontWeight: '600' }}>{emp.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: avgScore >= 80 ? 'var(--green)' : avgScore >= 60 ? 'var(--amber)' : 'var(--red)' }}>{avgScore || '—'}%</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canManage && <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>}
                        {isAdmin && <button onClick={() => handleDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>
                {editingEmployee ? 'Edit Employee Profile' : 'Register New Employee'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Full Name</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} placeholder="Employee Name" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Father Name</label>
                  <input type="text" value={formData.fatherName || ''} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} placeholder="Father's Name" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Employee ID</label>
                  <input type="text" value={formData.id || ''} onChange={(e) => setFormData({ ...formData, id: e.target.value })} disabled={!!editingEmployee} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} placeholder="EMP-001" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Phone Number</label>
                  <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} placeholder="03xx-xxxxxxx" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Department</label>
                  <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }}>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Position</label>
                  <input type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} placeholder="Designation" />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Address</label>
                <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} placeholder="Full Residential Address" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                {isAdmin && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Basic Salary</label>
                    <input type="number" value={formData.salary || ''} onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '5px', display: 'block' }}>Join Date</label>
                  <input type="date" value={formData.joinDate || ''} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '9px 24px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save Employee</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

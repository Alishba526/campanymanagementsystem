'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { Employee } from '@/types';

export default function EmployeesPage() {
  const { currentUser, employees, addEmployee, updateEmployee, deleteEmployee, tasks } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});

  if (!currentUser) return null;

  // Filter employees by department for managers
  // Managers cannot see admin users or salaries
  const departmentEmployees = currentUser.role === 'admin'
    ? employees
    : employees.filter(e => e.department === currentUser.role && e.id !== 'ADMIN001');

  const canManage = currentUser.role === 'admin' || ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  const getAvgScore = (empId: string) => {
    const empTasks = tasks.filter(t => t.employeeId === empId);
    if (empTasks.length === 0) return 0;
    return Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      department: currentUser.role === 'admin' ? 'ecommerce' : currentUser.role,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      monthlyHours: 176
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
      alert('Name and ID are required');
      return;
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
    } else {
      addEmployee(formData as Employee);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{departmentEmployees.length} employees</div>
        {canManage && (
          <button
            onClick={handleAdd}
            style={{ background: 'var(--accent)', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <span>➕</span> Add Employee
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>👥</span>
            All Employees
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>ID</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Department</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Position</th>
                {currentUser.role === 'admin' && (
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Salary</th>
                )}
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Join Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Perf</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departmentEmployees.map(emp => {
                const avgScore = getAvgScore(emp.id);
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--accentbg)', color: 'var(--accent2)', borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: 600 }}>
                        {emp.id}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{emp.name}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)', textTransform: 'capitalize' }}>{emp.department}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.position}</td>
                    {currentUser.role === 'admin' && (
                      <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>{formatCurrency(emp.salary)}</td>
                    )}
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.joinDate}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '20px', padding: '3px 9px', fontSize: '11px', fontWeight: 600 }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderRadius: '20px',
                        padding: '3px 9px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: avgScore >= 80 ? 'var(--greenbg)' : avgScore >= 60 ? 'var(--amberbg)' : 'var(--redbg)',
                        color: avgScore >= 80 ? 'var(--green)' : avgScore >= 60 ? 'var(--amber)' : 'var(--red)'
                      }}>
                        {avgScore || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canManage && (
                          <button
                            onClick={() => handleEdit(emp)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                          >
                            ✏️
                          </button>
                        )}
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(emp.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--red)', transition: '.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                          >
                            🗑️
                          </button>
                        )}
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
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="Ahmed Hassan"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Employee ID</label>
                  <input
                    type="text"
                    value={formData.id || ''}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="EC001"
                    disabled={!!editingEmployee}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Department</label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    disabled={currentUser.role !== 'admin'}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="ecommerce">E-Commerce</option>
                    <option value="marketing">Marketing</option>
                    <option value="architecture">Architecture</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Position</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="Senior Developer"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="name@nexaerp.com"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="0300-1234567"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {currentUser.role === 'admin' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Monthly Salary (Rs.)</label>
                    <input
                      type="number"
                      value={formData.salary || ''}
                      onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                      placeholder="85000"
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Join Date</label>
                  <input
                    type="date"
                    value={formData.joinDate || ''}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--accent)', transition: '.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

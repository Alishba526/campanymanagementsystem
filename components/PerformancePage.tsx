'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { TaskLog } from '@/types';

export default function PerformancePage() {
  const { currentUser, employees, tasks, addTask, updateTask, deleteTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskLog | null>(null);
  const [formData, setFormData] = useState<Partial<TaskLog>>({});

  if (!currentUser) return null;

  const canManage = currentUser.role === 'admin' || ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  // Filter employees by department for managers
  const departmentEmployees = currentUser.role === 'admin'
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  // Calculate performance summaries
  const performanceSummary = departmentEmployees.map(emp => {
    const empTasks = tasks.filter(t => t.employeeId === emp.id);
    const avgScore = empTasks.length > 0
      ? Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length)
      : 0;
    const completedTasks = empTasks.filter(t => t.completion === 100).length;
    return {
      employee: emp,
      avgScore,
      totalTasks: empTasks.length,
      completedTasks,
      rating: avgScore >= 90 ? 'Excellent' : avgScore >= 75 ? 'Good' : avgScore >= 60 ? 'Average' : 'Low'
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const lowPerformers = performanceSummary.filter(p => p.avgScore < 60);

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'development',
      hours: 0,
      completion: 0,
      quality: 0
    });
    setShowModal(true);
  };

  const handleEdit = (task: TaskLog) => {
    setEditingTask(task);
    setFormData(task);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.employeeId || !formData.task) {
      alert('Please select an employee and enter task description');
      return;
    }

    const employee = employees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    const completion = formData.completion || 0;
    const quality = formData.quality || 0;
    const hours = formData.hours || 0;
    const score = Math.round((completion * 0.5) + (quality * 0.3) + (Math.min(hours / 8, 1) * 100 * 0.2));

    const task: TaskLog = {
      id: editingTask?.id || `TK${Date.now()}`,
      employeeId: formData.employeeId,
      employeeName: employee.name,
      date: formData.date || new Date().toISOString().split('T')[0],
      task: formData.task,
      category: formData.category || 'development',
      hours,
      completion,
      quality,
      score
    };

    if (editingTask) {
      updateTask(editingTask.id, task);
    } else {
      addTask(task);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task log?')) {
      deleteTask(id);
    }
  };

  return (
    <div>
      {/* Low Performance Alerts */}
      {lowPerformers.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          {lowPerformers.map(perf => (
            <div key={perf.employee.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius)', marginBottom: '12px', fontSize: '13px', background: 'var(--redbg)', border: '1px solid var(--red)', color: 'var(--red)' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <div>
                <strong>Low Performance:</strong> {perf.employee.name} — Monthly Avg: {perf.avgScore}/100. Immediate attention required.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ⭐
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{performanceSummary[0]?.avgScore || 0}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Top Score This Month</div>
          <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '4px' }}>{performanceSummary[0]?.employee.name || '—'}</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            📊
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>
            {performanceSummary.length > 0
              ? Math.round(performanceSummary.reduce((sum, p) => sum + p.avgScore, 0) / performanceSummary.length)
              : 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Team Average Score</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--amberbg)', color: 'var(--amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            ✅
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{tasks.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Total Tasks Logged</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--redbg)', color: 'var(--red)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            🚨
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'normal', marginBottom: '2px', color: '#000' }}>{lowPerformers.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: 'normal' }}>Low Perf Alerts</div>
        </div>
      </div>

      {/* Performance Summary */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', marginBottom: '18px' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
            <span style={{ color: 'var(--accent)' }}>📈</span>
            Monthly Performance Summary
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Employee</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Department</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Avg Score</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Tasks Done</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Completion</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: '#000' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {performanceSummary.map(perf => {
                const completionRate = perf.totalTasks > 0 ? Math.round((perf.completedTasks / perf.totalTasks) * 100) : 0;
                return (
                  <tr key={perf.employee.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 'normal' }}>{perf.employee.name}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)', textTransform: 'capitalize' }}>{perf.employee.department}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'normal',
                          border: '2.5px solid',
                          color: perf.avgScore >= 80 ? 'var(--green)' : perf.avgScore >= 60 ? 'var(--amber)' : 'var(--red)',
                          borderColor: perf.avgScore >= 80 ? 'var(--green)' : perf.avgScore >= 60 ? 'var(--amber)' : 'var(--red)'
                        }}>
                          {perf.avgScore}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{perf.completedTasks}/{perf.totalTasks}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: 'var(--border)', borderRadius: '99px', height: '6px', width: '80px', overflow: 'hidden', minWidth: '80px' }}>
                          <div
                            style={{
                              height: '100%',
                              borderRadius: '99px',
                              transition: '.4s',
                              width: `${completionRate}%`,
                              background: completionRate >= 80 ? 'var(--green)' : completionRate >= 60 ? 'var(--amber)' : 'var(--red)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{completionRate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderRadius: '20px',
                        padding: '3px 9px',
                        fontSize: '11px',
                        fontWeight: 'normal',
                        background: perf.avgScore >= 90 ? 'var(--greenbg)' :
                                   perf.avgScore >= 75 ? 'var(--bluebg)' :
                                   perf.avgScore >= 60 ? 'var(--amberbg)' : 'var(--redbg)',
                        color: perf.avgScore >= 90 ? 'var(--green)' :
                               perf.avgScore >= 75 ? 'var(--blue)' :
                               perf.avgScore >= 60 ? 'var(--amber)' : 'var(--red)'
                      }}>
                        {perf.rating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Logs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{tasks.length} task logs</div>
        {canManage && (
          <button
            onClick={handleAdd}
            style={{ background: 'var(--accent)', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: '.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <span>➕</span> Add Task Log
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>✅</span>
            Daily Task Logs
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Employee</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Task</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Category</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Hours</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Completion</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>AI Score</th>
                {canManage && (
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'normal', letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text2)' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{task.date}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 'normal' }}>{task.employeeName}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={task.task}>{task.task}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 'normal',
                      background: task.category === 'development' ? 'var(--bluebg)' :
                                 task.category === 'marketing' ? 'var(--accentbg)' :
                                 task.category === 'design' ? '#230d1a' : 'var(--greenbg)',
                      color: task.category === 'development' ? 'var(--blue)' :
                             task.category === 'marketing' ? 'var(--accent2)' :
                             task.category === 'design' ? '#ec4899' : 'var(--green)'
                    }}>
                      {task.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{task.hours}h</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: 'var(--border)', borderRadius: '99px', height: '6px', width: '70px', overflow: 'hidden', minWidth: '70px' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '99px',
                            width: `${task.completion}%`,
                            background: task.completion >= 80 ? 'var(--green)' : task.completion >= 60 ? 'var(--amber)' : 'var(--red)'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{task.completion}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '20px',
                      padding: '3px 9px',
                      fontSize: '11px',
                      fontWeight: 'normal',
                      background: task.score >= 80 ? 'var(--greenbg)' : task.score >= 60 ? 'var(--amberbg)' : 'var(--redbg)',
                      color: task.score >= 80 ? 'var(--green)' : task.score >= 60 ? 'var(--amber)' : 'var(--red)'
                    }}>
                      {task.score}
                    </span>
                  </td>
                  {canManage && (
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(task)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                        >
                          ✏️
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(task.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--red)', transition: '.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 'normal', color: 'var(--text)' }}>
                {editingTask ? 'Edit Task Log' : 'Add Task Log'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Employee</label>
                  <select
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    disabled={!!editingTask}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">Select Employee</option>
                    {departmentEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Task Description</label>
                <input
                  type="text"
                  value={formData.task || ''}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                  placeholder="API Integration — Payment Gateway"
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Category</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="development">Development</option>
                    <option value="marketing">Marketing</option>
                    <option value="design">Design</option>
                    <option value="architecture">Architecture</option>
                    <option value="management">Management</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Hours Worked</label>
                  <input
                    type="number"
                    value={formData.hours || ''}
                    onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="4"
                    min="0"
                    max="12"
                    step="0.5"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Completion %</label>
                  <input
                    type="number"
                    value={formData.completion || ''}
                    onChange={(e) => setFormData({ ...formData, completion: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="80"
                    min="0"
                    max="100"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>Quality Score (0-100)</label>
                  <input
                    type="number"
                    value={formData.quality || ''}
                    onChange={(e) => setFormData({ ...formData, quality: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font)' }}
                    placeholder="85"
                    min="0"
                    max="100"
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'normal', cursor: 'pointer', border: '1px solid var(--accent)', transition: '.15s' }}
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

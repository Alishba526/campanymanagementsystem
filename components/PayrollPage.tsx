'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import jsPDF from 'jspdf';

export default function PayrollPage() {
  const { currentUser, employees, tasks, attendance } = useApp();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
          <p>Your role does not have permission to view this data.</p>
        </div>
      </div>
    );
  }

  const totalPayroll = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = employees.length > 0 ? Math.round(totalPayroll / employees.length) : 0;

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getAvgScore = (empId: string) => {
    const empTasks = tasks.filter(t => t.employeeId === empId);
    if (empTasks.length === 0) return 0;
    return Math.round(empTasks.reduce((sum, t) => sum + t.score, 0) / empTasks.length);
  };

  const getBonus = (empId: string, salary: number) => {
    const avgScore = getAvgScore(empId);
    if (avgScore >= 90) return Math.round(salary * 0.1);
    if (avgScore >= 75) return Math.round(salary * 0.05);
    return 0;
  };

  const getDeductions = (empId: string, salary: number) => {
    const absentDays = attendance.filter(a => a.employeeId === empId && a.status === 'absent').length;
    return absentDays * Math.round(salary / 30);
  };

  const viewPayslip = (empId: string) => {
    setSelectedEmployee(empId);
  };

  const selectedEmp = employees.find(e => e.id === selectedEmployee);
  const selectedAvgScore = selectedEmp ? getAvgScore(selectedEmp.id) : 0;
  const selectedBonus = selectedEmp ? getBonus(selectedEmp.id, selectedEmp.salary) : 0;
  const selectedAbsents = selectedEmp ? attendance.filter(a => a.employeeId === selectedEmp.id && a.status === 'absent').length : 0;
  const selectedDeductions = selectedEmp ? getDeductions(selectedEmp.id, selectedEmp.salary) : 0;
  const selectedNetPay = selectedEmp ? selectedEmp.salary + selectedBonus - selectedDeductions : 0;

  const scoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const downloadPayslipPDF = () => {
    if (!selectedEmp) return;
    
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237);
    doc.text('NexaERP - Salary Slip', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Digital Marketing & Commerce Solutions', 105, 38, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Employee Name: ${selectedEmp.name}`, 20, 60);
    doc.text(`Employee ID: ${selectedEmp.id}`, 20, 68);
    doc.text(`Designation: ${selectedEmp.position}`, 20, 76);
    doc.text(`Month: May 2026`, 140, 60);
    
    doc.line(20, 85, 190, 85);
    
    doc.text('Description', 20, 95);
    doc.text('Amount (Rs.)', 140, 95);
    
    doc.text('Basic Salary', 20, 110);
    doc.text(selectedEmp.salary.toLocaleString(), 140, 110);
    
    doc.text('Performance Bonus', 20, 120);
    doc.text(selectedBonus.toLocaleString(), 140, 120);
    
    doc.setTextColor(220, 0, 0);
    doc.text(`Deductions (${selectedAbsents} absents)`, 20, 130);
    doc.text(`- ${selectedDeductions.toLocaleString()}`, 140, 130);
    
    doc.line(20, 140, 190, 140);
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105);
    doc.text('Net Payable Salary', 20, 155);
    doc.text(selectedNetPay.toLocaleString(), 140, 155);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('This is a computer generated document and does not require a signature.', 105, 180, { align: 'center' });
    
    doc.save(`Payslip_${selectedEmp.name}_May2026.pdf`);
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--greenbg)', color: 'var(--green)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            💳
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{formatCurrency(totalPayroll)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Monthly Payroll</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--bluebg)', color: 'var(--blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            👥
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{employees.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Employees on Payroll</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--amberbg)', color: 'var(--amber)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            📊
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{formatCurrency(avgSalary)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Avg Salary</div>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '18px 16px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--accentbg)', color: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>
            📄
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px', color: 'var(--text)' }}>{employees.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Slips Ready</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>💳</span>
            Payroll — May 2026
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Employee</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Position</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Base Salary</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Bonus</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Deductions</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Net Pay</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Slip</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const salary = emp.salary || 0;
                const bonus = getBonus(emp.id, salary);
                const deductions = getDeductions(emp.id, salary);
                const netPay = salary + bonus - deductions;
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{emp.name}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.position}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{formatCurrency(salary)}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--green)' }}>{bonus ? formatCurrency(bonus) : '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--red)' }}>{deductions ? formatCurrency(deductions) : '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--amber)', fontWeight: 700 }}>{formatCurrency(netPay)}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        onClick={() => viewPayslip(emp.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
                      >
                        📄 View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedEmployee && selectedEmp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '18px', width: '90%', maxWidth: '520px' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Salary Slip — {selectedEmp.name}</div>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '24px' }}>
                <div style={{ textAlign: 'center', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>🧠 NexaERP</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Digital Marketing & Commerce</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '8px', color: 'var(--text)' }}>SALARY SLIP — MAY 2026</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>Employee</span>
                    <span style={{ color: 'var(--text)' }}>{selectedEmp.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>ID</span>
                    <span style={{ color: 'var(--text)' }}>{selectedEmp.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>Designation</span>
                    <span style={{ color: 'var(--text)' }}>{selectedEmp.position}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>Department</span>
                    <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{selectedEmp.department}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>Performance Score</span>
                    <span style={{ color: scoreColor(selectedAvgScore) }}>{selectedAvgScore}/100</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>Basic Salary</span>
                    <span style={{ color: 'var(--text)' }}>{formatCurrency(selectedEmp.salary)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>Performance Bonus</span>
                    <span style={{ color: 'var(--green)' }}>{selectedBonus ? formatCurrency(selectedBonus) : 'NIL'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text2)' }}>Absent Deductions ({selectedAbsents} days)</span>
                    <span style={{ color: 'var(--red)' }}>{selectedDeductions ? formatCurrency(selectedDeductions) : 'NIL'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '16px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--green)' }}>Net Pay</span>
                    <span style={{ color: 'var(--green)' }}>{formatCurrency(selectedNetPay)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={downloadPayslipPDF}
                style={{ background: 'var(--green)', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: '.15s' }}
              >
                📥 Download PDF
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                style={{ background: 'var(--accent)', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: '.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

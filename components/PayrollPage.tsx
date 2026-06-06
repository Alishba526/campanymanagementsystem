'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import jsPDF from 'jspdf';
import { getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';

export default function PayrollPage() {
  const { currentUser, employees, tasks, attendance } = useApp();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);
  const isManager = ['ecommerce', 'marketing', 'architecture'].includes(currentUser.role);

  if (!isAdmin && !isManager) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px', color: 'var(--red)' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '8px' }}>Access Restricted</h2>
        <p>Payroll management is reserved for Department Managers and Admins.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `Rs. ${(amount || 0).toLocaleString()}`;

  // 🔒 SECURITY SOURCE FILTERING
  const filteredEmployees = employees.filter(emp => isAdmin || emp.department === currentUser.role);

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
    const halfDays = attendance.filter(a => a.employeeId === empId && a.status === 'half-day').length;
    return (absentDays * Math.round(salary / 30)) + (halfDays * Math.round(salary / 60));
  };

  const getLatePenalty = (empId: string, salary: number) => {
    const lateDays = attendance.filter(a => a.employeeId === empId && a.status === 'late').length;
    return lateDays * 500;
  };

  const getOvertimePay = (empId: string, salary: number) => {
    const totalOvertime = attendance.filter(a => a.employeeId === empId).reduce((sum, a) => sum + (a.overtime || 0), 0);
    return Math.round((salary / 176) * 1.5 * totalOvertime);
  };

  // Universal Search Filter (Secured)
  const displayEmployees = filteredEmployees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    return !searchQuery || 
      emp.name.toLowerCase().includes(searchLower) ||
      emp.id.toLowerCase().includes(searchLower) ||
      emp.position?.toLowerCase().includes(searchLower);
  });

  const totalPayroll = filteredEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = filteredEmployees.length > 0 ? Math.round(totalPayroll / filteredEmployees.length) : 0;

  const selectedEmp = filteredEmployees.find(e => e.id === selectedEmployee);
  const selectedAvgScore = selectedEmp ? getAvgScore(selectedEmp.id) : 0;
  const selectedBonus = selectedEmp ? getBonus(selectedEmp.id, selectedEmp.salary) : 0;
  const selectedOvertimePay = selectedEmp ? getOvertimePay(selectedEmp.id, selectedEmp.salary) : 0;
  const selectedAbsents = selectedEmp ? attendance.filter(a => a.employeeId === selectedEmp.id && a.status === 'absent').length : 0;
  const selectedLatePenalty = selectedEmp ? getLatePenalty(selectedEmp.id, selectedEmp.salary) : 0;
  const selectedDeductions = selectedEmp ? getDeductions(selectedEmp.id, selectedEmp.salary) : 0;
  const selectedNetPay = selectedEmp ? selectedEmp.salary + selectedBonus + selectedOvertimePay - selectedDeductions - selectedLatePenalty : 0;

  const downloadPayslipPDF = () => {
    if (!selectedEmp) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237);
    doc.text('GROWZIX - Salary Slip', 105, 30, { align: 'center' });
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
    doc.text(`Month: ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`, 140, 60);
    doc.line(20, 85, 190, 85);
    doc.text('Description', 20, 95);
    doc.text('Amount (PKR Rs.)', 140, 95);
    doc.text('Basic Salary', 20, 110);
    doc.text(selectedEmp.salary.toLocaleString(), 140, 110);
    doc.text('Performance Bonus', 20, 120);
    doc.text(selectedBonus.toLocaleString(), 140, 120);
    doc.text('Overtime Pay', 20, 130);
    doc.text(selectedOvertimePay.toLocaleString(), 140, 130);
    doc.setTextColor(220, 0, 0);
    doc.text(`Deductions (${selectedAbsents} absents)`, 20, 140);
    doc.text(`- ${selectedDeductions.toLocaleString()}`, 140, 140);
    doc.text(`Late Penalty`, 20, 150);
    doc.text(`- ${selectedLatePenalty.toLocaleString()}`, 140, 150);
    doc.line(20, 160, 190, 160);
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105);
    doc.text('Net Payable Salary', 20, 175);
    doc.text(selectedNetPay.toLocaleString(), 140, 175);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('This is a computer generated document and does not require a signature.', 105, 180, { align: 'center' });
    doc.save(`Payslip_${selectedEmp.name}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Premium Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>💳</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Payroll Master Engine</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>Live Tracking: {filteredEmployees.length} staff on payroll</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px 8px 30px', color: 'var(--text)', outline: 'none', width: '200px', fontSize: '12px' }}
            />
          </div>
          <div style={{ padding: '8px 15px', background: 'var(--bg3)', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', border: '1px solid var(--border)' }}>
             📅 {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <StatCard icon="💰" label="Total Payroll" value={formatCurrency(totalPayroll)} color="#10b981" />
        <StatCard icon="👥" label="Staff Count" value={employees.length.toString()} color="#2563eb" />
        <StatCard icon="📊" label="Avg Salary" value={formatCurrency(avgSalary)} color="#f59e0b" />
        <StatCard icon="📄" label="Slips Active" value={employees.length.toString()} color="var(--accent)" />
      </div>

      {/* Payroll Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '15px 20px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          📋 Monthly Salary Ledger
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Position</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Base Salary</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Bonus</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Deductions</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Net Pay</th>
                <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Slip</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => {
                const salary = emp.salary || 0;
                const bonus = getBonus(emp.id, salary);
                const deductions = getDeductions(emp.id, salary);
                const netPay = salary + bonus - deductions;
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.1s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 15px' }}>
                       <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>{emp.name}</div>
                       <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold' }}>{emp.id}</div>
                    </td>
                    <td style={{ padding: '10px 15px', fontSize: '12px', color: 'var(--text2)', fontWeight: '600' }}>{emp.position}</td>
                    <td style={{ padding: '10px 15px', fontSize: '12px', color: '#059669', fontWeight: '900' }}>{formatCurrency(salary)}</td>
                    <td style={{ padding: '10px 15px', fontSize: '12px', color: '#059669', fontWeight: '900' }}>{bonus ? `+ ${formatCurrency(bonus)}` : '—'}</td>
                    <td style={{ padding: '10px 15px', fontSize: '12px', color: '#dc2626', fontWeight: '900' }}>{deductions ? `- ${formatCurrency(deductions)}` : '—'}</td>
                    <td style={{ padding: '10px 15px', fontSize: '13px', color: 'var(--text)', fontWeight: '900' }}>{formatCurrency(netPay)}</td>
                    <td style={{ padding: '10px 15px' }}>
                      <button onClick={() => setSelectedEmployee(emp.id)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>📄 Slip</button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', width: '90%', maxWidth: '500px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>Salary Slip — {selectedEmp.name}</div>
              <button onClick={() => setSelectedEmployee(null)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '25px' }}>
               <div style={{ background: 'var(--bg3)', padding: '25px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '15px' }}>
                     <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent)' }}>🚀 GROWZIX PRO</div>
                     <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', textTransform: 'uppercase' }}>Salary Statement — May 2026</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <PayslipRow label="Employee" value={selectedEmp.name} />
                    <PayslipRow label="Designation" value={selectedEmp.position} />
                    <PayslipRow label="Basic Salary" value={formatCurrency(selectedEmp.salary)} />
                    <PayslipRow label="Performance Bonus" value={formatCurrency(selectedBonus)} color="#059669" />
                    <PayslipRow label="Overtime Pay" value={formatCurrency(selectedOvertimePay)} color="#059669" />
                    <PayslipRow label="Late Penalty" value={`- ${formatCurrency(selectedLatePenalty)}`} color="#dc2626" />
                    <PayslipRow label="Absence Deductions" value={`- ${formatCurrency(selectedDeductions)}`} color="#dc2626" />
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '2px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)' }}>Net Payable</span>
                       <span style={{ fontSize: '18px', fontWeight: '900', color: '#059669' }}>{formatCurrency(selectedNetPay)}</span>
                    </div>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={downloadPayslipPDF} style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📥 Download PDF</button>
                  <button onClick={() => setSelectedEmployee(null)} style={{ flex: 1, background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow)' }}>
       <div style={{ width: '36px', height: '36px', background: `${color}15`, color: color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' }}>{icon}</div>
       <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>{value}</div>
       <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function PayslipRow({ label, value, color }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
      <span style={{ color: 'var(--text3)', fontWeight: 'bold' }}>{label}</span>
      <span style={{ color: color || 'var(--text)', fontWeight: '900' }}>{value}</span>
    </div>
  );
}

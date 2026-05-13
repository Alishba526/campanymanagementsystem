'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const { currentUser, employees, attendance, tasks, expenses, income, payroll } = useApp() as any;
  const [reportMonth, setReportMonth] = useState('May 2026');

  if (!currentUser || currentUser.role !== 'admin') {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Access Restricted to Admin</div>;
  }

  const totalIncome = income.filter((i: any) => i.status === 'received').reduce((sum: number, i: any) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSalaries = employees.reduce((sum: number, e: any) => sum + e.salary, 0);
  const netProfit = totalIncome - totalExpenses - totalSalaries;

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237); // Purple accent
    doc.text('GROWZIX - Monthly Business Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Month: ${reportMonth}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Financial Summary', 14, 50);
    
    autoTable(doc, {
      startY: 55,
      head: [['Category', 'Amount (Rs.)']],
      body: [
        ['Total Client Income', totalIncome.toLocaleString()],
        ['Total Operating Expenses', totalExpenses.toLocaleString()],
        ['Total Staff Payroll', totalSalaries.toLocaleString()],
        ['Net Profit', netProfit.toLocaleString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] }
    });

    // Department Breakdown
    const depts = ['ecommerce', 'marketing', 'architecture'];
    const deptData = depts.map(d => [
      d.toUpperCase(),
      employees.filter((e: any) => e.department === d).length,
      employees.filter((e: any) => e.department === d).reduce((sum: number, e: any) => sum + e.salary, 0).toLocaleString()
    ]);

    doc.text('Department Breakdown', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Department', 'Staff Count', 'Monthly Payroll']],
      body: deptData,
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Attendance Summary
    const totalAttendance = attendance.length;
    const present = attendance.filter((a: any) => a.status === 'present').length;
    const absent = attendance.filter((a: any) => a.status === 'absent').length;
    const late = attendance.filter((a: any) => a.status === 'late').length;

    doc.text('Attendance Summary', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Status', 'Count', 'Percentage']],
      body: [
        ['Present', present, `${Math.round((present/totalAttendance)*100 || 0)}%`],
        ['Absent', absent, `${Math.round((absent/totalAttendance)*100 || 0)}%`],
        ['Late', late, `${Math.round((late/totalAttendance)*100 || 0)}%`],
      ],
      headStyles: { fillColor: [5, 150, 105] }
    });

    doc.save(`GROWZIX_Report_${reportMonth.replace(' ', '_')}.pdf`);
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--text)' }}>Monthly Analytics & Reports</h2>
        <button 
          onClick={generatePDF}
          style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📥 Download Full PDF Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Financial Overview Card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'normal', marginBottom: '20px', color: 'var(--text)' }}>Financial Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text2)' }}>Total Income</span>
              <span style={{ color: 'var(--green)', fontWeight: 'normal' }}>{formatCurrency(totalIncome)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text2)' }}>Expenses + Salaries</span>
              <span style={{ color: 'var(--red)', fontWeight: 'normal' }}>{formatCurrency(totalExpenses + totalSalaries)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
              <span style={{ color: 'var(--text)', fontWeight: 'normal' }}>Net Profit</span>
              <span style={{ color: 'var(--accent)', fontSize: '18px', fontWeight: 'normal' }}>{formatCurrency(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* HR Metrics Card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'normal', marginBottom: '20px', color: 'var(--text)' }}>HR & Operations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text2)' }}>Active Employees</span>
              <span style={{ color: 'var(--text)', fontWeight: 'normal' }}>{employees.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text2)' }}>Average Performance</span>
              <span style={{ color: 'var(--blue)', fontWeight: 'normal' }}>88%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
              <span style={{ color: 'var(--text2)' }}>Pending Leaves</span>
              <span style={{ color: 'var(--amber)', fontWeight: 'normal' }}>2</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', background: 'var(--bg3)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border2)', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
          Tip: Monthly reports are automatically calculated based on your database records for income, expenses, and payroll.
        </p>
      </div>
    </div>
  );
}

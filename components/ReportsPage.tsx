'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDateShort } from '@/lib/dateUtils';

export default function ReportsPage() {
  const { currentUser, employees, attendance, tasks, expenses, income, projects } = useApp() as any;
  const [reportMonth, setReportMonth] = useState('May 2026');

  if (!currentUser) return null;

  const isAdmin = ['admin', 'superadmin'].includes(currentUser.role);

  if (!isAdmin) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Access Restricted to Admin</div>;
  }

  const totalIncome = income.filter((i: any) => i.status === 'received').reduce((sum: number, i: any) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSalaries = employees.reduce((sum: number, e: any) => sum + e.salary, 0);
  const netProfit = totalIncome - totalExpenses - totalSalaries;

  // Generic Excel Generator
  const downloadExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const generateAttendancePDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Report', 14, 20);
    const tableData = attendance.map((a: any) => [a.employeeName, a.date, a.status.toUpperCase(), a.checkIn, a.checkOut, a.hours.toFixed(1)]);
    autoTable(doc, { startY: 30, head: [['Name', 'Date', 'Status', 'In', 'Out', 'Hrs']], body: tableData, headStyles: { fillColor: [5, 150, 105] } });
    doc.save('Attendance_Report.pdf');
  };

  const downloadAttendanceExcel = () => {
    const data = attendance.map((a: any) => ({ Name: a.employeeName, Date: a.date, Status: a.status, In: a.checkIn, Out: a.checkOut, Hours: a.hours }));
    downloadExcel(data, 'Attendance_Report');
  };

  const generatePerformancePDF = () => {
    const doc = new jsPDF();
    doc.text('Performance Report', 14, 20);
    const perfData = employees.map((emp: any) => {
      const empTasks = tasks.filter((t: any) => t.employeeId === emp.id);
      const score = empTasks.length > 0 ? Math.round(empTasks.reduce((sum: number, t: any) => sum + t.score, 0) / empTasks.length) : 0;
      return [emp.name, emp.department.toUpperCase(), `${score}%`, empTasks.length];
    });
    autoTable(doc, { startY: 30, head: [['Employee', 'Department', 'Score', 'Tasks']], body: perfData, headStyles: { fillColor: [79, 70, 229] } });
    doc.save('Performance_Report.pdf');
  };

  const downloadPerformanceExcel = () => {
    const data = employees.map((emp: any) => {
      const empTasks = tasks.filter((t: any) => t.employeeId === emp.id);
      const score = empTasks.length > 0 ? Math.round(empTasks.reduce((sum: number, t: any) => sum + t.score, 0) / empTasks.length) : 0;
      return { Employee: emp.name, Department: emp.department, Score: `${score}%`, Tasks: empTasks.length };
    });
    downloadExcel(data, 'Performance_Report');
  };

  const generateSalaryPDF = () => {
    const doc = new jsPDF();
    doc.text('Payroll Report', 14, 20);
    const salaryData = employees.map((emp: any) => [emp.id, emp.name, emp.position, `Rs. ${emp.salary.toLocaleString()}`]);
    autoTable(doc, { startY: 30, head: [['ID', 'Employee', 'Position', 'Salary']], body: salaryData, headStyles: { fillColor: [220, 38, 38] } });
    doc.save('Salary_Report.pdf');
  };

  const downloadSalaryExcel = () => {
    const data = employees.map((emp: any) => ({ ID: emp.id, Name: emp.name, Position: emp.position, Salary: emp.salary }));
    downloadExcel(data, 'Salary_Report');
  };

  const generateProjectPDF = () => {
    const doc = new jsPDF();
    doc.text('Projects Report', 14, 20);
    const projData = projects.map((p: any) => [p.projectNo || '—', p.projectName, p.clientName, `$ ${p.cost.toLocaleString()}`, p.status.toUpperCase()]);
    autoTable(doc, { startY: 30, head: [['No', 'Project', 'Client', 'Cost', 'Status']], body: projData, headStyles: { fillColor: [37, 99, 235] } });
    doc.save('Projects_Report.pdf');
  };

  const downloadProjectExcel = () => {
    const data = projects.map((p: any) => ({ No: p.projectNo, Project: p.projectName, Client: p.clientName, Cost: p.cost, Status: p.status }));
    downloadExcel(data, 'Projects_Report');
  };

  const generateMainPDF = () => {
    const doc = new jsPDF();
    doc.text('Business Summary', 14, 20);
    autoTable(doc, { startY: 30, head: [['Metric', 'Value']], body: [['Income', totalIncome], ['Expenses', totalExpenses], ['Payroll', totalSalaries], ['Profit', netProfit]], headStyles: { fillColor: [124, 58, 237] } });
    doc.save('GROWZIX_Full_Report.pdf');
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)' }}>Downloadable Reports</h2>
          <p style={{ fontSize: '13px', color: 'var(--text2)' }}>Generate and download detailed system reports in PDF & Excel format</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <ReportCard title="Attendance Logs" desc="Daily presence records for all staff." color="#059669" onPDF={generateAttendancePDF} onExcel={downloadAttendanceExcel} />
        <ReportCard title="Performance Stats" desc="Employee rankings and quality scores." color="#4f46e5" onPDF={generatePerformancePDF} onExcel={downloadPerformanceExcel} />
        <ReportCard title="Salary & Payroll" desc="Monthly compensation breakdown." color="#dc2626" onPDF={generateSalaryPDF} onExcel={downloadSalaryExcel} />
        <ReportCard title="Projects Tracker" desc="Client project status and financials." color="#2563eb" onPDF={generateProjectPDF} onExcel={downloadProjectExcel} />
        <ReportCard title="Full Summary" desc="Complete P&L business overview." color="#7c3aed" onPDF={generateMainPDF} onExcel={() => {}} />
      </div>

      {/* Financial Snapshot */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>Financial Overview Snapshot</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ borderLeft: '4px solid var(--green)', paddingLeft: '15px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Income</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green)' }}>{formatCurrency(totalIncome)}</div>
          </div>
          <div style={{ borderLeft: '4px solid var(--red)', paddingLeft: '15px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Total Expenses</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--red)' }}>{formatCurrency(totalExpenses + totalSalaries)}</div>
          </div>
          <div style={{ borderLeft: '4px solid var(--accent)', paddingLeft: '15px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Net Profit</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)' }}>{formatCurrency(netProfit)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, desc, color, onPDF, onExcel }: any) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: '12px', color: 'var(--text2)', flex: 1 }}>{desc}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onPDF} style={{ flex: 1, background: color, color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>PDF</button>
        {onExcel && <button onClick={onExcel} style={{ flex: 1, background: 'var(--bg3)', color: 'var(--text)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Excel</button>}
      </div>
    </div>
  );
}

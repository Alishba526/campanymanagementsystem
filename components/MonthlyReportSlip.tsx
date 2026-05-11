'use client';

import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MonthlyReportSlip() {
  const { currentUser, employees, attendance, tasks, leaveRequests } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  // Filter employees based on role
  const availableEmployees = isAdmin
    ? employees
    : employees.filter(e => e.department === currentUser.role);

  const generateMonthlyReport = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const monthStart = selectedMonth + '-01';
    const monthEnd = new Date(selectedMonth + '-01');
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const monthEndStr = monthEnd.toISOString().slice(0, 10);

    // Filter data for selected month
    const monthAttendance = attendance.filter(a =>
      a.employeeId === employeeId &&
      a.date >= monthStart &&
      a.date < monthEndStr
    );

    const monthTasks = tasks.filter(t =>
      t.employeeId === employeeId &&
      t.date >= monthStart &&
      t.date < monthEndStr
    );

    const monthLeaves = leaveRequests.filter(l =>
      l.employeeId === employeeId &&
      l.startDate >= monthStart &&
      l.startDate < monthEndStr
    );

    // Calculate statistics
    const totalDays = monthAttendance.length;
    const presentDays = monthAttendance.filter(a => a.status === 'present').length;
    const lateDays = monthAttendance.filter(a => a.status === 'late').length;
    const absentDays = monthAttendance.filter(a => a.status === 'absent').length;
    const leaveDays = monthAttendance.filter(a => a.status === 'leave').length;
    const totalHours = monthAttendance.reduce((sum, a) => sum + (a.hours || 0), 0);
    const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0';

    const avgPerformance = monthTasks.length > 0
      ? Math.round(monthTasks.reduce((sum, t) => sum + t.score, 0) / monthTasks.length)
      : 0;

    const completedTasks = monthTasks.filter(t => t.completion === 100).length;
    const totalTaskHours = monthTasks.reduce((sum, t) => sum + t.hours, 0);

    const approvedLeaves = monthLeaves.filter(l => l.status === 'approved').length;
    const pendingLeaves = monthLeaves.filter(l => l.status === 'pending').length;

    // Generate PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(124, 58, 237);
    doc.text('NexaERP', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Monthly Performance Report', 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    doc.text(monthName, 105, 37, { align: 'center' });

    doc.setDrawColor(200);
    doc.line(20, 42, 190, 42);

    // Employee Information
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Employee Information', 20, 52);

    autoTable(doc, {
      startY: 56,
      head: [['Field', 'Details']],
      body: [
        ['Name', employee.name],
        ['Employee ID', employee.id],
        ['Department', employee.department.toUpperCase()],
        ['Position', employee.position],
        ['Email', employee.email],
        ['Phone', employee.phone],
      ],
      theme: 'plain',
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    });

    // Attendance Summary
    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Attendance Summary', 20, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Metric', 'Count', 'Percentage']],
      body: [
        ['Total Working Days', totalDays.toString(), '100%'],
        ['Present', presentDays.toString(), totalDays > 0 ? `${Math.round((presentDays/totalDays)*100)}%` : '0%'],
        ['Late Arrivals', lateDays.toString(), totalDays > 0 ? `${Math.round((lateDays/totalDays)*100)}%` : '0%'],
        ['Absent', absentDays.toString(), totalDays > 0 ? `${Math.round((absentDays/totalDays)*100)}%` : '0%'],
        ['On Leave', leaveDays.toString(), totalDays > 0 ? `${Math.round((leaveDays/totalDays)*100)}%` : '0%'],
        ['Total Hours Worked', totalHours.toFixed(1) + 'h', ''],
        ['Avg Hours/Day', avgHoursPerDay + 'h', ''],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Performance Summary
    const perfY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Performance Summary', 20, perfY);

    autoTable(doc, {
      startY: perfY + 4,
      head: [['Metric', 'Value']],
      body: [
        ['Average Performance Score', `${avgPerformance}/100`],
        ['Total Tasks Assigned', monthTasks.length.toString()],
        ['Tasks Completed', completedTasks.toString()],
        ['Completion Rate', monthTasks.length > 0 ? `${Math.round((completedTasks/monthTasks.length)*100)}%` : '0%'],
        ['Total Task Hours', totalTaskHours.toFixed(1) + 'h'],
        ['Performance Rating', avgPerformance >= 90 ? 'Excellent ⭐' : avgPerformance >= 75 ? 'Good ✓' : avgPerformance >= 60 ? 'Average' : 'Needs Improvement ⚠'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { cellWidth: 80 }
      }
    });

    // Leave Summary
    const leaveY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Leave Summary', 20, leaveY);

    autoTable(doc, {
      startY: leaveY + 4,
      head: [['Status', 'Count']],
      body: [
        ['Approved Leaves', approvedLeaves.toString()],
        ['Pending Requests', pendingLeaves.toString()],
        ['Total Leave Requests', monthLeaves.length.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Top Tasks (if any)
    if (monthTasks.length > 0) {
      const topY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Top 5 Tasks This Month', 20, topY);

      const topTasks = monthTasks
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(t => [
          t.date,
          t.task.substring(0, 40) + (t.task.length > 40 ? '...' : ''),
          t.score.toString(),
          t.completion + '%'
        ]);

      autoTable(doc, {
        startY: topY + 4,
        head: [['Date', 'Task', 'Score', 'Completion']],
        body: topTasks,
        theme: 'grid',
        headStyles: { fillColor: [234, 88, 12] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 95 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 }
        }
      });
    }

    // Footer
    const footerY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('This is a computer-generated report. No signature required.', 105, footerY, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, footerY + 5, { align: 'center' });
    doc.text('NexaERP - AI-Powered Enterprise Management System', 105, footerY + 10, { align: 'center' });

    // Save PDF
    doc.save(`${employee.name}_Monthly_Report_${monthName.replace(' ', '_')}.pdf`);
  };

  const generateAllReports = () => {
    if (!confirm(`Generate monthly reports for all ${availableEmployees.length} employees?`)) {
      return;
    }

    availableEmployees.forEach((emp, index) => {
      setTimeout(() => {
        generateMonthlyReport(emp.id);
      }, index * 500); // Delay to avoid browser blocking
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px', marginBottom: '22px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
          📄 Monthly Performance Report Generator
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px' }}>
          Generate comprehensive monthly reports including attendance, performance, tasks, and leave summary for employees.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px', display: 'block' }}>
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">Choose Employee</option>
              {availableEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => selectedEmployee && generateMonthlyReport(selectedEmployee)}
            disabled={!selectedEmployee}
            style={{ background: selectedEmployee ? 'var(--accent)' : 'var(--bg3)', color: selectedEmployee ? '#fff' : 'var(--text3)', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: selectedEmployee ? 'pointer' : 'not-allowed', border: 'none', transition: '.15s' }}
          >
            📥 Generate Report
          </button>
        </div>

        {isAdmin && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={generateAllReports}
              style={{ background: 'var(--green)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              📦 Generate Reports for All Employees
            </button>
            <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text3)' }}>
              ({availableEmployees.length} employees)
            </span>
          </div>
        )}
      </div>

      {/* Employee List */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>👥</span>
            Available Employees
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
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {availableEmployees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.id}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{emp.name}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)', textTransform: 'capitalize' }}>{emp.department}</td>
                  <td style={{ padding: '10px 16px', fontSize: '13px', color: 'var(--text2)' }}>{emp.position}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button
                      onClick={() => generateMonthlyReport(emp.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', transition: '.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accentbg)'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
                    >
                      📄 Generate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div style={{ marginTop: '20px', background: 'var(--bluebg)', border: '1px solid var(--blue)', borderRadius: 'var(--radius2)', padding: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
          <strong style={{ color: 'var(--blue)' }}>ℹ️ Report Includes:</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '12px', lineHeight: '1.8' }}>
            <li>Employee personal information</li>
            <li>Monthly attendance summary (Present, Late, Absent, Leave)</li>
            <li>Total hours worked and average per day</li>
            <li>Performance score and rating</li>
            <li>Tasks completed and completion rate</li>
            <li>Leave requests summary</li>
            <li>Top 5 tasks of the month</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

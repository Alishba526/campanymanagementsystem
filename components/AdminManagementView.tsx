'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { AttendanceRecord, Employee } from '@/types';
import { formatDateShort, getCurrentDate } from '@/lib/dateUtils';
import Swal from 'sweetalert2';
import AttendancePage from './AttendancePage';
import EmployeesPage from './EmployeesPage';

export default function AdminManagementView() {
  const { currentUser, attendance, announcements, breakRequests } = useApp();
  const [priorityItems, setPriorityItems] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];

  if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role)) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Access Restricted</div>;
  }

  // Activity Feed Logic
  useEffect(() => {
    const recentAtt = attendance
      .filter(a => a.date === today)
      .map(a => ({ 
        id: `att-${a.id}`, 
        type: 'attendance', 
        title: 'Attendance Marked', 
        content: `${a.employeeName} (${a.status.toUpperCase()}) at ${a.checkIn} (${formatDateShort(a.date)})`,
        time: a.checkIn,
        icon: '⏰',
        color: 'var(--green)'
      }));

    const recentBreaks = (breakRequests || [])
      .filter(b => b.date === today)
      .map(b => ({
        id: `break-${b.id}`,
        type: 'break',
        title: 'Break Update',
        content: `${b.employeeName} requested break at ${b.startTime} (${formatDateShort(b.date)})`,
        time: b.startTime,
        icon: '☕',
        color: 'var(--blue)'
      }));

    const recentAnnouncements = announcements
      .slice(0, 3)
      .map(a => ({
        id: `ann-${a.id}`,
        type: 'announcement',
        title: 'Announcement',
        content: a.title,
        time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        icon: '📢',
        color: 'var(--accent)'
      }));

    const combined = [...recentAtt, ...recentBreaks, ...recentAnnouncements]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 6);

    setPriorityItems(combined);
  }, [attendance, breakRequests, announcements, today]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Portion 1: Priority Activity Feed */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius2)', padding: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔥</span> Priority Activity Feed
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          {priorityItems.length > 0 ? priorityItems.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                background: 'var(--bg3)', 
                border: `1px solid var(--border)`, 
                borderLeft: `4px solid ${item.color}`,
                borderRadius: '10px', 
                padding: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '18px' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{item.content}</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '600' }}>{item.time}</div>
            </div>
          )) : (
            <div style={{ color: 'var(--text3)', fontSize: '13px' }}>No recent activity for today.</div>
          )}
        </div>
      </div>

      {/* Portion 2: Attendance Tracker */}
      <div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⏰</span> Daily Attendance Management
        </div>
        <AttendancePage />
      </div>

      {/* Portion 3: Employee Management */}
      <div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>👥</span> Employee Directory & Records
        </div>
        <EmployeesPage />
      </div>

      <style jsx>{`
        /* Hide extra headers when nested */
        :global(.attendance-header), :global(.employees-header) {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

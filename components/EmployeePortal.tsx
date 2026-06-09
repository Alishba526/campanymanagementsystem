'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { getCurrentDate, formatTimeAMPM, formatDateShort } from '@/lib/dateUtils';
import Swal from 'sweetalert2';
import { AttendanceRecord } from '@/types';
import Loader from './Loader';

export default function EmployeePortal() {
  const { currentUser, employees, attendance, addAttendance, updateAttendance, logout } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'portal' | 'history'>('portal');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(getCurrentDate());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const employee = employees.find(e => 
    e.id === currentUser.name || e.name === currentUser.name || e.email === currentUser.email || e.id === currentUser.email
  );

  // 🛡️ SHIFT LOGIC: Find absolute latest record regardless of date
  const myAttendanceRecords = attendance.filter(a => a.employeeId === employee?.id);
  const latestSession = myAttendanceRecords.length > 0 
    ? [...myAttendanceRecords].sort((a, b) => new Date(b.date + ' ' + (b.checkIn === '--' ? '00:00' : b.checkIn)).getTime() - new Date(a.date + ' ' + (a.checkIn === '--' ? '00:00' : a.checkIn)).getTime())[0]
    : null;

  const hasActiveShift = latestSession && latestSession.checkOut === '--';
  
  // 🛡️ BOSS REQUIREMENT: 'Duty In' only allowed between 12:00 PM and 09:00 PM.
  const currentHour = currentTime.getHours();
  // Restricted if hour is >= 21 (9 PM) OR < 12 (12 PM)
  const isRestrictedTime = currentHour >= 21 || currentHour < 12;

  const myAttendance = myAttendanceRecords.filter(a => {
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || a.status.toLowerCase().includes(searchLower) || a.date.includes(searchLower);
    const isDateMatch = !filterDate || a.date === filterDate;
    return isSearchMatch && isDateMatch;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handleCheckIn = async () => {
    if (!employee) {
      Swal.fire('Error', 'Employee record not found.', 'error');
      return;
    }
    
    // 🛡️ DUPLICATION FIX: Prevent starting a shift if one is already active
    if (hasActiveShift) {
      Swal.fire('Warning', 'You already have an active shift running.', 'warning');
      return;
    }

    if (isRestrictedTime) {
      Swal.fire('Restricted', 'New shifts can only start between 12 PM and 9 PM.', 'warning');
      return;
    }

    setIsProcessing(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const newRecord: AttendanceRecord = {
      id: `ATT${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      date: getCurrentDate(),
      checkIn: timeStr,
      checkOut: '--',
      status: 'present',
      hours: 0,
      overtime: 0,
      lateEntry: note ? `Note: ${note}` : '00:00',
      earlyExit: '00:00',
      breakIn: '',
      breakOut: ''
    };

    try {
      await addAttendance(newRecord);
      setNote('');
      Swal.fire({ title: 'Shift Started', text: `Welcome, ${employee.name}.`, icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire('Error', 'Failed to start shift', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!latestSession) return;
    
    setIsProcessing(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const startDateTime = new Date(latestSession.date + ' ' + latestSession.checkIn);
    const endDateTime = new Date(); 
    let calculatedHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

    if (latestSession.breakIn && latestSession.breakOut && latestSession.breakOut !== '--') {
      const bIn = new Date(latestSession.date + ' ' + latestSession.breakIn);
      const bOut = new Date(latestSession.date + ' ' + latestSession.breakOut);
      const breakDuration = (bOut.getTime() - bIn.getTime()) / (1000 * 60 * 60);
      if (breakDuration > 0) calculatedHours -= breakDuration;
    }

    const updates: Partial<AttendanceRecord> = {
      checkOut: timeStr,
      hours: calculatedHours > 0 ? calculatedHours : 0,
      earlyExit: note ? `Note: ${note}` : latestSession.earlyExit || '00:00'
    };

    try {
      await updateAttendance(latestSession.id, updates);
      setNote('');
      Swal.fire({ title: 'Shift Ended', text: `Goodbye! Total Hours: ${calculatedHours.toFixed(2)}h`, icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (e) {
      Swal.fire('Error', 'Failed to end shift', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBreak = async (type: 'in' | 'out') => {
    if (!latestSession) return;
    
    setIsProcessing(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const updates: Partial<AttendanceRecord> = type === 'in' 
      ? { breakIn: timeStr, breakOut: '--' }
      : { breakOut: timeStr };

    try {
      await updateAttendance(latestSession.id, updates);
      Swal.fire({ title: type === 'in' ? 'Break Started' : 'Break Ended', icon: 'info', timer: 1000, showConfirmButton: false, toast: true, position:'top-end' });
    } catch (e) {
      Swal.fire('Error', 'Update failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return '#059669';
      case 'absent': return '#dc2626';
      case 'leave': return '#2563eb';
      default: return '#1e293b';
    }
  };

  const renderActionButtons = () => {
    if (hasActiveShift) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '12px', border: '1px solid #fed7aa', color: '#9a3412', fontWeight: '900', fontSize: '12px' }}>
             ⚠️ ACTIVE SHIFT: Started {formatDateShort(latestSession.date)} at {latestSession.checkIn}
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
             <button onClick={() => handleBreak('in')} disabled={isProcessing || !!latestSession.breakIn} style={{ padding: '15px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>☕ Break Start</button>
             <button onClick={() => handleBreak('out')} disabled={isProcessing || !latestSession.breakIn || (latestSession.breakOut !== '' && latestSession.breakOut !== '--')} style={{ padding: '15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>🔄 Break End</button>
           </div>
           <textarea placeholder="End shift note..." value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', height: '80px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px', padding: '15px', outline: 'none', fontWeight:'900' }} />
           <button onClick={handleCheckOut} disabled={isProcessing || (!!latestSession.breakIn && latestSession.breakOut === '--')} style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '18px', padding: '20px', fontSize: '20px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(220,38,38,0.2)' }}>⏹️ FINISH DUTY</button>
        </div>
      );
    }

    if (isRestrictedTime) {
      return (
        <div style={{ padding: '30px', background: '#fef2f2', borderRadius: '20px', border: '1px solid #fecaca', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>🕒</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>Shift Start Restricted</div>
          <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: '900', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            New sessions are ONLY permitted between:<br/>
            <span style={{ fontSize: '16px', display: 'block', marginTop: '5px' }}>12:00 PM — 09:00 PM</span>
          </div>
          <div style={{ fontSize: '10px', color: '#7f1d1d', marginTop: '15px', fontStyle: 'italic' }}>Please wait for the next official window to start your duty.</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
         <textarea placeholder="Morning note (Optional)..." value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', height: '80px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px', padding: '15px', outline: 'none', fontWeight:'900' }} />
         <button onClick={handleCheckIn} disabled={isProcessing} style={{ width: '100%', background: '#059669', color: '#fff', border: 'none', borderRadius: '18px', padding: '20px', fontSize: '20px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(5, 150, 105, 0.2)' }}>▶ START DUTY</button>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1000px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>🚀</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Employee Duty Portal</h2>
            <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '900' }}>{view === 'portal' ? 'Personal Command Center' : 'Historical Records'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setView('portal')} style={{ background: view === 'portal' ? 'var(--accent)' : '#f1f5f9', color: view === 'portal' ? '#fff' : '#1e293b', border: 'none', padding: '8px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}>Dashboard</button>
          <button onClick={() => setView('history')} style={{ background: view === 'history' ? 'var(--accent)' : '#f1f5f9', color: view === 'history' ? '#fff' : '#1e293b', border: 'none', padding: '8px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}>My History</button>
          <button onClick={logout} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '900' }}>🚪 Exit</button>
        </div>
      </div>

      {view === 'portal' ? (
        <div style={{ width: '100%', maxWidth: '500px', marginTop: '20px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '30px', padding: '40px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '20px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px' }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a' }}>
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </div>
            </div>
            <div style={{ textAlign: 'left', background: '#eff6ff', padding: '20px', borderRadius: '20px', marginBottom: '25px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '11px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: '900', marginBottom: '4px' }}>Logged Profile:</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e40af' }}>{employee?.name || currentUser.name}</div>
              <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '900', marginTop: '5px' }}>ID: {employee?.id || 'N/A'} • {employee?.position || 'Personnel'}</div>
            </div>
            {renderActionButtons()}
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '1000px', background: '#fff', borderRadius: '24px', padding: '30px', boxShadow: 'var(--shadow)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Work History Ledger</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#0f172a', fontWeight: '900' }}>DATE</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#0f172a', fontWeight: '900' }}>IN TIME</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#0f172a', fontWeight: '900' }}>OUT TIME</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#0f172a', fontWeight: '900' }}>HOURS</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: '#0f172a', fontWeight: '900' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{formatDateShort(rec.date)}</td>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: '900', color: '#059669' }}>{formatTimeAMPM(rec.checkIn)}</td>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: '900', color: '#dc2626' }}>{rec.checkOut === '--' ? '--' : formatTimeAMPM(rec.checkOut)}</td>
                    <td style={{ padding: '12px', fontSize: '12px', fontWeight: '900', color: '#1e40af' }}>{rec.hours.toFixed(2)}h</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                       <span style={{ fontSize: '9px', fontWeight: '900', padding: '3px 10px', borderRadius: '6px', background: `${getStatusColor(rec.status)}15`, color: getStatusColor(rec.status), border: `1px solid ${getStatusColor(rec.status)}30` }}>{rec.status.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

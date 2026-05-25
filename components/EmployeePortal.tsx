'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { getCurrentDate, formatTimeAMPM, formatDateShort } from '@/lib/dateUtils';
import Swal from 'sweetalert2';
import { AttendanceRecord } from '@/types';

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

  // Find the employee record linked to this user (More robust matching)
  const employee = employees.find(e => 
    e.id === currentUser.id || 
    e.email === currentUser.email || 
    e.id === currentUser.email
  );

  const today = getCurrentDate();
  const todayRecord = attendance.find(a => a.employeeId === employee?.id && a.date === today);

  // Filter attendance for history
  const myAttendance = attendance.filter(a => {
    const isMe = a.employeeId === employee?.id;
    const searchLower = searchQuery.toLowerCase();
    const isSearchMatch = !searchQuery || a.status.toLowerCase().includes(searchLower) || a.date.includes(searchLower);
    const isDateMatch = !filterDate || a.date === filterDate;
    
    return isMe && isSearchMatch && isDateMatch;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handleCheckIn = async () => {
    if (!employee) {
      Swal.fire('Error', 'Employee record not found. Please contact admin.', 'error');
      return;
    }
    
    setIsProcessing(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const newRecord: AttendanceRecord = {
      id: `ATT${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      date: today,
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
      Swal.fire({
        title: 'Checked In!',
        text: `Welcome, ${employee.name}. Time: ${formatTimeAMPM(timeStr)}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire('Error', 'Failed to record attendance', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;
    
    setIsProcessing(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const [inH, inM] = todayRecord.checkIn.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    let calculatedHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;

    if (todayRecord.breakIn && todayRecord.breakOut && todayRecord.breakOut !== '--') {
      const [binH, binM] = todayRecord.breakIn.split(':').map(Number);
      const [boutH, boutM] = todayRecord.breakOut.split(':').map(Number);
      const breakDuration = ((boutH * 60 + boutM) - (binH * 60 + binM)) / 60;
      if (breakDuration > 0) calculatedHours -= breakDuration;
    }

    const updates: Partial<AttendanceRecord> = {
      checkOut: timeStr,
      hours: calculatedHours > 0 ? calculatedHours : 0,
      earlyExit: note ? `Note: ${note}` : todayRecord.earlyExit || '00:00'
    };

    try {
      await updateAttendance(todayRecord.id, updates);
      setNote('');
      Swal.fire({
        title: 'Checked Out!',
        text: `Goodbye, ${employee?.name}. Shift completed.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire('Error', 'Failed to record check-out', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBreak = async (type: 'in' | 'out') => {
    if (!todayRecord) return;
    
    setIsProcessing(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const updates: Partial<AttendanceRecord> = type === 'in' 
      ? { breakIn: timeStr, breakOut: '--' }
      : { breakOut: timeStr };

    try {
      await updateAttendance(todayRecord.id, updates);
      Swal.fire({
        title: type === 'in' ? 'Break Started' : 'Break Ended',
        text: `${type === 'in' ? 'Rest well!' : 'Welcome back!'} Time: ${formatTimeAMPM(timeStr)}`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire('Error', 'Failed to update break status', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return '#059669';
      case 'late': return '#f59e0b';
      case 'absent': return '#dc2626';
      case 'leave': return '#2563eb';
      case 'half-day': return '#7c3aed';
      default: return 'var(--text3)';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      
      {/* Standardized Header */}
      <div style={{ width: '100%', maxWidth: '1000px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px 25px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: 'var(--shadow)', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' }}>🚀</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>Employee Portal</h2>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>{view === 'portal' ? 'Personal Dashboard' : 'My Attendance History'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '12px' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px 8px 30px', color: 'var(--text)', outline: 'none', width: '180px', fontSize: '12px' }}
            />
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)', outline: 'none', fontSize: '12px', fontWeight: 'bold' }} />
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
            <button onClick={() => setView('portal')} style={{ background: view === 'portal' ? 'var(--accent)' : 'transparent', color: view === 'portal' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>Dashboard</button>
            <button onClick={() => setView('history')} style={{ background: view === 'history' ? 'var(--accent)' : 'transparent', color: view === 'history' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }}>My Records</button>
          </div>
          <button onClick={logout} style={{ background: 'var(--bg3)', color: 'var(--red)', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🚪 Logout</button>
        </div>

        {view === 'portal' ? (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '30px', width: '100%', maxWidth: '500px', padding: '40px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
              
              <div style={{ background: 'var(--bg3)', borderRadius: '20px', padding: '20px', marginBottom: '30px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--accent)' }}>
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
              </div>

              <div style={{ textAlign: 'left', background: 'var(--bg3)', padding: '15px', borderRadius: '15px', marginBottom: '25px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '900', opacity: 0.7 }}>Logged in as:</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)' }}>{employee?.name || currentUser.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700', textTransform: 'capitalize', marginTop: '2px' }}>ID: {employee?.id || 'N/A'} • {employee?.position || 'Employee'}</div>
              </div>

              {!todayRecord ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <textarea 
                    placeholder="Morning note (Optional)..." 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)}
                    style={{ width: '100%', height: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '15px', padding: '15px', color: 'var(--text)', outline: 'none', resize: 'none', fontSize: '14px' }}
                  />
                  <button onClick={handleCheckIn} disabled={isProcessing} style={{ width: '100%', background: '#059669', color: '#fff', border: 'none', borderRadius: '15px', padding: '18px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(5, 150, 105, 0.2)' }}>
                    {isProcessing ? 'Processing...' : '▶ Duty In'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '900' }}>CHECK IN</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#059669' }}>{formatTimeAMPM(todayRecord.checkIn)}</div>
                    </div>
                    <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '900' }}>CHECK OUT</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: todayRecord.checkOut === '--' ? 'var(--text3)' : '#dc2626' }}>{todayRecord.checkOut === '--' ? '--:--' : formatTimeAMPM(todayRecord.checkOut)}</div>
                    </div>
                  </div>

                  {todayRecord.checkOut === '--' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <button 
                          onClick={() => handleBreak('in')} 
                          disabled={isProcessing || !!todayRecord.breakIn} 
                          style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: !!todayRecord.breakIn ? 0.5 : 1 }}
                        >
                          ☕ Break Start
                        </button>
                        <button 
                          onClick={() => handleBreak('out')} 
                          disabled={isProcessing || !todayRecord.breakIn || (todayRecord.breakOut !== '' && todayRecord.breakOut !== '--')} 
                          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!todayRecord.breakIn || (todayRecord.breakOut !== '' && todayRecord.breakOut !== '--')) ? 0.5 : 1 }}
                        >
                          🔄 Break End
                        </button>
                      </div>
                      {todayRecord.breakIn && todayRecord.breakOut === '--' && (
                        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '900', animation: 'pulse 2s infinite' }}>⚠️ Currently on Break</div>
                      )}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                        <textarea placeholder="End shift note..." value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', height: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '15px', padding: '15px', color: 'var(--text)', outline: 'none', resize: 'none', fontSize: '14px', marginBottom: '15px' }} />
                        <button onClick={handleCheckOut} disabled={isProcessing || !!(todayRecord.breakIn && todayRecord.breakOut === '--')} style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '15px', padding: '18px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(220, 38, 38, 0.2)' }}>
                          {isProcessing ? 'Processing...' : '■ Duty Out'}
                        </button>
                      </div>
                    </div>
                  )}

                  {todayRecord.checkOut !== '--' && (
                    <div style={{ background: 'var(--bluebg)', color: 'var(--blue)', padding: '20px', borderRadius: '15px', border: '1px solid var(--blue)44' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900' }}>✅ Shift Completed</div>
                      <div style={{ fontSize: '13px', marginTop: '5px', fontWeight: 'bold' }}>Total Hours: {todayRecord.hours.toFixed(2)}h</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', width: '100%', padding: '25px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Attendance History Ledger
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Check In</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Check Out</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Hours</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.1s' }}>
                      <td style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text)', fontWeight: 'bold' }}>{formatDateShort(rec.date)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#059669', fontWeight: '900' }}>{formatTimeAMPM(rec.checkIn)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: rec.checkOut === '--' ? 'var(--text3)' : '#dc2626', fontWeight: '900' }}>{rec.checkOut === '--' ? '--' : formatTimeAMPM(rec.checkOut)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text)', fontWeight: '900' }}>{rec.hours.toFixed(2)}h</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', background: `${getStatusColor(rec.status)}15`, color: getStatusColor(rec.status), border: `1px solid ${getStatusColor(rec.status)}33` }}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {myAttendance.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>No matching records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}

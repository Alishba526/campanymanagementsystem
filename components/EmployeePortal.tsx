'use client';

import { useApp } from '@/context/AppContext';
import { useState, useEffect } from 'react';
import { getCurrentDate, formatTimeAMPM } from '@/lib/dateUtils';
import Swal from 'sweetalert2';
import { AttendanceRecord } from '@/types';

export default function EmployeePortal() {
  const { currentUser, employees, attendance, addAttendance, updateAttendance, logout } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'portal' | 'history'>('portal');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  // Find the employee record linked to this user
  const employee = employees.find(e => e.email === currentUser.email || e.id === currentUser.email || e.name === currentUser.name);
  const today = getCurrentDate();
  const todayRecord = attendance.find(a => a.employeeId === employee?.id && a.date === today);

  // Filter attendance for this specific employee
  const myAttendance = attendance.filter(a => a.employeeId === employee?.id).sort((a, b) => b.date.localeCompare(a.date));

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
        text: `Welcome, ${employee.name}. Your check-in time is ${formatTimeAMPM(timeStr)}`,
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
    
    // Calculate hours
    const [inH, inM] = todayRecord.checkIn.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    let calculatedHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;

    // Subtract break time if exists
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      
      {/* Top Navbar */}
      <div style={{ width: '100%', maxWidth: '1000px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>🚀</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>GROWZIX PRO</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>Employee Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setView('portal')} style={{ background: view === 'portal' ? 'var(--accent)' : 'transparent', color: view === 'portal' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Dashboard</button>
          <button onClick={() => setView('history')} style={{ background: view === 'history' ? 'var(--accent)' : 'transparent', color: view === 'history' ? '#fff' : 'var(--text2)', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>My Records</button>
          <button onClick={logout} style={{ background: 'var(--bg3)', color: 'var(--red)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>🚪 Logout</button>
        </div>
      </div>

      {view === 'portal' ? (
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
            <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '4px' }}>Logged in as:</div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text)' }}>{currentUser.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', textTransform: 'capitalize' }}>ID: {employee?.id || 'N/A'} • {employee?.position || 'Employee'}</div>
          </div>

          {!todayRecord ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <textarea 
                placeholder="Morning note (Optional)..." 
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                style={{ width: '100%', height: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '15px', padding: '15px', color: 'var(--text)', outline: 'none', resize: 'none', fontSize: '14px' }}
              />
              <button 
                onClick={handleCheckIn} 
                disabled={isProcessing}
                style={{ width: '100%', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '15px', padding: '18px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)', transition: '0.3s' }}
              >
                {isProcessing ? 'Processing...' : '▶ Duty In'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>CHECK IN</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--green)' }}>{formatTimeAMPM(todayRecord.checkIn)}</div>
                </div>
                <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>CHECK OUT</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: todayRecord.checkOut === '--' ? 'var(--text3)' : 'var(--red)' }}>{todayRecord.checkOut === '--' ? '--:--' : formatTimeAMPM(todayRecord.checkOut)}</div>
                </div>
              </div>

              {todayRecord.checkOut === '--' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
                  {/* Break Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <button 
                      onClick={() => handleBreak('in')}
                      disabled={isProcessing || !!(todayRecord.breakIn && todayRecord.breakOut === '--')}
                      style={{ background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!!todayRecord.breakIn && todayRecord.breakOut === '--') ? 0.5 : 1 }}
                    >
                      ☕ Break Start
                    </button>
                    <button 
                      onClick={() => handleBreak('out')}
                      disabled={isProcessing || !!(!todayRecord.breakIn || todayRecord.breakOut !== '--')}
                      style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: (!todayRecord.breakIn || todayRecord.breakOut !== '--') ? 0.5 : 1 }}
                    >
                      🔄 Break End
                    </button>
                  </div>

                  {todayRecord.breakIn && todayRecord.breakOut === '--' && (
                    <div style={{ fontSize: '13px', color: 'var(--amber)', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                      ⚠️ Currently on Break
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                    <textarea 
                      placeholder="End of shift note (Optional)..." 
                      value={note} 
                      onChange={(e) => setNote(e.target.value)}
                      style={{ width: '100%', height: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '15px', padding: '15px', color: 'var(--text)', outline: 'none', resize: 'none', fontSize: '14px', marginBottom: '15px' }}
                    />
                    <button 
                      onClick={handleCheckOut} 
                      disabled={isProcessing || !!(todayRecord.breakIn && todayRecord.breakOut === '--')}
                      style={{ width: '100%', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: '15px', padding: '18px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)', transition: '0.3s', opacity: (todayRecord.breakIn && todayRecord.breakOut === '--') ? 0.5 : 1 }}
                    >
                      {isProcessing ? 'Processing...' : '■ Duty Out'}
                    </button>
                  </div>
                </div>
              )}

              {todayRecord.checkOut !== '--' && (
                <div style={{ background: 'var(--bluebg)', color: 'var(--blue)', padding: '20px', borderRadius: '15px', border: '1px solid var(--blue)44' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>✅ Shift Completed</div>
                  <div style={{ fontSize: '13px', marginTop: '5px' }}>Total Hours: {todayRecord.hours.toFixed(2)}h</div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '30px', width: '100%', maxWidth: '800px', padding: '30px', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📊</span> Attendance & Performance History
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text3)' }}>Date</th>
                  <th style={{ padding: '12px', color: 'var(--text3)' }}>Check In</th>
                  <th style={{ padding: '12px', color: 'var(--text3)' }}>Check Out</th>
                  <th style={{ padding: '12px', color: 'var(--text3)' }}>Break</th>
                  <th style={{ padding: '12px', color: 'var(--text3)' }}>Hours</th>
                  <th style={{ padding: '12px', color: 'var(--text3)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No records found.</td>
                  </tr>
                ) : (
                  myAttendance.map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', color: 'var(--text)', fontWeight: '600' }}>{rec.date}</td>
                      <td style={{ padding: '12px', color: 'var(--green)' }}>{formatTimeAMPM(rec.checkIn)}</td>
                      <td style={{ padding: '12px', color: rec.checkOut === '--' ? 'var(--text3)' : 'var(--red)' }}>{rec.checkOut === '--' ? '--' : formatTimeAMPM(rec.checkOut)}</td>
                      <td style={{ padding: '12px', color: 'var(--amber)' }}>{rec.breakIn ? 'Used' : 'None'}</td>
                      <td style={{ padding: '12px', color: 'var(--text)' }}>{rec.hours.toFixed(2)}h</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: 'bold',
                          background: rec.status === 'present' ? 'var(--greenbg)' : rec.status === 'late' ? 'var(--amberbg)' : 'var(--bg3)',
                          color: rec.status === 'present' ? 'var(--green)' : rec.status === 'late' ? 'var(--amber)' : 'var(--text2)'
                        }}>
                          {rec.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}


'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog, LeaveRequest, Announcement, Project, MonthlySchedule, Bill, Notification, BreakRequest, Department } from '@/types';
import * as actions from '@/lib/actions';
import Swal from 'sweetalert2';

export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'teal' | 'light';
export type ThemeMode = 'light' | 'dark';

interface AppContextType {
  currentUser: User | null;
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: TaskLog[];
  expenses: Expense[];
  income: Income[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  leaveRequests: LeaveRequest[];
  breakRequests: BreakRequest[];
  departments: Department[];
  announcements: Announcement[];
  projects: Project[];
  schedules: MonthlySchedule[];
  bills: Bill[];
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addAttendance: (record: AttendanceRecord) => Promise<void>;
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  addTask: (task: TaskLog) => Promise<void>;
  updateTask: (id: string, task: Partial<TaskLog>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addAuditLog: (action: string) => Promise<void>;
  addNotification: (notif: Partial<Notification>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addLeaveRequest: (request: LeaveRequest) => Promise<void>;
  updateLeaveRequest: (id: string, request: Partial<LeaveRequest>) => Promise<void>;
  deleteLeaveRequest: (id: string) => Promise<void>;
  addBreakRequest: (request: BreakRequest) => Promise<void>;
  updateBreakRequest: (id: string, request: Partial<BreakRequest>) => Promise<void>;
  addDepartment: (name: string) => Promise<void>;
  updateDepartment: (id: string, name: string) => Promise<void>;
  addAnnouncement: (announcement: Announcement) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMonthlySchedule: (schedule: MonthlySchedule) => Promise<void>;
  updateMonthlySchedule: (id: string, schedule: Partial<MonthlySchedule>) => Promise<void>;
  deleteMonthlySchedule: (id: string) => Promise<void>;
  addBill: (bill: Bill) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const themeColors = {
  purple: {
    light: { primary: '#7c3aed', secondary: '#a78bfa', accentBg: '#f5f3ff', bg: '#fafafa', bg2: '#f5f5f5', bg3: '#e5e5e5', bg4: '#d4d4d4', text: '#1e293b', text2: '#475569', text3: '#538ddf', border: '#e2e8f0', border2: '#cbd5e1' },
    dark: { primary: '#a78bfa', secondary: '#7c3aed', accentBg: '#010002', bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', bg4: '#475569', text: '#f1f5f9', text2: '#cbd5e1', text3: '#64748b', border: '#334155', border2: '#475569' }
  },
  blue: {
    light: { primary: '#2563eb', secondary: '#60a5fa', accentBg: '#eff6ff', bg: '#fafafa', bg2: '#f5f5f5', bg3: '#e5e5e5', bg4: '#d4d4d4', text: '#1e293b', text2: '#475569', text3: '#94a3b8', border: '#e2e8f0', border2: '#cbd5e1' },
    dark: { primary: '#60a5fa', secondary: '#2563eb', accentBg: '#1e3a8a', bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', bg4: '#475569', text: '#f1f5f9', text2: '#cbd5e1', text3: '#64748b', border: '#334155', border2: '#475569' }
  },
  green: {
    light: { primary: '#059669', secondary: '#34d399', accentBg: '#ecfdf5', bg: '#fafafa', bg2: '#f5f5f5', bg3: '#e5e5e5', bg4: '#d4d4d4', text: '#1e293b', text2: '#475569', text3: '#94a3b8', border: '#e2e8f0', border2: '#cbd5e1' },
    dark: { primary: '#34d399', secondary: '#059669', accentBg: '#064e3b', bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', bg4: '#475569', text: '#f1f5f9', text2: '#cbd5e1', text3: '#64748b', border: '#334155', border2: '#475569' }
  },
  orange: {
    light: { primary: '#ea580c', secondary: '#fb923c', accentBg: '#fff7ed', bg: '#fafafa', bg2: '#f5f5f5', bg3: '#e5e5e5', bg4: '#d4d4d4', text: '#1e293b', text2: '#475569', text3: '#94a3b8', border: '#e2e8f0', border2: '#cbd5e1' },
    dark: { primary: '#fb923c', secondary: '#ea580c', accentBg: '#7c2d12', bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', bg4: '#475569', text: '#f1f5f9', text2: '#cbd5e1', text3: '#64748b', border: '#334155', border2: '#475569' }
  },
  red: {
    light: { primary: '#dc2626', secondary: '#f87171', accentBg: '#fef2f2', bg: '#fafafa', bg2: '#f5f5f5', bg3: '#e5e5e5', bg4: '#d4d4d4', text: '#1e293b', text2: '#475569', text3: '#94a3b8', border: '#e2e8f0', border2: '#cbd5e1' },
    dark: { primary: '#f87171', secondary: '#dc2626', accentBg: '#7f1d1d', bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', bg4: '#475569', text: '#f1f5f9', text2: '#cbd5e1', text3: '#64748b', border: '#334155', border2: '#475569' }
  },
  teal: {
    light: { primary: '#0d9488', secondary: '#2dd4bf', accentBg: '#f0fdfa', bg: '#fafafa', bg2: '#f5f5f5', bg3: '#e5e5e5', bg4: '#d4d4d4', text: '#1e293b', text2: '#475569', text3: '#94a3b8', border: '#e2e8f0', border2: '#cbd5e1' },
    dark: { primary: '#2dd4bf', secondary: '#0d9488', accentBg: '#134e4a', bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', bg4: '#475569', text: '#f1f5f9', text2: '#cbd5e1', text3: '#64748b', border: '#334155', border2: '#475569' }
  },
  light: {
    light: { primary: '#6366f1', secondary: '#818cf8', accentBg: '#eef2ff', bg: '#ffffff', bg2: '#f9fafb', bg3: '#f3f4f6', bg4: '#e5e7eb', text: '#1e293b', text2: '#475569', text3: '#94a3b8', border: '#e2e8f0', border2: '#cbd5e1' },
    dark: { primary: '#818cf8', secondary: '#6366f1', accentBg: '#312e81', bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', bg4: '#475569', text: '#f1f5f9', text2: '#cbd5e1', text3: '#64748b', border: '#334155', border2: '#475569' }
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [tasks, setTasks] = useState<TaskLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [breakRequests, setBreakRequests] = useState<BreakRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<MonthlySchedule[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [themeColor, setThemeColorState] = useState<ThemeColor>('light');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);
  const lastNotifIdRef = useRef<string | null>(null);

  // Audio Notification Helper
  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 1.0;
      audio.play().catch(e => console.log('Audio blocked:', e));
    } catch (e) {
      console.log('Error playing sound:', e);
    }
  };

  const showToast = (title: string, text: string, icon: any = 'info') => {
    Swal.fire({
      title, text, icon, toast: true, position: 'top', showConfirmButton: false, timer: 4500, timerProgressBar: true,
      background: 'var(--bg2)', color: 'var(--text)',
      customClass: { popup: 'tiktok-toast', title: 'tiktok-title', htmlContainer: 'tiktok-content' }
    });
  };

  const hasInitializedNotifs = useRef(false);

  const fetchData = async () => {
    try {
      const [empData, attData, taskData, expData, incData, logData, leaveData, announceData, projectData, scheduleData, billData, notifData, breakData, deptData] = await Promise.all([
        actions.getEmployees(), actions.getAttendance(), actions.getTasks(), actions.getExpenses(), actions.getIncome(), actions.getAuditLogs(),
        actions.getLeaveRequests(), actions.getAnnouncements(), actions.getProjects(), actions.getMonthlySchedules(), actions.getBills(), actions.getNotifications(),
        actions.getBreakRequests(), actions.getDepartments()
      ]);

      setEmployees(empData as Employee[]);
      setAttendance(attData as AttendanceRecord[]);
      setTasks(taskData as TaskLog[]);
      setExpenses(expData as any);
      setIncome(incData as Income[]);
      setAuditLogs(logData as AuditLog[]);
      setBreakRequests(breakData as BreakRequest[]);
      setDepartments(deptData as Department[]);
      
      const newNotifs = notifData as Notification[];
      if (newNotifs && newNotifs.length > 0) {
        const latest = newNotifs[0];
        const savedUser = localStorage.getItem('growzix-user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        if (user) {
          if (!hasInitializedNotifs.current) {
            lastNotifIdRef.current = latest.id;
            hasInitializedNotifs.current = true;
          } else if (latest.id !== lastNotifIdRef.current) {
            const isRecipient = latest.recipient === 'all' || ['admin', 'superadmin'].includes(user.role) || latest.recipient === user.role;
            if (isRecipient && latest.sender !== user.name) {
              playNotificationSound();
              showToast(latest.title, latest.message, latest.type);
            }
            lastNotifIdRef.current = latest.id;
          }
        }
      }
      
      setNotifications(newNotifs || []);
      setLeaveRequests(leaveData as LeaveRequest[]);
      setAnnouncements(announceData as Announcement[]);
      setProjects(projectData as Project[]);
      setSchedules(scheduleData as MonthlySchedule[]);
      setBills(billData as Bill[]);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    const savedUser = localStorage.getItem('growzix-user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    const savedTheme = localStorage.getItem('growzix-theme') as ThemeColor;
    const savedMode = localStorage.getItem('growzix-theme-mode') as ThemeMode;
    if (savedTheme) setThemeColorState(savedTheme);
    if (savedMode) setThemeModeState(savedMode);
    applyTheme(savedTheme || 'light', savedMode || 'light');
    return () => clearInterval(interval);
  }, []);

  const applyTheme = (color: ThemeColor, mode: ThemeMode) => {
    const theme = themeColors[color][mode];
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '124, 58, 237';
    };
    document.documentElement.style.setProperty('--accent-rgb', hexToRgb(theme.primary));
    document.documentElement.style.setProperty('--green', '#10b981');
    document.documentElement.style.setProperty('--greenbg', mode === 'dark' ? '#064e3b' : '#d1fae5');
    document.documentElement.style.setProperty('--red', '#ef4444');
    document.documentElement.style.setProperty('--redbg', mode === 'dark' ? '#7f1d1d' : '#fee2e2');
    document.documentElement.style.setProperty('--blue', '#3b82f6');
    document.documentElement.style.setProperty('--bluebg', mode === 'dark' ? '#1e3a8a' : '#dbeafe');
    document.documentElement.style.setProperty('--amber', '#f59e0b');
    document.documentElement.style.setProperty('--amberbg', mode === 'dark' ? '#78350f' : '#fef3c7');
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    applyTheme(color, themeMode);
    localStorage.setItem('growzix-theme', color);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyTheme(themeColor, mode);
    localStorage.setItem('growzix-theme-mode', mode);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = await actions.getUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      const userData: User = { email: user.email, password: user.password, role: user.role as any, name: user.name };
      setCurrentUser(userData);
      localStorage.setItem('growzix-user', JSON.stringify(userData));
      await addAuditLog(`${user.name} logged in`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) addAuditLog(`${currentUser.name} logged out`);
    setCurrentUser(null);
    localStorage.removeItem('growzix-user');
  };

  const addAuditLog = async (action: string) => {
    const log: AuditLog = { id: `AL${Date.now()}`, timestamp: new Date().toLocaleString('en-PK'), user: currentUser?.name || 'System', action };
    await actions.addAuditLogAction(log);
    setAuditLogs(prev => [log, ...prev]);
  };

  const addNotification = async (notif: Partial<Notification>) => {
    const fullNotif = { ...notif, sender: currentUser?.name || 'System', createdAt: new Date() };
    const result = await actions.addNotificationAction(fullNotif);
    if (result) setNotifications(prev => [result as any, ...prev]);
  };

  const markNotificationAsRead = async (id: string) => {
    await actions.markNotificationReadAction(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    const recipient = ['admin', 'superadmin'].includes(currentUser.role) ? 'admin' : currentUser.role;
    await actions.markAllNotificationsReadAction(recipient);
    setNotifications(prev => prev.map(n => (n.recipient === recipient || n.recipient === 'all') ? { ...n, read: true } : n));
  };

  const addEmployee = async (employee: Employee) => {
    await actions.addEmployeeAction(employee);
    setEmployees(prev => [employee, ...prev]);
    const msg = `New employee registered: ${employee.name}`;
    await addAuditLog(msg);
    await addNotification({ title: 'New Employee', message: msg, type: 'success', recipient: 'admin' });
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    await actions.updateEmployeeAction(id, updates);
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    await addAuditLog(`Updated employee: ${id}`);
  };

  const deleteEmployee = async (id: string) => {
    await actions.deleteEmployeeAction(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    await addAuditLog(`Deleted employee: ${id}`);
  };

  const addAttendance = async (record: AttendanceRecord) => {
    await actions.addAttendanceAction(record);
    setAttendance(prev => [record, ...prev]);
    const msg = `Attendance marked for: ${record.employeeName}`;
    await addAuditLog(msg);
    await addNotification({ title: 'Attendance Alert', message: msg, type: 'info', recipient: 'admin' });
  };

  const updateAttendance = async (id: string, updates: Partial<AttendanceRecord>) => {
    await actions.updateAttendanceAction(id, updates);
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAttendance = async (id: string) => {
    await actions.deleteAttendanceAction(id);
    setAttendance(prev => prev.filter(a => a.id !== id));
  };

  const addTask = async (task: TaskLog) => {
    await actions.addTaskAction(task);
    setTasks(prev => [task, ...prev]);
    await addAuditLog(`Performance logged for ${task.employeeName}`);
  };

  const updateTask = async (id: string, updates: Partial<TaskLog>) => {
    await actions.updateTaskAction(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    await actions.deleteTaskAction(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addExpense = async (expense: Expense) => {
    await actions.addExpenseAction(expense);
    setExpenses(prev => [expense, ...prev]);
    const msg = `New expense submitted: Rs.${expense.amount.toLocaleString()}`;
    await addAuditLog(msg);
    await addNotification({ title: '💰 Expense Alert', message: msg, type: 'warning', recipient: 'admin' });
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    await actions.updateExpenseAction(id, updates);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = async (id: string) => {
    await actions.deleteExpenseAction(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addIncome = async (inc: Income) => {
    await actions.addIncomeAction(inc);
    setIncome(prev => [inc, ...prev]);
  };

  const deleteIncome = async (id: string) => {
    await actions.deleteIncomeAction(id);
    setIncome(prev => prev.filter(i => i.id !== id));
  };

  const addLeaveRequest = async (request: LeaveRequest) => {
    await actions.addLeaveRequestAction(request);
    setLeaveRequests(prev => [request, ...prev]);
    const msg = `New leave request from ${request.employeeName}`;
    await addAuditLog(msg);
    await addNotification({ title: '📅 Leave Request', message: msg, type: 'info', recipient: 'admin' });
  };

  const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>) => {
    await actions.updateLeaveRequestAction(id, updates);
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLeaveRequest = async (id: string) => {
    await actions.deleteLeaveRequestAction(id);
    setLeaveRequests(prev => prev.filter(l => l.id !== id));
  };

  const addBreakRequest = async (request: BreakRequest) => {
    await actions.addBreakRequestAction(request);
    setBreakRequests(prev => [request, ...prev]);
    const msg = `New break request from ${request.employeeName}`;
    await addAuditLog(msg);
    await addNotification({ title: '☕ Break Request', message: msg, type: 'info', recipient: 'admin' });
  };

  const updateBreakRequest = async (id: string, updates: Partial<BreakRequest>) => {
    await actions.updateBreakRequestAction(id, updates);
    setBreakRequests(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addDepartment = async (name: string) => {
    const result = await actions.addDepartmentAction(name);
    if (result) setDepartments(prev => [...prev, result as any]);
  };

  const updateDepartment = async (id: string, name: string) => {
    await actions.updateDepartmentAction(id, name);
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const addAnnouncement = async (announcement: Announcement) => {
    await actions.addAnnouncementAction(announcement);
    setAnnouncements(prev => [announcement, ...prev]);
    await addNotification({ title: '📢 New Announcement', message: announcement.title, type: 'info', recipient: 'all' });
  };

  const deleteAnnouncement = async (id: string) => {
    await actions.deleteAnnouncementAction(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const addProject = async (project: Project) => {
    await actions.addProjectAction(project);
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await actions.updateProjectAction(id, updates);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = async (id: string) => {
    await actions.deleteProjectAction(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addMonthlySchedule = async (schedule: MonthlySchedule) => {
    await actions.addMonthlyScheduleAction(schedule);
    setSchedules(prev => [schedule, ...prev]);
  };

  const updateMonthlySchedule = async (id: string, updates: Partial<MonthlySchedule>) => {
    await actions.updateMonthlyScheduleAction(id, updates);
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteMonthlySchedule = async (id: string) => {
    await actions.deleteMonthlyScheduleAction(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const addBill = async (bill: Bill) => {
    await actions.addBillAction(bill);
    setBills(prev => [bill, ...prev]);
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    await actions.updateBillAction(id, updates);
    setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBill = async (id: string) => {
    await actions.deleteBillAction(id);
    setBills(prev => prev.filter(b => b.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser, employees, attendance, tasks, expenses, income, auditLogs, notifications, leaveRequests, breakRequests, departments, announcements, projects, schedules, bills,
      themeColor, themeMode, isLoading, login, logout, addEmployee, updateEmployee, deleteEmployee, addAttendance, updateAttendance, deleteAttendance,
      addTask, updateTask, deleteTask, addExpense, updateExpense, deleteExpense, addIncome, deleteIncome, addAuditLog, addNotification, markNotificationAsRead,
      markAllNotificationsAsRead, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, addBreakRequest, updateBreakRequest, addDepartment, updateDepartment,
      addAnnouncement, deleteAnnouncement, addProject, updateProject, deleteProject, addMonthlySchedule, updateMonthlySchedule, deleteMonthlySchedule, addBill, updateBill, deleteBill,
      setThemeColor, setThemeMode
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

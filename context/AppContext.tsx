'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog, LeaveRequest, Announcement, Project, MonthlySchedule, Bill, Notification, BreakRequest, Department } from '@/types';
import { users as initialUsers } from '@/lib/data';
import * as actions from '@/lib/actions';
import Swal from 'sweetalert2';

export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'teal' | 'light';
export type ThemeMode = 'light' | 'dark';

interface AppContextType {
  currentUser: User | null;
  users: User[];
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
  fetchData: () => Promise<void>;
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
  updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addAuditLog: (action: string) => Promise<void>;
  addNotification: (notif: Partial<Notification>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markCategoryNotificationsAsRead: (category: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addLeaveRequest: (request: LeaveRequest) => Promise<void>;
  updateLeaveRequest: (id: string, request: Partial<LeaveRequest>) => Promise<void>;
  deleteLeaveRequest: (id: string) => Promise<void>;
  addBreakRequest: (request: BreakRequest) => Promise<void>;
  updateBreakRequest: (id: string, request: Partial<BreakRequest>) => Promise<void>;
  addDepartment: (name: string) => Promise<void>;
  updateDepartment: (id: string, name: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addAnnouncement: (announcement: Announcement) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  markAnnouncementAsRead: (id: string, name: string, role: string) => Promise<void>;
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
  const [users, setUsers] = useState<User[]>(initialUsers); 
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

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const showToast = (title: string, text: string, icon: any = 'info') => {
    Swal.fire({
      title, text, icon, toast: true, position: 'top', showConfirmButton: false, timer: 4500, timerProgressBar: true,
      background: 'var(--bg2)', color: 'var(--text)'
    });
  };

  const hasInitializedNotifs = useRef(false);
  const lastProcessedDateRef = useRef<string>('');
  const pendingProjectUpdates = useRef<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      const savedUser = localStorage.getItem('growzix-user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const isAdmin = user && ['admin', 'superadmin'].includes(user.role);

      const [empData, attData, taskData, expData, incData, logData, leaveData, announceData, projectData, scheduleData, billData, notifData, breakData, deptData, userData] = await Promise.all([
        actions.getEmployees(), actions.getAttendance(), actions.getTasks(), actions.getExpenses(), actions.getIncome(), actions.getAuditLogs(),
        actions.getLeaveRequests(), actions.getAnnouncements(), actions.getProjects(), actions.getMonthlySchedules(), actions.getBills(), actions.getNotifications(),
        actions.getBreakRequests(), actions.getDepartments(), actions.getUsers()
      ]);

      if (empData) setEmployees(empData as Employee[]);
      if (attData) setAttendance(attData as AttendanceRecord[]);
      if (taskData) setTasks(taskData as any);
      if (expData) setExpenses(expData as any);
      if (incData) setIncome(incData as Income[]);
      if (logData) setAuditLogs(logData as AuditLog[]);
      if (breakData) setBreakRequests(breakData as BreakRequest[]);
      if (deptData) setDepartments(deptData as Department[]);
      if (leaveData) setLeaveRequests(leaveData as LeaveRequest[]);
      
      if (userData) {
        const dbUsers = userData as User[];
        setUsers(prev => {
          const merged = [...dbUsers];
          initialUsers.forEach(iu => {
            if (!merged.find(mu => mu.email === iu.email)) merged.push(iu);
          });
          return merged;
        });
      }

      if (projectData && (projectData as any).length > 0) {
        setProjects(prev => {
          const freshProjects = projectData as any;
          return prev.map(p => {
            if (pendingProjectUpdates.current.has(p.id)) return p;
            const fresh = freshProjects.find((fp: any) => fp.id === p.id);
            return fresh || p;
          }).concat(freshProjects.filter((fp: any) => !prev.some(p => p.id === fp.id)));
        });
      }
      setSchedules(scheduleData as MonthlySchedule[]);
      setBills(billData as Bill[]);
      
      const newNotifs = (notifData as Notification[] || []).filter(n => n.sender !== user?.name);
      const todayStr = new Date().toISOString().split('T')[0];

      if (isAdmin && lastProcessedDateRef.current !== todayStr) {
         // Auto notifications logic...
         lastProcessedDateRef.current = todayStr;
      }

      if (newNotifs && newNotifs.length > 0) {
        const latest = newNotifs[0];
        if (user && hasInitializedNotifs.current && latest.id !== lastNotifIdRef.current) {
          const isRecipient = latest.recipient === 'all' || isAdmin || latest.recipient === user.role;
          if (isRecipient && latest.sender !== user.name) {
            playNotificationSound();
            showToast(latest.title, latest.message, latest.type);
          }
          lastNotifIdRef.current = latest.id;
        } else if (user && !hasInitializedNotifs.current) {
          lastNotifIdRef.current = latest.id;
          hasInitializedNotifs.current = true;
        }
        setNotifications(newNotifs);
      }
      
      setLeaveRequests(leaveData as LeaveRequest[]);
      if (announceData) setAnnouncements(announceData as Announcement[]);
    } catch (error) {} finally { setIsLoading(false); }
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
    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    const dbUsers = await actions.getUsers();
    let user: any = dbUsers.find((u: any) => u.email === cleanEmail && u.password === cleanPass);
    if (!user) user = initialUsers.find(u => u.email === cleanEmail && u.password === cleanPass);

    if (user) {
      const userData: User = { id: user.id, email: user.email, password: user.password, role: user.role as any, name: user.name };
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
    const senderName = currentUser?.name || 'System';
    const result = await actions.addNotificationAction({ ...notif, sender: senderName, createdAt: new Date() });
    if (result) {
       const user = JSON.parse(localStorage.getItem('growzix-user') || '{}');
       const isAdmin = ['admin', 'superadmin'].includes(user.role);
       if ((result.recipient === 'all' || (result.recipient === 'admin' && isAdmin) || result.recipient === user.role) && result.sender !== user.name) {
         setNotifications(prev => [result as any, ...prev]);
       }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await actions.markNotificationReadAction(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markCategoryNotificationsAsRead = async (category: string) => {
    // Logic for marking category notifications...
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    const recipient = ['admin', 'superadmin'].includes(currentUser.role) ? 'admin' : currentUser.role;
    await actions.markAllNotificationsReadAction(recipient);
    setNotifications(prev => prev.map(n => (n.recipient === recipient || n.recipient === 'all') ? { ...n, read: true } : n));
  };

  const addEmployee = async (employee: Employee) => {
    try {
      await actions.addEmployeeAction(employee);
      setEmployees(prev => [employee, ...prev]);
      await addAuditLog(`Registered: ${employee.name}`);
    } catch (e) {}
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await actions.updateEmployeeAction(id, updates);
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (e) {}
  };

  const deleteEmployee = async (id: string) => {
    try {
      await actions.deleteEmployeeAction(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (e) {}
  };

  const addAttendance = async (record: AttendanceRecord) => {
    try {
      await actions.addAttendanceAction(record);
      setAttendance(prev => [record, ...prev]);
    } catch (e) {}
  };

  const updateAttendance = async (id: string, updates: Partial<AttendanceRecord>) => {
    try {
      await actions.updateAttendanceAction(id, updates);
      setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    } catch (e) {}
  };

  const deleteAttendance = async (id: string) => {
    try {
      await actions.deleteAttendanceAction(id);
      setAttendance(prev => prev.filter(a => a.id !== id));
    } catch (e) {}
  };

  const addTask = async (task: TaskLog) => {
    try {
      await actions.addTaskAction(task);
      setTasks(prev => [task, ...prev]);
    } catch (e) {}
  };

  const updateTask = async (id: string, updates: Partial<TaskLog>) => {
    try {
      await actions.updateTaskAction(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (e) {}
  };

  const deleteTask = async (id: string) => {
    try {
      await actions.deleteTaskAction(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {}
  };

  const addExpense = async (expense: Expense) => {
    try {
      await actions.addExpenseAction(expense);
      setExpenses(prev => [expense, ...prev]);
    } catch (e) {}
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      await actions.updateExpenseAction(id, updates);
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (e) {}
  };

  const deleteExpense = async (id: string) => {
    try {
      await actions.deleteExpenseAction(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (e) {}
  };

  const addIncome = async (inc: Income) => {
    try {
      await actions.addIncomeAction(inc);
      setIncome(prev => [inc, ...prev]);
    } catch (e) {}
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    try {
      await actions.updateIncomeAction(id, updates);
      setIncome(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    } catch (e) {}
  };

  const deleteIncome = async (id: string) => {
    try {
      await actions.deleteIncomeAction(id);
      setIncome(prev => prev.filter(i => i.id !== id));
    } catch (e) {}
  };

  const addLeaveRequest = async (request: LeaveRequest) => {
    try {
      await actions.addLeaveRequestAction(request);
      setLeaveRequests(prev => [request, ...prev]);
    } catch (e) {}
  };

  const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>) => {
    try {
      await actions.updateLeaveRequestAction(id, updates);
      setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    } catch (e) {}
  };

  const deleteLeaveRequest = async (id: string) => {
    try {
      await actions.deleteLeaveRequestAction(id);
      setLeaveRequests(prev => prev.filter(l => l.id !== id));
    } catch (e) {}
  };

  const addBreakRequest = async (request: BreakRequest) => {
    try {
      await actions.addBreakRequestAction(request);
      setBreakRequests(prev => [request, ...prev]);
    } catch (e) {}
  };

  const updateBreakRequest = async (id: string, updates: Partial<BreakRequest>) => {
    try {
      await actions.updateBreakRequestAction(id, updates);
      setBreakRequests(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (e) {}
  };

  const addDepartment = async (name: string) => {
    try {
      const result = await actions.addDepartmentAction(name);
      if (result) setDepartments(prev => [...prev, result as any]);
    } catch (e) {}
  };

  const updateDepartment = async (id: string, name: string) => {
    try {
      await actions.updateDepartmentAction(id, name);
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, name } : d));
    } catch (e) {}
  };

  const deleteDepartment = async (id: string) => {
    try {
      await actions.deleteDepartmentAction(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (e) {}
  };

  const addAnnouncement = async (announcement: Announcement) => {
    try {
      setAnnouncements(prev => [announcement, ...prev]);
      await actions.addAnnouncementAction(announcement);
      await fetchData();
    } catch (e) {}
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    try {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      await actions.updateAnnouncementAction(id, updates);
      await fetchData();
    } catch (e) {}
  };

  const markAnnouncementAsRead = async (id: string, name: string, role: string) => {
    try {
      await actions.markAnnouncementAsReadAction(id, name, role);
      await fetchData();
    } catch (e) {}
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await actions.deleteAnnouncementAction(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e) {}
  };

  const addProject = async (project: Project) => {
    try {
      setProjects(prev => [project, ...prev]);
      await actions.addProjectAction(project);
      await fetchData();
    } catch (e) {}
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    pendingProjectUpdates.current.add(id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await actions.updateProjectAction(id, updates);
    } catch (e) {
      showToast('Error', 'Failed to update project', 'error');
    } finally {
      setTimeout(() => pendingProjectUpdates.current.delete(id), 2000);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await actions.deleteProjectAction(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) {}
  };

  const addMonthlySchedule = async (schedule: MonthlySchedule) => {
    try {
      await actions.addMonthlyScheduleAction(schedule);
      setSchedules(prev => [schedule, ...prev]);
    } catch (e) {}
  };

  const updateMonthlySchedule = async (id: string, updates: Partial<MonthlySchedule>) => {
    try {
      await actions.updateMonthlyScheduleAction(id, updates);
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (e) {}
  };

  const deleteMonthlySchedule = async (id: string) => {
    try {
      await actions.deleteMonthlyScheduleAction(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (e) {}
  };

  const addBill = async (bill: Bill) => {
    try {
      await actions.addBillAction(bill);
      setBills(prev => [bill, ...prev]);
    } catch (e) {}
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    try {
      await actions.updateBillAction(id, updates);
      setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (e) {}
  };

  const deleteBill = async (id: string) => {
    try {
      await actions.deleteBillAction(id);
      setBills(prev => prev.filter(b => b.id !== id));
    } catch (e) {}
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, employees, attendance, tasks, expenses, income, auditLogs, notifications, leaveRequests, breakRequests, departments, announcements, projects, schedules, bills,
      themeColor, themeMode, isLoading, fetchData, login, logout, addEmployee, updateEmployee, deleteEmployee, addAttendance, updateAttendance, deleteAttendance,
      addTask, updateTask, deleteTask, addExpense, updateExpense, deleteExpense, addIncome, deleteIncome, addAuditLog, addNotification, markNotificationAsRead,
      markCategoryNotificationsAsRead, markAllNotificationsAsRead, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, addBreakRequest, updateBreakRequest, addDepartment, updateDepartment, deleteDepartment,
      addAnnouncement, updateAnnouncement, markAnnouncementAsRead, deleteAnnouncement, addProject, updateProject, deleteProject, addMonthlySchedule, updateMonthlySchedule, deleteMonthlySchedule, addBill, updateBill, deleteBill,
      setThemeColor, setThemeMode, updateIncome
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

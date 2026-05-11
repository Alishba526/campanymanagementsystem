'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog, LeaveRequest, Announcement, Project, MonthlySchedule } from '@/types';
import * as actions from '@/lib/actions';

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
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  projects: Project[];
  schedules: MonthlySchedule[];
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
  addLeaveRequest: (request: LeaveRequest) => Promise<void>;
  updateLeaveRequest: (id: string, request: Partial<LeaveRequest>) => Promise<void>;
  deleteLeaveRequest: (id: string) => Promise<void>;
  addAnnouncement: (announcement: Announcement) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMonthlySchedule: (schedule: MonthlySchedule) => Promise<void>;
  updateMonthlySchedule: (id: string, schedule: Partial<MonthlySchedule>) => Promise<void>;
  deleteMonthlySchedule: (id: string) => Promise<void>;
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const themeColors = {
  purple: {
    light: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accentBg: '#f5f3ff',
      bg: '#fafafa',
      bg2: '#f5f5f5',
      bg3: '#e5e5e5',
      bg4: '#d4d4d4',
      text: '#1e293b',
      text2: '#475569',
      text3: '#94a3b8',
      border: '#e2e8f0',
      border2: '#cbd5e1'
    },
    dark: {
      primary: '#a78bfa',
      secondary: '#7c3aed',
      accentBg: '#2e1065',
      bg: '#0f172a',
      bg2: '#1e293b',
      bg3: '#334155',
      bg4: '#475569',
      text: '#f1f5f9',
      text2: '#cbd5e1',
      text3: '#64748b',
      border: '#334155',
      border2: '#475569'
    }
  },
  blue: {
    light: {
      primary: '#2563eb',
      secondary: '#60a5fa',
      accentBg: '#eff6ff',
      bg: '#fafafa',
      bg2: '#f5f5f5',
      bg3: '#e5e5e5',
      bg4: '#d4d4d4',
      text: '#1e293b',
      text2: '#475569',
      text3: '#94a3b8',
      border: '#e2e8f0',
      border2: '#cbd5e1'
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#2563eb',
      accentBg: '#1e3a8a',
      bg: '#0f172a',
      bg2: '#1e293b',
      bg3: '#334155',
      bg4: '#475569',
      text: '#f1f5f9',
      text2: '#cbd5e1',
      text3: '#64748b',
      border: '#334155',
      border2: '#475569'
    }
  },
  green: {
    light: {
      primary: '#059669',
      secondary: '#34d399',
      accentBg: '#ecfdf5',
      bg: '#fafafa',
      bg2: '#f5f5f5',
      bg3: '#e5e5e5',
      bg4: '#d4d4d4',
      text: '#1e293b',
      text2: '#475569',
      text3: '#94a3b8',
      border: '#e2e8f0',
      border2: '#cbd5e1'
    },
    dark: {
      primary: '#34d399',
      secondary: '#059669',
      accentBg: '#064e3b',
      bg: '#0f172a',
      bg2: '#1e293b',
      bg3: '#334155',
      bg4: '#475569',
      text: '#f1f5f9',
      text2: '#cbd5e1',
      text3: '#64748b',
      border: '#334155',
      border2: '#475569'
    }
  },
  orange: {
    light: {
      primary: '#ea580c',
      secondary: '#fb923c',
      accentBg: '#fff7ed',
      bg: '#fafafa',
      bg2: '#f5f5f5',
      bg3: '#e5e5e5',
      bg4: '#d4d4d4',
      text: '#1e293b',
      text2: '#475569',
      text3: '#94a3b8',
      border: '#e2e8f0',
      border2: '#cbd5e1'
    },
    dark: {
      primary: '#fb923c',
      secondary: '#ea580c',
      accentBg: '#7c2d12',
      bg: '#0f172a',
      bg2: '#1e293b',
      bg3: '#334155',
      bg4: '#475569',
      text: '#f1f5f9',
      text2: '#cbd5e1',
      text3: '#64748b',
      border: '#334155',
      border2: '#475569'
    }
  },
  red: {
    light: {
      primary: '#dc2626',
      secondary: '#f87171',
      accentBg: '#fef2f2',
      bg: '#fafafa',
      bg2: '#f5f5f5',
      bg3: '#e5e5e5',
      bg4: '#d4d4d4',
      text: '#1e293b',
      text2: '#475569',
      text3: '#94a3b8',
      border: '#e2e8f0',
      border2: '#cbd5e1'
    },
    dark: {
      primary: '#f87171',
      secondary: '#dc2626',
      accentBg: '#7f1d1d',
      bg: '#0f172a',
      bg2: '#1e293b',
      bg3: '#334155',
      bg4: '#475569',
      text: '#f1f5f9',
      text2: '#cbd5e1',
      text3: '#64748b',
      border: '#334155',
      border2: '#475569'
    }
  },
  teal: {
    light: {
      primary: '#0d9488',
      secondary: '#2dd4bf',
      accentBg: '#f0fdfa',
      bg: '#fafafa',
      bg2: '#f5f5f5',
      bg3: '#e5e5e5',
      bg4: '#d4d4d4',
      text: '#1e293b',
      text2: '#475569',
      text3: '#94a3b8',
      border: '#e2e8f0',
      border2: '#cbd5e1'
    },
    dark: {
      primary: '#2dd4bf',
      secondary: '#0d9488',
      accentBg: '#134e4a',
      bg: '#0f172a',
      bg2: '#1e293b',
      bg3: '#334155',
      bg4: '#475569',
      text: '#f1f5f9',
      text2: '#cbd5e1',
      text3: '#64748b',
      border: '#334155',
      border2: '#475569'
    }
  },
  light: {
    light: {
      primary: '#6366f1',
      secondary: '#818cf8',
      accentBg: '#eef2ff',
      bg: '#ffffff',
      bg2: '#f9fafb',
      bg3: '#f3f4f6',
      bg4: '#e5e7eb',
      text: '#1e293b',
      text2: '#475569',
      text3: '#94a3b8',
      border: '#e2e8f0',
      border2: '#cbd5e1'
    },
    dark: {
      primary: '#818cf8',
      secondary: '#6366f1',
      accentBg: '#312e81',
      bg: '#0f172a',
      bg2: '#1e293b',
      bg3: '#334155',
      bg4: '#475569',
      text: '#f1f5f9',
      text2: '#cbd5e1',
      text3: '#64748b',
      border: '#334155',
      border2: '#475569'
    }
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
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<MonthlySchedule[]>([]);
  const [themeColor, setThemeColorState] = useState<ThemeColor>('light');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [empData, attData, taskData, expData, incData, logData, leaveData, announceData, projectData, scheduleData] = await Promise.all([
          actions.getEmployees(),
          actions.getAttendance(),
          actions.getTasks(),
          actions.getExpenses(),
          actions.getIncome(),
          actions.getAuditLogs(),
          actions.getLeaveRequests(),
          actions.getAnnouncements(),
          actions.getProjects(),
          actions.getMonthlySchedules()
        ]);

        setEmployees(empData as Employee[]);
        setAttendance(attData as AttendanceRecord[]);
        setTasks(taskData as TaskLog[]);
        setExpenses(expData as Expense[]);
        setIncome(incData as Income[]);
        setAuditLogs(logData as AuditLog[]);
        setLeaveRequests(leaveData as LeaveRequest[]);
        setAnnouncements(announceData as Announcement[]);
        setProjects(projectData as Project[]);
        setSchedules(scheduleData as MonthlySchedule[]);

        const savedUser = localStorage.getItem('nexaerp-user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const savedTheme = localStorage.getItem('nexaerp-theme') as ThemeColor;
    const savedMode = localStorage.getItem('nexaerp-theme-mode') as ThemeMode;

    if (savedTheme && themeColors[savedTheme]) {
      setThemeColorState(savedTheme);
    }

    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setThemeModeState(savedMode);
    }

    applyTheme(savedTheme || 'light', savedMode || 'light');
  }, []);

  const applyTheme = (color: ThemeColor, mode: ThemeMode) => {
    const theme = themeColors[color][mode];
    document.documentElement.style.setProperty('--accent', theme.primary);
    document.documentElement.style.setProperty('--accent2', theme.secondary);
    document.documentElement.style.setProperty('--accentbg', theme.accentBg);
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--bg2', theme.bg2);
    document.documentElement.style.setProperty('--bg3', theme.bg3);
    document.documentElement.style.setProperty('--bg4', theme.bg4);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--text2', theme.text2);
    document.documentElement.style.setProperty('--text3', theme.text3);
    document.documentElement.style.setProperty('--border', theme.border);
    document.documentElement.style.setProperty('--border2', theme.border2);

    // Fixed colors for status badges
    document.documentElement.style.setProperty('--green', '#10b981');
    document.documentElement.style.setProperty('--greenbg', mode === 'dark' ? '#064e3b' : '#d1fae5');
    document.documentElement.style.setProperty('--red', '#ef4444');
    document.documentElement.style.setProperty('--redbg', mode === 'dark' ? '#7f1d1d' : '#fee2e2');
    document.documentElement.style.setProperty('--blue', '#3b82f6');
    document.documentElement.style.setProperty('--bluebg', mode === 'dark' ? '#1e3a8a' : '#dbeafe');
    document.documentElement.style.setProperty('--amber', '#f59e0b');
    document.documentElement.style.setProperty('--amberbg', mode === 'dark' ? '#78350f' : '#fef3c7');
    document.documentElement.style.setProperty('--teal', '#14b8a6');
    document.documentElement.style.setProperty('--tealbg', mode === 'dark' ? '#134e4a' : '#ccfbf1');
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    applyTheme(color, themeMode);
    localStorage.setItem('nexaerp-theme', color);
    addAuditLog(`Theme color changed to ${color}`);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyTheme(themeColor, mode);
    localStorage.setItem('nexaerp-theme-mode', mode);
    addAuditLog(`Theme mode changed to ${mode}`);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = await actions.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const userData: User = {
        email: user.email,
        password: user.password,
        role: user.role as any,
        name: user.name
      };
      setCurrentUser(userData);
      localStorage.setItem('nexaerp-user', JSON.stringify(userData));
      await addAuditLog(`${user.name} logged into system`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog(`${currentUser.name} logged out`);
    }
    setCurrentUser(null);
    localStorage.removeItem('nexaerp-user');
  };

  const addEmployee = async (employee: Employee) => {
    await actions.addEmployeeAction(employee);
    setEmployees(prev => [employee, ...prev]);
    await addAuditLog(`Added new employee: ${employee.name} (${employee.id})`);
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    await actions.updateEmployeeAction(id, updates);
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    await addAuditLog(`Updated employee record: ${id}`);
  };

  const deleteEmployee = async (id: string) => {
    const emp = employees.find(e => e.id === id);
    await actions.deleteEmployeeAction(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (emp) await addAuditLog(`Deleted employee: ${emp.name} (${id})`);
  };

  const addAttendance = async (record: AttendanceRecord) => {
    await actions.addAttendanceAction(record);
    setAttendance(prev => [record, ...prev]);
    await addAuditLog(`Marked attendance for ${record.employeeName} - ${record.status}`);
  };

  const updateAttendance = async (id: string, updates: Partial<AttendanceRecord>) => {
    await actions.updateAttendanceAction(id, updates);
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    await addAuditLog(`Updated attendance record: ${id}`);
  };

  const deleteAttendance = async (id: string) => {
    await actions.deleteAttendanceAction(id);
    setAttendance(prev => prev.filter(a => a.id !== id));
    await addAuditLog(`Deleted attendance record: ${id}`);
  };

  const addTask = async (task: TaskLog) => {
    await actions.addTaskAction(task);
    setTasks(prev => [task, ...prev]);
    await addAuditLog(`Task logged for ${task.employeeName} - Score: ${task.score}/100`);
    if (task.score < 60) {
      await addAuditLog(`⚠ Low performance alert: ${task.employeeName} score ${task.score}`);
    }
  };

  const updateTask = async (id: string, updates: Partial<TaskLog>) => {
    await actions.updateTaskAction(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await addAuditLog(`Updated task log: ${id}`);
  };

  const deleteTask = async (id: string) => {
    await actions.deleteTaskAction(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    await addAuditLog(`Deleted task log: ${id}`);
  };

  const addExpense = async (expense: Expense) => {
    await actions.addExpenseAction(expense);
    setExpenses(prev => [expense, ...prev]);
    await addAuditLog(`Expense added: ${expense.description} - Rs.${expense.amount}`);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    await actions.updateExpenseAction(id, updates);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    await addAuditLog(`Updated expense: ${id}`);
  };

  const deleteExpense = async (id: string) => {
    await actions.deleteExpenseAction(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    await addAuditLog(`Deleted expense: ${id}`);
  };

  const addIncome = async (inc: Income) => {
    await actions.addIncomeAction(inc);
    setIncome(prev => [inc, ...prev]);
    await addAuditLog(`Income added: ${inc.client} - Rs.${inc.amount}`);
  };

  const deleteIncome = async (id: string) => {
    await actions.deleteIncomeAction(id);
    setIncome(prev => prev.filter(i => i.id !== id));
    await addAuditLog(`Deleted income record: ${id}`);
  };

  const addLeaveRequest = async (request: LeaveRequest) => {
    await actions.addLeaveRequestAction(request);
    setLeaveRequests(prev => [request, ...prev]);
    await addAuditLog(`Leave requested: ${request.employeeName} (${request.type})`);
  };

  const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>) => {
    await actions.updateLeaveRequestAction(id, updates);
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (updates.status === 'approved') {
      await addAuditLog(`Leave approved: ${id}`);
    } else if (updates.status === 'rejected') {
      await addAuditLog(`Leave rejected: ${id}`);
    }
  };

  const deleteLeaveRequest = async (id: string) => {
    await actions.deleteLeaveRequestAction(id);
    setLeaveRequests(prev => prev.filter(l => l.id !== id));
    await addAuditLog(`Deleted leave request: ${id}`);
  };

  const addAnnouncement = async (announcement: Announcement) => {
    await actions.addAnnouncementAction(announcement);
    setAnnouncements(prev => [announcement, ...prev]);
    await addAuditLog(`Broadcasted announcement: ${announcement.title}`);
  };

  const deleteAnnouncement = async (id: string) => {
    await actions.deleteAnnouncementAction(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    await addAuditLog(`Deleted announcement: ${id}`);
  };

  const addProject = async (project: Project) => {
    await actions.addProjectAction(project);
    setProjects(prev => [project, ...prev]);
    await addAuditLog(`Created project: ${project.projectName} for ${project.clientName}`);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await actions.updateProjectAction(id, updates);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await addAuditLog(`Updated project: ${id}`);
  };

  const deleteProject = async (id: string) => {
    await actions.deleteProjectAction(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    await addAuditLog(`Deleted project: ${id}`);
  };

  const addMonthlySchedule = async (schedule: MonthlySchedule) => {
    await actions.addMonthlyScheduleAction(schedule);
    setSchedules(prev => [schedule, ...prev]);
    await addAuditLog(`Added monthly schedule for ${schedule.employeeName} (${schedule.month})`);
  };

  const updateMonthlySchedule = async (id: string, updates: Partial<MonthlySchedule>) => {
    await actions.updateMonthlyScheduleAction(id, updates);
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    await addAuditLog(`Updated monthly schedule: ${id}`);
  };

  const deleteMonthlySchedule = async (id: string) => {
    await actions.deleteMonthlyScheduleAction(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    await addAuditLog(`Deleted monthly schedule: ${id}`);
  };

  const addAuditLog = async (action: string) => {
    const log: AuditLog = {
      id: `AL${Date.now()}`,
      timestamp: new Date().toLocaleString('en-PK', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      user: currentUser?.name || 'System',
      action
    };
    await actions.addAuditLogAction(log);
    setAuditLogs(prev => [log, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      employees,
      attendance,
      tasks,
      expenses,
      income,
      auditLogs,
      leaveRequests,
      announcements,
      projects,
      schedules,
      themeColor,
      themeMode,
      isLoading,
      login,
      logout,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addAttendance,
      updateAttendance,
      deleteAttendance,
      addTask,
      updateTask,
      deleteTask,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      deleteIncome,
      addAuditLog,
      addLeaveRequest,
      updateLeaveRequest,
      deleteLeaveRequest,
      addAnnouncement,
      deleteAnnouncement,
      addProject,
      updateProject,
      deleteProject,
      addMonthlySchedule,
      updateMonthlySchedule,
      deleteMonthlySchedule,
      setThemeColor,
      setThemeMode
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

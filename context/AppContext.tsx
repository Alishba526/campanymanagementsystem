'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog } from '@/types';
import { users, initialEmployees, initialAttendance, initialTasks, initialExpenses, initialIncome, initialAuditLogs } from '@/lib/data';

interface AppContextType {
  currentUser: User | null;
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: TaskLog[];
  expenses: Expense[];
  income: Income[];
  auditLogs: AuditLog[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addAttendance: (record: AttendanceRecord) => void;
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => void;
  deleteAttendance: (id: string) => void;
  addTask: (task: TaskLog) => void;
  updateTask: (id: string, task: Partial<TaskLog>) => void;
  deleteTask: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
  addAuditLog: (action: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [tasks, setTasks] = useState<TaskLog[]>(initialTasks);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [income, setIncome] = useState<Income[]>(initialIncome);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      addAuditLog(`${user.name} logged into system`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog(`${currentUser.name} logged out`);
    }
    setCurrentUser(null);
  };

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [employee, ...prev]);
    addAuditLog(`Added new employee: ${employee.name} (${employee.id})`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    addAuditLog(`Updated employee record: ${id}`);
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (emp) addAuditLog(`Deleted employee: ${emp.name} (${id})`);
  };

  const addAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => [record, ...prev]);
    addAuditLog(`Marked attendance for ${record.employeeName} - ${record.status}`);
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addAuditLog(`Updated attendance record: ${id}`);
  };

  const deleteAttendance = (id: string) => {
    setAttendance(prev => prev.filter(a => a.id !== id));
    addAuditLog(`Deleted attendance record: ${id}`);
  };

  const addTask = (task: TaskLog) => {
    setTasks(prev => [task, ...prev]);
    addAuditLog(`Task logged for ${task.employeeName} - Score: ${task.score}/100`);
    if (task.score < 60) {
      addAuditLog(`⚠ Low performance alert: ${task.employeeName} score ${task.score}`);
    }
  };

  const updateTask = (id: string, updates: Partial<TaskLog>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addAuditLog(`Updated task log: ${id}`);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addAuditLog(`Deleted task log: ${id}`);
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    addAuditLog(`Expense added: ${expense.description} - Rs.${expense.amount}`);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    addAuditLog(`Updated expense: ${id}`);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    addAuditLog(`Deleted expense: ${id}`);
  };

  const addIncome = (inc: Income) => {
    setIncome(prev => [inc, ...prev]);
    addAuditLog(`Income added: ${inc.client} - Rs.${inc.amount}`);
  };

  const deleteIncome = (id: string) => {
    setIncome(prev => prev.filter(i => i.id !== id));
    addAuditLog(`Deleted income record: ${id}`);
  };

  const addAuditLog = (action: string) => {
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
      addAuditLog
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

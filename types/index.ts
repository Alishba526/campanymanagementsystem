export type UserRole = 'admin' | 'ecommerce' | 'marketing' | 'architecture';

export interface User {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  salary: number;
  status: 'active' | 'inactive';
  joinDate: string;
  monthlyHours: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'leave' | 'late';
  hours: number;
}

export interface TaskLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  task: string;
  category: string;
  hours: number;
  completion: number;
  quality: number;
  score: number;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: 'approved' | 'pending';
  approvedBy: string;
}

export interface Income {
  id: string;
  date: string;
  client: string;
  project: string;
  amount: number;
  status: 'received' | 'pending';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

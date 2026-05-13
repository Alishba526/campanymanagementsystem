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
  status: 'approved' | 'pending' | 'rejected';
  approvedBy: string;
  submittedBy: string;
  department?: string;
}

export interface Bill {
  id: string;
  date: string;
  billType: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paidAmount?: number;
  notes?: string;
}

export interface Income {
  id: string;
  date: string;
  client: string;
  project: string;
  amount: number;
  status: 'received' | 'pending';
  department?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: 'sick' | 'casual' | 'annual';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approvedBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  priority: 'normal' | 'high';
  createdAt?: Date;
}

export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  totalBudget: number;
  amountReceived: number;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
}

export interface MonthlySchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  weeklyOffs?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

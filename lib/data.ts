import { User, Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog } from '@/types';

// User credentials
export const users: User[] = [
  {
    email: 'admin@growzix.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    email: 'ecommerce@growzix.com',
    password: 'eCommerce123',
    role: 'ecommerce',
    name: 'E-Commerce Manager'
  },
  {
    email: 'marketing@growzix.com',
    password: 'marketing123',
    role: 'marketing',
    name: 'Marketing Manager'
  },
  {
    email: 'architecture@growzix.com',
    password: 'architecture123',
    role: 'architecture',
    name: 'Architecture Manager'
  }
];

// Initial employees data
export const initialEmployees: Employee[] = [
  // E-Commerce Department
  {
    id: 'EC001',
    name: 'Ahmed Hassan',
    department: 'ecommerce',
    position: 'Senior Developer',
    email: 'ahmed.hassan@growzix.com',
    phone: '0300-1234567',
    salary: 85000,
    status: 'active',
    joinDate: '2023-01-15',
    monthlyHours: 176
  },
  {
    id: 'EC002',
    name: 'Fatima Ali',
    department: 'ecommerce',
    position: 'Product Manager',
    email: 'fatima.ali@growzix.com',
    phone: '0301-2345678',
    salary: 95000,
    status: 'active',
    joinDate: '2022-06-10',
    monthlyHours: 176
  },
  {
    id: 'EC003',
    name: 'Usman Khan',
    department: 'ecommerce',
    position: 'UI/UX Designer',
    email: 'usman.khan@growzix.com',
    phone: '0302-3456789',
    salary: 70000,
    status: 'active',
    joinDate: '2023-03-20',
    monthlyHours: 176
  },
  // Marketing Department
  {
    id: 'MK001',
    name: 'Sara Ahmed',
    department: 'marketing',
    position: 'SEO Specialist',
    email: 'sara.ahmed@growzix.com',
    phone: '0303-4567890',
    salary: 65000,
    status: 'active',
    joinDate: '2023-02-01',
    monthlyHours: 176
  },
  {
    id: 'MK002',
    name: 'Bilal Mahmood',
    department: 'marketing',
    position: 'Content Writer',
    email: 'bilal.mahmood@growzix.com',
    phone: '0304-5678901',
    salary: 55000,
    status: 'active',
    joinDate: '2023-04-15',
    monthlyHours: 176
  },
  {
    id: 'MK003',
    name: 'Ayesha Malik',
    department: 'marketing',
    position: 'Social Media Manager',
    email: 'ayesha.malik@growzix.com',
    phone: '0305-6789012',
    salary: 60000,
    status: 'active',
    joinDate: '2023-01-10',
    monthlyHours: 176
  },
  // Architecture Department
  {
    id: 'AR001',
    name: 'Hassan Raza',
    department: 'architecture',
    position: 'Lead Architect',
    email: 'hassan.raza@growzix.com',
    phone: '0306-7890123',
    salary: 120000,
    status: 'active',
    joinDate: '2022-03-01',
    monthlyHours: 176
  },
  {
    id: 'AR002',
    name: 'Zainab Sheikh',
    department: 'architecture',
    position: 'System Architect',
    email: 'zainab.sheikh@growzix.com',
    phone: '0307-8901234',
    salary: 100000,
    status: 'active',
    joinDate: '2022-08-15',
    monthlyHours: 176
  },
  {
    id: 'AR003',
    name: 'Ali Akbar',
    department: 'architecture',
    position: 'DevOps Engineer',
    email: 'ali.akbar@growzix.com',
    phone: '0308-9012345',
    salary: 90000,
    status: 'active',
    joinDate: '2023-05-01',
    monthlyHours: 176
  }
];

// Initial attendance records
export const initialAttendance: AttendanceRecord[] = [
  // Today's attendance
  { id: 'AT001', employeeId: 'EC001', employeeName: 'Ahmed Hassan', date: '2026-05-09', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: 9 },
  { id: 'AT002', employeeId: 'EC002', employeeName: 'Fatima Ali', date: '2026-05-09', checkIn: '09:15', checkOut: '18:10', status: 'present', hours: 8.9 },
  { id: 'AT003', employeeId: 'EC003', employeeName: 'Usman Khan', date: '2026-05-09', checkIn: '10:30', checkOut: '18:00', status: 'late', hours: 7.5 },
  { id: 'AT004', employeeId: 'MK001', employeeName: 'Sara Ahmed', date: '2026-05-09', checkIn: '09:05', checkOut: '18:00', status: 'present', hours: 8.9 },
  { id: 'AT005', employeeId: 'MK002', employeeName: 'Bilal Mahmood', date: '2026-05-09', checkIn: '--', checkOut: '--', status: 'absent', hours: 0 },
  { id: 'AT006', employeeId: 'MK003', employeeName: 'Ayesha Malik', date: '2026-05-09', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: 9 },
  { id: 'AT007', employeeId: 'AR001', employeeName: 'Hassan Raza', date: '2026-05-09', checkIn: '08:45', checkOut: '18:15', status: 'present', hours: 9.5 },
  { id: 'AT008', employeeId: 'AR002', employeeName: 'Zainab Sheikh', date: '2026-05-09', checkIn: '09:00', checkOut: '18:00', status: 'present', hours: 9 },
  { id: 'AT009', employeeId: 'AR003', employeeName: 'Ali Akbar', date: '2026-05-09', checkIn: '--', checkOut: '--', status: 'leave', hours: 0 },
];

// Initial task logs
export const initialTasks: TaskLog[] = [
  { id: 'TK001', employeeId: 'EC001', employeeName: 'Ahmed Hassan', date: '2026-05-09', task: 'Payment Gateway Integration', category: 'development', hours: 6, completion: 95, quality: 92, score: 94 },
  { id: 'TK002', employeeId: 'EC002', employeeName: 'Fatima Ali', date: '2026-05-09', task: 'Product Roadmap Planning', category: 'management', hours: 5, completion: 100, quality: 95, score: 98 },
  { id: 'TK003', employeeId: 'EC003', employeeName: 'Usman Khan', date: '2026-05-09', task: 'Checkout Page Redesign', category: 'design', hours: 7, completion: 80, quality: 85, score: 82 },
  { id: 'TK004', employeeId: 'MK001', employeeName: 'Sara Ahmed', date: '2026-05-09', task: 'SEO Audit - Client Website', category: 'marketing', hours: 4, completion: 100, quality: 90, score: 93 },
  { id: 'TK005', employeeId: 'MK003', employeeName: 'Ayesha Malik', date: '2026-05-09', task: 'Social Media Campaign', category: 'marketing', hours: 5, completion: 85, quality: 88, score: 86 },
  { id: 'TK006', employeeId: 'AR001', employeeName: 'Hassan Raza', date: '2026-05-09', task: 'System Architecture Review', category: 'architecture', hours: 6, completion: 100, quality: 98, score: 99 },
  { id: 'TK007', employeeId: 'AR002', employeeName: 'Zainab Sheikh', date: '2026-05-09', task: 'Microservices Design', category: 'architecture', hours: 7, completion: 90, quality: 92, score: 91 },
];

// Initial expenses
export const initialExpenses: Expense[] = [
  { id: 'EX001', date: '2026-05-09', category: 'Marketing', description: 'Google Ads Campaign', amount: 45000, status: 'approved', approvedBy: 'Admin', submittedBy: 'Admin', department: 'marketing' },
  { id: 'EX002', date: '2026-05-08', category: 'Operations', description: 'Office Rent - May', amount: 120000, status: 'approved', approvedBy: 'Admin', submittedBy: 'Admin', department: 'General' },
  { id: 'EX003', date: '2026-05-07', category: 'Software', description: 'Adobe CC Licenses', amount: 25000, status: 'approved', approvedBy: 'Admin', submittedBy: 'Admin', department: 'ecommerce' },
  { id: 'EX004', date: '2026-05-06', category: 'Infrastructure', description: 'AWS Cloud Services', amount: 35000, status: 'approved', approvedBy: 'Admin', submittedBy: 'Admin', department: 'architecture' },
];

// Initial income
export const initialIncome: Income[] = [
  { id: 'IN001', date: '2026-05-09', client: 'TechCorp Solutions', project: 'E-Commerce Platform Development', amount: 450000, status: 'received' },
  { id: 'IN002', date: '2026-05-07', client: 'Digital Marketing Hub', project: 'SEO & Marketing Package', amount: 180000, status: 'received' },
  { id: 'IN003', date: '2026-05-05', client: 'StartupXYZ', project: 'System Architecture Consulting', amount: 250000, status: 'received' },
  { id: 'IN004', date: '2026-05-03', client: 'RetailCo', project: 'E-Commerce Website', amount: 320000, status: 'pending' },
];

// Initial audit logs
export const initialAuditLogs: AuditLog[] = [
  { id: 'AL001', timestamp: '2026-05-09 09:00:00', user: 'Admin', action: 'Logged into system' },
  { id: 'AL002', timestamp: '2026-05-09 09:15:00', user: 'E-Commerce Manager', action: 'Marked attendance for Ahmed Hassan' },
  { id: 'AL003', timestamp: '2026-05-09 10:00:00', user: 'Admin', action: 'Approved expense EX001 - Google Ads Rs.45,000' },
];

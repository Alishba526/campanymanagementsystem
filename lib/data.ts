import { User, Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog } from '@/types';

// User credentials
export const users: User[] = [
  {
    id: 'ADMIN',
    email: 'admin@growzix.com',
    password: 'Admin@Growzix#2026',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: 'ECOM_MGR',
    email: 'ecommerce@growzix.com',
    password: 'ECMgr_Secure*99',
    role: 'ecommerce',
    name: 'E-Commerce Manager'
  },
  {
    id: 'MKT_MGR',
    email: 'marketing@growzix.com',
    password: 'MktMgr_Secure!88',
    role: 'marketing',
    name: 'Marketing Manager'
  },
  {
    id: 'ARCH_MGR',
    email: 'architecture@growzix.com',
    password: 'ArchMgr_Secure$77',
    role: 'architecture',
    name: 'Architecture Manager'
  },
  {
    id: 'REHMAN_SR',
    email: 'rehman.senior@growzix.com',
    password: 'Growzix@2026#',
    role: 'ecommerce',
    name: 'rehman'
  },
  {
    id: 'REHMAN_MKT',
    email: 'rehman.marketing@growzix.com',
    password: 'Growzix@2026#',
    role: 'marketing',
    name: 'Rehman'
  },
  {
    id: 'OWAIS',
    email: 'owais@growzix.com',
    password: 'Growzix@2026#',
    role: 'ecommerce',
    name: 'owais'
  }
];

// Initial employees data
export const initialEmployees: Employee[] = [
  // E-Commerce Department
  {
    id: 'EC001',
    name: 'Ahmed Hassan',
    fatherName: 'Hassan Raza',
    address: 'Gulshan-e-Iqbal, Karachi',
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
    fatherName: 'Ali Akbar',
    address: 'DHA Phase 6, Karachi',
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
    fatherName: 'Khan Muhammad',
    address: 'North Nazimabad, Karachi',
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
    fatherName: 'Ahmed Malik',
    address: 'PECHS Block 2, Karachi',
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
    fatherName: 'Mahmood Khan',
    address: 'Nazimabad No. 3, Karachi',
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
    fatherName: 'Malik Akbar',
    address: 'Gulberg, Karachi',
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
    fatherName: 'Raza Ali',
    address: 'Clifton Block 5, Karachi',
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
    fatherName: 'Sheikh Muhammad',
    address: 'Garden East, Karachi',
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
    fatherName: 'Akbar Hussain',
    address: 'Malir Cantt, Karachi',
    department: 'architecture',
    position: 'DevOps Engineer',
    email: 'ali.akbar@growzix.com',
    phone: '0308-9012345',
    salary: 90000,
    status: 'active',
    joinDate: '2023-05-01',
    monthlyHours: 176
  },
  // User Requested Employees
  {
    id: 'emp001',
    name: 'rehman',
    fatherName: 'rehman',
    address: 'etc',
    department: 'ecommerce',
    position: 'senior',
    email: 'rehman.senior@growzix.com',
    phone: '0300-0000000',
    salary: 0,
    status: 'active',
    joinDate: '2026-05-21',
    monthlyHours: 176
  },
  {
    id: 'EMP-001',
    name: 'Rehman',
    fatherName: '--',
    address: '',
    department: 'marketing',
    position: 'Employee',
    email: 'rehman.marketing@growzix.com',
    phone: '0300-0000000',
    salary: 0,
    status: 'active',
    joinDate: '2026-05-21',
    monthlyHours: 176
  },
  {
    id: 'EC001',
    name: 'owais',
    fatherName: '--',
    address: '',
    department: 'ecommerce',
    position: 'Employee',
    email: 'owais@growzix.com',
    phone: '0300-0000000',
    salary: 0,
    status: 'active',
    joinDate: '2026-05-21',
    monthlyHours: 176
  }
];

// Initial attendance records
export const initialAttendance: AttendanceRecord[] = [
  // Today's attendance
  { id: 'AT001', employeeId: 'EC001', employeeName: 'Ahmed Hassan', date: '2026-05-09', checkIn: '09:00', checkOut: '18:00', breakIn: '13:00', breakOut: '14:00', lateEntry: '00:00', earlyExit: '00:00', overtime: 0, status: 'present', hours: 9 },
  { id: 'AT002', employeeId: 'EC002', employeeName: 'Fatima Ali', date: '2026-05-09', checkIn: '09:15', checkOut: '18:10', breakIn: '13:00', breakOut: '14:00', lateEntry: '00:15', earlyExit: '00:00', overtime: 0, status: 'present', hours: 8.9 },
  { id: 'AT003', employeeId: 'EC003', employeeName: 'Usman Khan', date: '2026-05-09', checkIn: '10:30', checkOut: '18:00', breakIn: '13:00', breakOut: '14:00', lateEntry: '01:30', earlyExit: '00:00', overtime: 0, status: 'late', hours: 7.5 },
  { id: 'AT004', employeeId: 'MK001', employeeName: 'Sara Ahmed', date: '2026-05-09', checkIn: '09:05', checkOut: '18:00', breakIn: '13:00', breakOut: '14:00', lateEntry: '00:05', earlyExit: '00:00', overtime: 0, status: 'present', hours: 8.9 },
  { id: 'AT005', employeeId: 'MK002', employeeName: 'Bilal Mahmood', date: '2026-05-09', checkIn: '--', checkOut: '--', breakIn: '--', breakOut: '--', lateEntry: '--', earlyExit: '--', overtime: 0, status: 'absent', hours: 0 },
  { id: 'AT006', employeeId: 'MK003', employeeName: 'Ayesha Malik', date: '2026-05-09', checkIn: '09:00', checkOut: '18:00', breakIn: '13:00', breakOut: '14:00', lateEntry: '00:00', earlyExit: '00:00', overtime: 0, status: 'present', hours: 9 },
  { id: 'AT007', employeeId: 'AR001', employeeName: 'Hassan Raza', date: '2026-05-09', checkIn: '08:45', checkOut: '18:15', breakIn: '13:00', breakOut: '14:00', lateEntry: '00:00', earlyExit: '00:00', overtime: 0.5, status: 'present', hours: 9.5 },
  { id: 'AT008', employeeId: 'AR002', employeeName: 'Zainab Sheikh', date: '2026-05-09', checkIn: '09:00', checkOut: '18:00', breakIn: '13:00', breakOut: '14:00', lateEntry: '00:00', earlyExit: '00:00', overtime: 0, status: 'present', hours: 9 },
  { id: 'AT009', employeeId: 'AR003', employeeName: 'Ali Akbar', date: '2026-05-09', checkIn: '--', checkOut: '--', breakIn: '--', breakOut: '--', lateEntry: '--', earlyExit: '--', overtime: 0, status: 'leave', hours: 0 },
];

// Initial task logs
export const initialTasks: TaskLog[] = [
  { id: 'TK001', employeeId: 'EC001', employeeName: 'Ahmed Hassan', date: '2026-05-09', task: 'Payment Gateway Integration', category: 'development', workingDays: 1, quality: 92, score: 94, projectsAssigned: 2, projectsCompleted: 1, pendingProjects: 1, approvedProjects: 1, rejectedProjects: 0, clientResponses: 5, leadsGenerated: 0, emailsSent: 10, conversionRatio: 0 },
  { id: 'TK002', employeeId: 'EC002', employeeName: 'Fatima Ali', date: '2026-05-09', task: 'Product Roadmap Planning', category: 'management', workingDays: 1, quality: 95, score: 98, projectsAssigned: 3, projectsCompleted: 3, pendingProjects: 0, approvedProjects: 3, rejectedProjects: 0, clientResponses: 12, leadsGenerated: 2, emailsSent: 20, conversionRatio: 10 },
  { id: 'TK003', employeeId: 'EC003', employeeName: 'Usman Khan', date: '2026-05-09', task: 'Checkout Page Redesign', category: 'design', workingDays: 1, quality: 85, score: 82, projectsAssigned: 1, projectsCompleted: 0, pendingProjects: 1, approvedProjects: 0, rejectedProjects: 0, clientResponses: 4, leadsGenerated: 0, emailsSent: 5, conversionRatio: 0 },
  { id: 'TK004', employeeId: 'MK001', employeeName: 'Sara Ahmed', date: '2026-05-09', task: 'SEO Audit - Client Website', category: 'marketing', workingDays: 1, quality: 90, score: 93, projectsAssigned: 2, projectsCompleted: 2, pendingProjects: 0, approvedProjects: 2, rejectedProjects: 0, clientResponses: 8, leadsGenerated: 5, emailsSent: 15, conversionRatio: 33 },
  { id: 'TK005', employeeId: 'MK003', employeeName: 'Ayesha Malik', date: '2026-05-09', task: 'Social Media Campaign', category: 'marketing', workingDays: 1, quality: 88, score: 86, projectsAssigned: 4, projectsCompleted: 3, pendingProjects: 1, approvedProjects: 3, rejectedProjects: 0, clientResponses: 25, leadsGenerated: 10, emailsSent: 40, conversionRatio: 25 },
  { id: 'TK006', employeeId: 'AR001', employeeName: 'Hassan Raza', date: '2026-05-09', task: 'System Architecture Review', category: 'architecture', workingDays: 1, quality: 98, score: 99, projectsAssigned: 1, projectsCompleted: 1, pendingProjects: 0, approvedProjects: 1, rejectedProjects: 0, clientResponses: 3, leadsGenerated: 0, emailsSent: 5, conversionRatio: 0 },
  { id: 'TK007', employeeId: 'AR002', employeeName: 'Zainab Sheikh', date: '2026-05-09', task: 'Microservices Design', category: 'architecture', workingDays: 1, quality: 92, score: 91, projectsAssigned: 2, projectsCompleted: 1, pendingProjects: 1, approvedProjects: 1, rejectedProjects: 0, clientResponses: 6, leadsGenerated: 0, emailsSent: 8, conversionRatio: 0 },
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

'use server';

// Force re-compilation - Correct DB URL sync
import { prisma } from '@/lib/prisma';
import { Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog, User, LeaveRequest, Announcement, Project, MonthlySchedule, Bill } from '@/types';
import { revalidatePath } from 'next/cache';

// ... (existing code)

// Monthly Schedule Actions
export async function getMonthlySchedules() {
  return await prisma.monthlySchedule.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addMonthlyScheduleAction(schedule: MonthlySchedule) {
  // Explicitly map fields to data object, handling optional fields like weeklyOffs
  const { id, employeeId, employeeName, month, startTime, endTime, totalHours, weeklyOffs } = schedule;
  
  const data: any = { // Use 'any' temporarily if schema mapping is complex, but ideally type it
    id,
    employeeId,
    employeeName,
    month,
    startTime,
    endTime,
    totalHours,
  };

  // Conditionally add weeklyOffs if it exists
  if (weeklyOffs) {
    data.weeklyOffs = weeklyOffs;
  }

  return await prisma.monthlySchedule.create({
    data: data
  });
}

export async function updateMonthlyScheduleAction(id: string, updates: Partial<MonthlySchedule>) {
  return await prisma.monthlySchedule.update({
    where: { id },
    data: updates as any
  });
}
export async function deleteMonthlyScheduleAction(id: string) {
  await prisma.monthlySchedule.delete({
    where: { id }
  });
}

// Notification Actions
export async function getNotifications() {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification;
    if (!model) return [];
    return await model.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function addNotificationAction(notif: Partial<Notification>) {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification;
    if (!model) return null;
    return await model.create({
      data: {
        title: notif.title!,
        message: notif.message!,
        type: notif.type!,
        sender: notif.sender!,
        recipient: notif.recipient!,
        read: false
      }
    });
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
}

export async function markNotificationReadAction(id: string) {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification;
    if (!model) return null;
    return await model.update({
      where: { id },
      data: { read: true }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

export async function markAllNotificationsReadAction(recipient: string) {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification;
    if (!model) return null;
    return await model.updateMany({
      where: { recipient, read: false },
      data: { read: true }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return null;
  }
}

// User Actions
export async function getUsers() {
  return await prisma.user.findMany();
}

// Employee Actions
export async function getEmployees() {
  return await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addEmployeeAction(employee: Employee) {
  // Ensure required fields have defaults if missing (e.g., if a manager adds an employee)
  const employeeData = {
    ...employee,
    salary: employee.salary || 0,
    monthlyHours: employee.monthlyHours || 176,
    status: employee.status || 'active',
    joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
    phone: employee.phone || '0300-0000000',
    email: employee.email || 'employee@growzix.com',
    position: employee.position || 'Employee',
  };

  const result = await prisma.employee.create({
    data: employeeData
  });
  return result;
}

export async function updateEmployeeAction(id: string, updates: Partial<Employee>) {
  const result = await prisma.employee.update({
    where: { id },
    data: updates as any
  });
  return result;
}

export async function deleteEmployeeAction(id: string) {
  await prisma.employee.delete({
    where: { id }
  });
}

// Attendance Actions
export async function getAttendance() {
  return await prisma.attendanceRecord.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addAttendanceAction(record: AttendanceRecord) {
  return await prisma.attendanceRecord.create({
    data: record
  });
}

export async function updateAttendanceAction(id: string, updates: Partial<AttendanceRecord>) {
  return await prisma.attendanceRecord.update({
    where: { id },
    data: updates as any
  });
}

export async function deleteAttendanceAction(id: string) {
  await prisma.attendanceRecord.delete({
    where: { id }
  });
}

// Task Actions
export async function getTasks() {
  return await prisma.taskLog.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addTaskAction(task: TaskLog) {
  return await prisma.taskLog.create({
    data: task
  });
}

export async function updateTaskAction(id: string, updates: Partial<TaskLog>) {
  return await prisma.taskLog.update({
    where: { id },
    data: updates as any
  });
}

export async function deleteTaskAction(id: string) {
  await prisma.taskLog.delete({
    where: { id }
  });
}

// Expense Actions
export async function getExpenses() {
  return await prisma.expense.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addExpenseAction(expense: Expense) {
  return await prisma.expense.create({
    data: {
      id: expense.id,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      status: expense.status,
      approvedBy: expense.approvedBy,
      submittedBy: expense.submittedBy,
      department: expense.department
    }
  });
}

export async function updateExpenseAction(id: string, updates: Partial<Expense>) {
  return await prisma.expense.update({
    where: { id },
    data: updates as any
  });
}

export async function deleteExpenseAction(id: string) {
  await prisma.expense.delete({
    where: { id }
  });
}

// Income Actions
export async function getIncome() {
  return await prisma.income.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addIncomeAction(income: Income) {
  // Assuming Income type now includes a 'department' field
  return await prisma.income.create({
    data: income
  });
}

export async function deleteIncomeAction(id: string) {
  await prisma.income.delete({
    where: { id }
  });
}

// Payroll Actions
export async function getPayroll() {
  try {
    const p = prisma as any;
    return await p.payroll.findMany({
      orderBy: { month: 'desc' }
    });
  } catch (e) {
    return [];
  }
}

export async function addPayrollAction(payroll: any) {
  try {
    const p = prisma as any;
    return await p.payroll.create({
      data: payroll
    });
  } catch (e) {
    return null;
  }
}

export async function deletePayrollAction(id: string) {
  try {
    const p = prisma as any;
    await p.payroll.delete({ where: { id } });
  } catch (e) {}
}

// Audit Log Actions
export async function getAuditLogs() {
  return await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addAuditLogAction(log: AuditLog) {
  return await prisma.auditLog.create({
    data: log
  });
}

// Leave Request Actions
export async function getLeaveRequests() {
  return await prisma.leaveRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addLeaveRequestAction(request: LeaveRequest) {
  return await prisma.leaveRequest.create({
    data: request as any
  });
}

export async function updateLeaveRequestAction(id: string, updates: Partial<LeaveRequest>) {
  return await prisma.leaveRequest.update({
    where: { id },
    data: updates as any
  });
}

export async function deleteLeaveRequestAction(id: string) {
  try {
    await prisma.leaveRequest.delete({
      where: { id }
    });
  } catch (e) {
    console.warn(`Attempted to delete non-existent LeaveRequest: ${id}`);
  }
}

// Break Request Actions
export async function getBreakRequests() {
  try {
    const p = prisma as any;
    return await p.breakRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    return [];
  }
}

export async function addBreakRequestAction(data: any) {
  try {
    const p = prisma as any;
    return await p.breakRequest.create({ data });
  } catch (e) {
    return null;
  }
}

export async function updateBreakRequestAction(id: string, updates: any) {
  try {
    const p = prisma as any;
    return await p.breakRequest.update({
      where: { id },
      data: updates
    });
  } catch (e) {
    return null;
  }
}

// Department Actions
export async function getDepartments() {
  try {
    return await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (e) {
    return [];
  }
}

export async function addDepartmentAction(name: string) {
  try {
    return await prisma.department.create({
      data: { name }
    });
  } catch (e) {
    return null;
  }
}

export async function updateDepartmentAction(id: string, name: string) {
  try {
    return await prisma.department.update({
      where: { id },
      data: { name }
    });
  } catch (e) {
    return null;
  }
}

// Announcement Actions
export async function getAnnouncements() {
  return await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addAnnouncementAction(announcement: Announcement) {
  return await prisma.announcement.create({
    data: announcement as any
  });
}

export async function deleteAnnouncementAction(id: string) {
  await prisma.announcement.delete({
    where: { id }
  });
}

// Project Actions
export async function getProjects() {
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addProjectAction(project: Project) {
  return await prisma.project.create({
    data: project as any
  });
}

export async function updateProjectAction(id: string, updates: Partial<Project>) {
  return await prisma.project.update({
    where: { id },
    data: updates as any
  });
}

export async function deleteProjectAction(id: string) {
  await prisma.project.delete({
    where: { id }
  });
}

// Bill Actions
export async function getBills() {
  return await prisma.bill.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addBillAction(bill: Bill) {
  return await prisma.bill.create({
    data: bill as any
  });
}

export async function updateBillAction(id: string, updates: Partial<Bill>) {
  return await prisma.bill.update({
    where: { id },
    data: updates as any
  });
}

export async function deleteBillAction(id: string) {
  await prisma.bill.delete({
    where: { id }
  });
}

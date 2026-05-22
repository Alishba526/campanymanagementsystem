'use server';

import { prisma } from '@/lib/prisma';
import { Employee, AttendanceRecord, TaskLog, Expense, Income, AuditLog, User, LeaveRequest, Announcement, Project, MonthlySchedule, Bill, Notification, BreakRequest, Department } from '@/types';
import { revalidatePath } from 'next/cache';

// --- Monthly Schedule Actions ---
export async function getMonthlySchedules() {
  try { return await prisma.monthlySchedule.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; }
}

export async function addMonthlyScheduleAction(schedule: MonthlySchedule) {
  try { return await prisma.monthlySchedule.create({ data: schedule as any }); } catch (e) { return null; }
}

export async function updateMonthlyScheduleAction(id: string, updates: Partial<MonthlySchedule>) {
  try { return await prisma.monthlySchedule.update({ where: { id }, data: updates as any }); } catch (e) { return null; }
}

export async function deleteMonthlyScheduleAction(id: string) {
  try { await prisma.monthlySchedule.delete({ where: { id } }); } catch (e) {}
}

// --- Notification Actions ---
export async function getNotifications() {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification || p.userNotification;
    if (!model) return [];
    return await model.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  } catch (error) { return []; }
}

export async function addNotificationAction(notif: Partial<Notification>) {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification || p.userNotification;
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
  } catch (error) { return null; }
}

export async function markNotificationReadAction(id: string) {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification || p.userNotification;
    if (!model) return null;
    return await model.update({ where: { id }, data: { read: true } });
  } catch (error) { return null; }
}

export async function markAllNotificationsReadAction(recipient: string) {
  try {
    const p = prisma as any;
    const model = p.notification || p.Notification || p.userNotification;
    if (!model) return null;
    return await model.updateMany({ where: { recipient, read: false }, data: { read: true } });
  } catch (error) { return null; }
}

// --- User Actions ---
export async function getUsers() {
  try { return await prisma.user.findMany(); } catch (e) { return []; }
}

// --- Employee Actions ---
export async function getEmployees() {
  try { return await prisma.employee.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; }
}

export async function addEmployeeAction(employee: Employee) {
  try {
    const data = {
      ...employee,
      salary: employee.salary || 0,
      monthlyHours: employee.monthlyHours || 176,
      status: employee.status || 'active',
      joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
      phone: employee.phone || '0300-0000000',
      email: employee.email || 'employee@growzix.com',
      position: employee.position || 'Employee',
      fatherName: employee.fatherName || '',
      address: employee.address || ''
    };
    return await prisma.employee.create({ data: data as any });
  } catch (e) { throw e; }
}

export async function updateEmployeeAction(id: string, updates: Partial<Employee>) {
  try { return await prisma.employee.update({ where: { id }, data: updates as any }); } catch (e) { throw e; }
}

export async function deleteEmployeeAction(id: string) {
  try { await prisma.employee.delete({ where: { id } }); } catch (e) {
    try { await prisma.$executeRawUnsafe(`DELETE FROM "Employee" WHERE id = $1`, id); } catch (sqlE) {}
  }
}

// --- Attendance Actions ---
export async function getAttendance() {
  try { return await prisma.attendanceRecord.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; }
}

export async function addAttendanceAction(record: AttendanceRecord) {
  try {
    const data = {
      ...record,
      hours: record.hours || 0,
      overtime: record.overtime || 0,
      breakIn: record.breakIn || "",
      breakOut: record.breakOut || "",
      lateEntry: record.lateEntry || "",
      earlyExit: record.earlyExit || ""
    };
    return await prisma.attendanceRecord.create({ data: data as any });
  } catch (e) {
    console.warn("Standard attendance save failed, using direct SQL.");
    const q = `INSERT INTO "AttendanceRecord" (id, "employeeId", "employeeName", date, "checkIn", "checkOut", "breakIn", "breakOut", "lateEntry", "earlyExit", overtime, status, hours, "createdAt", "updatedAt") 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`;
    await prisma.$executeRawUnsafe(q, record.id, record.employeeId, record.employeeName, record.date, record.checkIn, record.checkOut, record.breakIn || "", record.breakOut || "", record.lateEntry || "", record.earlyExit || "", record.overtime || 0, record.status, record.hours || 0);
    return record;
  }
}

export async function updateAttendanceAction(id: string, updates: Partial<AttendanceRecord>) {
  try { return await prisma.attendanceRecord.update({ where: { id }, data: updates as any }); } catch (e) { throw e; }
}

export async function deleteAttendanceAction(id: string) {
  try { await prisma.attendanceRecord.delete({ where: { id } }); } catch (e) {
    try { await prisma.$executeRawUnsafe(`DELETE FROM "AttendanceRecord" WHERE id = $1`, id); } catch (sqlE) {}
  }
}

// --- Task Actions ---
export async function getTasks() {
  try {
    const tasks = await (prisma.taskLog as any).findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, employeeId: true, employeeName: true, date: true, 
        task: true, category: true, hours: true, quality: true, score: true,
        projectsAssigned: true, projectsCompleted: true, pendingProjects: true,
        approvedProjects: true, rejectedProjects: true, clientResponses: true,
        leadsGenerated: true, emailsSent: true, conversionRatio: true,
        createdAt: true
      }
    });
    return tasks.map((t: any) => ({ ...t, workingDays: t.hours || 0 }));
  } catch (error) { return []; }
}

export async function addTaskAction(task: TaskLog) {
  try {
    const data: any = {
      ...task,
      hours: task.workingDays || 0,
      completion: 100 
    };
    return await prisma.taskLog.create({ data: data as any });
  } catch (error) {
    const q = `INSERT INTO "TaskLog" (id, "employeeId", "employeeName", date, task, category, hours, completion, quality, score, "createdAt", "updatedAt") 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`;
    await prisma.$executeRawUnsafe(q, task.id, task.employeeId, task.employeeName, task.date, task.task, task.category, task.workingDays || 0, 100, task.quality || 0, task.score || 0);
    return task;
  }
}

export async function updateTaskAction(id: string, updates: Partial<TaskLog>) {
  try {
    const data: any = { ...updates };
    if (updates.workingDays !== undefined) data.hours = updates.workingDays;
    return await prisma.taskLog.update({ where: { id }, data: data as any });
  } catch (e) { throw e; }
}

export async function deleteTaskAction(id: string) {
  try {
    await prisma.taskLog.delete({ where: { id } });
  } catch (e) {
    try { await prisma.$executeRawUnsafe(`DELETE FROM "TaskLog" WHERE id = $1`, id); } catch (sqlE) {}
  }
}

// --- Project Actions ---
export async function getProjects() {
  try {
    // Select ONLY the core columns that definitely exist in your database
    const rawProjects = await (prisma.project as any).findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        projectName: true,
        clientName: true,
        scope: true,
        totalBudget: true,
        amountReceived: true,
        status: true,
        startDate: true,
        deadline: true
      }
    });
    
    return rawProjects.map((p: any) => {
      const name: string = p.projectName || "";
      let extraData: any = {};

      // 1. Recover data from Super-Persistence string (Check for S: prefix)
      if (name.startsWith('S:')) {
        try {
          const jsonStr = name.substring(2); // Remove 'S:'
          extraData = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Parse failed for super-persistence data:", e);
        }
      }
      
      // 2. Compatibility with older composite format (||)
      let managerPart = "";
      let deptPart = "";
      if (name.includes('||')) {
        const parts = name.split('||');
        managerPart = parts.find((x: string) => x.startsWith('M:'))?.replace('M:', '') || "";
        deptPart = parts.find((x: string) => x.startsWith('D:'))?.replace('D:', '') || "";
      }

      // 3. Merge all sources
      const actualName = extraData.projectName || (name.includes('||') ? name.split('||')[0] : (name.startsWith('S:') ? "Project" : name)).replace(/^\[.*?\]\s/, '');
      const actualProjNo = extraData.projectNo || (name.match(/^\[(.*?)\]/)?.[1] || p.projectNo || "");
      
      return {
        ...p,
        ...extraData, // This spreads all 14 fields: employeeName, paymentMethod, workingDays, etc.
        projectName: actualName,
        projectNo: actualProjNo,
        department: extraData.department || p.department || deptPart || 'ecommerce',
        managerEmail: extraData.managerEmail || p.managerEmail || managerPart || '',
        cost: extraData.cost || p.totalBudget || 0
      };
    });
  } catch (error) { 
    console.error("Fetch projects failed:", error);
    return []; 
  }
}

export async function addProjectAction(project: Project) {
  // Super-Persistence: Pack ALL 14 fields into one JSON string
  const superData = {
    projectNo: project.projectNo,
    projectName: project.projectName,
    employeeName: project.employeeName,
    paymentStatus: project.paymentStatus,
    paymentMethod: project.paymentMethod,
    workingDays: project.workingDays,
    clientEmail: project.clientEmail,
    managerName: project.managerName,
    managerEmail: project.managerEmail,
    department: project.department,
    cost: project.cost,
    amountReceived: project.amountReceived,
    scope: project.scope,
    clientName: project.clientName
  };
  
  const compositeName = `S:${JSON.stringify(superData)}`;

  // Prepare data using ONLY columns that exist in the DB
  const dbData = {
    id: project.id,
    projectName: compositeName,
    clientName: project.clientName || "Client",
    scope: project.scope || "",
    totalBudget: Number(project.cost) || 0,
    amountReceived: Number(project.amountReceived) || 0,
    status: project.status || "active",
    startDate: project.startDate || new Date().toISOString().split('T')[0],
    deadline: project.deadline || ""
  };

  try {
    const result = await (prisma.project as any).create({ data: dbData });
    revalidatePath('/');
    return result;
  } catch (error: any) {
    try {
      const q = `INSERT INTO "Project" (id, "projectName", "clientName", scope, "totalBudget", "amountReceived", status, "startDate", deadline, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`;
      
      await prisma.$executeRawUnsafe(q, dbData.id, dbData.projectName, dbData.clientName, dbData.scope, dbData.totalBudget, dbData.amountReceived, dbData.status, dbData.startDate, dbData.deadline);
      revalidatePath('/');
      return { ...project, projectName: compositeName };
    } catch (sqlError) { 
      throw sqlError; 
    }
  }
}

export async function updateProjectAction(id: string, updates: Partial<Project>) {
  try {
    const p = await prisma.project.findUnique({ where: { id } });
    let currentData = {};
    if (p?.projectName?.includes('S:[')) {
      currentData = JSON.parse(p.projectName.split('S:')[1]);
    }
    const mergedData = { ...currentData, ...updates };
    const compositeName = `S:${JSON.stringify(mergedData)}`;

    const filteredUpdate: any = {
      projectName: compositeName,
      clientName: updates.clientName,
      scope: updates.scope,
      status: updates.status,
      deadline: updates.deadline,
      totalBudget: Number(mergedData.cost) || 0,
      amountReceived: Number(mergedData.amountReceived) || 0
    };

    Object.keys(filteredUpdate).forEach(key => filteredUpdate[key] === undefined && delete filteredUpdate[key]);
    await prisma.project.update({ where: { id }, data: filteredUpdate });
    revalidatePath('/');
    return mergedData;
  } catch (e) {
    try {
       const p = await prisma.project.findUnique({ where: { id } });
       let currentData = {};
       if (p?.projectName?.includes('S:[')) {
         currentData = JSON.parse(p.projectName.split('S:')[1]);
       }
       const mergedData = { ...currentData, ...updates };
       const compositeName = `S:${JSON.stringify(mergedData)}`;

       await prisma.$executeRawUnsafe(
         `UPDATE "Project" SET "projectName" = $1, "clientName" = $2, status = $3, updatedAt = NOW() WHERE id = $4`,
         compositeName, mergedData.clientName, mergedData.status, id
       );
       revalidatePath('/');
       return mergedData;
    } catch (sqlE) { throw sqlE; }
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath('/');
  } catch (error) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "Project" WHERE id = $1`, id);
      revalidatePath('/');
    } catch (sqlError) {}
  }
}

// --- Announcement Actions ---
export async function getAnnouncements() {
  try { return await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; }
}

export async function addAnnouncementAction(announcement: Announcement) {
  try { return await prisma.announcement.create({ data: announcement as any }); } catch (e) { return null; }
}

export async function deleteAnnouncementAction(id: string) {
  try { await prisma.announcement.delete({ where: { id } }); } catch (e) {}
}

// --- Audit Log Actions ---
export async function getAuditLogs() { try { return await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; } }
export async function addAuditLogAction(log: AuditLog) { try { return await prisma.auditLog.create({ data: log as any }); } catch (e) { return null; } }

// --- Leave Request Actions ---
export async function getLeaveRequests() { try { return await prisma.leaveRequest.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; } }
export async function addLeaveRequestAction(request: LeaveRequest) { try { return await prisma.leaveRequest.create({ data: request as any }); } catch (e) { throw e; } }
export async function updateLeaveRequestAction(id: string, updates: Partial<LeaveRequest>) { try { return await prisma.leaveRequest.update({ where: { id }, data: updates as any }); } catch (e) { throw e; } }
export async function deleteLeaveRequestAction(id: string) { try { await prisma.leaveRequest.delete({ where: { id } }); } catch (e) {} }

// --- Expense Actions ---
export async function getExpenses() { try { return await prisma.expense.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; } }
export async function addExpenseAction(expense: Expense) { try { return await prisma.expense.create({ data: expense as any }); } catch (e) { throw e; } }
export async function updateExpenseAction(id: string, updates: Partial<Expense>) { try { return await prisma.expense.update({ where: { id }, data: updates as any }); } catch (e) { throw e; } }
export async function deleteExpenseAction(id: string) { try { await prisma.expense.delete({ where: { id } }); } catch (e) {} }

// --- Income Actions ---
export async function getIncome() { try { return await prisma.income.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; } }
export async function addIncomeAction(income: Income) { try { return await prisma.income.create({ data: income as any }); } catch (e) { throw e; } }
export async function deleteIncomeAction(id: string) { try { await prisma.income.delete({ where: { id } }); } catch (e) {} }

// --- Bill Actions ---
export async function getBills() { try { return await prisma.bill.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; } }
export async function addBillAction(bill: Bill) { try { return await prisma.bill.create({ data: bill as any }); } catch (e) { return null; } }
export async function updateBillAction(id: string, updates: Partial<Bill>) { try { return await prisma.bill.update({ where: { id }, data: updates as any }); } catch (e) { return null; } }
export async function deleteBillAction(id: string) { try { await prisma.bill.delete({ where: { id } }); } catch (e) {} }

// --- Payroll Actions ---
export async function getPayroll() { try { return await (prisma as any).payroll.findMany({ orderBy: { month: 'desc' } }); } catch (e) { return []; } }
export async function addPayrollAction(payroll: any) { try { return await (prisma as any).payroll.create({ data: payroll as any }); } catch (e) { return null; } }
export async function deletePayrollAction(id: string) { try { await (prisma as any).payroll.delete({ where: { id } }); } catch (e) {} }

// --- Break Request Actions ---
export async function getBreakRequests() { try { const p = prisma as any; return await p.breakRequest.findMany({ orderBy: { createdAt: 'desc' } }); } catch (e) { return []; } }
export async function addBreakRequestAction(data: any) { try { const p = prisma as any; return await p.breakRequest.create({ data: data as any }); } catch (e) { return null; } }
export async function updateBreakRequestAction(id: string, updates: any) { try { const p = prisma as any; return await p.breakRequest.update({ where: { id }, data: updates as any }); } catch (e) { return null; } }

// --- Department Actions ---
export async function getDepartments() { try { return await prisma.department.findMany({ orderBy: { name: 'asc' } }); } catch (e) { return []; } }
export async function addDepartmentAction(name: string) { try { return await prisma.department.create({ data: { name } as any }); } catch (e) { return null; } }
export async function updateDepartmentAction(id: string, name: string) { try { return await prisma.department.update({ where: { id }, data: { name } as any }); } catch (e) { return null; } }

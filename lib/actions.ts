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

export async function addUserAction(user: any) {
  try { return await prisma.user.create({ data: user }); } catch (e) { return null; }
}

export async function updateUserAction(id: string, updates: any) {
  try { return await prisma.user.update({ where: { id }, data: updates }); } catch (e) { return null; }
}

export async function deleteUserAction(id: string) {
  try { await prisma.user.delete({ where: { id } }); return true; } catch (e) { return false; }
}

// --- Employee Actions ---
export async function getEmployees() {
  try { 
    const raw = await prisma.employee.findMany({ orderBy: { updatedAt: 'desc' } });
    return raw.map((e: any) => {
      let extra: any = {};
      if (e.fatherName?.startsWith('S:')) {
        try {
          extra = JSON.parse(e.fatherName.substring(2));
        } catch (err) {}
      }
      return {
        ...e,
        fatherName: extra.fatherName || e.fatherName || '',
        cnic: extra.cnic || ''
      };
    });
  } catch (e) { return []; }
}

export async function addEmployeeAction(employee: Employee) {
  try {
    const superFather = `S:${JSON.stringify({ fatherName: employee.fatherName, cnic: employee.cnic || '' })}`;
    const data = {
      ...employee,
      salary: employee.salary || 0,
      monthlyHours: employee.monthlyHours || 176,
      status: employee.status || 'active',
      joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
      phone: employee.phone || '0300-0000000',
      email: employee.email || 'employee@growzix.com',
      position: employee.position || 'Employee',
      fatherName: superFather,
      address: employee.address || ''
    };
    // @ts-ignore
    delete data.cnic;
    return await prisma.employee.create({ data: data as any });
  } catch (e) { throw e; }
}

export async function updateEmployeeAction(id: string, updates: Partial<Employee>) {
  try {
    const existing = await prisma.employee.findUnique({ where: { id } });
    let currentExtra: any = {};
    if (existing?.fatherName?.startsWith('S:')) {
      try {
        currentExtra = JSON.parse(existing.fatherName.substring(2));
      } catch (err) {}
    }

    const newFatherName = updates.fatherName !== undefined ? updates.fatherName : (currentExtra.fatherName || existing?.fatherName || '');
    const newCnic = updates.cnic !== undefined ? updates.cnic : (currentExtra.cnic || '');
    
    const superFather = `S:${JSON.stringify({ fatherName: newFatherName, cnic: newCnic })}`;
    
    const data = { ...updates, fatherName: superFather };
    // @ts-ignore
    delete data.cnic;

    return await prisma.employee.update({ where: { id }, data: data as any });
  } catch (e) { throw e; }
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
      orderBy: { updatedAt: 'desc' },
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
        ...extraData, // This spreads other fields
        status: p.status, // FORCE the DB column to be the source of truth for status
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
  // Super-Persistence: Include status explicitly
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
    clientName: project.clientName,
    status: project.status || 'Working on'
  };
  
  const compositeName = `S:${JSON.stringify(superData)}`;

  const dbData = {
    id: project.id,
    projectName: compositeName,
    clientName: project.clientName || "Client",
    scope: project.scope || "",
    totalBudget: Number(project.cost) || 0,
    amountReceived: Number(project.amountReceived) || 0,
    status: project.status || "Working on",
    startDate: project.startDate || new Date().toISOString().split('T')[0],
    deadline: project.deadline || ""
  };

  try {
    const result = await (prisma as any).project.create({ data: dbData });
    revalidatePath('/');
    return result;
  } catch (error: any) {
    try {
      const q = `INSERT INTO "Project" (id, "projectName", "clientName", scope, "totalBudget", "amountReceived", status, "startDate", deadline, "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`;
      
      await prisma.$executeRawUnsafe(q, dbData.id, dbData.projectName, dbData.clientName, dbData.scope, dbData.totalBudget, dbData.amountReceived, dbData.status, dbData.startDate, dbData.deadline);
      revalidatePath('/');
      return { ...project, projectName: compositeName, status: dbData.status };
    } catch (sqlError) { throw sqlError; }
  }
}

export async function updateProjectAction(id: string, updates: Partial<Project>) {
  try {
    const p = await (prisma.project as any).findUnique({ where: { id } });
    if (!p) {
      console.error(`Project not found: ${id}`);
      return null;
    }

    let currentData: any = {};
    const nameStr = p.projectName || "";
    
    // Improved parsing with fallback
    if (nameStr.startsWith('S:')) {
      try {
        currentData = JSON.parse(nameStr.substring(2));
      } catch (e) {
        currentData = { projectName: nameStr };
      }
    } else {
      currentData = { projectName: nameStr.split('||')[0] };
    }

    // Merge updates into our JSON object
    const mergedData = { ...currentData, ...updates };
    const compositeName = `S:${JSON.stringify(mergedData)}`;

    // Prepare DB update with proper type casting for Int fields
    const dbUpdates: any = {
      projectName: compositeName,
      status: updates.status || mergedData.status || 'Working on',
      clientName: updates.clientName || mergedData.clientName || 'Client',
      scope: updates.scope || mergedData.scope || '',
      deadline: updates.deadline || mergedData.deadline || '',
      totalBudget: Math.floor(Number(mergedData.cost || mergedData.totalBudget || 0)),
      amountReceived: Math.floor(Number(mergedData.amountReceived || 0)),
      updatedAt: new Date()
    };

    const result = await (prisma.project as any).update({ 
      where: { id }, 
      data: dbUpdates 
    });
    
    revalidatePath('/');
    return mergedData;
  } catch (e: any) {
    console.error("Critical update error:", e.message || e);
    
    // Fallback: If regular update fails, try direct SQL for status at least
    try {
      if (updates.status) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Project" SET status = $1, "updatedAt" = NOW() WHERE id = $2`,
          updates.status, id
        );
        revalidatePath('/');
        return { ...updates, id }; 
      }
    } catch (sqlE) {
      console.error("SQL Fallback failed:", sqlE);
    }
    
    throw e; // Throw so AppContext knows it failed
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
  try {
    const raw = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    return raw.map((a: any) => {
      const content = a.content || "";
      if (content.startsWith('S:')) {
        try {
          const extra = JSON.parse(content.substring(2));
          return { ...a, ...extra, content: extra.content || content };
        } catch (e) { return a; }
      }
      return a;
    });
  } catch (e) { return []; }
}

export async function addAnnouncementAction(announcement: Announcement) {
  const superData = { ...announcement, seenBy: "" };
  const compositeContent = `S:${JSON.stringify(superData)}`;
  
  try {
    // 1. Try Prisma (Include ID to prevent mismatch)
    const result = await prisma.announcement.create({ 
      data: {
        id: announcement.id,
        title: announcement.title,
        content: compositeContent,
        author: announcement.author,
        priority: announcement.priority,
        createdAt: new Date()
      } as any 
    });
    revalidatePath('/');
    return result;
  } catch (e) {
    console.warn("Announcement prisma failed, using SQL fallback");
    try {
      // 2. Direct SQL Fallback
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Announcement" (id, title, content, author, priority, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())`,
        announcement.id, announcement.title, compositeContent, announcement.author, announcement.priority
      );
      revalidatePath('/');
      return announcement;
    } catch (sqlE) {
      console.error("Announcement critical failure", sqlE);
      return null;
    }
  }
}

export async function markAnnouncementAsReadAction(id: string, readerName: string, readerRole: string) {
  try {
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) return null;
    
    let currentData: any = {};
    if (ann.content.startsWith('S:')) {
      currentData = JSON.parse(ann.content.substring(2));
    } else {
      currentData = { content: ann.content, seenBy: "" };
    }

    const currentSeenBy = currentData.seenBy || "";
    if (currentSeenBy.includes(readerName)) return ann;

    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = `${days[now.getDay()]}, ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    const readReceipt = `${readerName} (${readerRole.toUpperCase()}) at ${timeStr} on ${dateStr}`;

    currentData.seenBy = currentSeenBy ? `${currentSeenBy}\n${readReceipt}` : readReceipt;
    const compositeContent = `S:${JSON.stringify(currentData)}`;

    return await prisma.announcement.update({ 
      where: { id }, 
      data: { content: compositeContent } as any 
    });
  } catch (e) { return null; }
}

export async function deleteAnnouncementAction(id: string) {
  try { await prisma.announcement.delete({ where: { id } }); } catch (e) {}
}

export async function updateAnnouncementAction(id: string, updates: Partial<Announcement>) {
  try {
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) return null;

    let currentData: any = {};
    if (ann.content.startsWith('S:')) {
      try {
        currentData = JSON.parse(ann.content.substring(2));
      } catch (e) {
        currentData = { content: ann.content };
      }
    } else {
      currentData = { content: ann.content };
    }

    // Merge updates into our JSON object
    const mergedData = { ...currentData, ...updates };
    const compositeContent = `S:${JSON.stringify(mergedData)}`;

    return await prisma.announcement.update({
      where: { id },
      data: {
        title: updates.title || ann.title,
        content: compositeContent,
        author: updates.author || ann.author,
        priority: updates.priority || ann.priority,
        updatedAt: new Date()
      } as any
    });
  } catch (e) {
    console.error("Broadcast update failed:", e);
    return null;
  }
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
export async function updateIncomeAction(id: string, updates: Partial<Income>) { try { return await prisma.income.update({ where: { id }, data: updates as any }); } catch (e) { throw e; } }
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
export async function deleteBreakRequestAction(id: string) { try { const p = prisma as any; await p.breakRequest.delete({ where: { id } }); } catch (e) {} }

// --- Department Actions ---
export async function getDepartments() { try { return await prisma.department.findMany({ orderBy: { name: 'asc' } }); } catch (e) { return []; } }
export async function addDepartmentAction(name: string) { try { return await prisma.department.create({ data: { name } as any }); } catch (e) { return null; } }
export async function updateDepartmentAction(id: string, name: string) { try { return await prisma.department.update({ where: { id }, data: { name } as any }); } catch (e) { return null; } }
export async function deleteDepartmentAction(id: string) { try { await prisma.department.delete({ where: { id } }); } catch (e) {} }

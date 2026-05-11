# NexaERP - AI-Powered Enterprise Management System

A complete, full-featured ERP system built with Next.js, TypeScript, and Tailwind CSS. Features role-based access control, real-time performance tracking, financial management, and comprehensive employee management.

## 🚀 Features

- **Role-Based Authentication**: Admin, E-Commerce Manager, Marketing Manager, Architecture Manager
- **Employee Management**: Add, edit, delete employees with full profile management
- **Attendance Tracking**: Real-time attendance with check-in/check-out times
- **Performance Analytics**: AI-powered scoring system with quality metrics
- **Financial Management**: Income tracking, expense management, P&L reports
- **Payroll System**: Automated salary calculation with bonuses and deductions
- **Audit Logging**: Complete system activity tracking
- **Real-time Dashboard**: Live statistics and performance metrics

## 🔐 Login Credentials

### Admin Account
- **Email**: `admin@nexaerp.com`
- **Password**: `admin123`
- **Access**: Full system access including finance, payroll, and all management features

### E-Commerce Manager
- **Email**: `ecommerce@nexaerp.com`
- **Password**: `eCommerce123`
- **Access**: E-Commerce team management, attendance, performance tracking

### Marketing Manager
- **Email**: `marketing@nexaerp.com`
- **Password**: `marketing123`
- **Access**: Marketing team management, attendance, performance tracking

### Architecture Manager
- **Email**: `architecture@nexaerp.com`
- **Password**: `architecture123`
- **Access**: Architecture team management, attendance, performance tracking

## 📦 Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd erp-system
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Login Process
1. Open the application in your browser
2. Select your role by clicking one of the four role buttons (Admin, E-Commerce, Marketing, Architecture)
3. The email and password fields will auto-fill with the demo credentials
4. Click "Enter System" to login

### Admin Dashboard Features
- **Dashboard**: View overall company performance, income, expenses, and profit
- **Employees**: Manage all employees across all departments
- **Attendance**: Track and manage attendance for all employees
- **Performance**: View performance analytics and AI scores
- **Finance**: Manage income, view P&L reports (Admin only)
- **Expenses**: Track and approve expenses
- **Payroll**: Generate salary slips with bonuses and deductions (Admin only)
- **Audit Log**: View all system activities (Admin only)

### Manager Dashboard Features
- **Dashboard**: View team statistics and performance
- **My Team**: Manage employees in your department
- **Attendance**: Mark and track team attendance
- **Performance**: View team performance and add task logs

## 📊 System Features

### Employee Management
- Add new employees with complete profile information
- Edit employee details (name, position, salary, department)
- Delete employees (Admin only)
- View employee performance scores
- Track employee status (active/inactive)

### Attendance System
- Mark daily attendance (Present, Late, Absent, Leave)
- Record check-in and check-out times
- Calculate working hours automatically
- View today's attendance or all records
- Edit attendance records

### Performance Tracking
- AI-powered scoring system (0-100)
- Task logging with completion percentage
- Quality score tracking
- Automatic performance alerts for low scores
- Monthly performance summaries
- Department-wise performance comparison

### Financial Management (Admin Only)
- Income tracking from clients
- Expense management with approval workflow
- Real-time P&L calculations
- Profit margin analysis
- Pending income tracking

### Payroll System (Admin Only)
- Automated salary calculations
- Performance-based bonuses (5-10% for high performers)
- Absence deductions
- Detailed salary slips
- Monthly payroll summaries

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Storage**: In-memory (client-side)

### Project Structure
```
erp-system/
├── app/
│   ├── layout.tsx          # Root layout with AppProvider
│   ├── page.tsx            # Main page (Login/Dashboard router)
│   └── globals.css         # Global styles
├── components/
│   ├── LoginPage.tsx       # Authentication page
│   ├── MainApp.tsx         # Main application layout
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Dashboard.tsx       # Dashboard component
│   ├── EmployeesPage.tsx   # Employee management
│   ├── AttendancePage.tsx  # Attendance tracking
│   ├── PerformancePage.tsx # Performance analytics
│   ├── FinancePage.tsx     # Financial management
│   ├── ExpensesPage.tsx    # Expense tracking
│   ├── PayrollPage.tsx     # Payroll system
│   └── AuditPage.tsx       # Audit logging
├── context/
│   └── AppContext.tsx      # Global state management
├── lib/
│   └── data.ts             # Initial data and users
└── types/
    └── index.ts            # TypeScript type definitions
```

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with purple accent colors
- **Responsive Design**: Works on desktop and tablet devices
- **Smooth Animations**: Polished transitions and hover effects
- **Intuitive Navigation**: Easy-to-use sidebar navigation
- **Real-time Updates**: Instant data updates across the system
- **Modal Dialogs**: Clean modal interfaces for forms
- **Data Tables**: Sortable, filterable data tables
- **Status Badges**: Color-coded status indicators
- **Progress Bars**: Visual progress indicators
- **Score Circles**: Performance score visualizations

## 📈 Performance Scoring System

The AI-powered scoring system calculates employee performance based on:
- **Completion Rate (50%)**: Task completion percentage
- **Quality Score (30%)**: Work quality rating
- **Time Efficiency (20%)**: Hours worked vs expected

**Score Ranges**:
- 90-100: Excellent (10% bonus)
- 75-89: Good (5% bonus)
- 60-74: Average (no bonus)
- Below 60: Low (performance alert)

## 🔒 Security Features

- Role-based access control
- Protected routes for admin-only features
- Audit logging for all system activities
- Session-based authentication

## 📝 Sample Data

The system comes pre-loaded with:
- 9 employees across 3 departments
- Recent attendance records
- Task logs with performance scores
- Income and expense records
- Audit log entries

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Key Highlights

- **Real Project**: Fully functional with real data management
- **Complete CRUD**: Create, Read, Update, Delete operations
- **Live Calculations**: Real-time salary, bonus, and deduction calculations
- **Performance Alerts**: Automatic alerts for low performance
- **Audit Trail**: Complete activity logging
- **Professional UI**: Modern, clean, and intuitive interface
- **Type-Safe**: Full TypeScript implementation

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

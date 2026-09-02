export type Company = {
  id: string;
  name: string;
  nameAr: string;
  commercialName: string;
  logo?: string;
  taxId: string;
  commercialRegistration: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  establishedDate: string;
  businessType: string;
  industry: string;
  isActive: boolean;
  settings: {
    currency: string;
    language: string;
    timezone: string;
    workingDays: string[];
    workingHours: { start: string; end: string };
  };
  contactPerson: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  bankAccounts: {
    bankName: string;
    accountNumber: string;
    iban: string;
    currency: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type Branch = {
  id: string;
  companyId: string;
  name: string;
  nameAr: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  managerPhone: string;
  managerEmail: string;
  workingHours: string;
  workingDays: string[];
  services: string[];
  area?: string;
  landmark?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  isMainBranch: boolean;
  capacity: {
    dailyServiceCapacity: number;
    showroomCapacity: number;
    parkingSpaces: number;
  };
  facilities: string[];
  licenseNumber?: string;
  licenseExpiry?: string;
  branchType: "showroom" | "service_center" | "both";
  createdAt: string;
  updatedAt: string;
};

export type Station = {
  id: string;
  branchId: string;
  companyId: string;
  name: string;
  nameAr: string;
  code: string;
  type: "service_bay" | "inspection_bay" | "wash_bay" | "diagnostic_bay" | "delivery_bay";
  status: "active" | "maintenance" | "inactive";
  capacity: number;
  currentLoad: number;
  assignedTechnicians: string[];
  equipment: string[];
  specialization: string[];
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type Listener = () => void;
let listeners: Listener[] = [];
export const subscribeData = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
export const notifyData = () => listeners.forEach((l) => l());


export const companies: Company[] = [
  {
    id: "c1",
    name: "Suzuki Egypt Automotive",
    nameAr: "سوزوكي مصر للسيارات",
    commercialName: "Suzuki Egypt",
    taxId: "123-456-789",
    commercialRegistration: "123456789",
    address: "12 El-Tayaran Street, Nasr City",
    city: "Cairo",
    country: "Egypt",
    phone: "+20 2 2267 8900",
    email: "info@suzuki-egypt.com",
    website: "https://www.suzuki-egypt.com",
    establishedDate: "2010-01-15",
    businessType: "Automotive Dealership",
    industry: "Automotive",
    isActive: true,
    settings: {
      currency: "EGP",
      language: "Arabic",
      timezone: "Africa/Cairo",
      workingDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      workingHours: { start: "08:00", end: "20:00" },
    },
    contactPerson: {
      name: "Ahmed Mohamed",
      position: "General Manager",
      phone: "+20 100 123 4567",
      email: "gm@suzuki-egypt.com",
    },
    bankAccounts: [
      {
        bankName: "National Bank of Egypt",
        accountNumber: "12345678901234567890",
        iban: "EG123456789012345678901234567890",
        currency: "EGP",
      },
    ],
    createdAt: "2010-01-15",
    updatedAt: "2026-08-20",
  },
  {
    id: "c2",
    name: "Delta Motors",
    nameAr: "دلتا موتورز",
    commercialName: "Delta Motors",
    taxId: "987-654-321",
    commercialRegistration: "987654321",
    address: "Industrial Zone, 6th of October",
    city: "Giza",
    country: "Egypt",
    phone: "+20 2 3834 5600",
    email: "info@deltamotors.com",
    establishedDate: "2015-06-20",
    businessType: "Automotive Service",
    industry: "Automotive",
    isActive: true,
    settings: {
      currency: "EGP",
      language: "Arabic",
      timezone: "Africa/Cairo",
      workingDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      workingHours: { start: "09:00", end: "18:00" },
    },
    contactPerson: {
      name: "Mona Ali",
      position: "Operations Manager",
      phone: "+20 122 345 6789",
      email: "operations@deltamotors.com",
    },
    bankAccounts: [
      {
        bankName: "Banque Misr",
        accountNumber: "09876543210987654321",
        iban: "EG098765432109876543210987654321",
        currency: "EGP",
      },
    ],
    createdAt: "2015-06-20",
    updatedAt: "2026-08-20",
  },
];

export const branches: Branch[] = [
  {
    id: "b1",
    companyId: "c1",
    name: "Nasr City Showroom",
    nameAr: "معرض مدينة نصر",
    code: "NSR-001",
    city: "Cairo",
    address: "12 El-Tayaran St., Nasr City",
    phone: "+20 2 2267 8900",
    email: "nascity@suzuki-egypt.com",
    manager: "Ahmed Khaled",
    managerPhone: "+20 100 123 4567",
    managerEmail: "ahmed.khaled@suzuki-egypt.com",
    workingHours: "8:00 AM - 8:00 PM",
    workingDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    services: ["Sales", "Service", "Parts"],
    area: "Nasr City",
    landmark: "Near City Stars Mall",
    gpsCoordinates: { latitude: 30.0478, longitude: 31.2357 },
    isActive: true,
    isMainBranch: true,
    capacity: {
      dailyServiceCapacity: 50,
      showroomCapacity: 20,
      parkingSpaces: 100,
    },
    facilities: ["Showroom", "Service Center", "Parts Department", "Customer Lounge", "WiFi"],
    licenseNumber: "LIC-2020-001",
    licenseExpiry: "2025-12-31",
    branchType: "both",
    createdAt: "2020-01-15",
    updatedAt: "2026-08-20",
  },
  {
    id: "b2",
    companyId: "c1",
    name: "6th of October Service Center",
    nameAr: "مركز خدمة 6 أكتوبر",
    code: "OCT-001",
    city: "Giza",
    address: "Industrial Zone, 6th of October",
    phone: "+20 2 3834 5600",
    email: "october@suzuki-egypt.com",
    manager: "Mona Ali",
    managerPhone: "+20 122 345 6789",
    managerEmail: "mona.ali@suzuki-egypt.com",
    workingHours: "9:00 AM - 6:00 PM",
    workingDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    services: ["Service", "Parts"],
    area: "6th of October",
    landmark: "Industrial Zone",
    gpsCoordinates: { latitude: 29.9792, longitude: 30.9283 },
    isActive: true,
    isMainBranch: false,
    capacity: {
      dailyServiceCapacity: 30,
      showroomCapacity: 0,
      parkingSpaces: 50,
    },
    facilities: ["Service Center", "Parts Department", "Customer Waiting Area"],
    licenseNumber: "LIC-2020-002",
    licenseExpiry: "2025-12-31",
    branchType: "service_center",
    createdAt: "2020-03-20",
    updatedAt: "2026-08-20",
  },
  {
    id: "b3",
    companyId: "c1",
    name: "Smouha Branch",
    nameAr: "فرع سموحة",
    code: "SMO-001",
    city: "Alexandria",
    address: "8 Victor Emanuel St., Smouha",
    phone: "+20 3 4871 2300",
    email: "smouha@suzuki-egypt.com",
    manager: "Tarek Hamed",
    managerPhone: "+20 111 234 5678",
    managerEmail: "tarek.hamed@suzuki-egypt.com",
    workingHours: "8:30 AM - 7:30 PM",
    workingDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    services: ["Sales", "Service", "Parts"],
    area: "Smouha",
    landmark: "Near Smouha Club",
    gpsCoordinates: { latitude: 31.2018, longitude: 29.9187 },
    isActive: true,
    isMainBranch: false,
    capacity: {
      dailyServiceCapacity: 40,
      showroomCapacity: 15,
      parkingSpaces: 80,
    },
    facilities: ["Showroom", "Service Center", "Parts Department", "Customer Lounge"],
    licenseNumber: "LIC-2020-003",
    licenseExpiry: "2025-12-31",
    branchType: "both",
    createdAt: "2020-06-10",
    updatedAt: "2026-08-20",
  },
  {
    id: "b4",
    companyId: "c2",
    name: "Mansoura Branch",
    nameAr: "فرع المنصورة",
    code: "MNS-001",
    city: "Dakahlia",
    address: "Gehan St., Mansoura",
    phone: "+20 50 2345 6700",
    email: "mansoura@deltamotors.com",
    manager: "Nadia Mostafa",
    managerPhone: "+20 109 876 5432",
    managerEmail: "nadia.mostafa@deltamotors.com",
    workingHours: "9:00 AM - 5:00 PM",
    workingDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    services: ["Sales", "Service"],
    area: "Mansoura",
    landmark: "City Center",
    gpsCoordinates: { latitude: 31.0379, longitude: 31.3785 },
    isActive: true,
    isMainBranch: true,
    capacity: {
      dailyServiceCapacity: 25,
      showroomCapacity: 10,
      parkingSpaces: 40,
    },
    facilities: ["Showroom", "Service Center", "Customer Waiting Area"],
    licenseNumber: "LIC-2021-001",
    licenseExpiry: "2026-12-31",
    branchType: "both",
    createdAt: "2021-02-28",
    updatedAt: "2026-08-20",
  },
];

export const stations: Station[] = [
  {
    id: "s1",
    branchId: "b1",
    companyId: "c1",
    name: "Service Bay 1",
    nameAr: "محطة خدمة 1",
    code: "SB-NSR-001",
    type: "service_bay",
    status: "active",
    capacity: 2,
    currentLoad: 1,
    assignedTechnicians: ["e1", "e2"],
    equipment: ["Lift", "Diagnostic Tool", "Wheel Alignment"],
    specialization: ["General Service", "Oil Change"],
    isActive: true,
    createdAt: "2020-01-20",
    updatedAt: "2026-08-20",
  },
  {
    id: "s2",
    branchId: "b1",
    companyId: "c1",
    name: "Service Bay 2",
    nameAr: "محطة خدمة 2",
    code: "SB-NSR-002",
    type: "service_bay",
    status: "active",
    capacity: 2,
    currentLoad: 0,
    assignedTechnicians: ["e3"],
    equipment: ["Lift", "Diagnostic Tool"],
    specialization: ["General Service", "Brake Service"],
    isActive: true,
    createdAt: "2020-01-20",
    updatedAt: "2026-08-20",
  },
  {
    id: "s3",
    branchId: "b1",
    companyId: "c1",
    name: "Inspection Bay",
    nameAr: "محطة فحص",
    code: "IB-NSR-001",
    type: "inspection_bay",
    status: "active",
    capacity: 1,
    currentLoad: 0,
    assignedTechnicians: ["e7"],
    equipment: ["Inspection Lights", "Brake Tester", "Emission Tester"],
    specialization: ["Vehicle Inspection", "Safety Check"],
    isActive: true,
    createdAt: "2020-01-20",
    updatedAt: "2026-08-20",
  },
  {
    id: "s4",
    branchId: "b2",
    companyId: "c1",
    name: "Service Bay 1",
    nameAr: "محطة خدمة 1",
    code: "SB-OCT-001",
    type: "service_bay",
    status: "active",
    capacity: 2,
    currentLoad: 1,
    assignedTechnicians: ["e4"],
    equipment: ["Lift", "Diagnostic Tool", "Transmission Service"],
    specialization: ["General Service", "Transmission Service"],
    isActive: true,
    createdAt: "2020-03-25",
    updatedAt: "2026-08-20",
  },
  {
    id: "s5",
    branchId: "b3",
    companyId: "c1",
    name: "Service Bay 1",
    nameAr: "محطة خدمة 1",
    code: "SB-SMO-001",
    type: "service_bay",
    status: "active",
    capacity: 2,
    currentLoad: 0,
    assignedTechnicians: ["e5"],
    equipment: ["Lift", "Diagnostic Tool"],
    specialization: ["General Service", "Air Conditioning"],
    isActive: true,
    createdAt: "2020-06-15",
    updatedAt: "2026-08-20",
  },
  {
    id: "s6",
    branchId: "b4",
    companyId: "c2",
    name: "Service Bay 1",
    nameAr: "محطة خدمة 1",
    code: "SB-MNS-001",
    type: "service_bay",
    status: "maintenance",
    capacity: 2,
    currentLoad: 0,
    assignedTechnicians: ["e6"],
    equipment: ["Lift", "Diagnostic Tool"],
    specialization: ["General Service"],
    isActive: false,
    notes: "Under maintenance - lift repair",
    createdAt: "2021-03-05",
    updatedAt: "2026-08-20",
  },
];

export const employees: Employee[] = [
  { id: "e1", name: "Mohamed Nashaat", role: "Service Advisor", branchId: "b1", available: true, workingHours: 8, hourlyRate: 150, specialization: "Premium Service", slotDuration: 15, schedule: { monday: { start: "08:00", end: "16:00" }, tuesday: { start: "08:00", end: "16:00" }, wednesday: { start: "08:00", end: "16:00" }, thursday: { start: "08:00", end: "16:00" }, saturday: { start: "09:00", end: "15:00" } } },
  { id: "e2", name: "Hazem Nabil", role: "Service Advisor", branchId: "b1", available: true, workingHours: 8, hourlyRate: 140, specialization: "Fleet Management", slotDuration: 30, schedule: { monday: { start: "09:00", end: "17:00" }, tuesday: { start: "09:00", end: "17:00" }, wednesday: { start: "09:00", end: "17:00" }, thursday: { start: "09:00", end: "17:00" }, saturday: { start: "10:00", end: "16:00" } } },
  { id: "e3", name: "Yara Kamal", role: "Service Advisor", branchId: "b1", available: false, workingHours: 6, hourlyRate: 130, specialization: "Test Drives", slotDuration: 60, schedule: { sunday: { start: "10:00", end: "16:00" }, monday: { start: "10:00", end: "16:00" }, tuesday: { start: "10:00", end: "16:00" } } },
  { id: "e4", name: "Mostafa Diaa", role: "Service Advisor", branchId: "b2", available: true, workingHours: 9, hourlyRate: 145, specialization: "Commercial Vehicles", slotDuration: 15, schedule: { saturday: { start: "08:00", end: "17:00" }, sunday: { start: "08:00", end: "17:00" }, monday: { start: "08:00", end: "17:00" }, tuesday: { start: "08:00", end: "17:00" }, wednesday: { start: "08:00", end: "17:00" } } },
  { id: "e5", name: "Rana Sherif", role: "Service Advisor", branchId: "b3", available: true, workingHours: 8, hourlyRate: 135, specialization: "Warranty Claims", slotDuration: 20, schedule: { monday: { start: "08:30", end: "16:30" }, tuesday: { start: "08:30", end: "16:30" }, wednesday: { start: "08:30", end: "16:30" }, thursday: { start: "08:30", end: "16:30" }, saturday: { start: "09:30", end: "15:30" } } },
  { id: "e6", name: "Tarek Amin", role: "Service Advisor", branchId: "b4", available: true, workingHours: 7, hourlyRate: 125, specialization: "New Vehicle Delivery", slotDuration: 45, schedule: { saturday: { start: "09:00", end: "16:00" }, sunday: { start: "09:00", end: "16:00" }, monday: { start: "09:00", end: "16:00" }, tuesday: { start: "09:00", end: "16:00" } } },
  { id: "e7", name: "Ahmed Fathy", role: "Engineer", branchId: "b1", available: true, workingHours: 10, hourlyRate: 200, specialization: "Engine Specialist", slotDuration: 10, schedule: { saturday: { start: "07:00", end: "17:00" }, sunday: { start: "07:00", end: "17:00" }, monday: { start: "07:00", end: "17:00" }, tuesday: { start: "07:00", end: "17:00" }, wednesday: { start: "07:00", end: "17:00" }, thursday: { start: "07:00", end: "17:00" } } },
  { id: "e8", name: "Sara Mohamed", role: "Engineer", branchId: "b2", available: false, workingHours: 8, hourlyRate: 180, specialization: "Electrical Systems", slotDuration: 30, schedule: { monday: { start: "10:00", end: "18:00" }, tuesday: { start: "10:00", end: "18:00" }, wednesday: { start: "10:00", end: "18:00" } } },
];

export type VehicleModel = {
  id: string;
  name: string;
  category: "Sedan" | "SUV" | "Hatchback" | "Pickup" | "Van";
  year: number;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  branchId: string;
  available: boolean;
  workingHours: number;
  hourlyRate: number;
  specialization?: string;
  slotDuration?: number; // Time slot duration in minutes (15, 30, 45, 60, etc.)
  schedule?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
};

export type SystemUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  nameAr?: string;
  role: UserRole;
  roleId: string;
  companyId: string;
  branchId?: string;
  stationIds?: string[];
  permissions: Permission[];
  pageAccess: PageAccess[];
  status: "Active" | "Inactive" | "Suspended";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  reportsTo?: string;
  settings: {
    language: string;
    timezone: string;
    dateFormat: string;
    theme: string;
  };
};

export type UserRole = "Super Admin" | "Admin" | "Manager" | "Supervisor" | "Staff" | "Viewer" | "Technician" | "Advisor";

export type Role = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  companyId: string;
  permissions: Permission[];
  pageAccess: PageAccess[];
  isSystemRole: boolean;
  isDefault: boolean;
  level: number; // Higher number = more privileges
  canManageUsers: boolean;
  canManageRoles: boolean;
  canEditSettings: boolean;
  canViewReports: boolean;
  canDeleteData: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Permission = {
  id: string;
  name: string;
  nameAr: string;
  module: string;
  action: string;
  description: string;
  category: "read" | "write" | "delete" | "admin" | "export" | "import";
};

export type PageAccess = {
  pageId: string;
  pageName: string;
  pageNameAr: string;
  accessLevel: "full" | "read" | "write" | "none";
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canExport: boolean;
  canImport: boolean;
  restrictions?: string[];
};

export type SystemDefinition = {
  id: string;
  category: string;
  key: string;
  value: string;
  valueAr: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  companyId?: string;
  color?: string;
  icon?: string;
};

export type StatusDefinition = {
  id: string;
  entityType: string;
  status: string;
  statusAr: string;
  description: string;
  color: string;
  backgroundColor: string;
  textColor: string;
  isDefault: boolean;
  isTerminal: boolean;
  nextStatuses: string[];
  companyId?: string;
  sortOrder: number;
};

export const availablePermissions: Permission[] = [
  // Company Management
  { id: "p1", name: "view_companies", nameAr: "عرض الشركات", module: "Companies", action: "view", description: "View companies list and details", category: "read" },
  { id: "p2", name: "create_companies", nameAr: "إنشاء شركات", module: "Companies", action: "create", description: "Create new companies", category: "write" },
  { id: "p3", name: "edit_companies", nameAr: "تعديل الشركات", module: "Companies", action: "edit", description: "Edit company information", category: "write" },
  { id: "p4", name: "delete_companies", nameAr: "حذف الشركات", module: "Companies", action: "delete", description: "Delete companies", category: "delete" },
  
  // Branch Management
  { id: "p5", name: "view_branches", nameAr: "عرض الفروع", module: "Branches", action: "view", description: "View branch information", category: "read" },
  { id: "p6", name: "create_branches", nameAr: "إنشاء فروع", module: "Branches", action: "create", description: "Create new branches", category: "write" },
  { id: "p7", name: "edit_branches", nameAr: "تعديل الفروع", module: "Branches", action: "edit", description: "Edit branch settings", category: "write" },
  { id: "p8", name: "delete_branches", nameAr: "حذف الفروع", module: "Branches", action: "delete", description: "Delete branches", category: "delete" },
  { id: "p9", name: "manage_branches", nameAr: "إدارة الفروع", module: "Branches", action: "manage", description: "Full branch management", category: "admin" },
  
  // Station Management
  { id: "p10", name: "view_stations", nameAr: "عرض المحطات", module: "Stations", action: "view", description: "View service stations", category: "read" },
  { id: "p11", name: "create_stations", nameAr: "إنشاء محطات", module: "Stations", action: "create", description: "Create new stations", category: "write" },
  { id: "p12", name: "edit_stations", nameAr: "تعديل المحطات", module: "Stations", action: "edit", description: "Edit station settings", category: "write" },
  { id: "p13", name: "delete_stations", nameAr: "حذف المحطات", module: "Stations", action: "delete", description: "Delete stations", category: "delete" },
  
  // Contacts Management
  { id: "p14", name: "view_contacts", nameAr: "عرض العملاء", module: "Contacts", action: "view", description: "View contacts list and details", category: "read" },
  { id: "p15", name: "create_contacts", nameAr: "إنشاء عملاء", module: "Contacts", action: "create", description: "Create new contacts", category: "write" },
  { id: "p16", name: "edit_contacts", nameAr: "تعديل العملاء", module: "Contacts", action: "edit", description: "Edit contact information", category: "write" },
  { id: "p17", name: "delete_contacts", nameAr: "حذف العملاء", module: "Contacts", action: "delete", description: "Delete contacts", category: "delete" },
  { id: "p18", name: "export_contacts", nameAr: "تصدير العملاء", module: "Contacts", action: "export", description: "Export contacts data", category: "export" },
  
  // Appointments Management
  { id: "p19", name: "view_appointments", nameAr: "عرض المواعيد", module: "Appointments", action: "view", description: "View appointments list and details", category: "read" },
  { id: "p20", name: "create_appointments", nameAr: "إنشاء مواعيد", module: "Appointments", action: "create", description: "Create new appointments", category: "write" },
  { id: "p21", name: "edit_appointments", nameAr: "تعديل المواعيد", module: "Appointments", action: "edit", description: "Edit appointment details", category: "write" },
  { id: "p22", name: "delete_appointments", nameAr: "حذف المواعيد", module: "Appointments", action: "delete", description: "Delete appointments", category: "delete" },
  { id: "p23", name: "manage_appointments", nameAr: "إدارة المواعيد", module: "Appointments", action: "manage", description: "Full appointment management", category: "admin" },
  
  // Vehicles Management
  { id: "p24", name: "view_vehicles", nameAr: "عرض المركبات", module: "Vehicles", action: "view", description: "View vehicles list and details", category: "read" },
  { id: "p25", name: "create_vehicles", nameAr: "إنشاء مركبات", module: "Vehicles", action: "create", description: "Add new vehicles", category: "write" },
  { id: "p26", name: "edit_vehicles", nameAr: "تعديل المركبات", module: "Vehicles", action: "edit", description: "Edit vehicle information", category: "write" },
  { id: "p27", name: "delete_vehicles", nameAr: "حذف المركبات", module: "Vehicles", action: "delete", description: "Delete vehicles", category: "delete" },
  
  // Helpdesk Management
  { id: "p28", name: "view_tickets", nameAr: "عرض التذاكر", module: "Helpdesk", action: "view", description: "View support tickets", category: "read" },
  { id: "p29", name: "create_tickets", nameAr: "إنشاء تذاكر", module: "Helpdesk", action: "create", description: "Create support tickets", category: "write" },
  { id: "p30", name: "edit_tickets", nameAr: "تعديل التذاكر", module: "Helpdesk", action: "edit", description: "Edit ticket details", category: "write" },
  { id: "p31", name: "delete_tickets", nameAr: "حذف التذاكر", module: "Helpdesk", action: "delete", description: "Delete tickets", category: "delete" },
  { id: "p32", name: "resolve_tickets", nameAr: "حل التذاكر", module: "Helpdesk", action: "resolve", description: "Resolve and close tickets", category: "write" },
  
  // User Management
  { id: "p33", name: "view_users", nameAr: "عرض المستخدمين", module: "Users", action: "view", description: "View system users", category: "read" },
  { id: "p34", name: "create_users", nameAr: "إنشاء مستخدمين", module: "Users", action: "create", description: "Create new users", category: "write" },
  { id: "p35", name: "edit_users", nameAr: "تعديل المستخدمين", module: "Users", action: "edit", description: "Edit user accounts", category: "write" },
  { id: "p36", name: "delete_users", nameAr: "حذف المستخدمين", module: "Users", action: "delete", description: "Delete user accounts", category: "delete" },
  { id: "p37", name: "manage_user_roles", nameAr: "إدارة أدوار المستخدمين", module: "Users", action: "manage_roles", description: "Assign and manage user roles", category: "admin" },
  
  // Role Management
  { id: "p38", name: "view_roles", nameAr: "عرض الأدوار", module: "Roles", action: "view", description: "View system roles", category: "read" },
  { id: "p39", name: "create_roles", nameAr: "إنشاء أدوار", module: "Roles", action: "create", description: "Create new roles", category: "write" },
  { id: "p40", name: "edit_roles", nameAr: "تعديل الأدوار", module: "Roles", action: "edit", description: "Edit role permissions", category: "write" },
  { id: "p41", name: "delete_roles", nameAr: "حذف الأدوار", module: "Roles", action: "delete", description: "Delete roles", category: "delete" },
  { id: "p42", name: "manage_permissions", nameAr: "إدارة الصلاحيات", module: "Roles", action: "manage_permissions", description: "Manage role permissions", category: "admin" },
  
  // Reports & Analytics
  { id: "p43", name: "view_reports", nameAr: "عرض التقارير", module: "Reports", action: "view", description: "View reports and analytics", category: "read" },
  { id: "p44", name: "create_reports", nameAr: "إنشاء تقارير", module: "Reports", action: "create", description: "Create custom reports", category: "write" },
  { id: "p45", name: "export_reports", nameAr: "تصدير التقارير", module: "Reports", action: "export", description: "Export reports", category: "export" },
  { id: "p46", name: "view_analytics", nameAr: "عرض التحليلات", module: "Reports", action: "analytics", description: "View advanced analytics", category: "read" },
  
  // System Settings
  { id: "p47", name: "system_settings", nameAr: "إعدادات النظام", module: "System", action: "settings", description: "Access system settings", category: "admin" },
  { id: "p48", name: "view_settings", nameAr: "عرض الإعدادات", module: "System", action: "view", description: "View system settings", category: "read" },
  { id: "p49", name: "edit_settings", nameAr: "تعديل الإعدادات", module: "System", action: "edit", description: "Edit system settings", category: "write" },
  { id: "p50", name: "manage_definitions", nameAr: "إدارة التعريفات", module: "System", action: "definitions", description: "Manage system definitions", category: "admin" },
  
  // Data Management
  { id: "p51", name: "export_data", nameAr: "تصدير البيانات", module: "System", action: "export", description: "Export data from system", category: "export" },
  { id: "p52", name: "import_data", nameAr: "استيراد البيانات", module: "System", action: "import", description: "Import data to system", category: "import" },
  { id: "p53", name: "backup_data", nameAr: "نسخ احتياطي", module: "System", action: "backup", description: "Create system backups", category: "admin" },
  { id: "p54", name: "restore_data", nameAr: "استعادة البيانات", module: "System", action: "restore", description: "Restore from backups", category: "admin" },
  
  // Audit & Logs
  { id: "p55", name: "view_audit_logs", nameAr: "عرض سجلات التدقيق", module: "System", action: "audit_logs", description: "View audit logs", category: "read" },
  { id: "p56", name: "view_activity_logs", nameAr: "عرض سجلات النشاط", module: "System", action: "activity_logs", description: "View activity logs", category: "read" },
  
  // Financial
  { id: "p57", name: "view_financial", nameAr: "عرض المالية", module: "Financial", action: "view", description: "View financial data", category: "read" },
  { id: "p58", name: "manage_invoices", nameAr: "إدارة الفواتير", module: "Financial", action: "invoices", description: "Manage invoices", category: "write" },
  { id: "p59", name: "view_pricing", nameAr: "عرض الأسعار", module: "Financial", action: "pricing", description: "View pricing information", category: "read" },
  { id: "p60", name: "edit_pricing", nameAr: "تعديل الأسعار", module: "Financial", action: "edit_pricing", description: "Edit pricing", category: "write" },
];

export const systemPages: PageAccess[] = [
  {
    pageId: "dashboard",
    pageName: "Dashboard",
    pageNameAr: "لوحة التحكم",
    accessLevel: "full",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canExport: true,
    canImport: false,
  },
  {
    pageId: "contacts",
    pageName: "Contacts",
    pageNameAr: "العملاء",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: true,
  },
  {
    pageId: "appointments",
    pageName: "Appointments",
    pageNameAr: "المواعيد",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: false,
  },
  {
    pageId: "vehicles",
    pageName: "Vehicles",
    pageNameAr: "المركبات",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: true,
  },
  {
    pageId: "helpdesk",
    pageName: "Helpdesk",
    pageNameAr: "مركز المساعدة",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: false,
  },
  {
    pageId: "branches",
    pageName: "Branches",
    pageNameAr: "الفروع",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: false,
  },
  {
    pageId: "roles",
    pageName: "Roles & Permissions",
    pageNameAr: "الأدوار والصلاحيات",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: false,
  },
  {
    pageId: "settings",
    pageName: "Settings",
    pageNameAr: "الإعدادات",
    accessLevel: "full",
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canView: true,
    canExport: true,
    canImport: false,
  },
  {
    pageId: "reports",
    pageName: "Reports",
    pageNameAr: "التقارير",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: false,
  },
  {
    pageId: "financial",
    pageName: "Financial",
    pageNameAr: "المالية",
    accessLevel: "full",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
    canImport: false,
  },
];

export const roles: Role[] = [
  {
    id: "r1",
    name: "Super Admin",
    nameAr: "مدير النظام",
    description: "Full system access with all permissions",
    companyId: "c1",
    permissions: availablePermissions,
    pageAccess: systemPages.map(page => ({...page, accessLevel: "full" as const})),
    isSystemRole: true,
    isDefault: false,
    level: 100,
    canManageUsers: true,
    canManageRoles: true,
    canEditSettings: true,
    canViewReports: true,
    canDeleteData: true,
    createdAt: "2020-01-01",
    updatedAt: "2026-08-20",
  },
  {
    id: "r2",
    name: "Company Admin",
    nameAr: "مدير الشركة",
    description: "Full access to company operations and settings",
    companyId: "c1",
    permissions: availablePermissions.filter(p => !p.category.includes("delete")),
    pageAccess: systemPages.map(page => ({...page, accessLevel: "full" as const, canDelete: false})),
    isSystemRole: false,
    isDefault: false,
    level: 90,
    canManageUsers: true,
    canManageRoles: true,
    canEditSettings: true,
    canViewReports: true,
    canDeleteData: false,
    createdAt: "2020-01-01",
    updatedAt: "2026-08-20",
  },
  {
    id: "r3",
    name: "Branch Manager",
    nameAr: "مدير الفرع",
    description: "Full access to branch operations and staff management",
    companyId: "c1",
    permissions: availablePermissions.filter(p =>
      p.module === "Contacts" ||
      p.module === "Appointments" ||
      p.module === "Vehicles" ||
      p.module === "Helpdesk" ||
      p.module === "Users" ||
      p.module === "Reports" ||
      (p.module === "Branches" && p.action === "view")
    ),
    pageAccess: systemPages.filter(page =>
      ["contacts", "appointments", "vehicles", "helpdesk", "reports"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "full" as const})),
    isSystemRole: false,
    isDefault: false,
    level: 70,
    canManageUsers: true,
    canManageRoles: false,
    canEditSettings: false,
    canViewReports: true,
    canDeleteData: false,
    createdAt: "2020-01-01",
    updatedAt: "2026-08-20",
  },
  {
    id: "r4",
    name: "Service Advisor",
    nameAr: "مستشار الخدمة",
    description: "Manage appointments, contacts, and service operations",
    companyId: "c1",
    permissions: availablePermissions.filter(p =>
      p.module === "Contacts" ||
      p.module === "Appointments" ||
      p.module === "Vehicles" ||
      (p.module === "Helpdesk" && p.action === "view")
    ),
    pageAccess: systemPages.filter(page =>
      ["contacts", "appointments", "vehicles"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "write" as const})),
    isSystemRole: false,
    isDefault: true,
    level: 50,
    canManageUsers: false,
    canManageRoles: false,
    canEditSettings: false,
    canViewReports: false,
    canDeleteData: false,
    createdAt: "2020-01-01",
    updatedAt: "2026-08-20",
  },
  {
    id: "r5",
    name: "Technician",
    nameAr: "الفني",
    description: "Access to vehicle service and technical operations",
    companyId: "c1",
    permissions: availablePermissions.filter(p =>
      (p.module === "Vehicles" && p.action === "view") ||
      (p.module === "Appointments" && p.action === "view")
    ),
    pageAccess: systemPages.filter(page =>
      ["vehicles", "appointments"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "read" as const, canCreate: false, canEdit: false, canDelete: false})),
    isSystemRole: false,
    isDefault: true,
    level: 40,
    canManageUsers: false,
    canManageRoles: false,
    canEditSettings: false,
    canViewReports: false,
    canDeleteData: false,
    createdAt: "2020-01-01",
    updatedAt: "2026-08-20",
  },
  {
    id: "r6",
    name: "Viewer",
    nameAr: "المشاهد",
    description: "Read-only access to most modules",
    companyId: "c1",
    permissions: availablePermissions.filter(p => p.category === "read"),
    pageAccess: systemPages.map(page => ({...page, accessLevel: "read" as const, canCreate: false, canEdit: false, canDelete: false})),
    isSystemRole: false,
    isDefault: true,
    level: 20,
    canManageUsers: false,
    canManageRoles: false,
    canEditSettings: false,
    canViewReports: true,
    canDeleteData: false,
    createdAt: "2020-01-01",
    updatedAt: "2026-08-20",
  },
];

export const systemDefinitions: SystemDefinition[] = [
  // Service Types
  { id: "sd1", category: "service_type", key: "periodic_service", value: "Periodic Service", valueAr: "خدمة دورية", description: "Regular scheduled maintenance", isActive: true, sortOrder: 1, color: "#3b82f6" },
  { id: "sd2", category: "service_type", key: "repair_service", value: "Repair Service", valueAr: "خدمة إصلاح", description: "Repair and maintenance work", isActive: true, sortOrder: 2, color: "#ef4444" },
  { id: "sd3", category: "service_type", key: "inspection_service", value: "Inspection", valueAr: "فحص", description: "Vehicle inspection service", isActive: true, sortOrder: 3, color: "#f59e0b" },
  { id: "sd4", category: "service_type", key: "diagnostic_service", value: "Diagnostic", valueAr: "تشخيص", description: "Computer diagnostic service", isActive: true, sortOrder: 4, color: "#8b5cf6" },
  
  // Vehicle Types
  { id: "sd5", category: "vehicle_type", key: "sedan", value: "Sedan", valueAr: "سيدان", description: "4-door passenger vehicle", isActive: true, sortOrder: 1 },
  { id: "sd6", category: "vehicle_type", key: "suv", value: "SUV", valueAr: "دفع رباعي", description: "Sport Utility Vehicle", isActive: true, sortOrder: 2 },
  { id: "sd7", category: "vehicle_type", key: "hatchback", value: "Hatchback", valueAr: "هاتشباك", description: "Compact hatchback vehicle", isActive: true, sortOrder: 3 },
  { id: "sd8", category: "vehicle_type", key: "pickup", value: "Pickup", valueAr: "بيك أب", description: "Pickup truck", isActive: true, sortOrder: 4 },
  { id: "sd9", category: "vehicle_type", key: "van", value: "Van", valueAr: "شاحنة صغيرة", description: "Commercial van", isActive: true, sortOrder: 5 },
  
  // Payment Methods
  { id: "sd10", category: "payment_method", key: "cash", value: "Cash", valueAr: "نقدي", description: "Cash payment", isActive: true, sortOrder: 1 },
  { id: "sd11", category: "payment_method", key: "card", value: "Credit Card", valueAr: "بطاقة ائتمان", description: "Credit/Debit card payment", isActive: true, sortOrder: 2 },
  { id: "sd12", category: "payment_method", key: "bank_transfer", value: "Bank Transfer", valueAr: "تحويل بنكي", description: "Bank transfer payment", isActive: true, sortOrder: 3 },
  { id: "sd13", category: "payment_method", key: "installment", value: "Installment", valueAr: "تقسيط", description: "Installment payment plan", isActive: true, sortOrder: 4 },
  
  // Customer Types
  { id: "sd14", category: "customer_type", key: "individual", value: "Individual", valueAr: "فردي", description: "Individual customer", isActive: true, sortOrder: 1 },
  { id: "sd15", category: "customer_type", key: "company", value: "Company", valueAr: "شركة", description: "Corporate customer", isActive: true, sortOrder: 2 },
  { id: "sd16", category: "customer_type", key: "fleet", value: "Fleet", valueAr: "أسطول", description: "Fleet customer", isActive: true, sortOrder: 3 },
];

export const statusDefinitions: StatusDefinition[] = [
  // Appointment Statuses
  { id: "st1", entityType: "appointment", status: "Pending", statusAr: "قيد الانتظار", description: "Appointment waiting for confirmation", color: "#f59e0b", backgroundColor: "#fef3c7", textColor: "#92400e", isDefault: true, isTerminal: false, nextStatuses: ["Confirmed", "Cancelled"], sortOrder: 1 },
  { id: "st2", entityType: "appointment", status: "Confirmed", statusAr: "مؤكد", description: "Appointment confirmed by staff", color: "#3b82f6", backgroundColor: "#dbeafe", textColor: "#1e40af", isDefault: false, isTerminal: false, nextStatuses: ["In Progress", "Cancelled"], sortOrder: 2 },
  { id: "st3", entityType: "appointment", status: "In Progress", statusAr: "قيد التنفيذ", description: "Service currently being performed", color: "#8b5cf6", backgroundColor: "#ede9fe", textColor: "#5b21b6", isDefault: false, isTerminal: false, nextStatuses: ["Completed", "No Show"], sortOrder: 3 },
  { id: "st4", entityType: "appointment", status: "Completed", statusAr: "مكتمل", description: "Service completed successfully", color: "#10b981", backgroundColor: "#d1fae5", textColor: "#065f46", isDefault: false, isTerminal: true, nextStatuses: [], sortOrder: 4 },
  { id: "st5", entityType: "appointment", status: "Cancelled", statusAr: "ملغي", description: "Appointment cancelled", color: "#ef4444", backgroundColor: "#fee2e2", textColor: "#991b1b", isDefault: false, isTerminal: true, nextStatuses: [], sortOrder: 5 },
  { id: "st6", entityType: "appointment", status: "No Show", statusAr: "لم يحضر", description: "Customer did not appear", color: "#6b7280", backgroundColor: "#f3f4f6", textColor: "#374151", isDefault: false, isTerminal: true, nextStatuses: [], sortOrder: 6 },
  
  // Ticket Statuses
  { id: "st7", entityType: "ticket", status: "New", statusAr: "جديد", description: "New support ticket", color: "#3b82f6", backgroundColor: "#dbeafe", textColor: "#1e40af", isDefault: true, isTerminal: false, nextStatuses: ["In Progress", "Assigned"], sortOrder: 1 },
  { id: "st8", entityType: "ticket", status: "Assigned", statusAr: "مُعين", description: "Ticket assigned to staff", color: "#8b5cf6", backgroundColor: "#ede9fe", textColor: "#5b21b6", isDefault: false, isTerminal: false, nextStatuses: ["In Progress", "On Hold"], sortOrder: 2 },
  { id: "st9", entityType: "ticket", status: "In Progress", statusAr: "قيد المعالجة", description: "Ticket being worked on", color: "#f59e0b", backgroundColor: "#fef3c7", textColor: "#92400e", isDefault: false, isTerminal: false, nextStatuses: ["Resolved", "Waiting Customer", "Escalated"], sortOrder: 3 },
  { id: "st10", entityType: "ticket", status: "Waiting Customer", statusAr: "بانتظار العميل", description: "Waiting for customer response", color: "#06b6d4", backgroundColor: "#cffafe", textColor: "#0e7490", isDefault: false, isTerminal: false, nextStatuses: ["In Progress", "Closed"], sortOrder: 4 },
  { id: "st11", entityType: "ticket", status: "Resolved", statusAr: "محلول", description: "Issue resolved", color: "#10b981", backgroundColor: "#d1fae5", textColor: "#065f46", isDefault: false, isTerminal: false, nextStatuses: ["Closed", "Reopened"], sortOrder: 5 },
  { id: "st12", entityType: "ticket", status: "Closed", statusAr: "مغلق", description: "Ticket closed", color: "#6b7280", backgroundColor: "#f3f4f6", textColor: "#374151", isDefault: false, isTerminal: true, nextStatuses: ["Reopened"], sortOrder: 6 },
  { id: "st13", entityType: "ticket", status: "Reopened", statusAr: "أعيد فتحه", description: "Ticket reopened by customer", color: "#ef4444", backgroundColor: "#fee2e2", textColor: "#991b1b", isDefault: false, isTerminal: false, nextStatuses: ["In Progress"], sortOrder: 7 },
  
  // Vehicle Statuses
  { id: "st14", entityType: "vehicle", status: "Active", statusAr: "نشط", description: "Vehicle in active use", color: "#10b981", backgroundColor: "#d1fae5", textColor: "#065f46", isDefault: true, isTerminal: false, nextStatuses: ["In Service", "Sold", "Maintenance"], sortOrder: 1 },
  { id: "st15", entityType: "vehicle", status: "In Service", statusAr: "في الخدمة", description: "Vehicle currently in service", color: "#f59e0b", backgroundColor: "#fef3c7", textColor: "#92400e", isDefault: false, isTerminal: false, nextStatuses: ["Active", "Maintenance Required"], sortOrder: 2 },
  { id: "st16", entityType: "vehicle", status: "Sold", statusAr: "مباع", description: "Vehicle sold", color: "#3b82f6", backgroundColor: "#dbeafe", textColor: "#1e40af", isDefault: false, isTerminal: true, nextStatuses: [], sortOrder: 3 },
  { id: "st17", entityType: "vehicle", status: "Reserved", statusAr: "محجوز", description: "Vehicle reserved for customer", color: "#8b5cf6", backgroundColor: "#ede9fe", textColor: "#5b21b6", isDefault: false, isTerminal: false, nextStatuses: ["Sold", "Active"], sortOrder: 4 },
  { id: "st18", entityType: "vehicle", status: "Maintenance", statusAr: "صيانة", description: "Vehicle under maintenance", color: "#ef4444", backgroundColor: "#fee2e2", textColor: "#991b1b", isDefault: false, isTerminal: false, nextStatuses: ["Active", "In Service"], sortOrder: 5 },
];

export const rolePermissions: Record<UserRole, Permission[]> = {
  "Super Admin": availablePermissions,
  "Admin": availablePermissions.filter(p => !p.category.includes("delete")),
  "Manager": availablePermissions.filter(p =>
    p.module === "Contacts" ||
    p.module === "Appointments" ||
    p.module === "Vehicles" ||
    p.module === "Helpdesk" ||
    p.module === "Users" ||
    p.module === "Reports" ||
    (p.module === "Branches" && p.action === "view")
  ),
  "Supervisor": availablePermissions.filter(p => p.category === "read" || (p.module === "Contacts" && p.action === "create")),
  "Staff": availablePermissions.filter(p =>
    p.module === "Contacts" ||
    p.module === "Appointments" ||
    p.module === "Vehicles" ||
    (p.module === "Helpdesk" && p.action === "view")
  ).filter(p => p.category === "read" || p.category === "write"),
  "Viewer": availablePermissions.filter(p => p.category === "read"),
  "Technician": availablePermissions.filter(p =>
    (p.module === "Vehicles" && p.action === "view") ||
    (p.module === "Appointments" && p.action === "view")
  ),
  "Advisor": availablePermissions.filter(p =>
    p.module === "Contacts" ||
    p.module === "Appointments" ||
    p.module === "Vehicles" ||
    (p.module === "Helpdesk" && p.action === "view")
  ),
};

export let systemUsers: SystemUser[] = [
  {
    id: "u1",
    username: "admin",
    email: "admin@suzuki-egypt.com",
    name: "System Administrator",
    nameAr: "مدير النظام",
    role: "Super Admin",
    roleId: "r1",
    companyId: "c1",
    permissions: rolePermissions["Super Admin"],
    pageAccess: systemPages.map(page => ({...page, accessLevel: "full" as const})),
    status: "Active",
    lastLogin: "2026-08-20 08:30",
    createdAt: "2020-01-01",
    updatedAt: "2026-08-20",
    phone: "+20 100 000 0000",
    department: "IT",
    position: "System Administrator",
    employeeId: "EMP-001",
    settings: {
      language: "Arabic",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
  {
    id: "u2",
    username: "ahmed.khaled",
    email: "ahmed.khaled@suzuki-egypt.com",
    name: "Ahmed Khaled",
    nameAr: "أحمد خالد",
    role: "Admin",
    roleId: "r2",
    companyId: "c1",
    branchId: "b1",
    permissions: rolePermissions["Admin"],
    pageAccess: systemPages.map(page => ({...page, accessLevel: "full" as const, canDelete: false})),
    status: "Active",
    lastLogin: "2026-08-20 07:45",
    createdAt: "2021-03-15",
    updatedAt: "2026-08-20",
    phone: "+20 100 123 4567",
    department: "Operations",
    position: "Operations Manager",
    employeeId: "EMP-002",
    reportsTo: "u1",
    settings: {
      language: "Arabic",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
  {
    id: "u3",
    username: "mona.ali",
    email: "mona.ali@suzuki-egypt.com",
    name: "Mona Ali",
    nameAr: "منى علي",
    role: "Manager",
    roleId: "r3",
    companyId: "c1",
    branchId: "b2",
    stationIds: ["s4"],
    permissions: rolePermissions["Manager"],
    pageAccess: systemPages.filter(page =>
      ["contacts", "appointments", "vehicles", "helpdesk", "reports"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "full" as const})),
    status: "Active",
    lastLogin: "2026-08-19 18:20",
    createdAt: "2021-06-20",
    updatedAt: "2026-08-20",
    phone: "+20 122 345 6789",
    department: "Service",
    position: "Branch Manager",
    employeeId: "EMP-003",
    reportsTo: "u2",
    settings: {
      language: "Arabic",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
  {
    id: "u4",
    username: "tarek.hamed",
    email: "tarek.hamed@suzuki-egypt.com",
    name: "Tarek Hamed",
    nameAr: "طارق حامد",
    role: "Manager",
    roleId: "r3",
    companyId: "c1",
    branchId: "b3",
    stationIds: ["s5"],
    permissions: rolePermissions["Manager"],
    pageAccess: systemPages.filter(page =>
      ["contacts", "appointments", "vehicles", "helpdesk", "reports"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "full" as const})),
    status: "Active",
    lastLogin: "2026-08-20 06:15",
    createdAt: "2021-09-10",
    updatedAt: "2026-08-20",
    phone: "+20 111 234 5678",
    department: "Sales",
    position: "Branch Manager",
    employeeId: "EMP-004",
    reportsTo: "u2",
    settings: {
      language: "Arabic",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
  {
    id: "u5",
    username: "nadia.mostafa",
    email: "nadia.mostafa@deltamotors.com",
    name: "Nadia Mostafa",
    nameAr: "نادية مصطفى",
    role: "Manager",
    roleId: "r3",
    companyId: "c2",
    branchId: "b4",
    stationIds: ["s6"],
    permissions: rolePermissions["Manager"],
    pageAccess: systemPages.filter(page =>
      ["contacts", "appointments", "vehicles", "helpdesk", "reports"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "full" as const})),
    status: "Active",
    lastLogin: "2026-08-18 16:45",
    createdAt: "2022-02-28",
    updatedAt: "2026-08-20",
    phone: "+20 109 876 5432",
    department: "Customer Service",
    position: "Branch Manager",
    employeeId: "EMP-005",
    reportsTo: "u2",
    settings: {
      language: "Arabic",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
  {
    id: "u6",
    username: "hazem.nabil",
    email: "hazem.nabil@suzuki-egypt.com",
    name: "Hazem Nabil",
    nameAr: "هازم نبيل",
    role: "Advisor",
    roleId: "r4",
    companyId: "c1",
    branchId: "b1",
    stationIds: ["s1", "s2"],
    permissions: rolePermissions["Advisor"],
    pageAccess: systemPages.filter(page =>
      ["contacts", "appointments", "vehicles"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "write" as const})),
    status: "Active",
    lastLogin: "2026-08-20 08:00",
    createdAt: "2022-05-15",
    updatedAt: "2026-08-20",
    phone: "+20 120 987 6543",
    department: "Service Advisor",
    position: "Service Advisor",
    employeeId: "EMP-006",
    reportsTo: "u2",
    settings: {
      language: "Arabic",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
  {
    id: "u7",
    username: "rana.sherif",
    email: "rana.sherif@suzuki-egypt.com",
    name: "Rana Sherif",
    nameAr: "رنا شريف",
    role: "Advisor",
    roleId: "r4",
    companyId: "c1",
    branchId: "b3",
    stationIds: ["s5"],
    permissions: rolePermissions["Advisor"],
    pageAccess: systemPages.filter(page =>
      ["contacts", "appointments", "vehicles"].includes(page.pageId)
    ).map(page => ({...page, accessLevel: "write" as const})),
    status: "Active",
    lastLogin: "2026-08-20 07:30",
    createdAt: "2022-08-01",
    updatedAt: "2026-08-20",
    phone: "+20 115 678 9012",
    department: "Service Advisor",
    position: "Service Advisor",
    employeeId: "EMP-007",
    reportsTo: "u4",
    settings: {
      language: "Arabic",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
  {
    id: "u8",
    username: "guest.user",
    email: "guest@suzuki-egypt.com",
    name: "Guest User",
    nameAr: "مستخدم ضيف",
    role: "Viewer",
    roleId: "r6",
    companyId: "c1",
    permissions: rolePermissions["Viewer"],
    pageAccess: systemPages.map(page => ({...page, accessLevel: "read" as const, canCreate: false, canEdit: false, canDelete: false})),
    status: "Inactive",
    createdAt: "2023-01-10",
    updatedAt: "2026-08-20",
    department: "External",
    position: "Guest",
    settings: {
      language: "English",
      timezone: "Africa/Cairo",
      dateFormat: "DD/MM/YYYY",
      theme: "light",
    },
  },
];

export const vehicleModels: VehicleModel[] = [
  { id: "v1", name: "Swift GL", category: "Hatchback", year: 2025 },
  { id: "v2", name: "Ciaz Premium", category: "Sedan", year: 2024 },
  { id: "v3", name: "Vitara AllGrip", category: "SUV", year: 2026 },
  { id: "v4", name: "Baleno Sport", category: "Hatchback", year: 2025 },
  { id: "v5", name: "Carry Pickup", category: "Pickup", year: 2024 },
  { id: "v6", name: "Ertiga Family", category: "Van", year: 2025 },
];

export type Contact = {
  id: string;
  name: string;
  company?: string;
  type: "Individual" | "Company" | "Fleet";
  email: string;
  phone: string;
  branchId: string;
  vehicles: string[];
  tags: string[];
  since: string;
  customerVehicles?: CustomerVehicle[];
  preferredBranchId?: string;
  accountManagerId?: string;
  creditLimit?: number;
  paymentTerms?: string;
};

export type CustomerVehicle = {
  id: string;
  modelId: string;
  vin: string;
  licensePlate: string;
  purchaseDate: string;
  warrantyExpiry: string;
  mileage: number;
  lastServiceDate?: string;
  nextServiceDue?: string;
};

export type Vehicle = {
  id: string;
  vin: string;
  licensePlate: string;
  modelId: string;
  contactId: string;
  branchId: string;
  status: "Active" | "In Service" | "Sold" | "Reserved" | "Maintenance";
  color: string;
  year: number;
  purchaseDate: string;
  warrantyExpiry: string;
  mileage: number;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Manual" | "Automatic" | "CVT";
  engineNumber: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  notes?: string;
  tags: string[];
  serviceHistory: ServiceRecord[];
};

export type ServiceRecord = {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  branchId: string;
  performedBy: string;
};

export const vehicles: Vehicle[] = [
  {
    id: "vh1",
    vin: "MA3EJKD1S00123481",
    licensePlate: "ص ط ر 4821",
    modelId: "v1",
    contactId: "c1",
    branchId: "b1",
    status: "Active",
    color: "Pearl White",
    year: 2023,
    purchaseDate: "2023-04-11",
    warrantyExpiry: "2028-04-11",
    mileage: 42150,
    fuelType: "Petrol",
    transmission: "Automatic",
    engineNumber: "K14B-882911",
    registrationExpiry: "2027-04-11",
    insuranceExpiry: "2027-04-11",
    lastServiceDate: "2026-07-15",
    nextServiceDue: "2026-10-15",
    notes: "Vehicle well-maintained, follows scheduled service intervals",
    tags: ["Warranty", "VIP"],
    serviceHistory: [
      {
        id: "sr1",
        date: "2026-07-15",
        type: "Periodic Service",
        description: "Engine oil + filter, Cabin filter, Brake inspection",
        cost: 3450,
        mileage: 42150,
        branchId: "b1",
        performedBy: "Hazem Nabil"
      },
      {
        id: "sr2",
        date: "2026-01-20",
        type: "Periodic Service",
        description: "30,000 km service, Brake fluid change",
        cost: 2800,
        mileage: 30000,
        branchId: "b1",
        performedBy: "Hazem Nabil"
      }
    ]
  },
  {
    id: "vh2",
    vin: "MA3BJKD2S00551209",
    licensePlate: "س ع ف 3390",
    modelId: "v4",
    contactId: "c2",
    branchId: "b3",
    status: "In Service",
    color: "Metallic Red",
    year: 2022,
    purchaseDate: "2022-09-02",
    warrantyExpiry: "2027-09-02",
    mileage: 67210,
    fuelType: "Petrol",
    transmission: "CVT",
    engineNumber: "K12M-992837",
    registrationExpiry: "2026-09-02",
    insuranceExpiry: "2026-09-02",
    lastServiceDate: "2026-06-20",
    nextServiceDue: "2026-09-20",
    notes: "Gearbox noise reported, under diagnostic",
    tags: ["Service plan"],
    serviceHistory: [
      {
        id: "sr3",
        date: "2026-06-20",
        type: "Periodic Service",
        description: "60,000 km service, Tyre rotation",
        cost: 3100,
        mileage: 67210,
        branchId: "b3",
        performedBy: "Rana Sherif"
      }
    ]
  },
  {
    id: "vh3",
    vin: "MA3CKD9S001220034",
    licensePlate: "ن ه ي 9032",
    modelId: "v5",
    contactId: "c3",
    branchId: "b2",
    status: "Maintenance",
    color: "Arctic Silver",
    year: 2021,
    purchaseDate: "2021-01-19",
    warrantyExpiry: "2026-01-19",
    mileage: 118400,
    fuelType: "Diesel",
    transmission: "Manual",
    engineNumber: "DDiS-773822",
    registrationExpiry: "2026-01-19",
    insuranceExpiry: "2026-01-19",
    lastServiceDate: "2026-07-01",
    nextServiceDue: "2026-10-01",
    notes: "Fleet vehicle #12, suspension repair in progress",
    tags: ["Fleet", "Corporate"],
    serviceHistory: [
      {
        id: "sr4",
        date: "2026-07-01",
        type: "Inspection",
        description: "Fleet 40-point inspection, Tyre wear report",
        cost: 1200,
        mileage: 118400,
        branchId: "b2",
        performedBy: "Mostafa Diaa"
      }
    ]
  },
  {
    id: "vh4",
    vin: "MA3CJKD4S00220441",
    licensePlate: "ك ط ب 1102",
    modelId: "v2",
    contactId: "c2",
    branchId: "b3",
    status: "Active",
    color: "Midnight Blue",
    year: 2024,
    purchaseDate: "2024-05-19",
    warrantyExpiry: "2029-05-19",
    mileage: 15000,
    fuelType: "Petrol",
    transmission: "Automatic",
    engineNumber: "K15B-551739",
    registrationExpiry: "2029-05-19",
    insuranceExpiry: "2029-05-19",
    lastServiceDate: "2026-08-01",
    nextServiceDue: "2026-11-01",
    notes: "New vehicle, first service completed",
    tags: ["Service plan"],
    serviceHistory: [
      {
        id: "sr5",
        date: "2026-08-01",
        type: "First Service",
        description: "1,000 km check, Software update",
        cost: 500,
        mileage: 15000,
        branchId: "b3",
        performedBy: "Rana Sherif"
      }
    ]
  },
  {
    id: "vh5",
    vin: "MA3EJKD8S00774451",
    licensePlate: "و ز ط 6614",
    modelId: "v6",
    contactId: "c5",
    branchId: "b4",
    status: "Active",
    color: "Pearl White",
    year: 2026,
    purchaseDate: "2026-08-21",
    warrantyExpiry: "2031-08-21",
    mileage: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    engineNumber: "K15B-663722",
    registrationExpiry: "2031-08-21",
    insuranceExpiry: "2031-08-21",
    lastServiceDate: undefined,
    nextServiceDue: "2027-02-21",
    notes: "New delivery, rental partner vehicle",
    tags: ["Rental", "New"],
    serviceHistory: []
  }
];

export let contacts: Contact[] = [
  {
    id: "c1",
    name: "Omar Hassan",
    type: "Individual",
    email: "omar.hassan@example.com",
    phone: "+20 100 224 8891",
    branchId: "b1",
    vehicles: ["v1"],
    tags: ["Warranty", "VIP"],
    since: "2023-04-11",
    preferredBranchId: "b1",
    accountManagerId: "e2",
    creditLimit: 50000,
    paymentTerms: "Net 30",
    customerVehicles: [
      {
        id: "cv1",
        modelId: "v1",
        vin: "MA3EJKD1S00123481",
        licensePlate: "ص ط ر 4821",
        purchaseDate: "2023-04-11",
        warrantyExpiry: "2028-04-11",
        mileage: 42150,
        lastServiceDate: "2026-07-15",
        nextServiceDue: "2026-10-15"
      }
    ]
  },
  {
    id: "c2",
    name: "Mona Adel",
    type: "Individual",
    email: "mona.adel@example.com",
    phone: "+20 122 887 4410",
    branchId: "b3",
    vehicles: ["v4", "v2"],
    tags: ["Service plan"],
    since: "2022-09-02",
    preferredBranchId: "b3",
    accountManagerId: "e5",
    creditLimit: 30000,
    paymentTerms: "Net 15",
    customerVehicles: [
      {
        id: "cv2",
        modelId: "v4",
        vin: "MA3BJKD2S00551209",
        licensePlate: "س ع ف 3390",
        purchaseDate: "2022-09-02",
        warrantyExpiry: "2027-09-02",
        mileage: 67210,
        lastServiceDate: "2026-06-20",
        nextServiceDue: "2026-09-20"
      },
      {
        id: "cv3",
        modelId: "v2",
        vin: "MA3CJKD4S00220441",
        licensePlate: "ك ط ب 1102",
        purchaseDate: "2024-05-19",
        warrantyExpiry: "2029-05-19",
        mileage: 15000,
        lastServiceDate: "2026-08-01",
        nextServiceDue: "2026-11-01"
      }
    ]
  },
  {
    id: "c3",
    name: "Karim Fathy",
    company: "Delta Logistics",
    type: "Fleet",
    email: "fleet@deltalog.example.com",
    phone: "+20 101 550 1188",
    branchId: "b2",
    vehicles: ["v5", "v6"],
    tags: ["Fleet 24 cars", "Corporate"],
    since: "2021-01-19",
    preferredBranchId: "b2",
    accountManagerId: "e4",
    creditLimit: 500000,
    paymentTerms: "Net 45",
    customerVehicles: [
      {
        id: "cv4",
        modelId: "v5",
        vin: "MA3CKD9S001220034",
        licensePlate: "ن ه ي 9032",
        purchaseDate: "2021-01-19",
        warrantyExpiry: "2026-01-19",
        mileage: 118400,
        lastServiceDate: "2026-07-01",
        nextServiceDue: "2026-10-01"
      },
      {
        id: "cv5",
        modelId: "v6",
        vin: "MA3EJKD8S00774451",
        licensePlate: "ر ق د 8845",
        purchaseDate: "2023-03-04",
        warrantyExpiry: "2028-03-04",
        mileage: 54300,
        lastServiceDate: "2026-08-10",
        nextServiceDue: "2026-11-10"
      }
    ]
  },
  {
    id: "c4",
    name: "Sara Ibrahim",
    type: "Individual",
    email: "sara.ibrahim@example.com",
    phone: "+20 111 903 2277",
    branchId: "b1",
    vehicles: ["v3"],
    tags: ["New customer"],
    since: "2026-02-27",
    preferredBranchId: "b1",
    accountManagerId: "e3",
    creditLimit: 0,
    paymentTerms: "Cash on Delivery",
    customerVehicles: []
  },
  {
    id: "c5",
    name: "Ahmed Zaki",
    company: "Zaki Rent a Car",
    type: "Company",
    email: "info@zakirent.example.com",
    phone: "+20 109 774 6600",
    branchId: "b4",
    vehicles: ["v2", "v6", "v1"],
    tags: ["Rental partner"],
    since: "2020-06-30",
    preferredBranchId: "b4",
    accountManagerId: "e6",
    creditLimit: 200000,
    paymentTerms: "Net 30",
    customerVehicles: [
      {
        id: "cv6",
        modelId: "v6",
        vin: "MA3EJKD8S00774451",
        licensePlate: "و ز ط 6614",
        purchaseDate: "2026-08-21",
        warrantyExpiry: "2031-08-21",
        mileage: 5,
        lastServiceDate: undefined,
        nextServiceDue: "2027-02-21"
      },
      {
        id: "cv7",
        modelId: "v2",
        vin: "MA3CJKD4S00887731",
        licensePlate: "ح ي ص 4471",
        purchaseDate: "2025-02-14",
        warrantyExpiry: "2030-02-14",
        mileage: 25000,
        lastServiceDate: "2026-07-25",
        nextServiceDue: "2026-10-25"
      },
      {
        id: "cv8",
        modelId: "v1",
        vin: "MA3EJKD1S00124550",
        licensePlate: "أ ب ج 9988",
        purchaseDate: "2025-08-15",
        warrantyExpiry: "2030-08-15",
        mileage: 12000,
        lastServiceDate: "2026-08-05",
        nextServiceDue: "2026-11-05"
      }
    ]
  },
  {
    id: "c6",
    name: "Nourhan Saad",
    type: "Individual",
    email: "nourhan.saad@example.com",
    phone: "+20 128 441 7702",
    branchId: "b3",
    vehicles: ["v4"],
    tags: ["Trade-in lead"],
    since: "2024-11-08",
    preferredBranchId: "b3",
    accountManagerId: "e5",
    creditLimit: 15000,
    paymentTerms: "Net 15",
    customerVehicles: [
      {
        id: "cv9",
        modelId: "v4",
        vin: "MA3BJKD2S00990771",
        licensePlate: "ل م ن 2208",
        purchaseDate: "2024-11-08",
        warrantyExpiry: "2029-11-08",
        mileage: 30980,
        lastServiceDate: "2026-08-19",
        nextServiceDue: "2026-11-19"
      }
    ]
  },
];

export type AppointmentStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";
export type AppointmentKind = "Test Drive" | "Periodic Service" | "Repair" | "Delivery" | "Inspection";

export type Appointment = {
  id: string;
  contactId: string;
  branchId: string;
  vehicleId: string;
  kind: AppointmentKind;
  date: string;
  time: string;
  advisor: string;
  status: AppointmentStatus;
  title?: string;
  duration?: number;
  preBookingTime?: number;
  schedulingWindow?: string;
  subServices?: string[];
  chassisNumber?: string;
  licensePlate?: string;
  serviceAdvisors?: string[];
  bookingInfo?: string;
  cancellationReason?: string;
};

export let appointments: Appointment[] = [
  { id: "a1", contactId: "c1", branchId: "b1", vehicleId: "v1", kind: "Periodic Service", date: "2026-08-20", time: "09:30", advisor: "Hazem Nabil", status: "Confirmed" },
  { id: "a2", contactId: "c4", branchId: "b1", vehicleId: "v3", kind: "Test Drive", date: "2026-08-20", time: "11:00", advisor: "Yara Kamal", status: "Pending" },
  { id: "a3", contactId: "c3", branchId: "b2", vehicleId: "v5", kind: "Inspection", date: "2026-08-20", time: "13:15", advisor: "Mostafa Diaa", status: "Confirmed" },
  { id: "a4", contactId: "c2", branchId: "b3", vehicleId: "v4", kind: "Repair", date: "2026-08-21", time: "10:00", advisor: "Rana Sherif", status: "Confirmed" },
  { id: "a5", contactId: "c5", branchId: "b4", vehicleId: "v6", kind: "Delivery", date: "2026-08-21", time: "15:45", advisor: "Tarek Amin", status: "Pending" },
  { id: "a6", contactId: "c6", branchId: "b3", vehicleId: "v4", kind: "Periodic Service", date: "2026-08-19", time: "08:45", advisor: "Rana Sherif", status: "Completed" },
  { id: "a7", contactId: "c1", branchId: "b1", vehicleId: "v1", kind: "Repair", date: "2026-08-18", time: "16:30", advisor: "Hazem Nabil", status: "Cancelled" },
  { id: "a8", contactId: "c3", branchId: "b2", vehicleId: "v6", kind: "Periodic Service", date: "2026-08-22", time: "12:00", advisor: "Mostafa Diaa", status: "Pending" },
];

export type TicketStage = "New" | "In Progress" | "Waiting Parts" | "Solved";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export type Ticket = {
  id: string;
  ref: string;
  subject: string;
  contactId: string;
  branchId: string;
  vehicleId: string;
  stage: TicketStage;
  priority: TicketPriority;
  assignee: string;
  opened: string;
  slaHours: number;
  from?: string;
  to?: string;
  timeline: TicketTimelineEntry[];
  category?: string;
  channel?: string;
  estimatedResolution?: string;
  actualResolution?: string;
  customerRating?: number;
  notes?: string;
};

export type TicketTimelineEntry = {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  details?: string;
  attachments?: string[];
};

export let tickets: Ticket[] = [
  { 
    id: "t1", 
    ref: "HD-1041", 
    subject: "AC not cooling after service", 
    contactId: "c1", 
    branchId: "b1", 
    vehicleId: "v1", 
    stage: "In Progress", 
    priority: "High", 
    assignee: "Hazem Nabil", 
    opened: "2026-08-18", 
    slaHours: 8,
    from: "Customer",
    to: "Service Team",
    category: "After-sales quality",
    channel: "Phone",
    estimatedResolution: "2026-08-18 18:00",
    timeline: [
      {
        id: "tt1",
        timestamp: "2026-08-18 09:15",
        author: "Omar Hassan",
        action: "Ticket created",
        details: "Customer reports the AC blows warm air two days after the periodic service."
      },
      {
        id: "tt2",
        timestamp: "2026-08-18 09:40",
        author: "Hazem Nabil",
        action: "Assigned",
        details: "Apologies — booked a free diagnostic slot for tomorrow morning."
      },
      {
        id: "tt3",
        timestamp: "2026-08-19 11:05",
        author: "Workshop",
        action: "Status update",
        details: "Leak detected at the low-pressure line, part ordered."
      }
    ]
  },
  { 
    id: "t2", 
    ref: "HD-1042", 
    subject: "Delay in spare part delivery", 
    contactId: "c3", 
    branchId: "b2", 
    vehicleId: "v5", 
    stage: "Waiting Parts", 
    priority: "Urgent", 
    assignee: "Mostafa Diaa", 
    opened: "2026-08-16", 
    slaHours: 4,
    from: "Delta Logistics",
    to: "Parts Department",
    category: "Spare parts",
    channel: "Email",
    estimatedResolution: "2026-08-18 12:00",
    timeline: [
      {
        id: "tt4",
        timestamp: "2026-08-16 08:30",
        author: "Delta Logistics",
        action: "Ticket created",
        details: "Unit has been down for 4 days, we need an ETA."
      },
      {
        id: "tt5",
        timestamp: "2026-08-16 12:00",
        author: "Mostafa Diaa",
        action: "Response sent",
        details: "Part cleared customs, expected in the branch in 48 hours."
      },
      {
        id: "tt6",
        timestamp: "2026-08-19 17:20",
        author: "Mostafa Diaa",
        action: "Update",
        details: "Courtesy vehicle offered until the repair is finished."
      }
    ]
  },
  { 
    id: "t3", 
    ref: "HD-1043", 
    subject: "Warranty claim for gearbox noise", 
    contactId: "c2", 
    branchId: "b3", 
    vehicleId: "v4", 
    stage: "New", 
    priority: "High", 
    assignee: "Unassigned", 
    opened: "2026-08-20", 
    slaHours: 12,
    from: "Mona Adel",
    to: "Warranty Department",
    category: "Warranty",
    channel: "Branch visit",
    estimatedResolution: "2026-08-22 12:00",
    timeline: [
      {
        id: "tt7",
        timestamp: "2026-08-20 09:00",
        author: "Mona Adel",
        action: "Ticket created",
        details: "Filed a warranty claim at the Smouha branch for gearbox noise."
      }
    ]
  },
  { 
    id: "t4", 
    ref: "HD-1044", 
    subject: "Invoice mismatch on last visit", 
    contactId: "c5", 
    branchId: "b4", 
    vehicleId: "v2", 
    stage: "In Progress", 
    priority: "Medium", 
    assignee: "Tarek Amin", 
    opened: "2026-08-19", 
    slaHours: 24,
    from: "Ahmed Zaki",
    to: "Finance Department",
    category: "Billing",
    channel: "Email",
    estimatedResolution: "2026-08-20 16:00",
    timeline: [
      {
        id: "tt8",
        timestamp: "2026-08-19 13:10",
        author: "Ahmed Zaki",
        action: "Ticket created",
        details: "Line item 4 on invoice INV-8842 is not correct."
      },
      {
        id: "tt9",
        timestamp: "2026-08-19 16:00",
        author: "Tarek Amin",
        action: "Investigation started",
        details: "Reviewing the job card with the workshop supervisor."
      }
    ]
  },
  { 
    id: "t5", 
    ref: "HD-1045", 
    subject: "Request for extended service plan", 
    contactId: "c6", 
    branchId: "b3", 
    vehicleId: "v4", 
    stage: "Solved", 
    priority: "Low", 
    assignee: "Rana Sherif", 
    opened: "2026-08-14", 
    slaHours: 48,
    from: "Nourhan Saad",
    to: "Service Department",
    category: "Service plan",
    channel: "Phone",
    estimatedResolution: "2026-08-15 12:00",
    actualResolution: "2026-08-14 15:00",
    customerRating: 5,
    timeline: [
      {
        id: "tt10",
        timestamp: "2026-08-14 10:25",
        author: "Nourhan Saad",
        action: "Ticket created",
        details: "Please send me the extended plan pricing."
      },
      {
        id: "tt11",
        timestamp: "2026-08-14 15:00",
        author: "Rana Sherif",
        action: "Resolved",
        details: "Quotation sent and accepted, plan activated."
      }
    ]
  },
  { 
    id: "t6", 
    ref: "HD-1046", 
    subject: "Test drive vehicle unavailable", 
    contactId: "c4", 
    branchId: "b1", 
    vehicleId: "v3", 
    stage: "New", 
    priority: "Medium", 
    assignee: "Yara Kamal", 
    opened: "2026-08-20", 
    slaHours: 12,
    from: "Sara Ibrahim",
    to: "Showroom Team",
    category: "Showroom",
    channel: "Website",
    estimatedResolution: "2026-08-21 10:00",
    timeline: [
      {
        id: "tt12",
        timestamp: "2026-08-20 10:30",
        author: "Sara Ibrahim",
        action: "Ticket created",
        details: "I came at my appointment time but no car was available."
      }
    ]
  },
];

export const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "—";
export const contactName = (id: string) => contacts.find((c) => c.id === id)?.name ?? "—";
export const vehicleName = (id: string) => vehicleModels.find((v) => v.id === id)?.name ?? "—";
export const userName = (id: string) => systemUsers.find((u) => u.id === id)?.name ?? "—";
export const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "—";
export const stationName = (id: string) => stations.find((s) => s.id === id)?.name ?? "—";
export const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? "—";
export const getCompanyBranches = (companyId: string) => branches.filter(b => b.companyId === companyId);
export const getBranchStations = (branchId: string) => stations.filter(s => s.branchId === branchId);
export const getCompanyUsers = (companyId: string) => systemUsers.filter(u => u.companyId === companyId);
export const getBranchUsers = (branchId: string) => systemUsers.filter(u => u.branchId === branchId);
export const getRoleUsers = (roleId: string) => systemUsers.filter(u => u.roleId === roleId);

/* ---------- Rich details ---------- */

export type TimelineEntry = { at: string; by: string; text: string };

export const appointmentDetails: Record<
  string,
  {
    vin: string;
    plate: string;
    mileageKm: number;
    bay: string;
    durationMin: number;
    estimatedCost: number;
    services: string[];
    customerNote: string;
    timeline: TimelineEntry[];
  }
> = {
  a1: {
    vin: "MA3EJKD1S00123481", plate: "ص ط ر 4821", mileageKm: 42150, bay: "Bay 3", durationMin: 90, estimatedCost: 3450,
    services: ["Engine oil + filter", "Cabin filter", "Brake inspection", "Software update"],
    customerNote: "Slight vibration on the steering wheel above 100 km/h.",
    timeline: [
      { at: "2026-08-17 10:12", by: "Call center", text: "Appointment requested by phone." },
      { at: "2026-08-17 10:20", by: "Hazem Nabil", text: "Slot confirmed at Nasr City, Bay 3." },
      { at: "2026-08-19 18:00", by: "System", text: "SMS reminder sent to customer." },
    ],
  },
  a2: {
    vin: "MA3VJKD5S00998112", plate: "أ ب ج 1177", mileageKm: 12, bay: "Showroom", durationMin: 45, estimatedCost: 0,
    services: ["Vitara AllGrip test drive", "Finance options briefing"],
    customerNote: "Interested in comparing AllGrip vs. 2WD before purchase.",
    timeline: [
      { at: "2026-08-19 14:02", by: "Website", text: "Test drive booked online." },
      { at: "2026-08-19 14:40", by: "Yara Kamal", text: "Waiting for driving license copy to confirm." },
    ],
  },
  a3: {
    vin: "MA3CKD9S001220034", plate: "ن ه ي 9032", mileageKm: 118400, bay: "Bay 1", durationMin: 60, estimatedCost: 1200,
    services: ["Fleet 40-point inspection", "Tyre wear report"],
    customerNote: "Fleet unit #12 — inspection required before renewal of the logistics contract.",
    timeline: [
      { at: "2026-08-15 09:00", by: "Delta Logistics", text: "Batch inspection request for 4 units." },
      { at: "2026-08-16 11:30", by: "Mostafa Diaa", text: "First unit scheduled, remaining three pending." },
    ],
  },
  a4: {
    vin: "MA3BJKD2S00551209", plate: "س ع ف 3390", mileageKm: 67210, bay: "Bay 5", durationMin: 180, estimatedCost: 7800,
    services: ["Gearbox noise diagnosis", "Clutch assembly check"],
    customerNote: "Noise appears when shifting from 2nd to 3rd gear.",
    timeline: [
      { at: "2026-08-18 12:45", by: "Rana Sherif", text: "Diagnosis slot reserved after warranty pre-check." },
    ],
  },
  a5: {
    vin: "MA3EJKD8S00774451", plate: "و ز ط 6614", mileageKm: 5, bay: "Delivery area", durationMin: 60, estimatedCost: 0,
    services: ["New vehicle handover", "Documents & plates", "Infotainment setup"],
    customerNote: "Company delivery — invoice must be issued to Zaki Rent a Car.",
    timeline: [
      { at: "2026-08-13 16:20", by: "Tarek Amin", text: "Unit allocated from Mansoura stock." },
      { at: "2026-08-18 09:05", by: "Finance", text: "Awaiting final payment confirmation." },
    ],
  },
  a6: {
    vin: "MA3BJKD2S00990771", plate: "ل م ن 2208", mileageKm: 30980, bay: "Bay 2", durationMin: 75, estimatedCost: 2100,
    services: ["30,000 km service", "Wheel alignment"],
    customerNote: "Customer asked for a wash before pickup.",
    timeline: [
      { at: "2026-08-19 08:45", by: "Rana Sherif", text: "Vehicle received." },
      { at: "2026-08-19 10:10", by: "Workshop", text: "Service completed and invoiced." },
    ],
  },
  a7: {
    vin: "MA3EJKD1S00123481", plate: "ص ط ر 4821", mileageKm: 41980, bay: "Bay 3", durationMin: 120, estimatedCost: 0,
    services: ["AC repair follow-up"],
    customerNote: "Cancelled — rescheduled into ticket HD-1041.",
    timeline: [{ at: "2026-08-18 15:10", by: "Customer", text: "Cancelled due to travel." }],
  },
  a8: {
    vin: "MA3EJKD8S00774451", plate: "ر ق د 8845", mileageKm: 54300, bay: "Bay 4", durationMin: 90, estimatedCost: 2950,
    services: ["Periodic service", "Battery health test"],
    customerNote: "Fleet unit #6.",
    timeline: [{ at: "2026-08-20 07:40", by: "Delta Logistics", text: "Requested next available slot." }],
  },
};

export const contactDetails: Record<
  string,
  {
    address: string;
    preferredLanguage: string;
    accountManager: string;
    lifetimeValue: number;
    openBalance: number;
    loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
    notes: string;
    ownedUnits: { plate: string; model: string; vin: string; purchased: string; warrantyUntil: string }[];
  }
> = {
  c1: {
    address: "12 El-Tayaran St., Nasr City, Cairo", preferredLanguage: "Arabic", accountManager: "Hazem Nabil",
    lifetimeValue: 48200, openBalance: 0, loyaltyTier: "Gold",
    notes: "Prefers early morning slots. Always requests the same service advisor.",
    ownedUnits: [{ plate: "ص ط ر 4821", model: "Swift GL", vin: "MA3EJKD1S00123481", purchased: "2023-04-11", warrantyUntil: "2028-04-11" }],
  },
  c2: {
    address: "8 Victor Emanuel St., Smouha, Alexandria", preferredLanguage: "Arabic", accountManager: "Rana Sherif",
    lifetimeValue: 71500, openBalance: 1250, loyaltyTier: "Gold",
    notes: "Enrolled in the 5-year service plan; two vehicles under the same account.",
    ownedUnits: [
      { plate: "س ع ف 3390", model: "Baleno Sport", vin: "MA3BJKD2S00551209", purchased: "2022-09-02", warrantyUntil: "2027-09-02" },
      { plate: "ك ط ب 1102", model: "Ciaz Premium", vin: "MA3CJKD4S00220441", purchased: "2024-05-19", warrantyUntil: "2029-05-19" },
    ],
  },
  c3: {
    address: "Industrial Zone, 6th of October, Giza", preferredLanguage: "English", accountManager: "Mostafa Diaa",
    lifetimeValue: 615000, openBalance: 18400, loyaltyTier: "Platinum",
    notes: "Fleet of 24 units. Quarterly inspection contract, invoices consolidated monthly.",
    ownedUnits: [
      { plate: "ن ه ي 9032", model: "Carry Pickup", vin: "MA3CKD9S001220034", purchased: "2021-01-19", warrantyUntil: "2026-01-19" },
      { plate: "ر ق د 8845", model: "Ertiga Family", vin: "MA3EJKD8S00774451", purchased: "2023-03-04", warrantyUntil: "2028-03-04" },
    ],
  },
  c4: {
    address: "44 Makram Ebeid, Nasr City, Cairo", preferredLanguage: "Arabic", accountManager: "Yara Kamal",
    lifetimeValue: 0, openBalance: 0, loyaltyTier: "Bronze",
    notes: "Prospect from the online test-drive form. Comparing Vitara against a competitor SUV.",
    ownedUnits: [],
  },
  c5: {
    address: "Gehan St., Mansoura, Dakahlia", preferredLanguage: "English", accountManager: "Tarek Amin",
    lifetimeValue: 289000, openBalance: 0, loyaltyTier: "Platinum",
    notes: "Rental partner. Buys 6–10 units per year, requires bulk invoicing and fast delivery.",
    ownedUnits: [
      { plate: "و ز ط 6614", model: "Ertiga Family", vin: "MA3EJKD8S00774451", purchased: "2026-08-21", warrantyUntil: "2031-08-21" },
      { plate: "ح ي ص 4471", model: "Ciaz Premium", vin: "MA3CJKD4S00887731", purchased: "2025-02-14", warrantyUntil: "2030-02-14" },
    ],
  },
  c6: {
    address: "3 Fawzy Moaz, Smouha, Alexandria", preferredLanguage: "Arabic", accountManager: "Rana Sherif",
    lifetimeValue: 21300, openBalance: 0, loyaltyTier: "Silver",
    notes: "Interested in trading in her Baleno for a Vitara within the next quarter.",
    ownedUnits: [{ plate: "ل م ن 2208", model: "Baleno Sport", vin: "MA3BJKD2S00990771", purchased: "2024-11-08", warrantyUntil: "2029-11-08" }],
  },
};

export type PhoneCallStatus = "Incoming" | "Outgoing" | "Missed" | "Completed" | "In Progress" | "On Hold";
export type PhoneCallPriority = "Low" | "Medium" | "High" | "Urgent";
export type PhoneCallCategory = "Service Inquiry" | "Sales Inquiry" | "Support" | "Complaint" | "Follow-up" | "Emergency" | "General";

export type PhoneCall = {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  branchId: string;
  agentId: string;
  agentName: string;
  status: PhoneCallStatus;
  priority: PhoneCallPriority;
  category: PhoneCallCategory;
  subject: string;
  description: string;
  duration?: number; // in seconds
  startTime: string;
  endTime?: string;
  recordingUrl?: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  relatedTicketId?: string;
  relatedAppointmentId?: string;
  relatedVehicleId?: string;
  satisfactionRating?: number; // 1-5
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export let phoneCalls: PhoneCall[] = [
  {
    id: "pc1",
    contactId: "c1",
    contactName: "Omar Hassan",
    contactPhone: "+20 100 224 8891",
    branchId: "b1",
    agentId: "e2",
    agentName: "Hazem Nabil",
    status: "Completed",
    priority: "Medium",
    category: "Service Inquiry",
    subject: "Periodic Service Booking",
    description: "Customer called to book periodic service for Swift GL. Discussed available slots and confirmed appointment for next week.",
    duration: 345, // 5 minutes 45 seconds
    startTime: "2026-08-24 09:15:00",
    endTime: "2026-08-24 09:20:45",
    recordingUrl: "/recordings/pc1.mp3",
    notes: "Customer prefers morning slots. Confirmed oil change and brake inspection.",
    followUpRequired: true,
    followUpDate: "2026-08-25",
    relatedAppointmentId: "a1",
    relatedVehicleId: "vh1",
    satisfactionRating: 5,
    tags: ["Service", "VIP Customer"],
    createdAt: "2026-08-24 09:15:00",
    updatedAt: "2026-08-24 09:20:45"
  },
  {
    id: "pc2",
    contactId: "c2",
    contactName: "Mona Adel",
    contactPhone: "+20 122 887 4410",
    branchId: "b3",
    agentId: "e5",
    agentName: "Rana Sherif",
    status: "In Progress",
    priority: "High",
    category: "Complaint",
    subject: "Gearbox Noise Issue",
    description: "Customer called regarding persistent gearbox noise in Baleno Sport. Customer is frustrated as issue persists after previous repair.",
    startTime: "2026-08-24 10:30:00",
    notes: "Customer requesting escalation to warranty department. Need to check previous service records.",
    followUpRequired: true,
    followUpDate: "2026-08-24",
    relatedTicketId: "t3",
    relatedVehicleId: "vh2",
    tags: ["Complaint", "Warranty", "Escalation"],
    createdAt: "2026-08-24 10:30:00",
    updatedAt: "2026-08-24 10:30:00"
  },
  {
    id: "pc3",
    contactId: "c3",
    contactName: "Karim Fathy",
    contactPhone: "+20 101 550 1188",
    branchId: "b2",
    agentId: "e4",
    agentName: "Mostafa Diaa",
    status: "Completed",
    priority: "Urgent",
    category: "Emergency",
    subject: "Fleet Vehicle Breakdown",
    description: "Emergency call regarding fleet vehicle breakdown on highway. Customer needs immediate assistance and towing service.",
    duration: 720, // 12 minutes
    startTime: "2026-08-24 08:00:00",
    endTime: "2026-08-24 08:12:00",
    recordingUrl: "/recordings/pc3.mp3",
    notes: "Dispatched tow truck immediately. Vehicle is Carry Pickup with engine failure. Customer location: Cairo-Alexandria Highway, km 45.",
    followUpRequired: true,
    followUpDate: "2026-08-24",
    relatedVehicleId: "vh3",
    tags: ["Emergency", "Fleet", "Towing"],
    createdAt: "2026-08-24 08:00:00",
    updatedAt: "2026-08-24 08:12:00"
  },
  {
    id: "pc4",
    contactId: "c4",
    contactName: "Sara Ibrahim",
    contactPhone: "+20 111 903 2277",
    branchId: "b1",
    agentId: "e3",
    agentName: "Yara Kamal",
    status: "Missed",
    priority: "Low",
    category: "Sales Inquiry",
    subject: "Vitara Test Drive Inquiry",
    description: "Missed call from potential customer interested in Vitara test drive.",
    startTime: "2026-08-24 11:45:00",
    notes: "Customer called during lunch break. Need to return call and schedule test drive.",
    followUpRequired: true,
    followUpDate: "2026-08-24",
    tags: ["Sales", "Test Drive", "Follow-up Required"],
    createdAt: "2026-08-24 11:45:00",
    updatedAt: "2026-08-24 11:45:00"
  },
  {
    id: "pc5",
    contactId: "c5",
    contactName: "Ahmed Zaki",
    contactPhone: "+20 109 774 6600",
    branchId: "b4",
    agentId: "e6",
    agentName: "Tarek Amin",
    status: "Completed",
    priority: "Medium",
    category: "Follow-up",
    subject: "Delivery Confirmation",
    description: "Follow-up call to confirm vehicle delivery details for rental partner. Discussed documentation and timing.",
    duration: 285, // 4 minutes 45 seconds
    startTime: "2026-08-24 07:30:00",
    endTime: "2026-08-24 07:34:45",
    recordingUrl: "/recordings/pc5.mp3",
    notes: "Delivery confirmed for 3:45 PM today. All documentation ready. Customer satisfied with process.",
    followUpRequired: false,
    relatedAppointmentId: "a5",
    relatedVehicleId: "vh5",
    satisfactionRating: 4,
    tags: ["Delivery", "Rental Partner", "Follow-up"],
    createdAt: "2026-08-24 07:30:00",
    updatedAt: "2026-08-24 07:34:45"
  },
  {
    id: "pc6",
    contactId: "c6",
    contactName: "Nourhan Saad",
    contactPhone: "+20 128 441 7702",
    branchId: "b3",
    agentId: "e5",
    agentName: "Rana Sherif",
    status: "On Hold",
    priority: "Low",
    category: "Support",
    subject: "Service Plan Inquiry",
    description: "Customer calling to inquire about extended service plan options and pricing for Baleno Sport.",
    startTime: "2026-08-24 12:00:00",
    notes: "Customer on hold while checking available service plan options and current promotions.",
    followUpRequired: true,
    followUpDate: "2026-08-24",
    relatedVehicleId: "vh4",
    tags: ["Support", "Service Plan", "Pricing"],
    createdAt: "2026-08-24 12:00:00",
    updatedAt: "2026-08-24 12:00:00"
  },
  {
    id: "pc7",
    contactId: "c1",
    contactName: "Omar Hassan",
    contactPhone: "+20 100 224 8891",
    branchId: "b1",
    agentId: "e2",
    agentName: "Hazem Nabil",
    status: "Incoming",
    priority: "High",
    category: "Support",
    subject: "AC Issue Follow-up",
    description: "Customer calling to follow up on AC repair progress from previous ticket.",
    startTime: "2026-08-24 13:15:00",
    notes: "Call just came in. Need to check ticket HD-1041 status and provide update.",
    followUpRequired: true,
    relatedTicketId: "t1",
    relatedVehicleId: "vh1",
    tags: ["Support", "Follow-up", "AC Issue"],
    createdAt: "2026-08-24 13:15:00",
    updatedAt: "2026-08-24 13:15:00"
  },
  {
    id: "pc8",
    contactId: "c2",
    contactName: "Mona Adel",
    contactPhone: "+20 122 887 4410",
    branchId: "b3",
    agentId: "e5",
    agentName: "Rana Sherif",
    status: "Outgoing",
    priority: "Medium",
    category: "Follow-up",
    subject: "Service Reminder",
    description: "Outgoing call to remind customer about upcoming periodic service for Ciaz Premium.",
    startTime: "2026-08-24 14:00:00",
    notes: "Planned courtesy call to remind customer of service due next month.",
    followUpRequired: false,
    relatedVehicleId: "vh4",
    tags: ["Reminder", "Service", "Outgoing"],
    createdAt: "2026-08-24 14:00:00",
    updatedAt: "2026-08-24 14:00:00"
  }
];

export const ticketDetails: Record<
  string,
  { channel: string; category: string; plate: string; description: string; messages: TimelineEntry[] }
> = {
  t1: {
    channel: "Phone", category: "After-sales quality", plate: "ص ط ر 4821",
    description: "Customer reports the AC blows warm air two days after the periodic service. Suspected refrigerant leak or condenser issue.",
    messages: [
      { at: "2026-08-18 09:15", by: "Omar Hassan", text: "The AC is not cooling since I picked up the car." },
      { at: "2026-08-18 09:40", by: "Hazem Nabil", text: "Apologies — booked a free diagnostic slot for tomorrow morning." },
      { at: "2026-08-19 11:05", by: "Workshop", text: "Leak detected at the low-pressure line, part ordered." },
    ],
  },
  t2: {
    channel: "Email", category: "Spare parts", plate: "ن ه ي 9032",
    description: "Rear suspension part for fleet unit #12 delayed at customs; vehicle is immobilized at the 6th of October workshop.",
    messages: [
      { at: "2026-08-16 08:30", by: "Delta Logistics", text: "Unit has been down for 4 days, we need an ETA." },
      { at: "2026-08-16 12:00", by: "Mostafa Diaa", text: "Part cleared customs, expected in the branch in 48 hours." },
      { at: "2026-08-19 17:20", by: "Mostafa Diaa", text: "Courtesy vehicle offered until the repair is finished." },
    ],
  },
  t3: {
    channel: "Branch visit", category: "Warranty", plate: "س ع ف 3390",
    description: "Gearbox noise while shifting from 2nd to 3rd gear on a vehicle still under factory warranty. Awaiting technical assessment before claim submission.",
    messages: [{ at: "2026-08-20 09:00", by: "Mona Adel", text: "Filed a warranty claim at the Smouha branch." }],
  },
  t4: {
    channel: "Email", category: "Billing", plate: "ح ي ص 4471",
    description: "Invoice includes a wheel alignment that the customer says was never performed during the last visit.",
    messages: [
      { at: "2026-08-19 13:10", by: "Ahmed Zaki", text: "Line item 4 on invoice INV-8842 is not correct." },
      { at: "2026-08-19 16:00", by: "Tarek Amin", text: "Reviewing the job card with the workshop supervisor." },
    ],
  },
  t5: {
    channel: "Phone", category: "Service plan", plate: "ل م ن 2208",
    description: "Customer asked to extend the service plan for two additional years and to include brake pads.",
    messages: [
      { at: "2026-08-14 10:25", by: "Nourhan Saad", text: "Please send me the extended plan pricing." },
      { at: "2026-08-14 15:00", by: "Rana Sherif", text: "Quotation sent and accepted, plan activated." },
    ],
  },
  t6: {
    channel: "Website", category: "Showroom", plate: "—",
    description: "The Vitara demo unit was out on another test drive when the customer arrived at the Nasr City showroom.",
    messages: [{ at: "2026-08-20 10:30", by: "Sara Ibrahim", text: "I came at my appointment time but no car was available." }],
  },
};

export type SystemSettings = {
  id: string;
  companyName: string;
  logo?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  defaultBranchId?: string;
  appointmentLeadTime: number;
  appointmentBufferTime: number;
  workingDays: string[];
  workingHours: { start: string; end: string };
  autoArchiveDays: number;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  sessionTimeout: number;
  maxFileSize: number;
  backupSchedule: string;
  lastBackup?: string;
};

export let systemSettings: SystemSettings = {
  id: "s1",
  companyName: "Suzuki Egypt",
  timezone: "Africa/Cairo",
  language: "Arabic",
  dateFormat: "DD/MM/YYYY",
  currency: "EGP",
  defaultBranchId: "b1",
  appointmentLeadTime: 24,
  appointmentBufferTime: 15,
  workingDays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  workingHours: { start: "08:00", end: "20:00" },
  autoArchiveDays: 90,
  maintenanceMode: false,
  allowRegistration: false,
  sessionTimeout: 60,
  maxFileSize: 10,
  backupSchedule: "daily",
  lastBackup: "2026-08-20 02:00",
};

export type NotificationSettings = {
  id: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  reminderHours: number;
  ticketUpdates: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  notificationEmail: string;
};

export let notificationSettings: NotificationSettings = {
  id: "n1",
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: true,
  appointmentReminders: true,
  reminderHours: 24,
  ticketUpdates: true,
  systemAlerts: true,
  marketingEmails: false,
  weeklyReports: true,
  notificationEmail: "notifications@suzuki-egypt.com",
};

export type SecuritySettings = {
  id: string;
  twoFactorAuth: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  ipWhitelist: string[];
  auditLogEnabled: boolean;
  logRetentionDays: number;
};

export let securitySettings: SecuritySettings = {
  id: "sec1",
  twoFactorAuth: false,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  ipWhitelist: [],
  auditLogEnabled: true,
  logRetentionDays: 365,
};

export type IntegrationSettings = {
  id: string;
  accountingIntegration: boolean;
  accountingSystem?: string;
  crmIntegration: boolean;
  crmSystem?: string;
  emailProvider: string;
  smsProvider: string;
  paymentGateway: string;
  inventorySync: boolean;
  autoSyncInterval: number;
  apiKeys: Record<string, string>;
};

export let integrationSettings: IntegrationSettings = {
  id: "int1",
  accountingIntegration: true,
  accountingSystem: "QuickBooks",
  crmIntegration: false,
  emailProvider: "SendGrid",
  smsProvider: "Twilio",
  paymentGateway: "PayFort",
  inventorySync: true,
  autoSyncInterval: 60,
  apiKeys: {
    sendgrid: "sk_live_***",
    twilio: "AC***",
    payfort: "***",
  },
};

export const vehicleDetails: Record<
  string,
  {
    condition: string;
    estimatedValue: number;
    nextInspection: string;
    accessories: string[];
    warrantyStatus: string;
    insuranceProvider?: string;
    lastInspection?: string;
  }
> = {
  vh1: {
    condition: "Excellent",
    estimatedValue: 285000,
    nextInspection: "2027-04-11",
    accessories: ["Navigation", "Rear camera", "Parking sensors"],
    warrantyStatus: "Active",
    insuranceProvider: "AXA Egypt",
    lastInspection: "2026-04-11"
  },
  vh2: {
    condition: "Good",
    estimatedValue: 275000,
    nextInspection: "2026-09-02",
    accessories: ["Sunroof", "Alloy wheels", "Fog lights"],
    warrantyStatus: "Active",
    insuranceProvider: "Misr Insurance",
    lastInspection: "2025-09-02"
  },
  vh3: {
    condition: "Fair",
    estimatedValue: 165000,
    nextInspection: "2026-01-19",
    accessories: ["Tow bar", "Roof rack", "Cargo cover"],
    warrantyStatus: "Expired",
    insuranceProvider: "Allianz Egypt",
    lastInspection: "2025-01-19"
  },
  vh4: {
    condition: "Excellent",
    estimatedValue: 320000,
    nextInspection: "2029-05-19",
    accessories: ["Navigation", "Sunroof", "Premium audio"],
    warrantyStatus: "Active",
    insuranceProvider: "AXA Egypt",
    lastInspection: "2025-05-19"
  },
  vh5: {
    condition: "New",
    estimatedValue: 380000,
    nextInspection: "2031-08-21",
    accessories: ["Navigation", "Sunroof", "360 camera", "Wireless charging"],
    warrantyStatus: "Active",
    insuranceProvider: "Misr Insurance",
    lastInspection: undefined
  },
  vh6: {
    condition: "Excellent",
    estimatedValue: 330000,
    nextInspection: "2030-02-14",
    accessories: ["Navigation", "Rear camera", "Alloy wheels"],
    warrantyStatus: "Active",
    insuranceProvider: "Allianz Egypt",
    lastInspection: "2025-02-14"
  },
  vh7: {
    condition: "Excellent",
    estimatedValue: 290000,
    nextInspection: "2030-08-15",
    accessories: ["Rear camera", "Parking sensors"],
    warrantyStatus: "Active",
    insuranceProvider: "AXA Egypt",
    lastInspection: "2025-08-15"
  },
  vh8: {
    condition: "Good",
    estimatedValue: 285000,
    nextInspection: "2029-11-08",
    accessories: ["Sunroof", "Alloy wheels", "Fog lights"],
    warrantyStatus: "Active",
    insuranceProvider: "Misr Insurance",
    lastInspection: "2024-11-08"
  },
  vh9: {
    condition: "New",
    estimatedValue: 420000,
    nextInspection: null,
    accessories: ["Navigation", "Sunroof", "AllGrip system", "Premium audio"],
    warrantyStatus: "Pending",
    insuranceProvider: null,
    lastInspection: null
  },
  vh10: {
    condition: "Good",
    estimatedValue: 270000,
    nextInspection: "2028-03-04",
    accessories: ["Rear camera", "Parking sensors", "Cargo cover"],
    warrantyStatus: "Active",
    insuranceProvider: "Allianz Egypt",
    lastInspection: "2025-03-04"
  }
};

/* ---------- EXTENSIVE SETTINGS SYSTEM ---------- */

export type ThemeSettings = {
  id: string;
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontSize: "small" | "medium" | "large";
  fontFamily: string;
  customCSS?: string;
  logoLight?: string;
  logoDark?: string;
  favicon?: string;
};

export let themeSettings: ThemeSettings = {
  id: "theme1",
  theme: "light",
  primaryColor: "#3b82f6",
  accentColor: "#8b5cf6",
  borderRadius: 8,
  fontSize: "medium",
  fontFamily: "Inter",
  customCSS: "",
};

export type BackupSettings = {
  id: string;
  enabled: boolean;
  schedule: "hourly" | "daily" | "weekly" | "monthly";
  retentionDays: number;
  backupLocation: "local" | "cloud" | "both";
  cloudProvider?: string;
  cloudBucket?: string;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  includeAttachments: boolean;
  lastBackup?: string;
  nextBackup?: string;
  backupSize?: number;
  autoRestoreEnabled: boolean;
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    emailRecipients: string[];
  };
};

export let backupSettings: BackupSettings = {
  id: "backup1",
  enabled: true,
  schedule: "daily",
  retentionDays: 30,
  backupLocation: "both",
  cloudProvider: "AWS S3",
  cloudBucket: "suzuki-egypt-backups",
  encryptionEnabled: true,
  compressionEnabled: true,
  includeAttachments: true,
  lastBackup: "2026-08-20 02:00",
  nextBackup: "2026-08-21 02:00",
  backupSize: 245.6,
  autoRestoreEnabled: false,
  notifications: {
    onSuccess: true,
    onFailure: true,
    emailRecipients: ["admin@suzuki-egypt.com", "it@suzuki-egypt.com"],
  },
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  changes?: Record<string, { old: any; new: any }>;
};

export let auditLogs: AuditLogEntry[] = [
  {
    id: "al1",
    timestamp: "2026-08-20 08:30:15",
    userId: "u1",
    userName: "System Administrator",
    action: "LOGIN",
    module: "Authentication",
    entityType: "User",
    entityId: "u1",
    details: "User logged in successfully",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "al2",
    timestamp: "2026-08-20 09:15:22",
    userId: "u2",
    userName: "Ahmed Khaled",
    action: "UPDATE",
    module: "Contacts",
    entityType: "Contact",
    entityId: "c1",
    details: "Updated contact phone number",
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    changes: {
      phone: { old: "+20 100 224 8890", new: "+20 100 224 8891" },
    },
  },
  {
    id: "al3",
    timestamp: "2026-08-20 10:30:45",
    userId: "u3",
    userName: "Mona Ali",
    action: "CREATE",
    module: "Appointments",
    entityType: "Appointment",
    entityId: "a8",
    details: "Created new appointment for Delta Logistics",
    ipAddress: "192.168.1.110",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
];

export type WorkflowSettings = {
  id: string;
  appointmentApprovalRequired: boolean;
  appointmentApprovalLevels: string[];
  serviceApprovalRequired: boolean;
  warrantyApprovalRequired: boolean;
  warrantyApprovalThreshold: number;
  discountApprovalRequired: boolean;
  discountApprovalThreshold: number;
  escalationRules: {
    ticketPriority: string;
    escalationHours: number;
    escalateTo: string;
  }[];
  slaRules: {
    ticketCategory: string;
    priority: string;
    responseTimeHours: number;
    resolutionTimeHours: number;
  }[];
  automatedActions: {
    trigger: string;
    action: string;
    enabled: boolean;
  }[];
};

export let workflowSettings: WorkflowSettings = {
  id: "workflow1",
  appointmentApprovalRequired: false,
  appointmentApprovalLevels: ["Manager"],
  serviceApprovalRequired: true,
  warrantyApprovalRequired: true,
  warrantyApprovalThreshold: 5000,
  discountApprovalRequired: true,
  discountApprovalThreshold: 10,
  escalationRules: [
    { ticketPriority: "Urgent", escalationHours: 2, escalateTo: "Manager" },
    { ticketPriority: "High", escalationHours: 8, escalateTo: "Supervisor" },
    { ticketPriority: "Medium", escalationHours: 24, escalateTo: "Staff" },
  ],
  slaRules: [
    { ticketCategory: "Warranty", priority: "Urgent", responseTimeHours: 4, resolutionTimeHours: 24 },
    { ticketCategory: "After-sales quality", priority: "High", responseTimeHours: 8, resolutionTimeHours: 48 },
    { ticketCategory: "Billing", priority: "Medium", responseTimeHours: 24, resolutionTimeHours: 72 },
  ],
  automatedActions: [
    { trigger: "ticket_created", action: "send_confirmation_email", enabled: true },
    { trigger: "appointment_confirmed", action: "send_sms_reminder", enabled: true },
    { trigger: "warranty_claim_submitted", action: "notify_manager", enabled: true },
  ],
};

export type ReportingSettings = {
  id: string;
  defaultReportPeriod: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  autoGenerateReports: boolean;
  reportSchedule: string;
  defaultReportFormat: "pdf" | "excel" | "csv";
  includeCharts: boolean;
  includeRawData: boolean;
  reportRecipients: string[];
  customReports: {
    id: string;
    name: string;
    description: string;
    query: string;
    schedule?: string;
    recipients?: string[];
  }[];
  dashboardConfigs: {
    id: string;
    name: string;
    widgets: {
      type: string;
      title: string;
      dataSource: string;
      position: { x: number; y: number; w: number; h: number };
    }[];
  }[];
};

export let reportingSettings: ReportingSettings = {
  id: "reporting1",
  defaultReportPeriod: "monthly",
  autoGenerateReports: true,
  reportSchedule: "1st of month 08:00",
  defaultReportFormat: "pdf",
  includeCharts: true,
  includeRawData: false,
  reportRecipients: ["management@suzuki-egypt.com"],
  customReports: [
    {
      id: "cr1",
      name: "Monthly Service Performance",
      description: "Service department performance metrics",
      query: "SELECT * FROM service_metrics WHERE month = CURRENT_MONTH",
      schedule: "monthly",
      recipients: ["service-manager@suzuki-egypt.com"],
    },
    {
      id: "cr2",
      name: "Sales Conversion Report",
      description: "Lead to sale conversion analysis",
      query: "SELECT * FROM sales_conversions WHERE period = LAST_QUARTER",
      schedule: "quarterly",
      recipients: ["sales-director@suzuki-egypt.com"],
    },
  ],
  dashboardConfigs: [
    {
      id: "dc1",
      name: "Executive Dashboard",
      widgets: [
        { type: "chart", title: "Revenue Trend", dataSource: "revenue_data", position: { x: 0, y: 0, w: 6, h: 4 } },
        { type: "metric", title: "Total Sales", dataSource: "total_sales", position: { x: 6, y: 0, w: 3, h: 2 } },
        { type: "metric", title: "Service Revenue", dataSource: "service_revenue", position: { x: 9, y: 0, w: 3, h: 2 } },
      ],
    },
  ],
};

export type APISettings = {
  id: string;
  apiEnabled: boolean;
  rateLimiting: boolean;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  apiKeyRequired: boolean;
  allowedOrigins: string[];
  apiVersion: string;
  documentationUrl: string;
  webhooks: {
    id: string;
    name: string;
    url: string;
    events: string[];
    headers: Record<string, string>;
    active: boolean;
    lastTriggered?: string;
    secret?: string;
  }[];
  apiKeysList: {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    created: string;
    expires?: string;
    lastUsed?: string;
    active: boolean;
  }[];
};

export let apiSettings: APISettings = {
  id: "api1",
  apiEnabled: true,
  rateLimiting: true,
  rateLimitPerMinute: 100,
  rateLimitPerHour: 1000,
  apiKeyRequired: true,
  allowedOrigins: ["https://suzuki-egypt.com", "https://app.suzuki-egypt.com"],
  apiVersion: "v2",
  documentationUrl: "https://api.suzuki-egypt.com/docs",
  webhooks: [
    {
      id: "wh1",
      name: "Appointment Created",
      url: "https://crm.example.com/webhooks/appointment",
      events: ["appointment.created", "appointment.updated"],
      headers: { "Authorization": "Bearer token123" },
      active: true,
      lastTriggered: "2026-08-20 09:15:00",
      secret: "webhook_secret_123",
    },
    {
      id: "wh2",
      name: "Ticket Resolved",
      url: "https://support.example.com/webhooks/ticket",
      events: ["ticket.resolved"],
      headers: { "Authorization": "Bearer token456" },
      active: true,
      secret: "webhook_secret_456",
    },
  ],
  apiKeysList: [
    {
      id: "ak1",
      name: "Production Key",
      key: "sk_live_1234567890abcdef",
      permissions: ["read", "write", "delete"],
      created: "2024-01-15",
      expires: "2025-01-15",
      lastUsed: "2026-08-20 08:30:00",
      active: true,
    },
    {
      id: "ak2",
      name: "Test Key",
      key: "sk_test_0987654321fedcba",
      permissions: ["read"],
      created: "2024-06-20",
      active: true,
    },
  ],
};

export type StorageSettings = {
  id: string;
  storageProvider: "local" | "aws_s3" | "azure_blob" | "google_cloud";
  storageLocation: string;
  maxStorageGB: number;
  currentStorageGB: number;
  storageAlertThreshold: number;
  fileRetentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  cdnEnabled: boolean;
  cdnUrl?: string;
  backupStorage: boolean;
  fileTypes: {
    allowed: string[];
    blocked: string[];
  };
  storageQuotas: {
    documents: number;
    images: number;
    videos: number;
    other: number;
  };
};

export let storageSettings: StorageSettings = {
  id: "storage1",
  storageProvider: "aws_s3",
  storageLocation: "suzuki-egypt-production",
  maxStorageGB: 1000,
  currentStorageGB: 345.6,
  storageAlertThreshold: 80,
  fileRetentionDays: 365,
  compressionEnabled: true,
  encryptionEnabled: true,
  cdnEnabled: true,
  cdnUrl: "https://cdn.suzuki-egypt.com",
  backupStorage: true,
  fileTypes: {
    allowed: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".xlsx", ".csv"],
    blocked: [".exe", ".bat", ".sh", ".php", ".js"],
  },
  storageQuotas: {
    documents: 500,
    images: 300,
    videos: 150,
    other: 50,
  },
};

export type CommunicationSettings = {
  id: string;
  emailSettings: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    encryption: "none" | "ssl" | "tls";
    maxEmailsPerDay: number;
    bounceHandling: boolean;
    trackingEnabled: boolean;
  };
  smsSettings: {
    provider: string;
    apiKey: string;
    senderId: string;
    maxSmsPerDay: number;
    unicodeEnabled: boolean;
    trackingEnabled: boolean;
  };
  pushNotificationSettings: {
    enabled: boolean;
    firebaseConfig: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    };
    apnsConfig: {
      bundleId: string;
      teamId: string;
      keyId: string;
    };
  };
  whatsappSettings: {
    enabled: boolean;
    phoneNumber: string;
    apiKey: string;
    templateMessages: string[];
  };
  voiceSettings: {
    provider: string;
    apiKey: string;
    defaultCallerId: string;
    recordingEnabled: boolean;
  };
};

export let communicationSettings: CommunicationSettings = {
  id: "comm1",
  emailSettings: {
    provider: "SendGrid",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: 587,
    smtpUsername: "apikey",
    smtpPassword: "SG.hidden_key",
    fromEmail: "noreply@suzuki-egypt.com",
    fromName: "Suzuki Egypt",
    encryption: "tls",
    maxEmailsPerDay: 10000,
    bounceHandling: true,
    trackingEnabled: true,
  },
  smsSettings: {
    provider: "Twilio",
    apiKey: "AC.hidden_key",
    senderId: "SuzukiEG",
    maxSmsPerDay: 5000,
    unicodeEnabled: true,
    trackingEnabled: true,
  },
  pushNotificationSettings: {
    enabled: true,
    firebaseConfig: {
      apiKey: "AIzaSy.hidden_key",
      authDomain: "suzuki-egypt.firebaseapp.com",
      projectId: "suzuki-egypt",
      storageBucket: "suzuki-egypt.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef",
    },
    apnsConfig: {
      bundleId: "com.suzuki.egypt",
      teamId: "TEAM123",
      keyId: "KEY456",
    },
  },
  whatsappSettings: {
    enabled: false,
    phoneNumber: "",
    apiKey: "",
    templateMessages: [],
  },
  voiceSettings: {
    provider: "Twilio",
    apiKey: "AC.hidden_key",
    defaultCallerId: "+201000000000",
    recordingEnabled: true,
  },
};

export type FinancialSettings = {
  id: string;
  currency: string;
  taxRate: number;
  taxId: string;
  invoiceSettings: {
    prefix: string;
    startingNumber: number;
    autoNumbering: boolean;
    includeVat: boolean;
    paymentTerms: string;
    lateFeePercentage: number;
    lateFeeDays: number;
  };
  paymentSettings: {
    acceptedMethods: string[];
    defaultMethod: string;
    requireDeposit: boolean;
    depositPercentage: number;
    refundPolicy: string;
  };
  expenseCategories: {
    id: string;
    name: string;
    budget: number;
    code: string;
  }[];
  revenueRecognition: {
    method: "cash" | "accrual";
    recognitionPeriod: number;
  };
  multiCurrency: {
    enabled: boolean;
    baseCurrency: string;
    supportedCurrencies: string[];
    autoUpdateRates: boolean;
  };
};

export let financialSettings: FinancialSettings = {
  id: "financial1",
  currency: "EGP",
  taxRate: 14,
  taxId: "123-456-789",
  invoiceSettings: {
    prefix: "INV",
    startingNumber: 1000,
    autoNumbering: true,
    includeVat: true,
    paymentTerms: "Net 30",
    lateFeePercentage: 1.5,
    lateFeeDays: 15,
  },
  paymentSettings: {
    acceptedMethods: ["cash", "card", "bank_transfer", "installment"],
    defaultMethod: "card",
    requireDeposit: true,
    depositPercentage: 20,
    refundPolicy: "7 days full refund",
  },
  expenseCategories: [
    { id: "ec1", name: "Parts & Materials", budget: 500000, code: "PARTS" },
    { id: "ec2", name: "Labor Costs", budget: 300000, code: "LABOR" },
    { id: "ec3", name: "Utilities", budget: 50000, code: "UTIL" },
    { id: "ec4", name: "Marketing", budget: 100000, code: "MKTG" },
  ],
  revenueRecognition: {
    method: "accrual",
    recognitionPeriod: 30,
  },
  multiCurrency: {
    enabled: false,
    baseCurrency: "EGP",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    autoUpdateRates: true,
  },
};

export type HrmSettings = {
  id: string;
  employeeManagement: {
    trackWorkingHours: boolean;
    overtimeEnabled: boolean;
    overtimeRate: number;
    leaveManagement: boolean;
    leaveTypes: {
      id: string;
      name: string;
      daysPerYear: number;
      requiresApproval: boolean;
    }[];
  };
  payrollSettings: {
    frequency: "weekly" | "bi_weekly" | "monthly";
    payday: number;
    includeCommission: boolean;
    taxDeduction: boolean;
    socialInsurance: boolean;
  };
  performanceManagement: {
    enabled: boolean;
    reviewPeriod: "monthly" | "quarterly" | "semi_annual" | "annual";
    kpiCategories: string[];
    ratingScale: number;
  };
  trainingSettings: {
    trackTraining: boolean;
    requiredTrainingHours: number;
    certificationTracking: boolean;
  };
  attendanceSettings: {
    biometricEnabled: boolean;
    gpsTracking: boolean;
    geoFencing: boolean;
    checkInRadius: number;
  };
};

export let hrmSettings: HrmSettings = {
  id: "hrm1",
  employeeManagement: {
    trackWorkingHours: true,
    overtimeEnabled: true,
    overtimeRate: 1.5,
    leaveManagement: true,
    leaveTypes: [
      { id: "lt1", name: "Annual Leave", daysPerYear: 21, requiresApproval: true },
      { id: "lt2", name: "Sick Leave", daysPerYear: 30, requiresApproval: true },
      { id: "lt3", name: "Personal Leave", daysPerYear: 6, requiresApproval: false },
    ],
  },
  payrollSettings: {
    frequency: "monthly",
    payday: 25,
    includeCommission: true,
    taxDeduction: true,
    socialInsurance: true,
  },
  performanceManagement: {
    enabled: true,
    reviewPeriod: "quarterly",
    kpiCategories: ["Sales", "Customer Service", "Technical Skills", "Teamwork"],
    ratingScale: 5,
  },
  trainingSettings: {
    trackTraining: true,
    requiredTrainingHours: 40,
    certificationTracking: true,
  },
  attendanceSettings: {
    biometricEnabled: true,
    gpsTracking: false,
    geoFencing: false,
    checkInRadius: 100,
  },
};

export type InventorySettings = {
  id: string;
  inventoryManagement: {
    enabled: boolean;
    autoReorder: boolean;
    reorderThreshold: number;
    leadTimeDays: number;
    multipleLocations: boolean;
  };
  partsCatalog: {
    oemPartsOnly: boolean;
    allowAftermarket: boolean;
    priceSync: boolean;
    catalogSource: string;
  };
  stockManagement: {
    trackByLocation: boolean;
    trackByBin: boolean;
    batchTracking: boolean;
    expiryTracking: boolean;
    serialNumberTracking: boolean;
  };
  pricingSettings: {
    basePriceSource: string;
    marginPercentage: number;
    dynamicPricing: boolean;
    discountRules: {
      id: string;
      name: string;
      condition: string;
      discount: number;
    }[];
  };
  supplierManagement: {
    preferredSuppliers: string[];
    autoSupplierSelection: boolean;
    supplierRating: boolean;
  };
};

export let inventorySettings: InventorySettings = {
  id: "inventory1",
  inventoryManagement: {
    enabled: true,
    autoReorder: true,
    reorderThreshold: 10,
    leadTimeDays: 7,
    multipleLocations: true,
  },
  partsCatalog: {
    oemPartsOnly: true,
    allowAftermarket: false,
    priceSync: true,
    catalogSource: "Suzuki Global",
  },
  stockManagement: {
    trackByLocation: true,
    trackByBin: true,
    batchTracking: true,
    expiryTracking: false,
    serialNumberTracking: true,
  },
  pricingSettings: {
    basePriceSource: "manufacturer",
    marginPercentage: 25,
    dynamicPricing: false,
    discountRules: [
      { id: "dr1", name: "Bulk Discount", condition: "quantity > 10", discount: 10 },
      { id: "dr2", name: "Fleet Discount", condition: "customer_type = fleet", discount: 15 },
    ],
  },
  supplierManagement: {
    preferredSuppliers: ["Suzuki Japan", "Suzuki Middle East"],
    autoSupplierSelection: true,
    supplierRating: true,
  },
};

export type ComplianceSettings = {
  id: string;
  dataProtection: {
    gdprCompliant: boolean;
    dataRetentionPolicy: string;
    rightToDeletion: boolean;
    consentManagement: boolean;
    dataEncryption: boolean;
  };
  industryCompliance: {
    automotiveStandards: boolean;
    isoCertified: boolean;
    isoNumber?: string;
    safetyStandards: boolean;
    environmentalCompliance: boolean;
  };
  documentCompliance: {
    digitalSignatures: boolean;
    auditTrail: boolean;
    versionControl: boolean;
    documentRetention: number;
  };
  regulatoryReporting: {
    autoReporting: boolean;
    reportSchedule: string;
    reportRecipients: string[];
    customReports: string[];
  };
  riskManagement: {
    riskAssessment: boolean;
    mitigationPlans: boolean;
    incidentReporting: boolean;
    businessContinuity: boolean;
  };
};

export let complianceSettings: ComplianceSettings = {
  id: "compliance1",
  dataProtection: {
    gdprCompliant: false,
    dataRetentionPolicy: "7 years",
    rightToDeletion: true,
    consentManagement: true,
    dataEncryption: true,
  },
  industryCompliance: {
    automotiveStandards: true,
    isoCertified: true,
    isoNumber: "ISO 9001:2015",
    safetyStandards: true,
    environmentalCompliance: true,
  },
  documentCompliance: {
    digitalSignatures: true,
    auditTrail: true,
    versionControl: true,
    documentRetention: 3650,
  },
  regulatoryReporting: {
    autoReporting: true,
    reportSchedule: "quarterly",
    reportRecipients: ["compliance@suzuki-egypt.com"],
    customReports: ["sales_tax", "environmental_impact"],
  },
  riskManagement: {
    riskAssessment: true,
    mitigationPlans: true,
    incidentReporting: true,
    businessContinuity: true,
  },
};

export type LocalizationSettings = {
  id: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  dateFormat: string;
  timeFormat: "12h" | "24h";
  timezone: string;
  numberFormat: {
    decimalSeparator: string;
    thousandsSeparator: string;
    currencyPosition: "before" | "after";
  };
  addressFormat: string;
  measurementSystem: "metric" | "imperial";
  rtlLanguages: string[];
  autoDetectLanguage: boolean;
  translations: {
    [key: string]: {
      [language: string]: string;
    };
  };
};

export let localizationSettings: LocalizationSettings = {
  id: "localization1",
  defaultLanguage: "ar",
  supportedLanguages: ["ar", "en", "fr"],
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  timezone: "Africa/Cairo",
  numberFormat: {
    decimalSeparator: ".",
    thousandsSeparator: ",",
    currencyPosition: "before",
  },
  addressFormat: "{street}, {city}, {country}",
  measurementSystem: "metric",
  rtlLanguages: ["ar"],
  autoDetectLanguage: true,
  translations: {},
};

export type AdvancedSettings = {
  id: string;
  developerMode: boolean;
  debugMode: boolean;
  featureFlags: {
    [key: string]: boolean;
  };
  betaFeatures: {
    enabled: boolean;
    availableFeatures: string[];
    enrolledFeatures: string[];
  };
  systemMaintenance: {
    enabled: boolean;
    message: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    allowAdminAccess: boolean;
  };
  performanceSettings: {
    cachingEnabled: boolean;
    cacheTimeout: number;
    queryOptimization: boolean;
    lazyLoading: boolean;
  };
  loggingSettings: {
    logLevel: "debug" | "info" | "warn" | "error";
    logToFile: boolean;
    logToDatabase: boolean;
    maxLogSize: number;
  };
};

export let advancedSettings: AdvancedSettings = {
  id: "advanced1",
  developerMode: false,
  debugMode: false,
  featureFlags: {
    new_ui: true,
    advanced_search: true,
    mobile_app: false,
    ai_assistant: false,
  },
  betaFeatures: {
    enabled: true,
    availableFeatures: ["predictive_maintenance", "customer_insights", "voice_commands"],
    enrolledFeatures: ["predictive_maintenance"],
  },
  systemMaintenance: {
    enabled: false,
    message: "",
    allowAdminAccess: true,
  },
  performanceSettings: {
    cachingEnabled: true,
    cacheTimeout: 3600,
    queryOptimization: true,
    lazyLoading: true,
  },
  loggingSettings: {
    logLevel: "info",
    logToFile: true,
    logToDatabase: true,
    maxLogSize: 100,
  },
};

export type ContentManagementSettings = {
  id: string;
  moduleNames: {
    dashboard: string;
    contacts: string;
    branches: string;
    appointments: string;
    helpdesk: string;
    settings: string;
  };
  servicesDictionary: Array<{
    id: string;
    name: string;
    description: string;
    category: "maintenance" | "sales" | "support" | "other";
    isActive: boolean;
  }>;
  definitions: {
    [key: string]: string;
  };
};

export let contentSettings: ContentManagementSettings = {
  id: "content1",
  moduleNames: {
    dashboard: "Dashboard",
    contacts: "Contacts",
    branches: "Branches",
    appointments: "Appointments",
    helpdesk: "Helpdesk",
    settings: "Settings",
  },
  servicesDictionary: [
    { id: "srv_1", name: "Periodic Maintenance", description: "Standard 10k km service", category: "maintenance", isActive: true },
    { id: "srv_2", name: "Test Drive", description: "Customer test drive booking", category: "sales", isActive: true },
    { id: "srv_3", name: "General Repair", description: "Unscheduled repair work", category: "maintenance", isActive: true },
    { id: "srv_4", name: "Warranty Claim", description: "Warranty related service", category: "support", isActive: true },
  ],
  definitions: {
    "SLA": "Service Level Agreement - The expected time to resolve a ticket.",
    "Lead": "A potential customer who has shown interest but hasn't purchased yet.",
  }
};

export type WarrantyPackage = {
  id: string;
  companyId: string;
  companyName: string;
  vehicleType: "Sedan" | "SUV" | "Hatchback" | "Pickup" | "Van";
  vehicleModel: string;
  modelYear: number;
  warrantyName: string;
  warrantyDescription: string;
  warrantyPeriod: number; // in months
  warrantyPeriodText: string;
  kilometerRange: {
    from: number;
    to: number;
  };
  warrantyCoverage: string[];
  exclusions: string[];
  additionalNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export let warrantyPackages: WarrantyPackage[] = [
  {
    id: "wp1",
    companyId: "c1",
    companyName: "Suzuki Egypt Automotive",
    vehicleType: "Sedan",
    vehicleModel: "Swift GL",
    modelYear: 2024,
    warrantyName: "Standard Factory Warranty",
    warrantyDescription: "Comprehensive factory warranty covering manufacturing defects and mechanical failures",
    warrantyPeriod: 36,
    warrantyPeriodText: "3 Years",
    kilometerRange: {
      from: 0,
      to: 100000
    },
    warrantyCoverage: [
      "Engine and transmission",
      "Electrical system",
      "Suspension components",
      "Braking system",
      "Air conditioning"
    ],
    exclusions: [
      "Wear and tear items",
      "Normal maintenance",
      "Accidental damage",
      "Misuse or neglect"
    ],
    additionalNotes: "Valid only at authorized Suzuki service centers",
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2026-08-20"
  },
  {
    id: "wp2",
    companyId: "c1",
    companyName: "Suzuki Egypt Automotive",
    vehicleType: "SUV",
    vehicleModel: "Vitara",
    modelYear: 2024,
    warrantyName: "Premium Extended Warranty",
    warrantyDescription: "Extended warranty package for premium SUV models with enhanced coverage",
    warrantyPeriod: 60,
    warrantyPeriodText: "5 Years",
    kilometerRange: {
      from: 0,
      to: 150000
    },
    warrantyCoverage: [
      "All mechanical components",
      "Electrical system including infotainment",
      "Suspension and steering",
      "Braking system with ABS",
      "Climate control system",
      "Power windows and locks"
    ],
    exclusions: [
      "Body and paint",
      "Tires and batteries",
      "Normal maintenance items",
      "Water damage",
      "Unauthorized modifications"
    ],
    additionalNotes: "Includes 24/7 roadside assistance",
    isActive: true,
    createdAt: "2024-02-20",
    updatedAt: "2026-08-20"
  },
  {
    id: "wp3",
    companyId: "c2",
    companyName: "Delta Motors",
    vehicleType: "Pickup",
    vehicleModel: "Carry Pickup",
    modelYear: 2023,
    warrantyName: "Commercial Fleet Warranty",
    warrantyDescription: "Specialized warranty for commercial fleet vehicles with high durability focus",
    warrantyPeriod: 24,
    warrantyPeriodText: "2 Years",
    kilometerRange: {
      from: 0,
      to: 80000
    },
    warrantyCoverage: [
      "Engine and drivetrain",
      "Chassis components",
      "Electrical system",
      "Braking system",
      "Suspension (heavy duty)"
    ],
    exclusions: [
      "Body and cargo area",
      "Interior wear",
      "Normal maintenance",
      "Overloading damage"
    ],
    additionalNotes: "Valid for commercial use only",
    isActive: true,
    createdAt: "2023-06-15",
    updatedAt: "2026-08-20"
  },
  {
    id: "wp4",
    companyId: "c1",
    companyName: "Suzuki Egypt Automotive",
    vehicleType: "Hatchback",
    vehicleModel: "Baleno Sport",
    modelYear: 2025,
    warrantyName: "New Generation Warranty",
    warrantyDescription: "Advanced warranty package for latest generation models with technology focus",
    warrantyPeriod: 48,
    warrantyPeriodText: "4 Years",
    kilometerRange: {
      from: 0,
      to: 120000
    },
    warrantyCoverage: [
      "All powertrain components",
      "Advanced safety systems",
      "Infotainment and connectivity",
      "Climate control",
      "Electrical architecture"
    ],
    exclusions: [
      "Cosmetic items",
      "Software updates",
      "Normal wear and tear",
      "Third-party accessories"
    ],
    additionalNotes: "Includes complimentary software updates",
    isActive: true,
    createdAt: "2025-01-10",
    updatedAt: "2026-08-20"
  }
];

export type MailGroup = {
  id: string;
  groupName: string;
  groupDescription: string;
  companyId: string;
  companyName: string;
  toEmails: string[];
  ccEmails: string[];
  category: "notifications" | "reports" | "alerts" | "marketing" | "general";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export let mailGroups: MailGroup[] = [
  {
    id: "mg1",
    groupName: "Service Notifications",
    groupDescription: "Email group for service appointment notifications and reminders",
    companyId: "c1",
    companyName: "Suzuki Egypt Automotive",
    toEmails: ["service@suzuki-egypt.com", "customerservice@suzuki-egypt.com"],
    ccEmails: ["manager@suzuki-egypt.com", "quality@suzuki-egypt.com"],
    category: "notifications",
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2026-08-20"
  },
  {
    id: "mg2",
    groupName: "Daily Reports",
    groupDescription: "Daily operational and sales reports distribution list",
    companyId: "c1",
    companyName: "Suzuki Egypt Automotive",
    toEmails: ["reports@suzuki-egypt.com", "directors@suzuki-egypt.com"],
    ccEmails: ["regional-managers@suzuki-egypt.com"],
    category: "reports",
    isActive: true,
    createdAt: "2024-02-20",
    updatedAt: "2026-08-20"
  },
  {
    id: "mg3",
    groupName: "Emergency Alerts",
    groupDescription: "Critical system and operational alerts for immediate attention",
    companyId: "c2",
    companyName: "Delta Motors",
    toEmails: ["emergency@deltamotors.com", "security@deltamotors.com"],
    ccEmails: ["ceo@deltamotors.com", "operations@deltamotors.com"],
    category: "alerts",
    isActive: true,
    createdAt: "2023-06-15",
    updatedAt: "2026-08-20"
  },
  {
    id: "mg4",
    groupName: "Marketing Campaigns",
    groupDescription: "Marketing and promotional email distribution list",
    companyId: "c1",
    companyName: "Suzuki Egypt Automotive",
    toEmails: ["marketing@suzuki-egypt.com", "sales@suzuki-egypt.com"],
    ccEmails: ["creative@suzuki-egypt.com"],
    category: "marketing",
    isActive: true,
    createdAt: "2024-03-10",
    updatedAt: "2026-08-20"
  }
];

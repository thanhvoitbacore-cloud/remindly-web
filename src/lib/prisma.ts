import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Helper to generate UUIDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// In-Memory Database Store
const mockStore: {
  user: any[];
  event: any[];
  meeting: any[];
  oTPCode: any[];
  calendarAccount: any[];
  activityLog: any[];
  notification: any[];
} = {
  user: [],
  event: [],
  meeting: [],
  oTPCode: [],
  calendarAccount: [],
  activityLog: [],
  notification: []
};

// Initialize Seed Data
function seedDatabase() {
  const adminPasswordHash = bcrypt.hashSync("2042001", 10);
  const userPasswordHash = bcrypt.hashSync("password123", 10);

  // Users
  const adminUser = {
    id: "admin-hardcoded-uuid-value-12345",
    email: "admin@remindly",
    phoneNumber: "0123456789",
    name: "System Administrator",
    avatar: null,
    passwordHash: adminPasswordHash,
    role: "ADMIN",
    accountStatus: "ACTIVE",
    autoSyncCalendars: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const normalUser = {
    id: "user-hardcoded-uuid-value-67890",
    email: "user@remindly",
    phoneNumber: "0987654321",
    name: "Remindly User",
    avatar: null,
    passwordHash: userPasswordHash,
    role: "USER",
    accountStatus: "ACTIVE",
    autoSyncCalendars: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  mockStore.user.push(adminUser, normalUser);

  // Events & Meetings for both Users
  const today = new Date();
  const getRelativeDate = (days: number, hours: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    d.setHours(hours, 0, 0, 0);
    return d;
  };

  // Mock Events for Admin
  const adminEvents = [
    {
      id: generateUUID(),
      ownerId: adminUser.id,
      title: "Họp Định Hướng Dự Án Remindly",
      description: "Thảo luận về các tính năng mới và kế hoạch phát triển hệ thống.",
      startTime: getRelativeDate(0, 9),
      endTime: getRelativeDate(0, 10.5),
      location: "Google Meet",
      isDraft: false,
      isRecurring: false,
      priority: "HIGH",
      source: "local",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateUUID(),
      ownerId: adminUser.id,
      title: "Đánh Giá Tiến Độ Sprint",
      description: "Xem xét các task đã hoàn thành và chuẩn bị cho sprint tiếp theo.",
      startTime: getRelativeDate(1, 14),
      endTime: getRelativeDate(1, 15),
      location: "Phòng họp lớn lầu 3",
      isDraft: false,
      isRecurring: false,
      priority: "MEDIUM",
      source: "local",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateUUID(),
      ownerId: adminUser.id,
      title: "Draft: Kế hoạch ngân sách Q3",
      description: "Bản thảo chi tiết các khoản chi dự kiến.",
      startTime: getRelativeDate(2, 10),
      endTime: getRelativeDate(2, 11),
      location: "Văn phòng",
      isDraft: true,
      isRecurring: false,
      priority: "LOW",
      source: "local",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Mock Events for Normal User
  const userEvents = [
    {
      id: generateUUID(),
      ownerId: normalUser.id,
      title: "Học nhóm Web Development",
      description: "Cùng ôn tập các kiến thức về Next.js và TailwindCSS.",
      startTime: getRelativeDate(0, 15),
      endTime: getRelativeDate(0, 17),
      location: "Thư viện trường",
      isDraft: false,
      isRecurring: false,
      priority: "MEDIUM",
      source: "local",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateUUID(),
      ownerId: normalUser.id,
      title: "Lớp Yoga Cuối Tuần",
      description: "Thư giãn và cải thiện sức khỏe.",
      startTime: getRelativeDate(3, 8),
      endTime: getRelativeDate(3, 9),
      location: "Trung tâm Yoga Fit",
      isDraft: false,
      isRecurring: false,
      priority: "LOW",
      source: "local",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  mockStore.event.push(...adminEvents, ...userEvents);

  // Mock Meetings for Events
  const meeting1 = {
    id: generateUUID(),
    eventId: adminEvents[0].id,
    provider: "google_meet",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    participantEmail: "partner@remindly.com",
    rsvpStatus: "ACCEPTED",
    role: "ATTENDEE",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const meeting2 = {
    id: generateUUID(),
    eventId: userEvents[0].id,
    provider: "zoom",
    meetingLink: "https://zoom.us/j/1234567890",
    participantEmail: "friend@remindly.com",
    rsvpStatus: "PENDING",
    role: "ATTENDEE",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  mockStore.meeting.push(meeting1, meeting2);

  // Mock Notifications
  mockStore.notification.push(
    {
      id: generateUUID(),
      userId: adminUser.id,
      title: "Chào mừng bạn quay lại!",
      message: "Hệ thống Remindly phiên bản Dữ Liệu Giả Lập đã sẵn sàng hoạt động.",
      type: "SYSTEM",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateUUID(),
      userId: normalUser.id,
      title: "Chào mừng thành viên mới!",
      message: "Chúc bạn có trải nghiệm tuyệt vời quản lý lịch trình với Remindly.",
      type: "SYSTEM",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );
}

// Seed the DB upon import
seedDatabase();

// Generic filter evaluator
function matchFilter(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const val = where[key];
    if (key === 'OR') {
      if (!Array.isArray(val)) continue;
      if (!val.some(cond => matchFilter(item, cond))) return false;
    } else if (key === 'AND') {
      if (!Array.isArray(val)) continue;
      if (!val.every(cond => matchFilter(item, cond))) return false;
    } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      const itemVal = item[key];
      for (const op of Object.keys(val)) {
        const opVal = val[op];
        if (op === 'in') {
          if (!Array.isArray(opVal) || !opVal.includes(itemVal)) return false;
        } else if (op === 'notIn') {
          if (Array.isArray(opVal) && opVal.includes(itemVal)) return false;
        } else if (op === 'gte') {
          if (itemVal < opVal) return false;
        } else if (op === 'lte') {
          if (itemVal > opVal) return false;
        } else if (op === 'gt') {
          if (itemVal <= opVal) return false;
        } else if (op === 'lt') {
          if (itemVal >= opVal) return false;
        } else if (op === 'equals') {
          if (itemVal !== opVal) return false;
        } else if (op === 'not') {
          if (itemVal === opVal) return false;
        }
      }
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

// Sort Helper
function sortItems(items: any[], orderBy: any) {
  if (!orderBy) return items;
  const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const order of orderArray) {
      const field = Object.keys(order)[0];
      const dir = order[field];
      const valA = a[field];
      const valB = b[field];
      if (valA === valB) continue;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

// Populates relations
function populateRelations(item: any, tableName: string) {
  if (!item) return null;
  const newItem = { ...item };
  if (tableName === 'event') {
    newItem.meetings = mockStore.meeting.filter(m => m.eventId === item.id);
  } else if (tableName === 'meeting') {
    newItem.event = mockStore.event.find(e => e.id === item.eventId);
  } else if (tableName === 'user') {
    newItem.events = mockStore.event.filter(e => e.ownerId === item.id);
    newItem.calendarAccounts = mockStore.calendarAccount.filter(ca => ca.userId === item.id);
    newItem.notifications = mockStore.notification.filter(n => n.userId === item.id);
  }
  return newItem;
}

// Creates Mock Service Factory for individual tables
class MockTableService<T extends { id: string }> {
  constructor(private tableName: keyof typeof mockStore) {}

  private get data(): T[] {
    return mockStore[this.tableName] as T[];
  }

  private set data(newData: T[]) {
    mockStore[this.tableName] = newData;
  }

  async findMany(args?: any) {
    let result = this.data.filter(item => matchFilter(item, args?.where));
    result = sortItems(result, args?.orderBy);
    
    // Pagination
    if (args?.skip) {
      result = result.slice(args.skip);
    }
    if (args?.take) {
      result = result.slice(0, args.take);
    }

    return result.map(item => populateRelations(item, this.tableName));
  }

  async findFirst(args?: any) {
    const result = this.data.find(item => matchFilter(item, args?.where));
    return populateRelations(result, this.tableName) || null;
  }

  async findUnique(args?: any) {
    return this.findFirst(args);
  }

  async count(args?: any) {
    const list = await this.findMany(args);
    return list.length;
  }

  async create(args: { data: any }) {
    const newItem = {
      id: args.data.id || generateUUID(),
      ...args.data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Flatten relational connect/create logic if present
    // Note: Simple mockup logic
    this.data.push(newItem);
    return populateRelations(newItem, this.tableName);
  }

  async createMany(args: { data: any[] }) {
    const added: any[] = [];
    const arr = Array.isArray(args.data) ? args.data : [args.data];
    for (const itemData of arr) {
      const newItem = {
        id: itemData.id || generateUUID(),
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.data.push(newItem);
      added.push(newItem);
    }
    return { count: added.length };
  }

  async update(args: { where: any, data: any }) {
    const index = this.data.findIndex(item => matchFilter(item, args.where));
    if (index === -1) {
      throw new Error(`Record not found for update in ${String(this.tableName)}`);
    }

    const currentItem = this.data[index];
    const updateData = { ...args.data };
    
    // Handle nested operators like { increment: 1 }
    for (const key of Object.keys(updateData)) {
      const val = updateData[key];
      if (val && typeof val === 'object' && 'increment' in val) {
        updateData[key] = (currentItem as any)[key] + val.increment;
      }
    }

    const updatedItem = {
      ...currentItem,
      ...updateData,
      updatedAt: new Date()
    };

    this.data[index] = updatedItem;
    return populateRelations(updatedItem, this.tableName);
  }

  async updateMany(args: { where: any, data: any }) {
    let count = 0;
    this.data = this.data.map(item => {
      if (matchFilter(item, args.where)) {
        count++;
        return {
          ...item,
          ...args.data,
          updatedAt: new Date()
        };
      }
      return item;
    });
    return { count };
  }

  async delete(args: { where: any }) {
    const index = this.data.findIndex(item => matchFilter(item, args.where));
    if (index === -1) {
      throw new Error(`Record not found for delete in ${String(this.tableName)}`);
    }
    const deleted = this.data[index];
    this.data.splice(index, 1);
    return populateRelations(deleted, this.tableName);
  }

  async deleteMany(args?: { where: any }) {
    const initialLen = this.data.length;
    this.data = this.data.filter(item => !matchFilter(item, args?.where));
    return { count: initialLen - this.data.length };
  }

  async upsert(args: { where: any, update: any, create: any }) {
    try {
      const existing = await this.findFirst({ where: args.where });
      if (existing) {
        return await this.update({ where: args.where, data: args.update });
      }
    } catch (e) {}
    return await this.create({ data: args.create });
  }
}

// Instantiate Mock Prisma Client
class MockPrismaClient {
  user = new MockTableService('user');
  event = new MockTableService('event');
  meeting = new MockTableService('meeting');
  oTPCode = new MockTableService('oTPCode');
  calendarAccount = new MockTableService('calendarAccount');
  activityLog = new MockTableService('activityLog');
  notification = new MockTableService('notification');

  $connect() {
    return Promise.resolve();
  }

  $disconnect() {
    return Promise.resolve();
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    (globalForPrisma.prisma ||
    new MockPrismaClient()) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

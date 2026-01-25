import { ASSET_BASE } from "./paths";

export const PAGES = {
  // ===== PUBLIC =====
  landing: `${ASSET_BASE}/pages/user/landing_page.html`,
  login: `${ASSET_BASE}/pages/user/login.html`,
  register: `${ASSET_BASE}/pages/user/register.html`,

  // ===== ADMIN =====
  adminProfile: `${ASSET_BASE}/pages/admin/adminProfile.html`,
  adminDashboard: `${ASSET_BASE}/pages/admin/dashboard.html`,
  adminEvents: `${ASSET_BASE}/pages/admin/event.html`,
  adminUsers: `${ASSET_BASE}/pages/admin/users.html`,
  adminAttendance: `${ASSET_BASE}/pages/admin/attendance.html`,
  adminEventSchedules: `${ASSET_BASE}/pages/admin/event_schedules.html`,

  // ===== USER =====
  userDashboard: `${ASSET_BASE}/pages/user/dashboard.html`,
  userProfile: `${ASSET_BASE}/pages/user/userProfile.html`,
  userAbout: `${ASSET_BASE}/pages/user/about_us.html`,
  userEvent: `${ASSET_BASE}/pages/user/event_page.html`,
  userMinistries: `${ASSET_BASE}/pages/user/ministries.html`,
  userWorship: `${ASSET_BASE}/pages/user/worship_schedule.html`,
  userScan: `${ASSET_BASE}/pages/user/scan.html`,
};

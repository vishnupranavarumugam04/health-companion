import { UserProfile, NotificationItem, HealthLogDay } from "@/types/health";

const STORAGE_KEYS = {
  USER_PROFILE: "sih_health_user_profile",
  NOTIFICATIONS: "sih_health_notifications",
  THEME: "sih_health_theme",
  HEALTH_LOGS: "sih_health_logs",
};

export const unauthenticatedProfile: UserProfile = {
  name: "",
  email: "",
  age: 0,
  gender: "Male",
  heightCm: 170,
  weightKg: 65,
  bloodGroup: "O+",
  emergencyContactName: "",
  emergencyContactPhone: "",
  knownConditions: "None",
  isLoggedIn: false,
};

export const getStoredProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveStoredProfile = (profile: UserProfile): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

export const getStoredTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme === "light" ? "light" : "dark";
  } catch (e) {
    return "dark";
  }
};

export const saveStoredTheme = (theme: "dark" | "light"): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error("Failed to save theme", e);
  }
};

// No fake pre-populated notifications
export const initialNotifications: NotificationItem[] = [];

export const getStoredNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") return initialNotifications;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : initialNotifications;
  } catch (e) {
    return initialNotifications;
  }
};

export const saveStoredNotifications = (items: NotificationItem[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save notifications", e);
  }
};

// No fake pre-populated health logs
export const initialHealthLogs: HealthLogDay[] = [];

export const getStoredHealthLogs = (): HealthLogDay[] => {
  if (typeof window === "undefined") return initialHealthLogs;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH_LOGS);
    return data ? JSON.parse(data) : initialHealthLogs;
  } catch (e) {
    return initialHealthLogs;
  }
};

export const saveStoredHealthLogs = (logs: HealthLogDay[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save health logs", e);
  }
};

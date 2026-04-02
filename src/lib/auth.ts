// Simple auth store (UI-only, no real backend)
const AUTH_KEY = 'saas_auth';

export interface User {
  name: string;
  email: string;
  isActive: boolean;
}

export function getUser(): User | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function loginUser(user: User) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  const user = getUser();
  return !!user && user.isActive;
}

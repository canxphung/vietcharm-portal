import { Injectable, computed } from '@angular/core';
import { DEFAULT_USERS } from '@/constants/seed/users';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { UserAccount } from '@/types';
import { storedSignal } from './storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly users = storedSignal<UserAccount[]>(STORAGE_KEYS.users, DEFAULT_USERS);
  readonly currentUser = storedSignal<UserAccount | null>(STORAGE_KEYS.currentUser, null, { removeOnFalsy: true });
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  login(user: UserAccount): void {
    this.currentUser.set(user);
  }

  loginByCredentials(identifier: string, password: string): boolean {
    const normalized = identifier.trim().toLowerCase();
    const user = this.users().find((candidate) => {
      const matchesIdentifier =
        candidate.email.toLowerCase() === normalized || candidate.username.toLowerCase() === normalized;
      const matchesPassword = (candidate.password ?? 'demo123') === password;
      return matchesIdentifier && matchesPassword;
    });
    if (!user) return false;
    this.login(user);
    return true;
  }

  register(user: UserAccount): void {
    this.users.update((users) => [user, ...users]);
    this.currentUser.set(user);
  }

  logout(): void {
    this.currentUser.set(null);
  }

  updateProfile(user: UserAccount): void {
    this.currentUser.set(user);
    this.users.update((users) => users.map((item) => (item.id === user.id ? user : item)));
  }

  updatePasswordByEmail(email: string, password: string): boolean {
    const normalized = email.trim().toLowerCase();
    const exists = this.users().some((user) => user.email.toLowerCase() === normalized);
    if (!exists) return false;

    this.users.update((users) =>
      users.map((user) => (user.email.toLowerCase() === normalized ? { ...user, password } : user)),
    );
    const current = this.currentUser();
    if (current?.email.toLowerCase() === normalized) {
      this.currentUser.set({ ...current, password });
    }
    return true;
  }

  setUserRole(userId: string, role: UserAccount['role']): void {
    this.users.update((users) => users.map((user) => (user.id === userId ? { ...user, role } : user)));
    const current = this.currentUser();
    if (current?.id === userId) this.currentUser.set({ ...current, role });
  }
}

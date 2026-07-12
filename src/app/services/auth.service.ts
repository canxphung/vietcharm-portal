import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { UserAccount } from '@/types';
import { storedSignal } from './storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly usersRes = httpResource<UserAccount[]>(() => '/api/users', { defaultValue: [] });
  readonly users = computed(() => this.usersRes.value());

  /** Who is signed in on this browser. Session-only, so it stays in localStorage rather than Mongo. */
  readonly currentUser = storedSignal<UserAccount | null>(STORAGE_KEYS.currentUser, null, { removeOnFalsy: true });
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  login(user: UserAccount): void {
    this.currentUser.set(user);
  }

  async loginByCredentials(identifier: string, password: string): Promise<boolean> {
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

  async register(user: UserAccount): Promise<void> {
    const { id, ...rest } = user;
    await firstValueFrom(this.http.post('/api/users', { id, ...rest }));
    this.usersRes.reload();
    this.currentUser.set(user);
  }

  logout(): void {
    this.currentUser.set(null);
  }

  async updateProfile(user: UserAccount): Promise<void> {
    this.currentUser.set(user);
    const { id, ...rest } = user;
    await firstValueFrom(this.http.patch(`/api/users/${id}`, rest));
    this.usersRes.reload();
  }

  async updatePasswordByEmail(email: string, password: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const target = this.users().find((user) => user.email.toLowerCase() === normalized);
    if (!target) return false;

    await firstValueFrom(this.http.patch(`/api/users/${target.id}`, { password }));
    this.usersRes.reload();
    const current = this.currentUser();
    if (current?.email.toLowerCase() === normalized) {
      this.currentUser.set({ ...current, password });
    }
    return true;
  }

  async setUserRole(userId: string, role: UserAccount['role']): Promise<void> {
    await firstValueFrom(this.http.patch(`/api/users/${userId}`, { role }));
    this.usersRes.reload();
    const current = this.currentUser();
    if (current?.id === userId) this.currentUser.set({ ...current, role });
  }
}

import { Injectable } from '@angular/core';
import { User } from '../dto/user-dto';
import { UserService } from './user.service';
import { BehaviorSubject, catchError, Observable, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<number | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();
  user$ = this.userSubject.asObservable();

  constructor(private userService: UserService) {}

  updateAuthStatus(user: User | null) {
    if (user) {
      this.isLoggedInSubject.next(true);
      this.userRoleSubject.next(user.userRole_id ?? null);
      this.userSubject.next(user);
    } else {
      this.isLoggedInSubject.next(false);
      this.userRoleSubject.next(null);
      this.userSubject.next(null);
    }
  }

  checkLoginStatus() {
    this.userService.getUser().subscribe({
      next: (user) => this.updateAuthStatus(user),
      error: () => this.updateAuthStatus(null),
    });
  }

  login(email: string, password: string): Observable<User> {
    return this.userService.login({ email, password }).pipe(
      switchMap(() => this.userService.getUser()),
      tap((user) => this.updateAuthStatus(user)),
      catchError((err) => {
        this.updateAuthStatus(null);
        throw err;
      })
    );
  }

  logout() {
    this.userService.logout().subscribe(() => {
      this.updateAuthStatus(null);
    });
  }
}

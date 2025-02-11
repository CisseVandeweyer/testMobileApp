import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../dto/user-dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.baseUrl; // Backend URL

  constructor(private http: HttpClient) {}

  /**
   * Login een gebruiker met e-mail en wachtwoord.
   * @param credentials Object met `email` en `password`.
   * @returns Observable met de serverrespons.
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, {
      withCredentials: true,
    });
  }

  /**
   * Haal de gegevens van de ingelogde gebruiker op.
   * @returns Observable met de gebruikersgegevens.
   */
  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`, {
      withCredentials: true,
    });
  }

  /**
   * Logout de gebruiker.
   * @returns Observable met de logout-respons.
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Haal een specifieke gebruiker op met zijn ID.
   * @param userId De ID van de gebruiker.
   * @returns Observable met de gebruikersgegevens.
   */
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/`);
  }

  /**
   * Haal gebruikers op met specifieke rol-IDs.
   * @param roleIds Array van rol-IDs.
   * @returns Observable met gebruikers die aan de rollen voldoen.
   */
  getUsersByRoleIds(roleIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/roles/`, roleIds);
  }

  getUsersByAccessToUserField(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user/access-field/`, {
      params: { userId: userId.toString() },
    });
  }
}

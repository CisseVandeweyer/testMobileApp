import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../dto/user-dto';
import { userRole } from '../dto/userRole-dto';
@Injectable({
  providedIn: 'root',
})
export class UserRoleService {
  private apiUrl = environment.baseUrl; // Backend UR

  constructor(private http: HttpClient) {}

  getUserRole(userid: number): Observable<userRole> {
    return this.http.get<userRole>(`${this.apiUrl}/userrole/${userid}/`, {
      withCredentials: true,
    });
  }
}

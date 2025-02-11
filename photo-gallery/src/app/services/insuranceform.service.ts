import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InsuranceFormResponseDto } from '../dto/InsuranceFormResponseDto';

@Injectable({
  providedIn: 'root',
})
export class InsuranceFormService {
  private apiUrl = `${environment.baseUrl}/insurance-claims`;

  constructor(private http: HttpClient) {}

  getInsuranceformByClaimId(claimId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/id/${claimId}/`, {
      withCredentials: true,
    });
  }

  getInsuranceformByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`, {
      withCredentials: true,
    });
  }

  postInsuranceformById(
    userId: number | undefined,
    formdata: object
  ): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/${userId}`, formdata, {
      withCredentials: true,
    });
  }

  putInsuranceform(
    formId: number | undefined,
    formdata: object
  ): Observable<any[]> {
    return this.http.put<any[]>(`${this.apiUrl}/edit/${formId}`, formdata, {
      withCredentials: true,
    });
  }
  getInsuranceclaimsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  putInsuranceformById(
    insuranceformId: number,
    formdata: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/edit/${insuranceformId}`,
      formdata
    );
  }

  getInsuranceformsByUserIdByAccessToUserField(
    loggedInUserId: number,
    targetUserId: number
  ): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(
      `${this.apiUrl}/access-field/userId/${targetUserId}`,
      {
        params: {
          loggedInUserId: loggedInUserId.toString(),
        },
      }
    );
  }
}

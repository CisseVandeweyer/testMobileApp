import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class RequestedImageService {

  constructor(private httpClient: HttpClient) {
  }



  // postImage(formdata: File): Observable<RequestedImageResponseDto[]> {
  //   return this.httpClient.post<RequestedImageResponseDto[]>(`http://localhost:8000/api/images/`, formdata, { withCredentials: true });
  // }

  getImages(insuranceId:number | undefined): Observable<any[]> {
    return this.httpClient.get<any[]>(`http://192.168.0.223:8000/api/requestedimages/${insuranceId}/`, { withCredentials: true });
  }
}


import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  constructor(
    private platform: Platform,
    private http: HttpClient
  ) { }


  public async addNewPhoto(): Promise<UserPhoto | null> {
    // Request permissions
    const locationPermission = await this.requestPermission('location');
    const cameraPermission = await this.requestPermission('camera');

    if (!locationPermission || !cameraPermission) {
      return null;
    }

    // Get location
    const position = await Geolocation.getCurrentPosition();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Take photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    // Save photo locally
    const savedImage = await this.savePicture(capturedPhoto, latitude, longitude);
    return savedImage;
  }


  public async uploadPhotos(photos: UserPhoto[]): Promise<void> {
    const headers = new HttpHeaders();
    const promises = photos.map(async (photo) => {
      const response = await fetch(photo.webviewPath!);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, photo.filepath.split('/').pop()!);
      formData.append('insuranceform', '146');
      formData.append('filename', photo.filepath.split('/').pop()!);
      formData.append('xCord', photo.latitude?.toString() || '');
      formData.append('yCord', photo.longitude?.toString() || '');
      formData.append('date', new Date().toISOString().split('T')[0]);

      return this.http.post(`${environment.baseUrl}/images/`, formData, { headers }).toPromise();
    });

    await Promise.all(promises); // Wait for all uploads to complete
    console.log('All photos uploaded successfully');
  }



  public async addNewToGallery() {
    // Vraag toestemmingen
    const locationPermission = await this.requestPermission('location');
    const cameraPermission = await this.requestPermission('camera');

    if (!locationPermission || !cameraPermission) {
      return;
    }

    // Vraag om locatie-informatie
    const position = await Geolocation.getCurrentPosition();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Neem een foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    // Bewaar de foto lokaal
    const savedImageFile = await this.savePicture(capturedPhoto, latitude, longitude);

    // Stuur de foto naar de API
    await this.uploadPhoto(savedImageFile, latitude, longitude);
  }


  private async uploadPhoto(photo: UserPhoto, latitude: number, longitude: number) {
    // Haal de afbeelding op als Blob
    const response = await fetch(photo.webviewPath!);
    const blob = await response.blob();

    // Maak FormData aan en voeg de foto en andere gegevens toe
    const formData = new FormData();
    formData.append('image', blob, photo.filepath.split('/').pop()!);
    formData.append('insuranceform', '146'); // Vervang '20' met de juiste insuranceId
    formData.append('filename', photo.filepath.split('/').pop()!);
    formData.append('xCord', latitude.toString());
    formData.append('yCord', longitude.toString());
    formData.append('date', new Date().toISOString().split('T')[0]);

    const headers = new HttpHeaders();

    this.http.post(`${environment.baseUrl}/images/`, formData, { headers }).subscribe(
      (response) => {
        console.log('Foto succesvol geüpload:', response);
      },
      (error) => {
        console.error('Fout bij het uploaden van de foto:', error);
      }
    );
  }

  private async savePicture(photo: Photo, latitude: number, longitude: number): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    const fileName = Date.now() + '.jpeg';

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        latitude,
        longitude
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
        latitude,
        longitude
      };
    }
  }

  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  //permission
  private async requestPermission(permission: 'location' | 'camera'): Promise<boolean> {
    try {
      if (permission === 'location') {
        const status = await Geolocation.checkPermissions();
        if (status.location === 'granted') {
          return true;
        }

        const result = await Geolocation.requestPermissions();
        if (result.location !== 'granted') {
          const alert = document.createElement('ion-alert');
          alert.header = 'Locatieservices uitgeschakeld';
          alert.message = 'Schakel locatieservices in om door te gaan.';
          alert.buttons = ['OK'];

          document.body.appendChild(alert);
          await alert.present();
          return false;
        }

        return true;
      }

      if (permission === 'camera') {
        const status = await Camera.checkPermissions();
        if (status.camera === 'granted') {
          return true;
        }

        const result = await Camera.requestPermissions();
        if (result.camera !== 'granted') {
          const alert = document.createElement('ion-alert');
          alert.header = 'Camera toegang geweigerd';
          alert.message = 'Sta toegang tot de camera toe om door te gaan.';
          alert.buttons = ['OK'];

          document.body.appendChild(alert);
          await alert.present();
          return false;
        }

        return true;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Location services are not enabled')) {
        const alert = document.createElement('ion-alert');
        alert.header = 'Locatieservices uitgeschakeld';
        alert.message = 'Schakel locatieservices in via de instellingen van uw apparaat.';
        alert.buttons = ['OK'];

        document.body.appendChild(alert);
        await alert.present();
      } else {
        console.error('Onbekende fout bij het aanvragen van permissies:', error);
      }
      return false;
    }

    return false;
  }

  public updateRequestedImage(id: number, updateData: Partial<{ fulfilled: boolean }>): Observable<any> {
    const url = `${environment.baseUrl}/requestedimages/edit/${id}/`;
    return this.http.put(url, updateData);
  }

}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  latitude?: number;
  longitude?: number;
}
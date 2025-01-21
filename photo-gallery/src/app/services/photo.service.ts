import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  constructor(
    private platform: Platform,
    private http: HttpClient
  ) {}

  public async addNewToGallery() {
    // Vraag toestemmingen
    const locationPermission = await this.requestPermission('location');
    const cameraPermission = await this.requestPermission('camera');

    if (!locationPermission) {
      alert('Locatieservices zijn uitgeschakeld. Schakel locatieservices in om door te gaan.');
      return;
    }

    if (!cameraPermission) {
      console.error('Cameratoegang geweigerd.');
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

  private async requestPermission(permission: 'location' | 'camera'): Promise<boolean> {
    if (permission === 'location') {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'granted') {
        return true;
      }
      const result = await Geolocation.requestPermissions();
      return result.location === 'granted';
    }

    if (permission === 'camera') {
      const status = await Camera.checkPermissions();
      if (status.camera === 'granted') {
        return true;
      }
      const result = await Camera.requestPermissions();
      return result.camera === 'granted';
    }

    return false;
  }

  private async uploadPhoto(photo: UserPhoto, latitude: number, longitude: number) {
    // Haal de afbeelding op als Blob
    const response = await fetch(photo.webviewPath!);
    const blob = await response.blob();

    // Maak FormData aan en voeg de foto en andere gegevens toe
    const formData = new FormData();
    formData.append('image', blob, photo.filepath.split('/').pop()!);
    formData.append('insuranceform', '20'); // Vervang '20' met de juiste insuranceId
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

  private async savePicture(photo: Photo, latitude: number, longitude: number) {
    // Converteer foto naar base64 formaat
    const base64Data = await this.readAsBase64(photo);

    // Schrijf bestand naar de gegevensmap
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
        latitude: latitude,
        longitude: longitude
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
        latitude: latitude,
        longitude: longitude
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
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  latitude?: number;
  longitude?: number;
}

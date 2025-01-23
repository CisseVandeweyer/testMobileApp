import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { RequestedImageService } from '../services/requestedImage.service';
import { Geolocation } from '@capacitor/geolocation';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@awesome-cordova-plugins/device-orientation/ngx';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
  providers: [DeviceOrientation], // Add DeviceOrientation service
})
export class Tab2Page implements OnInit, OnDestroy {
  requestedImages: any[] = [];
  capturedImages: UserPhoto[] = []; // Store captured images
  currentRequestedImage: any; // Current requested image details
  insuranceId: number = 0; // Store the dynamic insuranceId


  angle: number = 0; // Calculated arrow angle
  magneticHeading: number | null = null; // Magnetic heading from the compass

  userLocation: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
  targetLocation: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 }; // Dynamically set target location


  private watchId: string | null = null;
  deviceHeading: number = 0;

  constructor(
    public photoService: PhotoService,
    private requestedImageService: RequestedImageService,
    private changeDetectorRef: ChangeDetectorRef,
    private deviceOrientation: DeviceOrientation, // Inject DeviceOrientation service
    private route: ActivatedRoute // Inject ActivatedRoute to access query parameters

  ) {}

  ngOnInit(): void {
    // Retrieve the insuranceId from query params
    this.route.queryParams.subscribe((params) => {
        // Check if 'insuranceId' is there
      if (params['insuranceId']) {
        this.insuranceId = Number(params['insuranceId']);;
        this.fetchRequestedImages(this.insuranceId);
        console.log('banaan', this.fetchRequestedImages);
      }
    });

    this.trackUserLocation();
    this.startOrientationTracking();
  }
  ngOnDestroy(): void {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }

  fetchRequestedImages(insuranceId: number): void {
    this.requestedImageService.getImages(insuranceId).subscribe(
      (images: any) => {
        this.requestedImages = images.filter((image: { fulfilled: any }) => !image.fulfilled);
        if (this.requestedImages.length > 0) {
          this.setTargetLocation(0); // Set the first image as the target when available
        }
      },
      (error: any) => {
        console.error('Error fetching images:', error);
      }
    );
  }

  setTargetLocation(imageIndex: number): void {
    const image = this.requestedImages[imageIndex];
    if (image) {
      this.targetLocation = {
        latitude: image.xCord || 0,
        longitude: image.yCord || 0,
      };
      this.currentRequestedImage = image; // Set the current image details
      this.updateArrowDirection(); // Update arrow direction immediately
    }
  }

  async addPhotoToGallery(): Promise<void> {
    const newPhoto = await this.photoService.addNewPhoto();
    if (newPhoto) {
      this.capturedImages.push(newPhoto);

      // Update target location for the next requested image if available
      if (this.capturedImages.length < this.requestedImages.length) {
        this.setTargetLocation(this.capturedImages.length);
      }
    }
  }

  removeImage(index: number): void {
    const confirmDelete = confirm('Weet je zeker dat je deze foto wilt verwijderen?');
    if (confirmDelete) {
      this.capturedImages.splice(index, 1);

      // Update target location for the next requested image if available
      if (this.capturedImages.length < this.requestedImages.length) {
        this.setTargetLocation(this.capturedImages.length);
      }
    }
  }

  uploadCapturedImages(): void {
    if (this.capturedImages.length > 0) {
      this.photoService.uploadPhotos(this.capturedImages).then(() => {
        this.updateRequestedImagesFulfilled();
        this.capturedImages = [];
        this.refreshRequestedImages();
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  refreshRequestedImages(): void {
    const insuranceId = 146;
    this.fetchRequestedImages(insuranceId);
  }

  updateRequestedImagesFulfilled(): void {
    this.capturedImages.forEach((capturedImage, index) => {
      const requestedImage = this.requestedImages[index];
      if (requestedImage) {
        this.photoService.updateRequestedImage(requestedImage.id, { fulfilled: true }).subscribe(
          () => {
            console.log(`RequestedImage ${requestedImage.id} updated successfully.`);
          },
          (error) => {
            console.error(`Error updating RequestedImage ${requestedImage.id}:`, error);
          }
        );
      }
    });
  }

  async trackUserLocation(): Promise<void> {
    try {
      const hasPermission = await Geolocation.checkPermissions();
      if (hasPermission.location !== 'granted') {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') {
          console.error('Location permission not granted.');
          return;
        }
      }

      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position, err) => {
          if (err) {
            console.error('Error watching position:', err);
            return;
          }

          if (position) {
            this.userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            this.updateArrowDirection();
          }
        }
      );
    } catch (error) {
      console.error('Error tracking user location:', error);
    }
  }

  startOrientationTracking(): void {
    // Use both deviceorientation (for compass heading) and DeviceOrientation plugin
    this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => {
        this.magneticHeading = data.magneticHeading;
        this.deviceHeading = data.magneticHeading; // Sync with device heading
        this.updateArrowDirection();
      },
      (error) => {
        console.error('Error getting device heading:', error);
      }
    );

    window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
  }

  handleOrientation(event: DeviceOrientationEvent): void {
    if (event.alpha !== null) {
      this.deviceHeading = event.alpha;
      this.updateArrowDirection();
    }
  }

  updateArrowDirection(): void {
    const bearing = this.calculateBearing(this.userLocation, this.targetLocation);
    this.angle = (bearing - this.deviceHeading + 360) % 360;
    this.changeDetectorRef.detectChanges();
  }

  calculateBearing(start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }): number {
    const startLat = this.degreesToRadians(start.latitude);
    const startLng = this.degreesToRadians(start.longitude);
    const endLat = this.degreesToRadians(end.latitude);
    const endLng = this.degreesToRadians(end.longitude);

    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

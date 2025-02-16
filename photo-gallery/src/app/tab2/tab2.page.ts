import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { RequestedImageService } from '../services/requestedImage.service';
import { Geolocation } from '@capacitor/geolocation';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@awesome-cordova-plugins/device-orientation/ngx';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { Router } from '@angular/router';

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


  private userMarker: L.Marker | null = null; // Store the user marker instance


  private marker: L.Marker | null = null; // To store the marker instance
  markerx: number = 0;
  markery: number = 0;


  private watchId: string | null = null;
  deviceHeading: number = 0;

  private map: L.Map | null = null;

  private distanceInterval: any; // Interval for updating distance every second

  constructor(
    public photoService: PhotoService,
    private requestedImageService: RequestedImageService,
    private changeDetectorRef: ChangeDetectorRef,
    private deviceOrientation: DeviceOrientation, // Inject DeviceOrientation service
    private route: ActivatedRoute, // Inject ActivatedRoute to access query parameters
    private router: Router // Inject the Router service

  ) { }

  ngOnInit(): void {
    // Retrieve the insuranceId from query params
    this.route.queryParams.subscribe((params) => {
      // Check if 'insuranceId' is there
      if (params['insuranceId']) {
        this.insuranceId = Number(params['insuranceId']);
        this.fetchRequestedImages(this.insuranceId);
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
    // Clear the interval to stop updating the distance
    if (this.distanceInterval) {
      clearInterval(this.distanceInterval);
    }
  }

  startDistanceUpdate(): void {
    // Update the distance every second (1000ms)
    this.distanceInterval = setInterval(() => {
      if (this.userLocation && this.targetLocation) {
        this.updateArrowDirection(); // This will update the angle and the distance
      }
    }, 1000); // 1 second interval
  }



  fetchRequestedImages(insuranceId: number): void {
    this.requestedImageService.getImages(insuranceId).subscribe(
      (images: any) => {
        this.requestedImages = images.filter((image: { fulfilled: boolean }) => !image.fulfilled);
        if (this.requestedImages.length > 0) {
          this.setTargetLocation(0); // Set the first image as the target
          this.initializeMap(); // Initialize the map when images are available
        }
      },
      (error: any) => {
        console.error('Error fetching images:', error);
      }
    );
  }


  private initializeMap(): void {
    if (this.requestedImages.length > 0) {
      this.map = L.map('map', {
        center: [this.userLocation.latitude || 0, this.userLocation.longitude || 0],
        zoom: 16, // Closer zoom level
        zoomControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(this.map);

      this.updateMarker();
      this.updateUserMarker(); // Add user marker

      // Force Leaflet to recalculate the map's size
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 0);
    }
  }

  private updateMarker(): void {
    // Define a custom icon
    const customIcon = L.icon({
      iconUrl: 'assets/marker.png', // Path to your custom marker icon
      iconSize: [40, 40], // Size of the icon
      iconAnchor: [20, 40], // Anchor point of the icon (bottom center)
      popupAnchor: [0, -40], // Anchor point for the popup
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', // Optional shadow image
      shadowSize: [60, 38], // Size of the shadow
    });

    // Remove existing marker if present
    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }

    // Check if the map is initialized before adding the marker
    if (this.map) {
      // Add a new marker at the current coordinates
      this.marker = L.marker([this.markerx || 0, this.markery || 0], { icon: customIcon }).addTo(this.map);

      // Add a popup to the marker
      this.marker.bindPopup(`Maak hier een foto`).openPopup();

      // Re-center the map on the marker
      this.map.setView([this.markerx || 0, this.markery || 0], this.map.getZoom());
    }
  }

  setTargetLocation(imageIndex: number): void {
    const image = this.requestedImages[imageIndex];
    if (image) {
      this.targetLocation = {
        latitude: image.xCord || 0,
        longitude: image.yCord || 0,
      };

      this.markerx = image.xCord || 0;
      this.markery = image.yCord || 0;


      this.updateMarker();
      this.currentRequestedImage = image;
      this.updateArrowDirection();
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
      this.photoService.uploadPhotos(this.capturedImages, this.insuranceId).then(() => {
        this.updateRequestedImagesFulfilled(); // Update the fulfilled status of requested images
        this.capturedImages = [];
        this.refreshRequestedImages();
        this.changeDetectorRef.detectChanges();

        this.router.navigate(['/tab3']);

      });
    }
  }

  refreshRequestedImages(): void {
    const insuranceId = this.insuranceId;
    this.fetchRequestedImages(insuranceId);
  }

  // Mark images as fulfilled in the database after upload
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
            this.updateUserMarker(); // Update user marker on the map
          }
        }
      );
  
      this.startDistanceUpdate(); // Ensure continuous distance update
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

  private updateUserMarker(): void {
    // Define a custom icon for the user
    const userIcon = L.icon({
      iconUrl: 'assets/user-marker.png', // Path to user icon image
      iconSize: [40, 40], // Adjust size as needed
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    if (this.userMarker) {
      this.userMarker.setLatLng([this.userLocation.latitude, this.userLocation.longitude]);
    } else {
      this.userMarker = L.marker([this.userLocation.latitude, this.userLocation.longitude], { icon: userIcon }).addTo(this.map!);
      this.userMarker.bindPopup('Jouw locatie');
    }
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

  navigateToTab3(): void {
    this.router.navigate(['/tabs/tab3/']);

  }
}

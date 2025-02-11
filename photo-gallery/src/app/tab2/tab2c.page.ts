import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,

})
export class Tab2Page implements AfterViewInit {
  private map: L.Map | null = null;

  constructor() { }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    this.map = L.map('map', {
      center: [50.8503, 4.3517], // Brussels coordinates
      zoom: 18, // Closer zoom level
      zoomControl: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(this.map);

    // Define a custom icon
    const customIcon = L.icon({
      iconUrl: 'assets/marker.png', // Path to your custom marker icon
      iconSize: [40, 40], // Size of the icon
      iconAnchor: [22, 35], // Anchor point of the icon (bottom center)
      popupAnchor: [-50, -50], // Anchor point for the popup
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', // Optional shadow image
      shadowSize: [60, 38], // Size of the shadow
    });

    // Add a marker
    L.marker([51.202712, 4.959415 ], { icon: customIcon })
      .addTo(this.map)
      .bindPopup('Brussels')
      .openPopup();

    // Force Leaflet to recalculate the map's size
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);
  }

}

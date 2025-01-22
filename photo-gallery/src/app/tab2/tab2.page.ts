import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  constructor(public photoService: PhotoService) {
    // Example: Calculate angle to target (300, 300) from center of screen
    const startPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const targetPoint = { x: 300, y: 300 };

    this.angle = this.calculateAngle(startPoint, targetPoint);

  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  angle: number = 0;



  calculateAngle(start: { x: number; y: number }, end: { x: number; y: number }): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.atan2(dy, dx) * (180 / Math.PI); // Convert radians to degrees
  }

}



import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@awesome-cordova-plugins/device-orientation/ngx';
import { IonicModule } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { InsuranceFormService } from '../services/insuranceform.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true, // Set to true to make it a standalone component
  imports: [CommonModule, IonicModule, ],
  providers: [DeviceOrientation], // Add this line to provide the service


})
export class Tab3Page {

  user: any = null; // Om de ingelogde gebruiker op te slaan
  insuranceForms: any[] = []; // Array to hold insurance forms

  ionViewWillEnter(): void {
    // Triggered whenever the tab becomes active
    this.getUser();
  }
  constructor(    
    private userService: UserService,
      private insuranceFormService: InsuranceFormService, // Inject the insurance form service
      private router: Router) {}

  getUser() {
    this.userService.getUser().subscribe({
      next: (response) => {
        console.log('Gebruiker opgehaald:', response);
        this.user = response;
        if (this.user) {
          this.getInsuranceForms(this.user.id); // Fetch insurance forms for the logged-in user
        }
      },
      error: (err) => {
        console.error('Gebruiker ophalen mislukt:', err);
        this.user = null; // Reset de gebruiker bij een fout
      },
    });
  }

  getInsuranceForms(userId: number) {
    this.insuranceFormService.getInsuranceformByUserId(userId).subscribe({
      next: (response: any[]) => {
        console.log('Verzekeringsformulieren opgehaald:', response);
        this.insuranceForms = response; // Store insurance forms in the component
      },
      error: (err: any) => {
        console.error('Verzekeringsformulieren ophalen mislukt:', err);
      },
    });
  }

  navigateToTab2(insuranceId: number): void {
    this.router.navigate(['/tabs/tab2/${insuranceId}'], { queryParams: { insuranceId: insuranceId } });

  }
}

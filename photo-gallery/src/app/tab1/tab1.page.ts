import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; // Zorg dat dit pad klopt
import { Router } from '@angular/router'; // Voor navigatie na login of logout
import { InsuranceFormService } from '../services/insuranceform.service';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  email: string = '';
  password: string = '';
  user: any = null; // Om de ingelogde gebruiker op te slaan
  error: string = ''; // Voor foutmeldingen
  insuranceForms: any[] = []; // Array to hold insurance forms

  constructor(
    private userService: UserService,
    private insuranceFormService: InsuranceFormService, // Inject the insurance form service
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUser(); // Haal de ingelogde gebruiker op bij het laden van de pagina
  }

  login() {
    if (this.email && this.password) {
      this.userService.login({ email: this.email, password: this.password }).subscribe({
        next: (response) => {
          console.log('Login succesvol:', response);
          this.getUser(); // Update de gebruiker na succesvolle login
          this.error = '';
        },
        error: (err) => {
          console.error('Login fout:', err);
          this.error = 'Inloggen mislukt. Controleer je gegevens.';
        },
      });
    } else {
      this.error = 'Voer je e-mail en wachtwoord in.';
    }
  }

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

  logout() {
    this.userService.logout().subscribe({
      next: () => {
        console.log('Uitgelogd');
        this.user = null; // Verwijder de ingelogde gebruiker
        this.insuranceForms = []; // Clear insurance forms
        this.router.navigate(['/']); // Navigeer naar de homepagina of een andere pagina
      },
      error: (err) => {
        console.error('Uitloggen mislukt:', err);
      },
    });
  }
}

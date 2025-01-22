import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; // Zorg dat dit pad klopt
import { Router } from '@angular/router'; // Voor navigatie na login of logout

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

  constructor(private userService: UserService, private router: Router) {}

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
      },
      error: (err) => {
        console.error('Gebruiker ophalen mislukt:', err);
        this.user = null; // Reset de gebruiker bij een fout
      },
    });
  }

  logout() {
    this.userService.logout().subscribe({
      next: () => {
        console.log('Uitgelogd');
        this.user = null; // Verwijder de ingelogde gebruiker
        this.router.navigate(['/']); // Navigeer naar de homepagina of een andere pagina
      },
      error: (err) => {
        console.error('Uitloggen mislukt:', err);
      },
    });
  }
}

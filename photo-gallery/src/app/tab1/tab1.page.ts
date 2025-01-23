import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserRoleService } from '../services/user-role.service';
import { Observable } from 'rxjs';
import { User } from '../dto/user-dto';
import { InsuranceFormService } from '../services/insuranceform.service';
@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class Tab1Page implements OnInit {
  email: string = '';
  password: string = '';
  user: User | null = null;
  error: string = '';
  userrole: string = '';
  isLoggedIn: boolean = false;
  insuranceForms: any[] = []; // Array to hold insurance forms
  constructor(
    private userService: UserService,
    private router: Router,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit(): void {
    this.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoggedIn = true;
      },
      error: (err) => {
        console.error('Gebruiker ophalen mislukt:', err);
        this.user = null;
        this.isLoggedIn = false;
      },
    });
  }

  login(): void {
    if (this.email && this.password) {
      this.userService
        .login({ email: this.email, password: this.password })
        .subscribe({
          next: () => {
            this.getUser().subscribe({
              next: (user) => {
                this.user = user;
                this.isLoggedIn = true;

                // Controleer of userroleId beschikbaar is
                if (user.userRole_id) {
                  this.userRoleService.getUserRole(user.userRole_id).subscribe({
                    next: (role) => {
                      this.userrole = role.role_name; // Update de userrole met de rol naam
                      this.error = '';
                    },
                    error: (err) => {
                      console.error('Rol ophalen mislukt:', err);
                      this.error = 'Rol ophalen mislukt.';
                    },
                  });
                } else {
                  console.error('Gebruiker heeft geen userroleId');
                  this.error = 'Gebruiker heeft geen rol.';
                }
              },
              error: (err) => {
                console.error('Gebruiker ophalen mislukt:', err);
                this.error = 'Gebruiker ophalen mislukt.';
              },
            });
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

  getUser(): Observable<any> {
    return this.userService.getUser();
  }
  // getUser() {
  //   this.userService.getUser().subscribe({
  //     next: (response) => {
  //       console.log('Gebruiker opgehaald:', response);
  //       this.user = response;
  //       if (this.user) {
  //         this.getInsuranceForms(this.user.id); // Fetch insurance forms for the logged-in user
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Gebruiker ophalen mislukt:', err);
  //       this.user = null; // Reset de gebruiker bij een fout
  //     },
  //   });
  // }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.user = null;
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Uitloggen mislukt:', err);
      },
    });
  }
}
// logout() {
//   this.userService.logout().subscribe({
//     next: () => {
//       console.log('Uitgelogd');
//       this.user = null; // Verwijder de ingelogde gebruiker
//       this.insuranceForms = []; // Clear insurance forms
//       this.router.navigate(['/']); // Navigeer naar de homepagina of een andere pagina
//     },
//     error: (err) => {
//       console.error('Uitloggen mislukt:', err);
//     },
//   });
// }

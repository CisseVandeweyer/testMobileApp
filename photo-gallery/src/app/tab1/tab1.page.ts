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
    private userRoleService: UserRoleService,
    private insuranceFormService: InsuranceFormService
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
                console.log('Ingelogd als:', user);
                this.isLoggedIn = true;

                // Controleer of userroleId beschikbaar is
                if (user.userRole_id) {
                  this.userRoleService.getUserRole(user.id).subscribe({
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

  getUser(): Observable<User> {
    return this.userService.getUser(); // Deze retourneert nu een Observable<User>
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

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.user = null;
        this.userrole = '';
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Uitloggen mislukt:', err);
      },
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { InsuranceFormService } from '../../services/insuranceform.service';
import { Observable } from 'rxjs';
import { User } from '../../dto/user-dto';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})
export class DashboardPage implements OnInit {
  userList$!: Observable<User[]>;

  constructor(
    private userService: UserService,
    private router: Router,
    private schadeclaimService: InsuranceFormService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user')!); // Haal de gebruiker op uit localStorage
    if (user && user.id) {
      // Voeg de userId toe aan de API-aanroep
      this.userList$ = this.userService.getUsersByAccessToUserField(user.id);
    } else {
      console.error('User not found in localStorage');
    }
  }

  bekijkSchadeclaim(userId: number) {
    this.router.navigate(['/tabs/verzekeraar/schadeclaims-user'], {
      queryParams: { userId: userId },
    });
  }
}

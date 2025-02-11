import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth-service.service';
import { combineLatest, Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core'; // Importeren van ChangeDetectorRef
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class TabsPage implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isConsultant: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private authservice: AuthService,
    private cdRef: ChangeDetectorRef // Voeg ChangeDetectorRef toe
  ) {}

  ngOnInit() {
    this.subscription = combineLatest([
      this.authservice.isLoggedIn$,
      this.authservice.userRole$,
    ]).subscribe(([isLoggedIn, userRole]) => {
      this.isLoggedIn = isLoggedIn;
      this.isConsultant = userRole === 2;

      // Dwing Angular om de view bij te werken
      this.cdRef.detectChanges();

      console.log('isLoggedIn:', this.isLoggedIn);
    });
  }

  public setIsConsultant(value: boolean) {
    this.isConsultant = value;
    this.cdRef.detectChanges(); // Dwing Angular om de view bij te werken
    console.log('isConsultant:', this.isConsultant);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

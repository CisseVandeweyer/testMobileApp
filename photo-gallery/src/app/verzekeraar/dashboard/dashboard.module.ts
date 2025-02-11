import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // Voeg dit toe!
import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // Zorg dat dit is toegevoegd
    DashboardPageRoutingModule,
    DashboardPage,
  ],
  declarations: [],
})
export class DashboardPageModule {}

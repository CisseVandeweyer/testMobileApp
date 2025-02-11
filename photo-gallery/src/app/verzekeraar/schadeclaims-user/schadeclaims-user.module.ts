import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchadeclaimsUserPageRoutingModule } from './schadeclaims-user-routing.module';

import { SchadeclaimsUserPage } from './schadeclaims-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchadeclaimsUserPageRoutingModule,
    SchadeclaimsUserPage,
  ],
  declarations: [],
})
export class SchadeclaimsUserPageModule {}

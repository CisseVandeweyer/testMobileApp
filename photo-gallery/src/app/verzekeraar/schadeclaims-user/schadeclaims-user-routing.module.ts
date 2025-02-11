import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SchadeclaimsUserPage } from './schadeclaims-user.page';

const routes: Routes = [
  {
    path: '',
    component: SchadeclaimsUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchadeclaimsUserPageRoutingModule {}

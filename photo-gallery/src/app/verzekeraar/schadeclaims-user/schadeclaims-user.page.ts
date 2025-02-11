import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InsuranceFormService } from '../../services/insuranceform.service';
import { Observable } from 'rxjs';
import { InsuranceFormResponseDto } from '../../dto/InsuranceFormResponseDto';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-schadeclaims-user',
  templateUrl: './schadeclaims-user.page.html',
  styleUrls: ['./schadeclaims-user.page.scss'],
  imports: [CommonModule, IonicModule],
  standalone: true,
})
export class SchadeclaimsUserPage implements OnInit {
  userId!: number;
  insuranceForms$!: Observable<InsuranceFormResponseDto[]>;

  constructor(
    private route: ActivatedRoute,
    private insuranceFormService: InsuranceFormService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userId = +params['userId'];
      this.loadInsuranceForms();
    });
  }

  loadInsuranceForms() {
    const user = JSON.parse(localStorage.getItem('user')!);
    this.insuranceForms$ =
      this.insuranceFormService.getInsuranceformsByUserIdByAccessToUserField(
        user.id,
        this.userId
      );
  }

  viewSchadeclaim(arg0: number) {
    console.log('View schadeclaim');
  }
}

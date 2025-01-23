import { Component, Input, OnInit } from '@angular/core';
import { InsuranceFormService } from '../services/insuranceform.service';
// import { PDFService } from '../../api/services/pdf/pdf.service';

@Component({
  selector: 'app-schadeclaims',
  templateUrl: './schadeclaims.component.html',
  styleUrls: ['./schadeclaims.component.css'],
})
export class SchadeclaimsComponent implements OnInit {
  @Input() userId: number | null = null;  // Accept userId as input
  claims: any[] = [];

  constructor(
    private insuranceformservice: InsuranceFormService,
    // private pdfService: PDFService
  ) {}

  ngOnInit(): void {
    if (this.userId) {
      this.fetchInsuranceClaims(this.userId);
    }
  }

  fetchInsuranceClaims(userId: number): void {
    // Make the API call to get insurance claims based on the user ID
    this.insuranceformservice.getInsuranceformByUserId(userId).subscribe({
      next: (response: any) => {
        this.claims = response;
      },
      error: (err) => {
        console.error('Failed to fetch insurance claims', err);
      },
    });
  }

//   generatePDF(claimId: number): void {
//     this.pdfService.getPDF(claimId).subscribe({
//       next: (response) => {
//         const blob = new Blob([response], { type: 'application/pdf' });
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `claim_${claimId}.pdf`;
//         link.click();
//         window.URL.revokeObjectURL(url);
//       },
//       error: (err) => {
//         console.error('Failed to generate PDF', err);
//       },
//     });
//   }
}

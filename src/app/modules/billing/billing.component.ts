import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  billData: any = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Retrieve transaction data from navigation state
    const state = history.state;
    if (state && state.billData) {
      this.billData = state.billData;
    } else {
      this.router.navigate(['/checkout']); // Redirect if no data
    }
  }

  navigateToHome() {
    this.router.navigate(['/B2B']);
  }

  // Download Bill as PDF
  downloadPDF(): void {
    const billElement = document.getElementById('bill-container');

    if (!billElement) return;

    html2canvas(billElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('invoice.pdf');
    });
  }

  // Download Bill as Image
  downloadImage(): void {
    const billElement = document.getElementById('bill-container');

    if (!billElement) return;

    html2canvas(billElement, { scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'invoice.png';
      link.click();
    });
  }
}
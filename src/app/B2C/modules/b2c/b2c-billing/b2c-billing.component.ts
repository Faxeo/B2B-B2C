import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
    selector: 'app-b2c-billing',
    imports: [],
    templateUrl: './b2c-billing.component.html',
    styleUrl: './b2c-billing.component.css'
})
export class B2cBillingComponent implements OnInit {
  billData: any = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Check if billData exists in state
    const state = history.state;

    if (state && state.billData) {
      console.log("✅ Received billData from navigation state:", state.billData);
      this.billData = state.billData;
      // Store in local storage for persistence
      localStorage.setItem('billData', JSON.stringify(this.billData));
    } else {
      // Try retrieving from local storage if page is refreshed
      const storedBillData = localStorage.getItem('billData');
      if (storedBillData) {
        console.log("♻️ Retrieved billData from localStorage:", JSON.parse(storedBillData));
        this.billData = JSON.parse(storedBillData);
      } else {
        console.warn("⚠️ No billData found! Redirecting to checkout...");
        this.router.navigate(['B2C/checkout']);
      }
    }
  }

  navigateToHome() {
    this.router.navigate(['/B2C']);
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

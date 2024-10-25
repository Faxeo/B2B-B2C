import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  underline: boolean = false; // Add underline property for hover effect

  constructor(private router: Router) {}

  navigateToPrivacyPolicy() {
    this.router.navigate(['/privacy-policy']);
  }
}

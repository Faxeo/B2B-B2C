import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {
  constructor(private router: Router) {}

  closePrivacyPolicy() {
    this.router.navigate(['/']); 
  }
}

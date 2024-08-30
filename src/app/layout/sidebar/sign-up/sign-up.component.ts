import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignupComponent {
  name: string = ''; 
  email: string = '';
  password: string = '';
  confirmPassword: string = ''; 
  showPassword: boolean = false;
  companyName: string = '';
  firstName: string = '';
  lastName: string = '';
  countryCode: string = '';
  phoneNumber: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const signupData = {
      name: this.name,
      email: this.email,
      password: this.password,
      companyName: this.companyName,
      firstName: this.firstName,
      lastName: this.lastName,
      countryCode: this.countryCode,
      phoneNumber: this.phoneNumber,
    };

    this.http.post('Profile/registerCustomer', signupData).subscribe(
      (response) => {
        console.log('Signup successful', response);
        alert('Signup successful!');
        this.router.navigate(['/login']);
      }
    );
  }
}

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateUserServiceService } from '../../../features/users/services/createUser-service/create-user-service.service';

@Component({
    selector: 'app-signup',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    standalone: false
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
  notificationMessage: string = '';

  constructor(private createUserService: CreateUserServiceService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  closeSignUp() {
    this.router.navigate(['/']); // Navigate to home page or previous page
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return; 
    }

    // Create the signup data based on the form input
    const signupData = {
      name: `${this.firstName} ${this.lastName}`, // Concatenate first and last names as name
      email: this.email,
      password: this.password,
      contact: `${this.countryCode}${this.phoneNumber}`, // Concatenate country code and phone number as contact
    };

    // Use the CreateUserServiceService to send the request
    this.createUserService.signup(signupData).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        alert('Signup successful!');
        this.router.navigate(['/login']); // Navigate to login page on success
      },
      error: (error) => {
        console.error('Signup failed', error);
        alert('Signup failed. Please try again.');
      }
    });
  }

  showNotification(message: string) {
    this.notificationMessage = message;
    // Clear the notification after 5 seconds
    setTimeout(() => {
      this.notificationMessage = '';
    }, 5000);  // Notification disappears after 5 seconds
  }
}

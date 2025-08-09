import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private location: Location) { }

  // Method to go back to the previous state
  goBack(): void {
    this.location.back();
  }
}

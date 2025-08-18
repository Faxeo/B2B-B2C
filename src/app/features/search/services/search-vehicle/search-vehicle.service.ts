import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class VehicleSearchService {
  private vehicleData: any = {};

  setVehicleData(data: any): void {
    this.vehicleData = { ...this.vehicleData, ...data }; // Merge new data with existing
    console.log('Updated Vehicle Data:', this.vehicleData); // Debug log to confirm update
  }
  
  getVehicleData(): any {
    return this.vehicleData;
  }
}
   
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service'; // Adjust the path as necessary

interface DeleteResponse {
  success: boolean;
  statusCode: number;
  statusReason: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeleteCartService {
  constructor(private apiService: ApiService) {}

  /**
   * Deletes a product from the cart based on the provided cart ID.
   * Now uses a POST request instead of DELETE.
   * @param cartId - The ID of the cart item to be deleted.
   * @returns Observable containing the response from the server.
   */
  deleteCart(cartId: number): Observable<DeleteResponse> {
    // Construct the endpoint with cartId as a query parameter
    const endpoint = `Cart/deleteCart?cartId=${cartId}`;
    return this.apiService.post<DeleteResponse>(endpoint, {});
  }
}

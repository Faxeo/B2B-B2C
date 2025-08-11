import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://182.180.50.148:5021/';  // API base URL

  constructor(private http: HttpClient) {}

  // Function to send user input to the chatbot API
  sendMessageToBot(message: string): Observable<any> {
    const endpoint = `${this.apiUrl}?message=${encodeURIComponent(message)}`;  // Add message as query parameter
    return this.http.get(endpoint);
  }
  
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchQueryService {
  // holds the current search term (initially empty)
  private querySubject = new BehaviorSubject<string>('');

  // expose as Observable so components can subscribe
  readonly query$: Observable<string> = this.querySubject.asObservable();

  constructor() { }

  /** Broadcast a new search term */
  setQuery(term: string): void {
    this.querySubject.next(term);
  }

  /** Optionally clear the current term */
  clear(): void {
    this.querySubject.next('');
  }
}

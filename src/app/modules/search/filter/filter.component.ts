import { Component } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation-service/navigation-service.service';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent {
  constructor(private navigationService: NavigationService) {}

  onBackClick(): void {
    this.navigationService.goBack();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
// import { SidebarComponent } from './layout/sidebar/sidebar/sidebar.component';
import { AuthService } from '../../../B2B-B2C-2/src/app/shared/Session/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule], //, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'b2b-angular';
  constructor(private authService: AuthService) {
    // AuthService constructor will handle token check
  }
}

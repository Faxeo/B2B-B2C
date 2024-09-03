import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ProductModule } from './modules/product/product.module';
import { HomeComponent } from './modules/home/home.component';
import { ApiService } from './core/services/api.service';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { UsersModule } from './modules/users/users.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { SidebarComponent } from './layout/sidebar/sidebar/sidebar.component';
import { SignupComponent } from './layout/sidebar/sign-up/sign-up.component';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';




@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ProductModule, 
    HomeComponent,
    AppComponent,
    UsersModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    SidebarComponent,
    FormsModule,
    DashboardComponent,
    AdminDashboardComponent
  ],
  providers: [
    ApiService,
    provideHttpClient(withFetch())
  ]
})
export class AppModule { }
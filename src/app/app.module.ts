import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ProductModule } from './modules/product/product.module';
import { HomeComponent } from './modules/home/home.component';
import { ApiService } from './core/services/api.service';
import { provideHttpClient, withFetch } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ProductModule, 
    HomeComponent,
    AppComponent
  ],
  providers: [
    ApiService,
    provideHttpClient(withFetch())
  ]
})
export class AppModule { }
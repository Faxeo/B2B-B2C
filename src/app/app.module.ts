import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ProductModule } from './modules/product/product.module';
import { HomeComponent } from './modules/home/home.component';
import { ApiService } from './core/services/api.service';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ProductModule, // Include ProductModule
    HomeComponent,
    HttpClientModule
  ],
  providers: [ApiService]
})
export class AppModule { }

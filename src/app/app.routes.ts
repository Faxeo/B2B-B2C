import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component'; // Import HomeComponent


export const routes: Routes = [
    { path: '', component: HomeComponent },
];

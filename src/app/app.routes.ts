import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component'; 


export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'users',
        loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule)
    }
];

import { Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component'; 

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'users',
        loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule)
    },
    {
        path: 'sidebar',
        loadChildren: () => import('./layout/sidebar/sidebar.module').then(m => m.SidebarModule)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'admin-dashboard',
        loadChildren: () => import('./dashboard/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardRoutingModule)
    },
    {
        path: 'cutomer-dashboard',
        loadChildren: () => import('./dashboard/cutomer-dashboard/cutomer-dashboard.module').then(m => m.CutomerDashboardModule)
    },
    {
        path: 'business-dashboard',
        loadChildren: () => import('./dashboard/business-dashboard/business-dashboard.module').then(m => m.BusinessDashboardModule)
    },
    {
        path: 'sub-home',
        loadChildren: () => import('./modules/home/sub-home/sub-home.module').then(m => m.SubHomeModule)
    },
    {
        path: 'cart',
        loadChildren: () => import('./modules/cart/cart.module').then(m => m.CartModule)
    }   
    
];
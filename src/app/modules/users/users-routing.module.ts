import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import path from 'path';
import { UsersComponent } from './users/users.component';
import { User1Component } from './user-1/user-1.component';
import { User2Component } from './user-2/user-2.component';
import { User3Component } from './user-3/user-3.component';
import { User4Component } from './user-4/user-4.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent
  },
  {
    path: 'user-1',
    component: User1Component
  },
  {
    path: 'user-2',
    component: User2Component
  },
  {
    path: 'user-3',
    component: User3Component
  },
  {
    path: 'user-4',
    component: User4Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }

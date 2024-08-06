import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users/users.component';
import { User1Component } from './user-1/user-1.component';
import { User2Component } from './user-2/user-2.component';
import { User3Component } from './user-3/user-3.component';
import { User4Component } from './user-4/user-4.component';


@NgModule({
  declarations: [
    UsersComponent,
    User1Component,
    User2Component,
    User3Component,
    User4Component
  ],
  imports: [
    CommonModule,
    UsersRoutingModule
  ],
  exports: [UsersRoutingModule]
})
export class UsersModule { }

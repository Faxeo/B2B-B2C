import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarRoutingModule } from './sidebar-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { SignupComponent } from './sign-up/sign-up.component';


@NgModule({
  declarations: [SignupComponent],
  imports: [
    CommonModule,
    SidebarComponent,
    SidebarRoutingModule,
    FormsModule
  ]
})
export class SidebarModule { }

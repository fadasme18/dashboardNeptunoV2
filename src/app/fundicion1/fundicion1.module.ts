import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Fundicion1RoutingModule } from './fundicion1-routing.module';
import { Fundicion1Component } from './fundicion1.component';


@NgModule({
  declarations: [
    Fundicion1Component
  ],
  imports: [
    CommonModule,
    Fundicion1RoutingModule
  ]
})
export class Fundicion1Module { }

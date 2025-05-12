import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Fundicion1Component } from './fundicion1.component';
import { Horno1Component } from './horno1/horno1.component';
import { Horno2Component } from './horno2/horno2.component';
import { Horno3Component } from './horno3/horno3.component';
import { Horno4Component } from './horno4/horno4.component';

const routes: Routes = [
  {
    path: 'horno1',
    component: Horno1Component
  },
  {
    path: 'horno2',
    component: Horno2Component
  },
  {
    path: 'horno3',
    component: Horno3Component
  },
  {
    path: 'horno4',
    component: Horno4Component
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Fundicion1RoutingModule { }

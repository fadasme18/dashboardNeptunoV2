import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Horno1Component } from './horno1/horno1.component';
import { Horno2Component } from './horno2/horno2.component';
import { LechofluidizadoComponent } from './lechofluidizado/lechofluidizado.component';
import { SilosComponent } from './silos/silos.component';
import { TtermicosComponent } from './ttermicos/ttermicos.component';

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
    path: 'lechofluidizado',
    component: LechofluidizadoComponent
  },
  {
    path: 'silos',
    component: SilosComponent
  },
  {
    path: 'ttermicos',
    component: TtermicosComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Fundicion2RoutingModule { }

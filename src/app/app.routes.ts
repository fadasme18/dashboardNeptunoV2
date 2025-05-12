import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Fundicion1Component } from './fundicion1/fundicion1.component';
import { Fundicion2Component } from './fundicion2/fundicion2.component';

export const routes: Routes = [
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent},
    {
        path: 'fundicion1',
        loadChildren: () => import('./fundicion1/fundicion1.module').then(m => m.Fundicion1Module)
    },
    {
        path: 'fundicion2',
        loadChildren: () => import('./fundicion2/fundicion2.module').then(m => m.Fundicion2Module)
    },
];

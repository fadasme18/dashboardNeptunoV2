import { Router, RouterLink } from '@angular/router';
import { INavbarData } from './helper';

export const navbarData: INavbarData[] = [
  {
    routeLink: 'dashboard',
    icon: 'fal fa-home',
    label: 'Dashboard',
    // items: [
    //   {
    //     routeLink: 'dashboard/horno1',
    //     label: 'horno 1',
    //     items: [
    //       {
    //         routeLink: 'dashboard/horno1/horno1-1',
    //         label: 'horno 1-1',
    //       },
    //       {
    //         routeLink: 'dashboard/horno1/horno1-2',
    //         label: 'horno 1-2',
    //         items: [
    //           {
    //             routeLink: 'dashboard/horno1/horno1-2/horno1-2-1',
    //             label: 'horno 1-2-1',
    //           },
    //           {
    //             routeLink: 'dashboard/horno1/horno1-2/horno1-2-1',
    //             label: 'horno 1-2-2',
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
  },
  {
    routeLink: 'fundicion1',
    icon: 'fal fa-chart-bar',
    label: 'fundición 1',
    items: [
      {
        routeLink: 'fundicion1/horno1',
        label: 'Horno 1',
      },
      {
        routeLink: 'fundicion1/horno2',
        label: 'Horno 2',
      },
      {
        routeLink: 'fundicion1/horno3',
        label: 'Horno 3',
      },
      {
        routeLink: 'fundicion1/horno4',
        label: 'Horno 4',
      },
    ],
  },
  {
    routeLink: 'fundicion2',
    icon: 'fal fa-chart-bar',
    label: 'Fundición 2',
    items: [
      {
        routeLink: 'fundicion2/horno1',
        label: 'Horno 1',
      },
      {
        routeLink: 'fundicion2/horno2',
        label: 'Horno 2',
      },
      {
        routeLink: 'fundicion2/silos',
        label: 'Silos',
      },
      {
        routeLink: 'fundicion2/ttermicos',
        label: 'Tratamientos termicos',
      },
      {
        routeLink: 'fundicion2/lechofluidizado',
        label: 'Lecho fluidizado',
      },
    ],
  },
];

import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    title: true,
    name: 'Componentes',
  },
  {
    name: 'Vistas',
    url: '/construccion',
    icon: 'icon-puzzle',
    children: [
      {
        name: 'Vista1',
        url: '/construccion',
      },
      {
        name: 'Vista2',
        url: '/construccion',
      },
    ]
  },
  {
    name: 'Gráficas',
    url: '/plot',
    icon: 'icon-puzzle',
    children: [
      {
        name: 'Gráfica1',
        url: '/construccion',
      },
      {
        name: 'Gráfica2',
        url: '/construccion',
      },
    ]
  },
  {
    name: 'Alarmas',
    url: '/construccion',
    icon: 'icon-puzzle',
  },
  {
    name: 'Gateways',
    url: '/construccion',
    icon: 'icon-puzzle',
    children: [
      {
        name: 'Raspberry',
        url: '/construccion',
      },
      {
        name: 'Campbell',
        url: '/construccion',
      },
    ]
  },
  {
    name: 'Sensores',
    url: '/construccion',
    icon: 'icon-puzzle',
    children: [
      {
        name: 'VW Strain Gauge',
        url: '/construccion',
      },
      {
        name: 'Esp32 Temp',
        url: '/construccion',
      },
    ]
  },
  {
    title: true,
    name: 'Utilidades',
  },
  {
    name: 'Descarga',
    url: '/construccion',
    icon: 'icon-puzzle'
  },
  {
    name: 'Configuración',
    url: '/construccion',
    icon: 'icon-puzzle',
    children: [
      {
        name: 'Usuarios',
        url: '/construccion',
      },
      {
        name: 'Proyectos',
        url: '/construccion',
      },
      {
        name: 'Dispositivos',
        url: '/construccion',
      }
    ]
  },
];

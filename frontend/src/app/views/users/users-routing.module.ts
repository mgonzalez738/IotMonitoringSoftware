import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserLayoutComponent } from './user-layout.component';
import { UsersComponent } from './users.component';
import { NewUserComponent } from './new-user.component';
/*
const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    data: {
      title: 'Usuarios'
    }
  },
  {
    path: 'newuser',
    component: NewUserComponent,
    data: {
      title: 'Usuarios / Nuevo'
    }
  }
]
*/
const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    data: {
      title: 'Usuarios'
    },
    children : [
      {
        path: '',
        component: UsersComponent,
        data: {
          title: ''
        }
      },
      {
        path: 'newuser',
        component: NewUserComponent,
        data: {
          title: 'Nuevo'
        }
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}

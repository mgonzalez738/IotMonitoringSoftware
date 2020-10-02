import { Component, OnInit, ViewChild } from '@angular/core';
import {ModalDirective} from 'ngx-bootstrap/modal';
import { Router } from '@angular/router'

import { UsersService } from '../../services/users/users.service';

import { User } from '../../models/userModel';

@Component({
  templateUrl: 'users.component.html'
})
export class UsersComponent implements OnInit {

  public users: User[];
  public selectedUser: User = null;
  @ViewChild('warningModal') public warningModal: ModalDirective;
  public isDeleting: boolean = false;

  constructor(
    private usersService: UsersService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.users = await this.usersService.getUsers();
    } catch (error) {
      console.log(error);
    }
  }

  onDeleteRequest(event, user: User) {
    this.selectedUser = user;
    this.warningModal.show();
  }

  onDeleteCancel(event) {
    this.selectedUser = null;
    this.warningModal.hide();
  }

  async onDeleteOk(event) {
    this.isDeleting = true;
    try {
      await this.usersService.deleteUser(this.selectedUser._id);
      this.users = await this.usersService.getUsers();
    } catch (error) {
      console.log(error);
    }
    this.selectedUser = null;
    this.warningModal.hide();
    this.isDeleting = false;
  }

}

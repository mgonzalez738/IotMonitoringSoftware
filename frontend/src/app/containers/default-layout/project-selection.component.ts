import { Component, EventEmitter } from '@angular/core';

import { Project } from '../../models/projectModel';

@Component({
  selector: 'project-selection',
  inputs: ['projectSelected', 'projectList'],
  outputs: ['projectSelectedChanged'],
  templateUrl: './project-selection.component.html'
})
export class ProjectSelectionComponent {

  public projectList: Project[];
  public projectSelected: Project;
  public projectSelectedChanged = new EventEmitter<Project>();

  constructor( ) {}

  public onProjectSelectedChanged(event, project: Project) {
    // Emite el nuevo cliente seleccionado
    this.projectSelectedChanged.emit(project);
  }
}

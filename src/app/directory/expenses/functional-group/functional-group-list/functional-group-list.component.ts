import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { FuncGroupService } from '../func-group.services';
import { func_group_detail, func_group_list } from '../interfaces';

@Component({
  selector: 'app-functional-group-list',
  templateUrl: './functional-group-list.component.html',
  styleUrls: ['./functional-group-list.component.css']
})
export class FunctionalGroupListComponent implements OnInit {

  constructor(
    private funcGrService: FuncGroupService,
    private funcGrref: DynamicDialogRef,
    private funcGrconfirm: ConfirmationService,
    private funcGrListdialog: DialogService,
    private funcGrListmessage: MessageService,
  ) { }

  @Input() data = false
  funcGr$: Observable<func_group_list>
  searchfuncGr = ''
  first = 0
  rows = 3

  ngOnInit(): void {
    this.fetchGr()
  }

  fetchGr() {
    let params = {
      limit: this.rows.toString(),
      offset: this.first.toString()
    }

    this.funcGr$ = this.funcGrService.fetch(params)
  }

  onPageChange(event: any) {
    this.first = event.first
    this.rows = event.rows
    this.fetchGr()
  }

  onRowClick(func_detail: func_group_detail) {

  }

  search() {

  }

}
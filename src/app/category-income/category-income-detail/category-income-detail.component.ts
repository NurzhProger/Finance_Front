import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CategoryIncomeService } from '../category_income.service';
import { category_income_detail } from '../interfaces';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-category-income-detail',
  templateUrl: './category-income-detail.component.html',
  styleUrls: ['./category-income-detail.component.css']
})
export class CategoryIncomeDetailComponent implements OnInit {

  constructor(
    private CatService: CategoryIncomeService,
    private CatDetailconfig: DynamicDialogConfig,
    private CatDetailmsg: MessageService,
    private CatDetailref: DynamicDialogRef,
  ) { }

  form: FormGroup
  category_detail: category_income_detail

  ngOnInit(): void {
    this.form = new FormGroup({
      code: new FormControl(null, [Validators.required]),
      name_kaz: new FormControl(null, [Validators.required]),
      name_rus: new FormControl(null, [Validators.required])
    })

    this.category_detail = this.CatDetailconfig.data.category
  }

  saveCategory() {
    if (this.category_detail.id == '') {
      this.CatService.addCategory(this.category_detail)
        .pipe(
          timeout(5000), // установка таймаута на 5 секунд
          catchError(error => {
            if (error.name === 'TimeoutError') {
              this.CatDetailmsg.add({ severity: 'error', summary: 'Ошибка', detail: 'Время ожидания истекло. Попробуйте позднее!' });
            }
            else {
              this.CatDetailmsg.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные!' });
            }
            return throwError('Произошла ошибка: ' + error.message);
          })

        )
        .subscribe(
          (data) => (this.CatDetailmsg.add({ severity: 'success', summary: 'Успешно', detail: 'Категория успешно добавлена!' }), this.CatDetailref.close(true)),
          (error) => (this.CatDetailmsg.add({ severity: 'error', summary: 'Ошибка', detail: error.error.status }))
        )
    }
    else {
      this.CatService.saveCategory(this.category_detail)
        .pipe(
          timeout(5000), // установка таймаута на 5 секунд
          catchError(error => {
            if (error.name === 'TimeoutError') {
              this.CatDetailmsg.add({ severity: 'error', summary: 'Ошибка', detail: 'Время ожидания истекло. Попробуйте позднее!' });
            }
            else {
              this.CatDetailmsg.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные!' });
            }
            return throwError('Произошла ошибка: ' + error.message);
          })

        )
        .subscribe(
          (data) => (this.CatDetailmsg.add({ severity: 'success', summary: 'Успешно', detail: 'Категория успешно отредактирована!' }), this.CatDetailref.close(true)),
          (error) => (this.CatDetailmsg.add({ severity: 'error', summary: 'Ошибка', detail: error.error.status })))
    }
  }

  closeCat(save: boolean) {
    this.CatDetailref.close(save)
  }

}

import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FkrListComponent } from 'src/app/directory/expenses/fkr/fkr-list/fkr-list.component';
import { FkrSelectComponent } from 'src/app/directory/expenses/fkr/fkr-select/fkr-select.component';
import { fkr_detail } from 'src/app/directory/expenses/fkr/interfaces';
import { specification_income_detail } from 'src/app/directory/income/specification-income/interfaces';
import { utv_expenses_detail } from '../interfaces';
import { UtvExpensesService } from '../utv_expenses.service';
import { SHA256 } from 'crypto-js';
import { SpecificationExpListComponent } from 'src/app/directory/expenses/specification-exp/specification-exp-list/specification-exp-list.component';

@Component({
  selector: 'app-utv-exp-doc-detail',
  templateUrl: './utv-exp-doc-detail.component.html',
  styleUrls: ['./utv-exp-doc-detail.component.css']
})
export class UtvExpDocDetailComponent implements OnInit, DoCheck {

  constructor(
    private utvDetailService: UtvExpensesService,
    private utvDetailmsg: MessageService,
    private utvDetailref: DynamicDialogRef,
    private utvDetaildialog: DialogService,
    private utvDetailconfirm: ConfirmationService,
  ) {
    this.items = [
      {
        label: 'Записать',
        icon: 'pi pi-save',
        command: () => {

        }
      },
      // {
      //   label: 'Пометка на удаление',
      //   icon: 'pi pi-times',
      //   command: () => {
      //     this.onDelete();
      //   }
      // }
    ]
  }

  @Input() utv_exp_id = ''
  @Output() closeEvent = new EventEmitter<any>();

  items: MenuItem[]
  form: FormGroup
  obligats: any = []
  payments: any = []
  fkr_array: any = []
  allrecord = true
  _lastfkr = 0
  firstclick = true
  hashBegin = ''
  hashEnd = ''
  nochanged = true
  fkr: fkr_detail = {
    id: 0,
    code: '',
    name_kaz: '',
    name_rus: ''
  }

  utvDetail: utv_expenses_detail = {
    doc: {
      id: 0,
      nom: '',
      _date: '',
      deleted: false,
      _organization: {
        id: 0,
        budjet_name: '',
        bin: '',
        name_kaz: '',
        name_rus: '',
        adress: '',
        _budjet: 0
      }
    },
    payments: [{
      id: 0,
      god: 0,
      sm1: 0,
      sm2: 0,
      sm3: 0,
      sm4: 0,
      sm5: 0,
      sm6: 0,
      sm7: 0,
      sm8: 0,
      sm9: 0,
      sm10: 0,
      sm11: 0,
      sm12: 0,
      _date: '',
      _utv_exp: 0,
      _organization: 0,
      _fkr: {
        id: 0,
        code: '',
        name_kaz: '',
        name_rus: ''
      },
      _spec: {
        id: 0,
        code: '',
        name_kaz: '',
        name_rus: ''
      }
    }],
    obligats: [{
      id: 0,
      god: 0,
      sm1: 0,
      sm2: 0,
      sm3: 0,
      sm4: 0,
      sm5: 0,
      sm6: 0,
      sm7: 0,
      sm8: 0,
      sm9: 0,
      sm10: 0,
      sm11: 0,
      sm12: 0,
      _date: '',
      _utv_exp: 0,
      _organization: 0,
      _fkr: {
        id: 0,
        code: '',
        name_kaz: '',
        name_rus: ''
      },
      _spec: {
        id: 0,
        code: '',
        name_kaz: '',
        name_rus: ''
      }
    }]
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      number_doc: new FormControl(null, [Validators.required]),
      date_doc: new FormControl(null, [Validators.required]),
      org_name: new FormControl(null, [Validators.required]),
      // budjet_name: new FormControl(null, [Validators.required])
    })
    if (this.utv_exp_id !== '') {
      this.utvDetailService.fetch_detail(parseInt(this.utv_exp_id))
        .subscribe(
          (detail) => {
            this.utvDetail = detail,
              this.obligats = this.utvDetail.obligats,
              this.payments = this.utvDetail.payments,
              this.addFKRtoArray()
          }
        )
    }

    let objString = JSON.stringify(this.utvDetail)
    this.hashBegin = SHA256(objString).toString()

  }

  addFKRtoArray() {
    for (let i = 0; i < this.utvDetail.payments.length; i++) {
      this.fkr_array.push({
        id: this.utvDetail.payments[i]._fkr.id,
        code: this.utvDetail.payments[i]._fkr.code,
        name_kaz: this.utvDetail.payments[i]._fkr.name_kaz,
        name_rus: this.utvDetail.payments[i]._fkr.name_rus,
      })
    }
  }

  ngDoCheck() {

    let objString = JSON.stringify(this.utvDetail)
    let hashBeg = SHA256(objString).toString()

    if (hashBeg !== this.hashBegin && this.nochanged) {
      this.nochanged = false
      this.hashBegin = hashBeg
    }
  }

  addFKR() {
    this.utvDetailref = this.utvDetaildialog.open(FkrSelectComponent,
      {
        header: 'Выбор ФКР',
        width: '60%',
        height: '80%'
      })

    this.utvDetailref.onClose.subscribe((fkr_detail: fkr_detail) => {
      if (fkr_detail) {
        this.addSpec(fkr_detail),
          this.fkr_array.push({
            id: fkr_detail.id,
            code: fkr_detail.code,
            name_kaz: fkr_detail.name_kaz,
            name_rus: fkr_detail.name_rus
          })
      }
    }
    )
  }

  addSpec(fkr_detail: fkr_detail) {
    if (fkr_detail !== undefined) {
      this.utvDetailref = this.utvDetaildialog.open(SpecificationExpListComponent,
        {
          header: 'Выбор спецификации',
          width: '60%',
          height: '80%'
        })
      this.utvDetailref.onClose.subscribe((spec_detail: specification_income_detail) => {
        if (spec_detail) {
          this.pushArray(fkr_detail, spec_detail)
        }
      }
      )
    }
    else {
      this.utvDetailmsg.add({ severity: 'error', summary: 'Ошибка', detail: 'Выберите ФКР!' })
      return

    }
  }

  pushArray(fkr_detail: fkr_detail, spec_detail: specification_income_detail) {
    this.utvDetail.payments.push(
      {
        id: 0,
        god: 0,
        sm1: 0,
        sm2: 0,
        sm3: 0,
        sm4: 0,
        sm5: 0,
        sm6: 0,
        sm7: 0,
        sm8: 0,
        sm9: 0,
        sm10: 0,
        sm11: 0,
        sm12: 0,
        _date: this.utvDetail.doc._date,
        _utv_exp: parseInt(this.utv_exp_id),
        _organization: this.utvDetail.doc._organization.id,
        _fkr: {
          id: fkr_detail.id,
          code: fkr_detail.code,
          name_kaz: fkr_detail.name_kaz,
          name_rus: fkr_detail.name_rus
        },
        _spec: {
          id: spec_detail.id,
          code: spec_detail.code,
          name_kaz: spec_detail.name_kaz,
          name_rus: spec_detail.name_rus
        }
      })
    this.utvDetail.obligats.push(
      {
        id: 0,
        god: 0,
        sm1: 0,
        sm2: 0,
        sm3: 0,
        sm4: 0,
        sm5: 0,
        sm6: 0,
        sm7: 0,
        sm8: 0,
        sm9: 0,
        sm10: 0,
        sm11: 0,
        sm12: 0,
        _date: this.utvDetail.doc._date,
        _utv_exp: parseInt(this.utv_exp_id),
        _organization: this.utvDetail.doc._organization.id,
        _fkr: {
          id: fkr_detail.id,
          code: fkr_detail.code,
          name_kaz: fkr_detail.name_kaz,
          name_rus: fkr_detail.name_rus
        },
        _spec: {
          id: spec_detail.id,
          code: spec_detail.code,
          name_kaz: spec_detail.name_kaz,
          name_rus: spec_detail.name_rus
        }
      })
  }

  saveDoc(close: boolean) {
    this.closeaftersave(close)
  }

  filterFKR(_fkr: fkr_detail) {
    if (this.firstclick) {
      this._lastfkr = _fkr.id
      this.firstclick = false
    }

    if (this._lastfkr == _fkr.id) {
      this.allrecord = !this.allrecord
    }
    else {
      this.allrecord = false
    }

    if (!this.allrecord) {
      this.obligats = this.utvDetail.obligats.filter(item => item['_fkr'].id == _fkr.id)
      this.payments = this.utvDetail.payments.filter(item => item['_fkr'].id == _fkr.id)

      this.fkr.id = _fkr.id
      this.fkr.code = _fkr.code
      this.fkr.name_kaz = _fkr.name_kaz
      this.fkr.name_rus = _fkr.name_rus

    }
    else {
      this.obligats = this.utvDetail.obligats
      this.payments = this.utvDetail.payments

      this.fkr.id = 0
      this.fkr.code = ''
      this.fkr.name_kaz = ''
      this.fkr.name_rus = ''
    }

    this._lastfkr = _fkr.id

  }

  changedate() {
    this.utvDetail.doc._date = this.toLocaleDate(this.utvDetail.doc._date)
  }

  toLocaleDate(dateForStr: string) {
    return new Date(dateForStr).toLocaleDateString() + ' ' + new Date(dateForStr).toLocaleTimeString();
  }

  closeaftersave(close: boolean) {
    let objString = JSON.stringify(this.utvDetail)
    this.hashEnd = SHA256(objString).toString()

    this.hashBegin = this.hashEnd

    if (close) {
      this.closeEvent.emit()
    }
  }

  closeform(close: boolean) {

    let objString = JSON.stringify(this.utvDetail)
    this.hashEnd = SHA256(objString).toString()

    if (close) {
      if (this.hashBegin == this.hashEnd) {
        this.closeEvent.emit()
      }
      else {
        this.utvDetailconfirm.confirm({
          message: 'Данные были изменены. Закрыть документ?',
          header: 'Закрытие',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.closeEvent.emit()
            this.utvDetailconfirm.close()
          },
          reject: () => {
            this.utvDetailconfirm.close()
          }
        })
      }
    }
  }

}

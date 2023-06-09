import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { specification_income_detail, specification_income_list } from "./interfaces";

@Injectable({
    providedIn: 'root'
})


export class SpecificationIncomeService {
    constructor(private http: HttpClient) {
    }
    host = "http://192.168.10.237:8000/"


    fetch(params: any): Observable<specification_income_list> {
        return this.http.get<specification_income_list>(this.host + 'dirs/specinclist', { params })
    }

    saveSpec(spec: specification_income_detail) {
        return this.http.post(this.host + 'dirs/specincedit', spec)
    }

    addSpec(spec: specification_income_detail) {
        return this.http.post(this.host + 'dirs/specincadd', spec)
    }

    deleteSpec(spec_id: string = '') {
        return this.http.delete(this.host + 'dirs/specincdelete/' + spec_id)
    }
}
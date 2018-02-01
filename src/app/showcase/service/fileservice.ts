import 'rxjs/add/operator/toPromise';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class FileService {

    constructor(private http: HttpClient) { }

    getItems() {
    return this.http.get<any>('assets/showcase/data/SampleChipsSuggestion.json')
      .toPromise()
      .then(res => <any[]>res.data)
      .then(data => { return data; });
    }
}
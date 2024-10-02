import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly API_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) { }

  getAddress(cep: string): Observable<any> {
    return this.http.get(`${this.API_URL}/${cep}/json/`);
  }
}

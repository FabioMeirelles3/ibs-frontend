import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = `${environment.baseApiUrl}/address`;

  constructor(private http: HttpClient) { }

  getAddresss(): Observable<{ addresses: Address[] }> {
    return this.http.get<{ addresses: Address[] }>(this.apiUrl);
  }

  getAddressByCustomerId(customerId: string): Observable<{ addresses: Address[] }> {
    return this.http.get<{ addresses: Address[] }>(`${this.apiUrl}/cust/${customerId}`);
  }

  createAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, address);
  }

  deleteAddress(id: string): Observable<Address> {
    return this.http.delete<Address>(`${this.apiUrl}/${id}`);
  }


}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.baseApiUrl}/customers`;

  constructor(private http: HttpClient) { }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  getAllCustomers(): Observable<{ customers: Customer[] }> {
    return this.http.get<{ customers: Customer[] }>(this.apiUrl);
  }

  createCustomers(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomers(customer: Customer): Observable<Customer> {
    return this.http.patch<Customer>(this.apiUrl, customer);
  }

  deleteCustomers(id: string): Observable<Customer> {
    return this.http.delete<Customer>(`${this.apiUrl}/${id}`);
  }
}

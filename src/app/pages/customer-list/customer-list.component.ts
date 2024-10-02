import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators, type AbstractControl, type FormGroup } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule, type Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CustomerService } from '../../core/services/customer.service';
import { CalendarModule } from 'primeng/calendar';
import { CepService } from '../../core/services/cep.service';
import { AddressService } from '../../core/services/address.service';
import type { Customer } from '../../core/models/customer.model';
import type { Address } from '../../core/models/address.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    TableModule,
    ToastModule,
    ButtonModule,
    CommonModule,
    DialogModule,
    RippleModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    InputTextareaModule,
    FileUploadModule,
    DropdownModule,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    CalendarModule,

  ],
  providers: [ConfirmationService, MessageService, CustomerService, CepService, FormBuilder, AddressService],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  customerDialog: boolean = false;
  expandedRows = {};
  customers: Customer[] = [];
  customer!: Customer
  customerForm!: FormGroup
  submitted: boolean = false;
  submittedAddress: boolean = false;
  addresses: Address[] = [];

  genders = ['Male', 'Female', 'Other',]
  maritialStatus = ['Single', 'Common-law', 'Married', 'Separated', 'Divorced', 'Widowed',]
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private customerService: CustomerService,
    private addressService: AddressService,
    private cepService: CepService) {
    this.maxDate = new Date()
  }

  ngOnInit() {
    this.customerService.getAllCustomers().subscribe((customers) => {
      this.customers = customers.customers
    })

    this.customerForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      gender: ['', Validators.required],
      birthDate: ['', Validators.required],
      maritialStatus: ['', Validators.required],
      addresses: this.fb.group({
        zipCode: ['', [Validators.required]],
        street: [{ value: '', disabled: true }, Validators.required],
        number: [{ value: null, disabled: true }, Validators.required],
        district: [{ value: '', disabled: true }, Validators.required],
        state: [{ value: '', disabled: true }, Validators.required],
        city: [{ value: '', disabled: true }, Validators.required],
        complement: [{ value: '', disabled: true }]
      })
    });
  }

  onCepChange(event: Event) {
    if (event.target) {
      const input = event.target as HTMLInputElement;
      const zipCode = input.value;

      if (zipCode && zipCode.length === 8) {
        this.cepService.getAddress(zipCode).subscribe(
          data => {
            this.customerForm.get('addresses')?.enable();
            if (data.erro) {
              this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'ZIP code not found', life: 3000 });
            } else {
              this.customerForm.patchValue({
                addresses: {
                  street: data.logradouro,
                  district: data.bairro,
                  state: data.estado,
                  city: data.localidade,
                  complement: data.complemento
                }
              });
            }
          },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'An error occurred while searching address details', life: 3000 });
          }
        );
      }
    }
  }

  openNew() {
    this.customerForm.reset()
    this.addresses = [];
    this.submitted = false;
    this.customerDialog = true;
  }

  editCustomer(customer: Customer) {
    this.customerForm.reset()
    const birthDate = new Date(customer.birthDate);
    const gender = this.genders.find(g => g.toLowerCase() === customer.gender.toLowerCase());
    const maritialStatus = this.maritialStatus.find(ms => ms.toLowerCase() === customer.maritialStatus.toLowerCase());

    this.customerForm.patchValue({
      id: customer.id,
      name: customer.name,
      birthDate: birthDate,
      gender: gender,
      maritialStatus: maritialStatus,
      addresses: customer.addresses
    });

    this.addresses = customer.addresses;
    this.customerDialog = true;
  }

  async deleteCustomer(customer: Customer) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + customer.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const deleteAddressPromises = customer.addresses.map(address =>
            this.addressService.deleteAddress(address.id).toPromise()
          );
          await Promise.all(deleteAddressPromises);
          await this.customerService.deleteCustomers(customer.id).toPromise();
          this.customers = this.customers.filter((val) => val.id !== customer.id);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Customer Deleted', life: 3000 });
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while deleting the customer', life: 3000 });
        }
      }
    });
  }

  async deleteAddress(address: Address) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + address.street + ' ' + address.number + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.addressService.deleteAddress(address.id).toPromise();
          this.customers.forEach(customer => {
            customer.addresses = customer.addresses.filter(addr => addr.id !== address.id);
          });
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Address Deleted', life: 3000 });
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while deleting the address', life: 3000 });
        }
      }
    });
  }

  hideDialog() {
    this.customerForm.reset()
    this.customerDialog = false;
    this.submitted = false;
  }

  addAddress() {
    const addressesGroup = this.customerForm.get('addresses');
    if (addressesGroup?.valid) {
      const address = addressesGroup.value;
      this.addresses.push({ ...address });
      addressesGroup.reset();
    } else {
      this.submittedAddress = true;
    }
  }

  async saveCustomer() {
    this.submitted = true;
    this.customerForm.get('addresses')?.disable();

    if (this.customerForm.valid) {
      let customer = this.customerForm.value;
      customer.addresses = this.addresses
      try {
        if (customer.id) {
          await this.updateExistingCustomer(customer);
        } else {
          await this.createNewCustomer(customer);
        }

        this.customers = [...this.customers];
      } catch (error) {
        this.handleError(error);
      } finally {
        this.customerDialog = false;
        this.customerForm.get('addresses.zipCode')?.enable();
      }
    } else {
      this.customerForm.get('addresses.zipCode')?.enable();
    }

  }

  async updateExistingCustomer(customer: any) {
    await this.customerService.updateCustomers(customer).toPromise();
    const newAddresses = this.addresses.filter(address => !address.id);
    if (newAddresses.length > 0) {
      const createdAddresses = await this.createAddresses(newAddresses, customer.id);
      customer.addresses = [...customer.addresses];
    }

    this.customers[this.findIndexById(customer.id)] = customer;
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Customer Updated', life: 3000 });
  }

  async createNewCustomer(customer: any) {
    const newCustomer = await this.customerService.createCustomers(customer).toPromise();
    if (newCustomer) {
      if (this.addresses.length > 0) {
        const newAddresses = await this.createAddresses(this.addresses, newCustomer.id);
        newCustomer.addresses = newAddresses;
        this.customers.push(newCustomer);
      } else {
        customer.id = newCustomer.id;
        this.customers.push(customer);
      }

      this.addBirthdayMessage(customer);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create new customer', life: 3000 });
    }
  }

  async createAddresses(addresses: any[], customerId: string) {
    const addressObservables = addresses.map(address => {
      address.customerId = customerId;
      return this.addressService.createAddress(address).toPromise();
    });

    const createdAddresses = await Promise.all(addressObservables);
    return createdAddresses.filter((address): address is Address => address !== undefined);
  }

  addBirthdayMessage(customer: any) {
    const { age, isBirthday, daysUntilNextBirthday } = this.calculateAgeAndBirthday(new Date(customer.birthDate));
    if (isBirthday) {
      this.messageService.add({
        severity: 'success',
        summary: 'Customer Created',
        detail: `🎉 Happy Birthday 🎉! Today is your special day! 🎈🎂`,
        life: 5000
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Customer Created',
        detail: `Age: ${age} years. ${daysUntilNextBirthday} days until your next birthday!`,
        life: 3000
      });
    }
  }

  handleError(error: any) {
    console.error('Error saving customer:', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred', life: 3000 });
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.customers.length; i++) {
      if (this.customers[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  calculateAgeAndBirthday(birthDate: Date): { age: number, isBirthday: boolean, daysUntilNextBirthday: number } {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    const dayDifference = today.getDate() - birth.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (today > nextBirthday) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntilNextBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isBirthday = monthDifference === 0 && dayDifference === 0;

    return { age, isBirthday, daysUntilNextBirthday };
  }

  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
}



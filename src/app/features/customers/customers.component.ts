import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, Customer } from '../../core/services/api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent implements OnInit {
  private readonly api = inject(ApiService);

  customers: Customer[] = [];
  loading = false;
  error: string | null = null;

  editingId: number | null = null;

  form = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? String(e?.message ?? e);
        this.loading = false;
      },
    });
  }

  resetCreateForm(): void {
    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      country: '',
    };
  }

  startEdit(c: Customer): void {
    this.editingId = c.id;
    this.form = {
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phoneNumber: c.phoneNumber ?? '',
      addressLine1: c.addressLine1 ?? '',
      addressLine2: c.addressLine2 ?? '',
      city: c.city ?? '',
      country: c.country ?? '',
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.resetCreateForm();
  }

  submit(): void {
    this.error = null;
    if (this.editingId != null) {
      this.api
        .updateCustomer(this.editingId, {
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          email: this.form.email,
          phoneNumber: this.form.phoneNumber || undefined,
          addressLine1: this.form.addressLine1 || undefined,
          addressLine2: this.form.addressLine2 || undefined,
          city: this.form.city || undefined,
          country: this.form.country || undefined,
        })
        .subscribe({
          next: () => {
            this.cancelEdit();
            this.load();
          },
          error: (e) => {
            this.error = e?.error?.message ?? String(e?.message ?? e);
          },
        });
      return;
    }

    this.api
      .createCustomer({
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        phoneNumber: this.form.phoneNumber || undefined,
        addressLine1: this.form.addressLine1 || undefined,
        addressLine2: this.form.addressLine2 || undefined,
        city: this.form.city || undefined,
        country: this.form.country || undefined,
      })
      .subscribe({
        next: () => {
          this.resetCreateForm();
          this.load();
        },
        error: (e) => {
          this.error = e?.error?.message ?? String(e?.message ?? e);
        },
      });
  }
}

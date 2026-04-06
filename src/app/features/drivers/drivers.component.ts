import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, Driver } from '../../core/services/api.service';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.scss',
})
export class DriversComponent implements OnInit {
  private readonly api = inject(ApiService);

  drivers: Driver[] = [];
  loading = false;
  error: string | null = null;

  editingId: number | null = null;

  form = { name: '', licenseNumber: '', phoneNumber: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.getDrivers().subscribe({
      next: (d) => {
        this.drivers = d;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? String(e?.message ?? e);
        this.loading = false;
      },
    });
  }

  startEdit(d: Driver): void {
    this.editingId = d.id;
    this.form = {
      name: d.name,
      licenseNumber: d.licenseNumber,
      phoneNumber: d.phoneNumber,
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = { name: '', licenseNumber: '', phoneNumber: '' };
  }

  submit(): void {
    this.error = null;
    if (this.editingId != null) {
      this.api.updateDriver(this.editingId, this.form).subscribe({
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

    this.api.createDriver(this.form).subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: (e) => {
        this.error = e?.error?.message ?? String(e?.message ?? e);
      },
    });
  }
}

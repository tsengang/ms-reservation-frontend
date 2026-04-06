import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, Car } from '../../core/services/api.service';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss',
})
export class CarsComponent implements OnInit {
  private readonly api = inject(ApiService);

  cars: Car[] = [];
  loading = false;
  error: string | null = null;

  editingId: number | null = null;

  form = { licensePlate: '', make: '', model: '', year: new Date().getFullYear(), active: true };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.getCars().subscribe({
      next: (c) => {
        this.cars = c;
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
      licensePlate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      active: true,
    };
  }

  startEdit(c: Car): void {
    this.editingId = c.id;
    this.form = {
      licensePlate: c.licensePlate,
      make: c.make,
      model: c.model,
      year: c.year,
      active: c.active,
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
        .updateCar(this.editingId, {
          licensePlate: this.form.licensePlate,
          make: this.form.make,
          model: this.form.model,
          year: Number(this.form.year),
          active: this.form.active,
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
      .createCar({
        licensePlate: this.form.licensePlate,
        make: this.form.make,
        model: this.form.model,
        year: Number(this.form.year),
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

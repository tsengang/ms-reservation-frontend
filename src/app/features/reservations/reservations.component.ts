import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import {
  ApiService,
  Car,
  Customer,
  Driver,
  Reservation,
  ReservationStatus,
} from '../../core/services/api.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);

  reservations: Reservation[] = [];
  cars: Car[] = [];
  customers: Customer[] = [];
  drivers: Driver[] = [];
  loading = false;
  /** List / refresh / delete failures only — never cleared when editing forms. */
  listError: string | null = null;
  createError: string | null = null;
  assignError: string | null = null;
  statusError: string | null = null;
  editReservationError: string | null = null;

  editingReservationId: number | null = null;

  /** Start of today in local time (for matDatepicker min). */
  readonly minDate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  /** Disallow any calendar day strictly before today. */
  pastDateFilter = (d: Date | null): boolean => {
    if (!d) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pick = new Date(d);
    pick.setHours(0, 0, 0, 0);
    return pick >= today;
  };

  createForm = {
    carId: null as number | null,
    customerId: null as number | null,
    startDatePart: null as Date | null,
    endDatePart: null as Date | null,
    startTime: '09:00',
    endTime: '18:00',
  };

  assignForm = { reservationId: null as number | null, driverId: null as number | null };

  statusForm = { id: null as number | null, status: 'CONFIRMED' as ReservationStatus };

  editForm = {
    carId: null as number | null,
    customerId: null as number | null,
    startDatePart: null as Date | null,
    endDatePart: null as Date | null,
    startTime: '09:00',
    endTime: '18:00',
    status: 'CONFIRMED' as ReservationStatus,
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.listError = null;
    forkJoin({
      reservations: this.api.getReservations(),
      cars: this.api.getCars(),
      customers: this.api.getCustomers(),
      drivers: this.api.getDrivers(),
    }).subscribe({
      next: ({ reservations, cars, customers, drivers }) => {
        this.reservations = reservations;
        this.cars = cars;
        this.customers = customers;
        this.drivers = drivers;
        this.loading = false;
      },
      error: (e) => {
        this.listError = e?.error?.message ?? String(e?.message ?? e);
        this.loading = false;
      },
    });
  }

  /** Min time for start when the chosen day is today (local). */
  get startTimeMin(): string | undefined {
    if (!this.createForm.startDatePart || !this.isSameCalendarDay(this.createForm.startDatePart, new Date())) {
      return undefined;
    }
    return this.formatHm(new Date());
  }

  /** Min time for end: not before start on the same day; not before now if end day is today. */
  get endTimeMin(): string | undefined {
    if (!this.createForm.endDatePart || !this.createForm.startDatePart) {
      return undefined;
    }
    const startCombined = this.combineDateAndTime(this.createForm.startDatePart, this.createForm.startTime);
    if (!startCombined) {
      return undefined;
    }
    if (this.isSameCalendarDay(this.createForm.endDatePart, this.createForm.startDatePart)) {
      return this.formatHm(startCombined);
    }
    if (this.isSameCalendarDay(this.createForm.endDatePart, new Date())) {
      return this.formatHm(new Date());
    }
    return undefined;
  }

  reservationOptionLabel(r: Reservation): string {
    const name = [r.customerFirstName, r.customerLastName].filter(Boolean).join(' ') || '—';
    const start = new Date(r.startDate).toLocaleString();
    const end = new Date(r.endDate).toLocaleString();
    return `#${r.id} · ${r.licensePlate} · ${name} · ${start} → ${end}`;
  }

  create(): void {
    const carId = this.createForm.carId;
    const customerId = this.createForm.customerId;
    if (carId == null || customerId == null) {
      this.createError = this.translate.instant('FORMS.INCOMPLETE_RESERVATION');
      return;
    }
    const start = this.combineDateAndTime(this.createForm.startDatePart, this.createForm.startTime);
    const end = this.combineDateAndTime(this.createForm.endDatePart, this.createForm.endTime);
    if (!start || !end) {
      this.createError = this.translate.instant('FORMS.INCOMPLETE_DATETIME');
      return;
    }
    const now = new Date();
    if (start.getTime() < now.getTime()) {
      this.createError = this.translate.instant('FORMS.PAST_START_NOT_ALLOWED');
      return;
    }
    if (end.getTime() <= start.getTime()) {
      this.createError = this.translate.instant('FORMS.END_BEFORE_START');
      return;
    }

    this.createError = null;
    this.api
      .createReservation({
        carId,
        customerId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
      .subscribe({
        next: () => {
          this.createForm = {
            carId: null,
            customerId: null,
            startDatePart: null,
            endDatePart: null,
            startTime: '09:00',
            endTime: '18:00',
          };
          this.createError = null;
          this.load();
        },
        error: (e) => {
          this.createError = e?.error?.message ?? String(e?.message ?? e);
        },
      });
  }

  assignDriver(): void {
    const reservationId = this.assignForm.reservationId;
    const driverId = this.assignForm.driverId;
    if (reservationId == null || driverId == null) {
      return;
    }
    this.assignError = null;
    this.api.assignDriver(reservationId, driverId).subscribe({
      next: () => {
        this.assignError = null;
        this.load();
      },
      error: (e) => {
        this.assignError = e?.error?.message ?? String(e?.message ?? e);
      },
    });
  }

  updateStatus(): void {
    const id = this.statusForm.id;
    if (id == null) {
      return;
    }
    this.statusError = null;
    this.api.updateReservationStatus(id, this.statusForm.status).subscribe({
      next: () => {
        this.statusError = null;
        this.load();
      },
      error: (e) => {
        this.statusError = e?.error?.message ?? String(e?.message ?? e);
      },
    });
  }

  delete(id: number): void {
    this.listError = null;
    this.api.deleteReservation(id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.listError = e?.error?.message ?? String(e?.message ?? e);
      },
    });
  }

  startEditReservation(r: Reservation): void {
    this.editingReservationId = r.id;
    this.editReservationError = null;
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    let carId: number | null = r.carId ?? null;
    let customerId: number | null = r.customerId ?? null;
    if (carId == null) {
      carId = this.cars.find((c) => c.licensePlate === r.licensePlate)?.id ?? null;
    }
    if (customerId == null && r.customerEmail) {
      customerId = this.customers.find((c) => c.email === r.customerEmail)?.id ?? null;
    }
    this.editForm = {
      carId,
      customerId,
      startDatePart: start,
      endDatePart: end,
      startTime: this.formatHm(start),
      endTime: this.formatHm(end),
      status: r.status,
    };
  }

  cancelEditReservation(): void {
    this.editingReservationId = null;
    this.editReservationError = null;
  }

  saveReservationEdit(): void {
    const id = this.editingReservationId;
    if (id == null) {
      return;
    }
    const carId = this.editForm.carId;
    const customerId = this.editForm.customerId;
    if (carId == null || customerId == null) {
      this.editReservationError = this.translate.instant('FORMS.INCOMPLETE_RESERVATION');
      return;
    }
    const start = this.combineDateAndTime(this.editForm.startDatePart, this.editForm.startTime);
    const end = this.combineDateAndTime(this.editForm.endDatePart, this.editForm.endTime);
    if (!start || !end) {
      this.editReservationError = this.translate.instant('FORMS.INCOMPLETE_DATETIME');
      return;
    }
    if (end.getTime() <= start.getTime()) {
      this.editReservationError = this.translate.instant('FORMS.END_BEFORE_START');
      return;
    }

    this.editReservationError = null;
    this.api
      .updateReservation(id, {
        carId,
        customerId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        status: this.editForm.status,
      })
      .subscribe({
        next: () => {
          this.cancelEditReservation();
          this.load();
        },
        error: (e) => {
          this.editReservationError = e?.error?.message ?? String(e?.message ?? e);
        },
      });
  }

  private combineDateAndTime(date: Date | null, time: string): Date | null {
    if (!date || !time?.trim()) {
      return null;
    }
    const parts = time.split(':').map((x) => Number(x));
    const h = parts[0];
    const m = parts[1];
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return null;
    }
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  }

  private isSameCalendarDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private formatHm(d: Date): string {
    return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`;
  }

  private pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
  }
}

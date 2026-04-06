import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService, Car, Reservation } from '../../core/services/api.service';

const MAX_CARS = 15;

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, DatePipe],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);

  /** Monday 00:00 local of the visible week */
  weekStart = this.startOfWeekMonday(new Date());

  /** Up to MAX_CARS from the fleet (sorted by plate); every car gets a row even with zero reservations */
  cars: Car[] = [];
  weekDays: Date[] = [];
  grid: { car: Car; cells: Reservation[][] }[] = [];

  loading = false;
  error: string | null = null;
  truncated = false;

  dateLocale = 'en-US';

  ngOnInit(): void {
    this.dateLocale = this.translate.currentLang === 'fr' ? 'fr' : 'en-US';
    this.translate.onLangChange.subscribe(() => {
      this.dateLocale = this.translate.currentLang === 'fr' ? 'fr' : 'en-US';
    });
    this.rebuildWeekDays();
    this.load();
  }

  prevWeek(): void {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() - 7);
    this.weekStart = d;
    this.rebuildWeekDays();
    this.recomputeGrid();
  }

  nextWeek(): void {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + 7);
    this.weekStart = d;
    this.rebuildWeekDays();
    this.recomputeGrid();
  }

  thisWeek(): void {
    this.weekStart = this.startOfWeekMonday(new Date());
    this.rebuildWeekDays();
    this.recomputeGrid();
  }

  weekRangeLabel(): string {
    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 6);
    const loc = this.dateLocale;
    const a = formatDate(this.weekStart, 'mediumDate', loc) ?? '';
    const b = formatDate(end, 'mediumDate', loc) ?? '';
    return `${a} – ${b}`;
  }

  load(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      cars: this.api.getCars(),
      reservations: this.api.getReservations(),
    }).subscribe({
      next: ({ cars, reservations }) => {
        const sorted = [...cars].sort((a, b) =>
          a.licensePlate.localeCompare(b.licensePlate, undefined, { sensitivity: 'base' }),
        );
        this.truncated = sorted.length > MAX_CARS;
        this.cars = sorted.slice(0, MAX_CARS);
        this.allReservations = reservations;
        this.recomputeGrid();
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? String(e?.message ?? e);
        this.loading = false;
      },
    });
  }

  private allReservations: Reservation[] = [];

  private rebuildWeekDays(): void {
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      this.weekDays.push(d);
    }
  }

  /**
   * One row per car in {@link cars} (including cars with no bookings).
   * Reservations matched by {@link Car.id} / {@link Reservation.carId}, with fallback to license plate.
   */
  private recomputeGrid(): void {
    const weekEndExcl = new Date(this.weekStart);
    weekEndExcl.setDate(weekEndExcl.getDate() + 7);
    weekEndExcl.setHours(0, 0, 0, 0);

    const inWeek = (r: Reservation): boolean => {
      const rs = new Date(r.startDate).getTime();
      const re = new Date(r.endDate).getTime();
      const ws = this.weekStart.getTime();
      const we = weekEndExcl.getTime();
      return rs < we && re > ws;
    };

    const weekRes = this.allReservations.filter(inWeek);

    const matchesCar = (r: Reservation, car: Car): boolean => {
      if (r.carId != null && car.id != null && r.carId === car.id) {
        return true;
      }
      return (
        r.licensePlate != null &&
        car.licensePlate != null &&
        r.licensePlate.trim().toLowerCase() === car.licensePlate.trim().toLowerCase()
      );
    };

    this.grid = this.cars.map((car) => ({
      car,
      cells: this.weekDays.map((day) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        return weekRes.filter((r) => {
          if (!matchesCar(r, car)) {
            return false;
          }
          const rs = new Date(r.startDate).getTime();
          const re = new Date(r.endDate).getTime();
          return rs < dayEnd.getTime() && re > dayStart.getTime();
        });
      }),
    }));
  }

  customerLabel(r: Reservation): string {
    const parts = [r.customerFirstName, r.customerLastName].filter(Boolean);
    return parts.length ? parts.join(' ') : (r.customerEmail ?? `#${r.id}`);
  }

  private startOfWeekMonday(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    return x;
  }
}

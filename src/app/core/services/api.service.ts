import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Car {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  active: boolean;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: number;
  carId: number;
  customerId: number;
  licensePlate: string;
  carMake: string;
  carModel: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string | null;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  driverFirstName: string | null;
  driverLastName: string | null;
  driverAssignedAt: string | null;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.base}/cars`);
  }

  createCar(body: {
    licensePlate: string;
    make: string;
    model: string;
    year: number;
  }): Observable<Car> {
    return this.http.post<Car>(`${this.base}/cars`, body);
  }

  updateCar(
    id: number,
    body: { licensePlate: string; make: string; model: string; year: number; active: boolean },
  ): Observable<Car> {
    return this.http.put<Car>(`${this.base}/cars/${id}`, body);
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.base}/customers`);
  }

  createCustomer(body: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    country?: string;
  }): Observable<Customer> {
    return this.http.post<Customer>(`${this.base}/customers`, body);
  }

  updateCustomer(
    id: number,
    body: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      country?: string;
    },
  ): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/customers/${id}`, body);
  }

  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.base}/drivers`);
  }

  createDriver(body: {
    name: string;
    licenseNumber: string;
    phoneNumber: string;
  }): Observable<Driver> {
    return this.http.post<Driver>(`${this.base}/drivers`, body);
  }

  updateDriver(
    id: number,
    body: { name: string; licenseNumber: string; phoneNumber: string },
  ): Observable<Driver> {
    return this.http.put<Driver>(`${this.base}/drivers/${id}`, body);
  }

  getReservations(carId?: number): Observable<Reservation[]> {
    const url =
      carId != null ? `${this.base}/reservations?carId=${carId}` : `${this.base}/reservations`;
    return this.http.get<Reservation[]>(url);
  }

  createReservation(body: {
    carId: number;
    customerId: number;
    startDate: string;
    endDate: string;
  }): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.base}/reservations`, body);
  }

  updateReservation(
    id: number,
    body: {
      carId: number;
      customerId: number;
      startDate: string;
      endDate: string;
      status: ReservationStatus;
    },
  ): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.base}/reservations/${id}`, body);
  }

  updateReservationStatus(id: number, status: ReservationStatus): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/reservations/${id}/status`, { status });
  }

  assignDriver(reservationId: number, driverId: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/reservations/${reservationId}/driver`, {
      driverId,
    });
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/reservations/${id}`);
  }
}

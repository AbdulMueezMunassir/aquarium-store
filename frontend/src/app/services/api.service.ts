import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'x-auth-token': token || '',
        'Content-Type': 'application/json'
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error?.msg) {
      errorMessage = error.error.msg;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => ({ msg: errorMessage }));
  }

  // ===== AUTH =====
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, userData)
      .pipe(catchError(this.handleError));
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  // ===== CATEGORIES =====
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fish/categories`)
      .pipe(catchError(this.handleError));
  }

  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/fish/category`, category, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/fish/category/${categoryId}`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  // ===== FISH =====
  getFishesByCategory(catId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fish/category/${catId}`)
      .pipe(catchError(this.handleError));
  }

  getAllFishes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fish/all`)
      .pipe(catchError(this.handleError));
  }

  addFish(fishData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/fish/add`, fishData, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  updateFish(fishId: string, fishData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/fish/${fishId}`, fishData, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  deleteFish(fishId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/fish/${fishId}`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  updateStock(fishId: string, stockData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/fish/stock/${fishId}`, stockData, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  // ===== ORDERS =====
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, orderData, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/orders/${orderId}`, { status }, this.getHeaders())
      .pipe(catchError(this.handleError));
  }
}
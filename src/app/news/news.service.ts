import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'https://dtapppy.onrender.com/news';

  constructor(private http: HttpClient) {}

  getNews(endpoint: string = this.apiUrl): Observable<any> {
    return this.http.get<any>(endpoint);
  }
}

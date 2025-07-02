import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// news.service.ts
@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = environment.apiUrl + '/news/';

  constructor(private http: HttpClient) {}

  getNews(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}

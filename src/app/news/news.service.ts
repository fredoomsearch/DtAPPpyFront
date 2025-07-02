import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environment';


// news.service.ts
@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = environments.apiUrl + '/news';

  constructor(private http: HttpClient) {}

  getNews(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import * as Papa from 'papaparse';

// Define interfaces
export interface CryptoMarketData {
  name: string;
  current_price: number;
  market_cap: number;
  symbol: string;
}

export interface CryptoPredictionData {
  symbol: string;
  predicted_price: number;
}

// Define the structure of a row in the prediction CSV
export interface PredictionCsvRow {
  symbol: string;
  predicted_price: number;
  [key: string]: any; // Add this if there may be additional columns
}

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private baseApiUrl = 'http://localhost:8000/api/crypto';

  constructor(private http: HttpClient) {}

  // Market Data Methods
  getCryptoMarketData(): Observable<CryptoMarketData[]> {
    return this.http.get<CryptoMarketData[]>(`${this.baseApiUrl}/crypto-data`);
  }
  
  getPredictedCryptoData(): Observable<CryptoPredictionData[]> {
    return this.http.get<CryptoPredictionData[]>(`${this.baseApiUrl}/predictions-data`);
  }

  // CSV and Prediction Methods
  generateCsv(): Observable<any> {
    return this.http.get(`${this.baseApiUrl}/csv/`);
  }

  getPredictions(): Observable<CryptoPredictionData[]> {
    return this.http.get<CryptoPredictionData[]>(`${this.baseApiUrl}/predictions_dl/`);
  }

  predictPrices(): Observable<any> {
    return this.http.get(`${this.baseApiUrl}/predict_dl/`).pipe(
      catchError(error => {
        console.error('Error in predictPrices:', error);
        return throwError(() => new Error(error.error?.detail || 'Failed to predict prices'));
      })
    );
  }

downloadPredictionCsv(): Observable<PredictionCsvRow[]> {
  return this.http.get('http://localhost:8000/csv/', { responseType: 'blob' }).pipe(
    switchMap(blob => new Observable<PredictionCsvRow[]>(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        Papa.parse<PredictionCsvRow>(reader.result as string, {
          header: true,
          skipEmptyLines: true,
          complete: (result: Papa.ParseResult<PredictionCsvRow>) => {
            observer.next(result.data as PredictionCsvRow[]);
            observer.complete();
          },
          error: (error: Error, file: any) => observer.error(error)
        });
      };
      reader.readAsText(blob);
    }))
  );
}


}
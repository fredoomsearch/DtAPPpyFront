import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import * as Papa from 'papaparse';

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

export interface PredictionCsvRow {
  symbol: string;
  predicted_price: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  // 🔗 Base API URL for Render backend
  private baseApiUrl = 'https://dtapppy.onrender.com/crypto';

  constructor(private http: HttpClient) {}

  // 📈 Get current market data
  getCryptoMarketData(): Observable<CryptoMarketData[]> {
    return this.http.get<CryptoMarketData[]>(`${this.baseApiUrl}/crypto-data`);
  }

  // 🔮 Get predicted crypto prices
  getPredictedCryptoData(): Observable<CryptoPredictionData[]> {
    return this.http.get<CryptoPredictionData[]>(`${this.baseApiUrl}/predictions-data`);
  }

  // 📄 Trigger generation of a CSV file on the backend
  generateCsv(): Observable<any> {
    return this.http.get(`${this.baseApiUrl}/csv/`);
  }

  // 🧠 Get ML predictions (DL-based)
  getPredictions(): Observable<CryptoPredictionData[]> {
    return this.http.get<CryptoPredictionData[]>(`${this.baseApiUrl}/predictions_dl/`);
  }

  // 🚀 Trigger prediction generation
  predictPrices(): Observable<any> {
    return this.http.get(`${this.baseApiUrl}/predict_dl/`).pipe(
      catchError(error => {
        console.error('Error in predictPrices:', error);
        return throwError(() => new Error(error.error?.detail || 'Failed to predict prices'));
      })
    );
  }

  // ⬇️ Download and parse CSV predictions
downloadPredictionCsv(): Observable<PredictionCsvRow[]> {
  return this.http.get('https://dtapppy.onrender.com/csv/', { responseType: 'blob' }).pipe(
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
          error: (error: any) => observer.error(error) // ✅ FIXED HERE
        });
      };
      reader.readAsText(blob);
    }))
  );
}

}

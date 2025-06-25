import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxEchartsModule } from 'ngx-echarts';
import { Papa } from 'ngx-papaparse';
import { CryptoService, CryptoMarketData, CryptoPredictionData } from './crypto.service';
import type { EChartsOption } from 'echarts';
import { DomSanitizer } from '@angular/platform-browser';
import * as CryptoJS from 'crypto-js';

interface HistoricalData {
  feature1: number;
  target: number;
  symbol: string;
}

@Component({
  selector: 'app-crypto',
  templateUrl: './crypto.component.html',
  styleUrls: ['./crypto.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgxEchartsModule],
  providers: [CryptoService, Papa]
})
export class CryptoComponent implements OnInit {
  // Chart and Data Properties
  chartOption: EChartsOption = {};
  currentCryptoData: CryptoMarketData[] = [];
  cryptoPredictionsData: CryptoPredictionData[] = [];
  predictions: CryptoPredictionData[] = [];

  // Linear Regression CSV Prediction Data
  predictionCsvData: any[] = [];
  csvChartOption: EChartsOption = {};

  // UI State Properties
  loadingChart = false;
  chartError = '';
  currentView: 'market' | 'predictions' = 'market';
  showDonationForm = false;

  // Data Properties
  private historicalDataCsvUrl = '/assets/historical_data.csv';
  private historicalData: HistoricalData[] = [];
  selectedHistoricalEntry: HistoricalData | null = null;
  selectedSymbol: string | null = null;

  // PayU Properties
  donationAmountCOP = 5000;
  buyerEmail = '';
  merchantId = '508029';
  accountId = '512321';
  apiKey = '4Vj8UsQn0u3bflKxgsmipeRpQz';
  payUBaseUrl = 'https://checkout.payulatam.com/ppp-web-gateway/';
  payUSandboxUrl = 'https://sandbox.checkout.payulatam.com/ppp-web-gateway/';
  useSandbox = true;

  constructor(
    private cryptoService: CryptoService,
    private http: HttpClient,
    private papa: Papa,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadHistoricalDataFromCsv();
    this.loadCurrentCryptoData();
  }

  // -------------------- PAYU DONATION FORM --------------------
  calculateSignature(apiKey: string, merchantId: string, referenceCode: string, amount: number, currency: string): string {
    const formattedAmount = amount.toFixed(2);
    const stringToHash = `${apiKey}~${merchantId}~${referenceCode}~${formattedAmount}~${currency}`;
    return CryptoJS.MD5(stringToHash).toString();
  }

  redirectToPayU(): void {
    // ...existing code...
  }

  // -------------------- RANDOM FOREST MODEL (API: /crypto/predict_dl/, /crypto/predictions_dl/) --------------------
  loadPredictedCryptoData(): void {
    this.loadingChart = true;
    this.chartError = '';
    this.currentView = 'predictions';

    this.cryptoService.getPredictedCryptoData().subscribe({
      next: (data) => {
        this.cryptoPredictionsData = data;
        this.updateChart(data, 'Predicted Price', 'symbol', 'predicted_price');
        this.loadingChart = false;
      },
      error: (err) => {
        this.chartError = 'Failed to load crypto predictions for chart';
        this.loadingChart = false;
        console.error('Error loading crypto predictions:', err);
      }
    });
  }

  // -------------------- TF KERAS MODEL (API: /crypto/predict/, /crypto/predictions/) --------------------
  generateCsvAndPredict(): void {
    this.loadingChart = true;
    this.chartError = '';
    this.cryptoService.generateCsv().subscribe({
      next: () => {
        this.cryptoService.predictPrices().subscribe({
          next: () => {
            this.loadPredictions();
          },
          error: (err) => {
            this.chartError = 'Error predicting prices';
            this.loadingChart = false;
            console.error('Error predicting prices:', err);
          }
        });
      },
      error: (err) => {
        this.chartError = 'Error generating CSV';
        this.loadingChart = false;
        console.error('Error generating CSV:', err);
      }
    });
  }

  loadPredictions(): void {
    this.cryptoService.getPredictions().subscribe({
      next: (data) => {
        this.predictions = data;
        this.updateChart(data, 'Predicted Price', 'symbol', 'predicted_price');
        this.loadingChart = false;
      },
      error: (err) => {
        this.chartError = 'Error loading predictions';
        this.loadingChart = false;
        console.error('Error loading predictions:', err);
      }
    });
  }

  // -------------------- LINEAR REGRESSION MODEL (API: /ml/predict_price/, /ml/csv/) --------------------
  downloadAndShowPredictionCsv(): void {
    this.loadingChart = true;
    this.cryptoService.downloadPredictionCsv().subscribe({
      next: (data) => {
        this.predictionCsvData = data;
        this.updateCsvChart(data);
        this.loadingChart = false;
      },
      error: (err) => {
        this.chartError = 'Error loading prediction CSV';
        this.loadingChart = false;
        console.error('Error loading prediction CSV:', err);
      }
    });
  }

  updateCsvChart(data: any[]): void {
    this.csvChartOption = {
      title: { text: 'Predicted Prices from CSV', left: 'center' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: data.map(item => item.symbol),
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value', name: 'Predicted Price (USD)' },
      series: [{
        name: 'Predicted Price',
        data: data.map(item => +item.predicted_price),
        type: 'bar',
        itemStyle: { color: '#91CC75' }
      }]
    };
  }

  // -------------------- MARKET DATA (API: /crypto/crypto-data) --------------------
  loadCurrentCryptoData(): void {
    this.loadingChart = true;
    this.chartError = '';
    this.currentView = 'market';

    this.cryptoService.getCryptoMarketData().subscribe({
      next: (data) => {
        this.currentCryptoData = data;
        this.updateChart(data, 'Current Price', 'name', 'current_price');
        this.loadingChart = false;
      },
      error: (err) => {
        this.chartError = 'Error loading current crypto data';
        this.loadingChart = false;
        console.error('Error loading current crypto data:', err);
      }
    });
  }

  // -------------------- HISTORICAL DATA (CSV) --------------------
  loadHistoricalDataFromCsv(): void {
    this.http.get(this.historicalDataCsvUrl, { responseType: 'text' }).subscribe({
      next: (csvData: string) => {
        this.papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            this.historicalData = result.data as HistoricalData[];
          },
          error: (error) => {
            this.chartError = 'Error parsing historical data CSV';
            console.error('PapaParse error:', error);
          }
        });
      },
      error: (err) => {
        this.chartError = 'Error loading historical data CSV';
        console.error('HTTP error:', err);
      }
    });
  }

  showHistoricalData(symbol: string): void {
    if (this.selectedSymbol === symbol) {
      this.selectedSymbol = null;
      this.selectedHistoricalEntry = null;
    } else {
      this.selectedSymbol = symbol;
      this.selectedHistoricalEntry = this.historicalData.find(
        (data) => data.symbol.toLowerCase() === symbol.toLowerCase()
      ) || null;
    }
  }

  // -------------------- CHART UPDATE (USED BY ALL MODELS) --------------------
  private updateChart(data: any[], seriesName: string, xAxisKey: string, yAxisValueKey: string): void {
    this.chartOption = {};
    setTimeout(() => {
      this.chartOption = {
        title: {
          text: `Cryptocurrency ${seriesName}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const item = params[0];
            let tooltipHtml = `${item.name}<br/>${seriesName}: $${item.value.toFixed(2)}`;
            if (this.currentView === 'market' && this.currentCryptoData[item.dataIndex]?.market_cap) {
              tooltipHtml += `<br/>Market Cap: $${this.currentCryptoData[item.dataIndex].market_cap.toLocaleString()}`;
            }
            return tooltipHtml;
          }
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item[xAxisKey]),
          axisLabel: { rotate: 45 }
        },
        yAxis: {
          type: 'value',
          name: `${seriesName} (USD)`
        },
        series: [{
          name: seriesName,
          data: data.map(item => item[yAxisValueKey]),
          type: 'bar',
          itemStyle: {
            color: this.currentView === 'market' ? '#5470C6' : '#91CC75'
          }
        }],
        dataZoom: [{ type: 'inside' }, { type: 'slider' }]
      };
    });
  }
}
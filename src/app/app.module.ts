import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// Standalone Components — ✅ IMPORT them
import { AppComponent } from './app.component';
import { CryptoComponent } from './crypto/crypto.components';
import { NavbarComponent } from './navbar/navbar.component';

// Routes
import { routes } from './app.routes';

// ECharts
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  // ❌ REMOVE declarations — standalone components don’t go here
  declarations: [],

  // ✅ IMPORT standalone components here
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    AppComponent,        // ✅ Now in imports
    CryptoComponent,     // ✅ Now in imports
    NavbarComponent      // ✅ Now in imports
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

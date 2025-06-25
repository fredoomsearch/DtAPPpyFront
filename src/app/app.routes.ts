import { Routes } from '@angular/router';
import { NewsComponent } from './news/news.component';
import { CryptoComponent } from './crypto/crypto.components';


export const routes: Routes = [
  { path: 'news', component: NewsComponent },
  { path: 'crypto', component: CryptoComponent }, // Add this route
  { path: '', redirectTo: '/news', pathMatch: 'full' }
];
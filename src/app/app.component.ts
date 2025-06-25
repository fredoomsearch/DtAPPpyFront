import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, NavbarComponent, RouterOutlet]
})
export class AppComponent {
  backgroundImageUrl = 'assets/images/2.jpg';

}

import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DarkModeComponent } from "./components/dark-mode/dark-mode.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DarkModeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AnguShop';

  SendData(evData: any) {
   
  }
}

import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-dark-mode',
  standalone: true,
  templateUrl: './dark-mode.component.html',
  styleUrls: ['./dark-mode.component.css']
})
export class DarkModeComponent implements OnInit {

  ngOnInit(): void {
    const preferredTheme = this.getPreferredTheme();
    this.setTheme(preferredTheme);
    this.showActiveTheme(preferredTheme);

    // Listen for user clicking theme toggle buttons
    document.querySelectorAll('[data-bs-theme-value]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const theme = toggle.getAttribute('data-bs-theme-value');
        if (theme) {
          this.setStoredTheme(theme);
          this.setTheme(theme);
          this.showActiveTheme(theme, true);
        }
      });
    });
  }

  @HostListener('window:change', ['$event'])
  onThemeChange(): void {
    const storedTheme = this.getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      this.setTheme(this.getPreferredTheme());
    }
  }

  getStoredTheme(): string | null {
    return localStorage.getItem('theme');
  }

  setStoredTheme(theme: string): void {
    localStorage.setItem('theme', theme);
  }

  getPreferredTheme(): string {
    const storedTheme = this.getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setTheme(theme: string): void {
    if (theme === 'auto') {
      document.documentElement.setAttribute(
        'data-bs-theme',
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      );
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
  }

  showActiveTheme(theme: string, focus: boolean = false): void {
    const themeSwitcher = document.querySelector('#bd-theme') as HTMLElement;
    const themeSwitcherText = document.querySelector('#bd-theme-text') as HTMLElement;
    const activeIcon = themeSwitcher.querySelector('.theme-icon-active') as HTMLElement;
    const btnToActivate = document.querySelector(`[data-bs-theme-value="${theme}"]`) as HTMLElement;

    if (!themeSwitcher || !themeSwitcherText || !activeIcon || !btnToActivate) return;

    // Update active classes and aria-pressed
    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active');
      element.setAttribute('aria-pressed', 'false');
    });

    btnToActivate.classList.add('active');
    btnToActivate.setAttribute('aria-pressed', 'true');

    // Get the icon class from the selected button and apply it to the toggle icon
    const selectedIcon = btnToActivate.querySelector('i')?.className;
    if (selectedIcon) {
      activeIcon.className = selectedIcon + ' theme-icon-active me-2';
    }

    const label = `${themeSwitcherText.textContent} (${theme})`;
    themeSwitcher.setAttribute('aria-label', label);

    if (focus) {
      themeSwitcher.focus();
    }
  }
}

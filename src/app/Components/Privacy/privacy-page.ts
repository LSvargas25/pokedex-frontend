import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** /privacy — pública, fuera del Pokédex. Google OAuth enlaza aquí. */
@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink],
  templateUrl: './privacy-page.html',
  styleUrl: './privacy-page.scss',
})
export class PrivacyPage {
  readonly contactEmail = 'stevenvr2017@gmail.com';
  readonly updated = '6 de octubre de 2026';
}

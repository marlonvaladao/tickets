import { Component } from '@angular/core';
import { SenhasService } from '../services/senhas.service';

@Component({
  selector: 'app-tab-painel',
  templateUrl: './tab-painel.page.html',
  styleUrls: ['./tab-painel.page.scss'],
  standalone: false, // <-- Adicionar isso aqui!
})
export class TabPainelPage {
  constructor(public senhasService: SenhasService) {}
}

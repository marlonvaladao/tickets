import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SenhasService } from '../services/senhas.service';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  constructor(private alertController: AlertController, public senhasService: SenhasService) {}

  async mostrarAlerta() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Marlon Valadão - 01785018',
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  gerarSenha(tipo: string) {
    if (this.senhasService.verificarExpediente()) {
      this.senhasService.novaSenha(tipo);
    } else {
      alert('Fora do horário de atendimento (07h00 às 17h00).');
    }
  }
  
  formatarUltimaSenha(senha: string): string {
    if (!senha) return '';
    const partes = senha.split('-');
    return partes[1] || senha; // Exibe apenas "SP01", "SG01", etc.
  }
  

}

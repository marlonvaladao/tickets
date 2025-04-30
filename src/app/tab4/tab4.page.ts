import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HeaderUninassauComponent } from '../components/header-uninassau/header-uninassau.component';
import { SenhasService } from '../services/senhas.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderUninassauComponent]
})
export class Tab4Page {
  dataInicio: Date = new Date();
  dataFim: Date = new Date();

  constructor(
    private alertController: AlertController,
    public senhasService: SenhasService
  ) {}

  async abrirSelecaoPeriodo() {
    const alertInicio = await this.alertController.create({
      header: 'Selecione a data de início',
      inputs: [{ name: 'dataInicio', type: 'date' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Próximo',
          handler: async (inicioData) => {
            const alertFim = await this.alertController.create({
              header: 'Selecione a data de fim',
              inputs: [{ name: 'dataFim', type: 'date' }],
              buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                  text: 'OK',
                  handler: async (fimData) => {
                    const dataInicio = new Date(inicioData.dataInicio + 'T00:00:00');
                    const dataFim = new Date(fimData.dataFim + 'T23:59:59');

                    const confirmacao = await this.alertController.create({
                      header: 'Confirmar Período',
                      message: `Deseja gerar relatório de ${dataInicio.toLocaleDateString()} até ${dataFim.toLocaleDateString()}?`,
                      buttons: [
                        { text: 'Cancelar', role: 'cancel' },
                        {
                          text: 'Confirmar',
                          handler: () => {
                            this.dataInicio = dataInicio;
                            this.dataFim = dataFim;
                            this.gerarRelatorio();
                          }
                        }
                      ]
                    });

                    await confirmacao.present();
                  }
                }
              ]
            });

            await alertFim.present();
          }
        }
      ]
    });

    await alertInicio.present();
  }

  gerarRelatorio() {
    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);
    fim.setHours(23, 59, 59, 999);

    const registrosFiltrados = this.senhasService.senhasDetalhadas.filter(senha =>
      senha.dataHoraEmissao >= inicio && senha.dataHoraEmissao <= fim
    );

    const temposEspera: { [tipo: string]: number[] } = { SP: [], SE: [], SG: [] };

    registrosFiltrados.forEach(s => {
      if (s.horaChamada && s.dataHoraEmissao) {
        const tempoEspera = (s.horaChamada.getTime() - s.dataHoraEmissao.getTime()) / 1000;
        temposEspera[s.tipoSenha].push(tempoEspera);
      }
    });

    const calcularMedia = (tempos: number[]) =>
      tempos.length > 0
        ? Math.round(tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length)
        : 0;

    const mediaEsperaSP = calcularMedia(temposEspera['SP']);
    const mediaEsperaSE = calcularMedia(temposEspera['SE']);
    const mediaEsperaSG = calcularMedia(temposEspera['SG']);

    const atendidas = registrosFiltrados.filter(r => r.dataHoraAtendimento);

    const calcularTempoMedio = (tipo: string, campo: 'atendimento' | 'espera') => {
      const tempos = atendidas
        .filter(r => r.tipoSenha === tipo && r.dataHoraAtendimento)
        .map(r => {
          const inicio = r.horaChamada?.getTime() ?? r.dataHoraEmissao.getTime();
          const fim = r.dataHoraAtendimento!.getTime();
          return (fim - inicio) / 1000;
        });

      if (tempos.length === 0) return '0 segundos';

      const media = tempos.reduce((acc, val) => acc + val, 0) / tempos.length;

      if (media < 60) return `${Math.round(media)} segundos`;
      const min = Math.floor(media / 60);
      const sec = Math.round(media % 60);
      return `${min}m ${sec}s`;
    };

    let relatorio = `
      <h1>Relatório de Atendimento</h1>
      <p><b>Período:</b> ${inicio.toLocaleDateString()} até ${fim.toLocaleDateString()}</p>
      <p><b>Total de Senhas Emitidas:</b> ${registrosFiltrados.length}</p>
      <p><b>Senhas Atendidas:</b> ${atendidas.length}</p>

      <h2>Senhas emitidas por prioridade</h2>
      <ul>
        <li>Geral (SG): ${registrosFiltrados.filter(r => r.tipoSenha === 'SG').length}</li>
        <li>Prioritária (SP): ${registrosFiltrados.filter(r => r.tipoSenha === 'SP').length}</li>
        <li>Exame (SE): ${registrosFiltrados.filter(r => r.tipoSenha === 'SE').length}</li>
      </ul>

      <h2>Senhas atendidas por prioridade</h2>
      <ul>
        <li>Geral (SG): ${atendidas.filter(r => r.tipoSenha === 'SG').length}</li>
        <li>Prioritária (SP): ${atendidas.filter(r => r.tipoSenha === 'SP').length}</li>
        <li>Exame (SE): ${atendidas.filter(r => r.tipoSenha === 'SE').length}</li>
      </ul>

      <h2>Tempo Médio de Atendimento</h2>
      <ul>
        <li>SP (Prioritária): ${calcularTempoMedio('SP', 'atendimento')}</li>
        <li>SE (Exame): ${calcularTempoMedio('SE', 'atendimento')}</li>
        <li>SG (Geral): ${calcularTempoMedio('SG', 'atendimento')}</li>
      </ul>

      <h2>Tempo Médio de Espera para ser Atendido</h2>
      <ul>
        <li>SP (Prioritária): ${mediaEsperaSP} segundos</li>
        <li>SE (Exame): ${mediaEsperaSE} segundos</li>
        <li>SG (Geral): ${mediaEsperaSG} segundos</li>
      </ul>

      <h2>Detalhamento das Senhas</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Senha</th>
          <th>Tipo</th>
          <th>Data Emissão</th>
          <th>Data Atendimento</th>
          <th>Guichê</th>
        </tr>`;

    registrosFiltrados.forEach(senha => {
      relatorio += `
        <tr>
          <td>${senha.numeroSenha.split('-')[1]}</td>
          <td>${senha.tipoSenha}</td>
          <td>${senha.dataHoraEmissao.toLocaleString()}</td>
          <td>${senha.dataHoraAtendimento ? senha.dataHoraAtendimento.toLocaleString() : ''}</td>
          <td>${senha.guicheAtendimento ?? ''}</td>
        </tr>`;
    });

    relatorio += `</table>`;

    const blob = new Blob([`\uFEFF${relatorio}`], {
      type: 'application/msword;charset=utf-8'
    });

    saveAs(blob, `Relatorio_Atendimentos_${inicio.toLocaleDateString()}_a_${fim.toLocaleDateString()}.doc`);
  }
}

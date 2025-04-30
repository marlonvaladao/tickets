import { Component } from '@angular/core';
import { SenhasService } from '../services/senhas.service';
import { saveAs } from 'file-saver'; // No topo do arquivo, junto com os imports!
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  senhaAtual: string = '';
  dataInicio: Date = new Date();
  dataFim: Date = new Date();



  constructor(public senhasService: SenhasService, private alertController: AlertController) {}


  chamarSenha() {
    if (this.senhasService.atendimentoEmAndamento()) {
      alert('Finalize o atendimento atual antes de chamar uma nova senha.');
      return;
    }
  
    if (!this.senhasService.verificarExpediente()) {
      alert('Fora do horário de atendimento (07h00 às 17h00).');
      return;
    }
  
    const proximaSenha = this.senhasService.chamarProximaSenha();
    if (!proximaSenha) {
      this.senhaAtual = 'Nenhuma senha disponível';
      return;
    }

   


    this.senhaAtual = proximaSenha.split('-')[1];

  
    // 🔊 Monta o texto com base na senha
    const guicheAtual = this.senhasService.guicheAtual;
    const partes = proximaSenha.split('-');
    const tipoSenha = partes[1].substring(0, 2);
    const numeroSequencial = partes[1].substring(2);
    const numeroFormatado = numeroSequencial.split('').join(' ');
  
    let texto = '';
  
    if (tipoSenha === 'SP') {
      texto = `Senha preferencial S P ${numeroFormatado}, guichê ${guicheAtual}`;
    } else if (tipoSenha === 'SE') {
      texto = `Resultado de exame S É ${numeroFormatado}, guichê ${guicheAtual}`;
    } else if (tipoSenha === 'SG') {
      texto = `Senha geral S G ${numeroFormatado}, guichê ${guicheAtual}`;
    }
  
    console.log('🔊 Vai falar:', texto);
  
    // 🔊 TTS fora de promessa, diretamente ligado ao clique
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    const voz = synth.getVoices().find(v => v.lang === 'pt-BR');
    if (voz) utterance.voice = voz;
  
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
  
    synth.cancel();
    synth.speak(utterance);
  }
  
  
  
  
  

  finalizarAtendimento() {
    this.senhasService.finalizarAtendimento();
    this.senhaAtual = '';
  }

  falarSenhaCompleta() {
    const senhaAtual = this.senhaAtual;
    const guicheAtual = this.senhasService.guicheAtual;
  
    if (!senhaAtual || guicheAtual === null) return;
  
    const partes = senhaAtual.split('-');
    if (partes.length < 2) return;
  
    const tipoSenha = partes[1].substring(0, 2);
    const numeroSequencial = partes[1].substring(2);
    const numeroFormatado = numeroSequencial.split('').join(' ');
  
    let texto = '';
  
    if (tipoSenha === 'SP') {
      texto = `Senha preferencial ${numeroFormatado}, guichê ${guicheAtual}`;
    } else if (tipoSenha === 'SE') {
      texto = `Resultado de exame ${numeroFormatado}, guichê ${guicheAtual}`;
    } else if (tipoSenha === 'SG') {
      texto = `Senha geral ${numeroFormatado}, guichê ${guicheAtual}`;
    }
  
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    const voz = synth.getVoices().find(v => v.lang === 'pt-BR');
    if (voz) utterance.voice = voz;
  
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
  
    synth.cancel(); // cancela qualquer voz anterior
    synth.speak(utterance);
  
    console.log('🔊 FALANDO:', texto);
  }
  
  
  
  
  
  
  

  formatarNumero(numero: string): string {
    return numero.split('').join(' ');
  }
  gerarRelatorio() {
    if (!this.dataInicio || !this.dataFim) {
      alert('Por favor, selecione o período inicial e final!');
      return;
    }
  
    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);
    fim.setHours(23, 59, 59, 999); // Garante que o dia final inclua o dia todo
  
    const registrosFiltrados = this.senhasService.senhasDetalhadas.filter(senha => {
      return senha.dataHoraEmissao >= inicio && senha.dataHoraEmissao <= fim;
    });
  
    let relatorio = `
      <h1>Relatório de Atendimento</h1>
      <p><b>Período:</b> ${inicio.toLocaleDateString()} até ${fim.toLocaleDateString()}</p>
      <p><b>Total de Senhas Emitidas:</b> ${registrosFiltrados.length}</p>
      <p><b>Senhas Atendidas:</b> ${registrosFiltrados.filter(r => r.dataHoraAtendimento).length}</p>
  
      <h2>Quantitativo por Tipo</h2>
      <ul>
        <li>Geral (SG): ${registrosFiltrados.filter(r => r.tipoSenha === 'SG').length}</li>
        <li>Prioritária (SP): ${registrosFiltrados.filter(r => r.tipoSenha === 'SP').length}</li>
        <li>Exame (SE): ${registrosFiltrados.filter(r => r.tipoSenha === 'SE').length}</li>
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
  
    const blob = new Blob(
      [`\uFEFF${relatorio}`],
      { type: 'application/msword;charset=utf-8' }
    );
    saveAs(blob, `Relatorio_Atendimentos_${inicio.toLocaleDateString()}_a_${fim.toLocaleDateString()}.doc`);
    
  }
  

  ngOnInit() {
    // Aguarda as vozes serem carregadas de fato
    const synth = window.speechSynthesis;
    const carregarVozes = () => {
      const vozes = synth.getVoices();
      console.log('🔁 Vozes disponíveis:', vozes);
    };
  
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = carregarVozes;
    } else {
      // fallback em caso de não suportar o evento
      setTimeout(carregarVozes, 500);
    }
  }
  
  
  falarDiretoTestando() {
    const texto = 'Senha geral zero um, guichê três';
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    const voz = synth.getVoices().find(v => v.lang === 'pt-BR');
    if (voz) utterance.voice = voz;
  
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
  
    synth.cancel();
    synth.speak(utterance);
  
    console.log('⚡️ FALA DIRETA: ', texto);
  }
  
  
}

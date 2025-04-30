import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SenhasService {
  public inputNovaSenha: string = '';
  public senhasArray: any = { SG: [], SP: [], SE: [] };
  public senhasGeral: number = 0;
  public senhasPrior: number = 0;
  public senhasExame: number = 0;
  public senhasTotal: number = 0;
  public filaPrioritaria: string[] = [];
  public filaGeral: string[] = [];
  public filaExame: string[] = [];
  public ultimasChamadas: { senha: string; guiche: number }[] = [];

  public temposAtendimento: { [tipo: string]: number[] } = { SG: [], SP: [], SE: [] };
  public horaChamadaAtual: Date | null = null;
  public tipoSenhaAtual: string = '';
  public horarioFilaExame: Date[] = [];
  public horarioFilaGeral: Date[] = [];
  public senhasAtendimento: string[] = [];
  public guicheAtual: number | null = null;

  public senhasDetalhadas: {
    numeroSenha: string;
    tipoSenha: string;
    dataHoraEmissao: Date;
    dataHoraAtendimento?: Date;
    guicheAtendimento?: number;
    horaChamada?: Date; // <-- adicione esta linha
  }[] = [];
  

  public senhaAtendimentoAtual: string = '';
  public vezPrioritaria: boolean = true;

  constructor() {
    // Verifica a cada minuto se passou das 17h para limpar filas
    setInterval(() => {
      const agora = new Date();
      const hora = agora.getHours();
      if (
        hora >= 17 &&
        (this.filaGeral.length > 0 || this.filaPrioritaria.length > 0 || this.filaExame.length > 0)
      ) {
        this.descartarSenhasAoEncerrarExpediente();
        console.warn(`⚠️ Fila limpa automaticamente às ${hora}:${agora.getMinutes().toString().padStart(2, '0')}`);
      }
    }, 60000);
  }

  somaGeral() {
    this.senhasGeral++;
    this.senhasTotal++;
  }

  somaPrior() {
    this.senhasPrior++;
    this.senhasTotal++;
  }

  somaExame() {
    this.senhasExame++;
    this.senhasTotal++;
  }

  novaSenha(tipoSenha: string = '') {
    const novaSenhaGerada =
      new Date().getFullYear().toString().substring(2, 4) +
      (new Date().getMonth() + 1).toString().padStart(2, '0') +
      new Date().getDate().toString().padStart(2, '0') +
      '-' +
      tipoSenha +
      (this.senhasArray[tipoSenha].length + 1).toString().padStart(2, '0');

    if (tipoSenha == 'SG') {
      this.somaGeral();
      this.senhasArray.SG.push(novaSenhaGerada);
      this.filaGeral.push(novaSenhaGerada);
      this.horarioFilaGeral.push(new Date());
    } else if (tipoSenha == 'SP') {
      this.somaPrior();
      this.senhasArray.SP.push(novaSenhaGerada);
      this.filaPrioritaria.push(novaSenhaGerada);
    } else if (tipoSenha == 'SE') {
      this.somaExame();
      this.senhasArray.SE.push(novaSenhaGerada);
      this.filaExame.push(novaSenhaGerada);
      this.horarioFilaExame.push(new Date());
    }

    this.senhasDetalhadas.push({
      numeroSenha: novaSenhaGerada,
      tipoSenha: tipoSenha,
      dataHoraEmissao: new Date()
    });

    this.inputNovaSenha = novaSenhaGerada;

    console.log('Fila Prioritária:', this.filaPrioritaria);
    console.log('Fila Geral:', this.filaGeral);
    console.log('Fila Exame:', this.filaExame);
  }

  chamarProximaSenha(): string | null {
    let senhaChamando: string | null = null;

    if (this.filaPrioritaria.length > 0 || this.filaExame.length > 0) {
      if (this.vezPrioritaria && this.filaPrioritaria.length > 0) {
        senhaChamando = this.filaPrioritaria.shift() || null;
      } else if (!this.vezPrioritaria && this.filaExame.length > 0) {
        senhaChamando = this.filaExame.shift() || null;
      } else if (this.filaPrioritaria.length > 0) {
        senhaChamando = this.filaPrioritaria.shift() || null;
      } else if (this.filaExame.length > 0) {
        senhaChamando = this.filaExame.shift() || null;
      }

      this.vezPrioritaria = !this.vezPrioritaria;
    } else if (this.filaGeral.length > 0) {
      senhaChamando = this.filaGeral.shift() || null;
    }

    if (senhaChamando) {
      this.horaChamadaAtual = new Date();
      const partes = senhaChamando.split('-');
      if (partes.length > 1) {
        this.tipoSenhaAtual = partes[1].substring(0, 2);
      }
      this.guicheAtual = Math.floor(Math.random() * 5) + 1;
      this.ultimasChamadas.unshift({
        senha: senhaChamando,
        guiche: this.guicheAtual!
      });

      if (this.ultimasChamadas.length > 5) {
        this.ultimasChamadas.pop();
      }

      this.senhaAtendimentoAtual = senhaChamando;

      // Salvar guichê e hora da chamada no histórico
      const registro = this.senhasDetalhadas.find(s => s.numeroSenha === senhaChamando);
      if (registro) {
      registro.guicheAtendimento = this.guicheAtual!;
      registro.horaChamada = new Date(); // ⏱ marca o horário da chamada
      }


    }

    console.log('Senha chamada:', senhaChamando);
    return senhaChamando;
  }

  verificarExpediente(): boolean {
    const agora = new Date();
    const hora = agora.getHours();
    return hora >= 7 && hora < 17;
  }

  finalizarAtendimento() {
    if (this.horaChamadaAtual && this.tipoSenhaAtual && this.inputNovaSenha) {
      const agora = new Date();
      const tempoAtendimento = (agora.getTime() - this.horaChamadaAtual.getTime()) / 1000;
      this.temposAtendimento[this.tipoSenhaAtual].push(tempoAtendimento);

      const registro = this.senhasDetalhadas.find(s => s.numeroSenha === this.senhaAtendimentoAtual);
      if (registro) {
        registro.dataHoraAtendimento = agora;
        registro.guicheAtendimento = this.guicheAtual!;
      
        if (registro.horaChamada) {
          const tempoAtendimento = (agora.getTime() - registro.horaChamada.getTime()) / 1000;
          this.temposAtendimento[this.tipoSenhaAtual].push(tempoAtendimento);
        }
      }
      

      console.log(`Tempo registrado para ${this.tipoSenhaAtual}: ${tempoAtendimento} segundos`);

      this.horaChamadaAtual = null;
      this.tipoSenhaAtual = '';
    } else {
      console.log('Nenhum atendimento em andamento.');
    }
  }

  calcularTempoMedio(tipoSenha: string): number {
    const tempos = this.temposAtendimento[tipoSenha];
    if (tempos && tempos.length > 0) {
      const soma = tempos.reduce((acc, tempo) => acc + tempo, 0);
      return soma / tempos.length;
    }
    return 0;
  }

  getTotalSenhasEmEspera(): number {
    return this.filaGeral.length + this.filaPrioritaria.length + this.filaExame.length;
  }

  getTotalSenhasEmAtendimento(): number {
    return this.senhasAtendimento.length;
  }

  getSenhasEmEspera(): string[] {
    const filas = [...this.filaPrioritaria, ...this.filaGeral, ...this.filaExame];
  
    // Criar um mapa de horários usando as senhasDetalhadas
    const mapaSenhas: { [numero: string]: Date } = {};
    this.senhasDetalhadas.forEach(senha => {
      if (!senha.dataHoraAtendimento) {
        mapaSenhas[senha.numeroSenha] = senha.dataHoraEmissao;
      }
    });
  
    // Ordenar pelo horário de emissão
    return filas.sort((a, b) => {
      const dataA = mapaSenhas[a] || new Date();
      const dataB = mapaSenhas[b] || new Date();
      return dataA.getTime() - dataB.getTime();
    });
  }
  
  

  getSenhasEmAtendimento(): string[] {
    return this.senhasAtendimento.slice(0, 5);
  }

  formatarTempo(segundos: number): string {
    if (segundos < 60) {
      return `${segundos} segundos`;
    } else if (segundos < 3600) {
      const minutos = Math.floor(segundos / 60);
      const restoSegundos = Math.floor(segundos % 60);
      return `${minutos}m ${restoSegundos}s`;
    } else {
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const restoSegundos = Math.floor(segundos % 60);
      return `${horas}h ${minutos}m ${restoSegundos}s`;
    }
  }

  atendimentoEmAndamento(): boolean {
    return this.horaChamadaAtual !== null;
  }

  descartarSenhasAoEncerrarExpediente() {
    console.warn('Expediente encerrado. Todas as senhas foram descartadas.');

    this.filaGeral = [];
    this.filaPrioritaria = [];
    this.filaExame = [];

    this.horarioFilaGeral = [];
    this.horarioFilaExame = [];

    this.horaChamadaAtual = null;
    this.tipoSenhaAtual = '';
    this.senhaAtendimentoAtual = '';
  }
}

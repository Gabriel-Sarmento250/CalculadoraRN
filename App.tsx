import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Operacao = '+' | '-' | 'x' | '÷' | '^' | null;
type Tema = 'escuro' | 'claro' | 'colorido';

type TemaCores = {
  fundo: string;
  display: string;
  texto: string;
  textoSuave: string;
  botao: string;
  botaoTexto: string;
  operacao: string;
  operacaoTexto: string;
  acao: string;
  acaoTexto: string;
  historico: string;
  historicoTexto: string;
  cabecalho: string;
};

const TEMAS: Record<Tema, TemaCores> = {
  escuro: {
    fundo: '#202020',
    display: '#202020',
    texto: '#ffffff',
    textoSuave: '#aaaaaa',
    botao: '#444444',
    botaoTexto: '#ffffff',
    operacao: '#e58a00',
    operacaoTexto: '#ffffff',
    acao: '#777777',
    acaoTexto: '#ffffff',
    historico: '#2a2a2a',
    historicoTexto: '#bbbbbb',
    cabecalho: '#2a2a2a',
  },
  claro: {
    fundo: '#f2f2f2',
    display: '#f2f2f2',
    texto: '#000000',
    textoSuave: '#666666',
    botao: '#ffffff',
    botaoTexto: '#000000',
    operacao: '#ff9500',
    operacaoTexto: '#ffffff',
    acao: '#d4d4d2',
    acaoTexto: '#000000',
    historico: '#e0e0e0',
    historicoTexto: '#444444',
    cabecalho: '#e0e0e0',
  },
  colorido: {
    fundo: '#1a0033',
    display: '#1a0033',
    texto: '#ffffff',
    textoSuave: '#c9a7ff',
    botao: '#6a0dad',
    botaoTexto: '#ffffff',
    operacao: '#ff2e63',
    operacaoTexto: '#ffffff',
    acao: '#00c9a7',
    acaoTexto: '#ffffff',
    historico: '#2d0052',
    historicoTexto: '#e0c3fc',
    cabecalho: '#2d0052',
  },
};

const LIMITE_CARACTERES = 12;

const NOMES_GRUPO = [
  'Bruno Ferreira de Oliveira',
  'Caio da Silva Costa',
  'Gabriel Sarmento Visconti',
  'Nathan Porto França',
  'Pedro Henrique da Costa Araújo',
  'Vinicius Henrique Garrett Marinho',
];

const TURMA = 'UCS · CST em Análise e Desenvolvimento de Sistemas · 4N1 · 2026/2';

type BotaoProps = {
  texto: string;
  aoPressionar: () => void;
  tipo?: 'numero' | 'operacao' | 'acao';
  duplo?: boolean;
  tema: TemaCores;
};

function Botao({
  texto,
  aoPressionar,
  tipo = 'numero',
  duplo = false,
  tema,
}: BotaoProps) {
  return (
    <Pressable
      onPress={aoPressionar}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: tema.botao },
        tipo === 'operacao' && { backgroundColor: tema.operacao },
        tipo === 'acao' && { backgroundColor: tema.acao },
        duplo && styles.botaoDuplo,
        pressed && styles.botaoPressionado,
      ]}
    >
      <Text
        style={[
          styles.botaoTexto,
          { color: tema.botaoTexto },
          tipo === 'operacao' && { color: tema.operacaoTexto },
          tipo === 'acao' && { color: tema.acaoTexto },
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [valorAnterior, setValorAnterior] = useState<number | null>(null);
  const [operacao, setOperacao] = useState<Operacao>(null);
  const [aguardandoNovoValor, setAguardandoNovoValor] = useState(false);
  const [historico, setHistorico] = useState<string[]>([]);
  const [temaAtual, setTemaAtual] = useState<Tema>('escuro');

  const tema = TEMAS[temaAtual];

  function adicionarHistorico(entrada: string) {
    setHistorico((anterior) => [entrada, ...anterior].slice(0, 5));
  }

  function digitarNumero(numero: string) {
    if (display === 'Erro') {
      setDisplay(numero);
      setAguardandoNovoValor(false);
      return;
    }
    if (aguardandoNovoValor) {
      setDisplay(numero);
      setAguardandoNovoValor(false);
      return;
    }
    if (display.replace('-', '').replace('.', '').length >= LIMITE_CARACTERES) {
      return;
    }
    if (display === '0') {
      setDisplay(numero);
    } else {
      setDisplay(display + numero);
    }
  }

  function digitarDecimal() {
    if (display === 'Erro' || aguardandoNovoValor) {
      setDisplay('0.');
      setAguardandoNovoValor(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }

  function calcular(
    numero1: number,
    numero2: number,
    op: Operacao
  ): number | null {
    switch (op) {
      case '+':
        return numero1 + numero2;
      case '-':
        return numero1 - numero2;
      case 'x':
        return numero1 * numero2;
      case '÷':
        if (numero2 === 0) return null;
        return numero1 / numero2;
      case '^':
        return Math.pow(numero1, numero2);
      default:
        return numero2;
    }
  }

  function formatarResultado(valor: number) {
    if (!isFinite(valor) || isNaN(valor)) return 'Erro';
    if (Number.isInteger(valor)) {
      return String(valor);
    }
    return String(parseFloat(valor.toFixed(10)));
  }

  function selecionarOperacao(novaOperacao: Operacao) {
    if (display === 'Erro') {
      limpar();
      return;
    }

    const valorAtual = Number(display);

    if (valorAnterior === null) {
      setValorAnterior(valorAtual);
    } else if (operacao !== null && !aguardandoNovoValor) {
      const resultado = calcular(valorAnterior, valorAtual, operacao);

      if (resultado === null) {
        setDisplay('Não é possível dividir por zero! 🚫');
        adicionarHistorico('Erro: divisão por zero');
        setValorAnterior(null);
        setOperacao(null);
        return;
      }

      const simbolo = operacao === 'x' ? '×' : operacao;
      adicionarHistorico(
        `${formatarResultado(valorAnterior)} ${simbolo} ${formatarResultado(valorAtual)} = ${formatarResultado(resultado)}`
      );
      setDisplay(formatarResultado(resultado));
      setValorAnterior(resultado);
    }
    setOperacao(novaOperacao);
    setAguardandoNovoValor(true);
  }

  function resultado() {
    if (
      valorAnterior === null ||
      operacao === null ||
      display === 'Erro' ||
      aguardandoNovoValor
    ) {
      return;
    }
    const valorAtual = Number(display);
    const resultadoCalculado = calcular(valorAnterior, valorAtual, operacao);

    if (resultadoCalculado === null) {
      setDisplay('Não é possível dividir por zero! 🚫');
      adicionarHistorico('Erro: divisão por zero');
    } else {
      const simbolo = operacao === 'x' ? '×' : operacao;
      adicionarHistorico(
        `${formatarResultado(valorAnterior)} ${simbolo} ${formatarResultado(valorAtual)} = ${formatarResultado(resultadoCalculado)}`
      );
      setDisplay(formatarResultado(resultadoCalculado));
    }
    setValorAnterior(null);
    setOperacao(null);
    setAguardandoNovoValor(true);
  }

  function limpar() {
    setDisplay('0');
    setValorAnterior(null);
    setOperacao(null);
    setAguardandoNovoValor(false);
  }

  function limparHistorico() {
    setHistorico([]);
  }

  function apagarUltimoDigito() {
    if (display === 'Erro' || aguardandoNovoValor) return;
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }

  function inverterSinal() {
    if (display === 'Erro') return;
    const valor = Number(display);
    setDisplay(formatarResultado(valor * -1));
  }

  function porcentagem() {
    if (display === 'Erro') return;
    const valor = Number(display);
    setDisplay(formatarResultado(valor / 100));
  }

  function raizQuadrada() {
    if (display === 'Erro') return;
    const valor = Number(display);
    if (valor < 0) {
      setDisplay('Não existe raiz de número negativo! ⚠️');
      adicionarHistorico('Erro: raiz de negativo');
      return;
    }
    const resultado = Math.sqrt(valor);
    adicionarHistorico(`√${formatarResultado(valor)} = ${formatarResultado(resultado)}`);
    setDisplay(formatarResultado(resultado));
    setAguardandoNovoValor(true);
  }

  function alternarTema() {
    const ordem: Tema[] = ['escuro', 'claro', 'colorido'];
    const proximo = ordem[(ordem.indexOf(temaAtual) + 1) % ordem.length];
    setTemaAtual(proximo);
  }

  const iconeTema =
    temaAtual === 'escuro' ? '🌙' : temaAtual === 'claro' ? '☀️' : '🎨';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.fundo }]}>
      <View style={[styles.cabecalho, { backgroundColor: tema.cabecalho }]}>
        <View style={styles.cabecalhoInfo}>
          <Text style={[styles.cabecalhoTitulo, { color: tema.texto }]}>
            Grupo 9
          </Text>
          <Text style={[styles.cabecalhoTurma, { color: tema.textoSuave }]}>
            {TURMA}
          </Text>
          {NOMES_GRUPO.map((nome, index) => (
            <Text
              key={index}
              style={[styles.cabecalhoNome, { color: tema.textoSuave }]}
            >
              • {nome}
            </Text>
          ))}
        </View>
        <Pressable
          onPress={alternarTema}
          style={({ pressed }) => [
            styles.botaoTema,
            { backgroundColor: tema.botao },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.iconeTema}>{iconeTema}</Text>
        </Pressable>
      </View>

      <View style={[styles.historico, { backgroundColor: tema.historico }]}>
        <View style={styles.historicoTopo}>
          <Text style={[styles.historicoTitulo, { color: tema.historicoTexto }]}>
            Histórico
          </Text>
          {historico.length > 0 && (
            <Pressable onPress={limparHistorico}>
              <Text style={[styles.limparHistorico, { color: tema.operacao }]}>
                limpar
              </Text>
            </Pressable>
          )}
        </View>
        <ScrollView style={styles.historicoLista}>
          {historico.length === 0 ? (
            <Text style={[styles.historicoVazio, { color: tema.historicoTexto }]}>
              Nenhuma operação ainda...
            </Text>
          ) : (
            historico.map((item, index) => (
              <Text
                key={index}
                style={[styles.historicoItem, { color: tema.historicoTexto }]}
              >
                {item}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.display}>
        <Text
          style={[styles.displayTexto, { color: tema.texto }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {display}
        </Text>
      </View>

      <View style={styles.linha}>
        <Botao texto="C" tipo="acao" aoPressionar={limpar} tema={tema} />
        <Botao texto="⌫" tipo="acao" aoPressionar={apagarUltimoDigito} tema={tema} />
        <Botao texto="√" tipo="acao" aoPressionar={raizQuadrada} tema={tema} />
        <Botao
          texto="÷"
          tipo="operacao"
          aoPressionar={() => selecionarOperacao('÷')}
          tema={tema}
        />
      </View>

      <View style={styles.linha}>
        <Botao texto="7" aoPressionar={() => digitarNumero('7')} tema={tema} />
        <Botao texto="8" aoPressionar={() => digitarNumero('8')} tema={tema} />
        <Botao texto="9" aoPressionar={() => digitarNumero('9')} tema={tema} />
        <Botao
          texto="x"
          tipo="operacao"
          aoPressionar={() => selecionarOperacao('x')}
          tema={tema}
        />
      </View>

      <View style={styles.linha}>
        <Botao texto="4" aoPressionar={() => digitarNumero('4')} tema={tema} />
        <Botao texto="5" aoPressionar={() => digitarNumero('5')} tema={tema} />
        <Botao texto="6" aoPressionar={() => digitarNumero('6')} tema={tema} />
        <Botao
          texto="-"
          tipo="operacao"
          aoPressionar={() => selecionarOperacao('-')}
          tema={tema}
        />
      </View>

      <View style={styles.linha}>
        <Botao texto="1" aoPressionar={() => digitarNumero('1')} tema={tema} />
        <Botao texto="2" aoPressionar={() => digitarNumero('2')} tema={tema} />
        <Botao texto="3" aoPressionar={() => digitarNumero('3')} tema={tema} />
        <Botao
          texto="+"
          tipo="operacao"
          aoPressionar={() => selecionarOperacao('+')}
          tema={tema}
        />
      </View>

      <View style={styles.linha}>
        <Botao texto="0" duplo aoPressionar={() => digitarNumero('0')} tema={tema} />
        <Botao texto="." aoPressionar={digitarDecimal} tema={tema} />
        <Botao
          texto="^"
          tipo="operacao"
          aoPressionar={() => selecionarOperacao('^')}
          tema={tema}
        />
        <Botao texto="=" tipo="operacao" aoPressionar={resultado} tema={tema} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 8,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  cabecalhoInfo: {
    flex: 1,
    paddingRight: 8,
  },
  cabecalhoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cabecalhoTurma: {
    fontSize: 10,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  cabecalhoNome: {
    fontSize: 11,
    marginBottom: 1,
  },
  botaoTema: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconeTema: {
    fontSize: 20,
  },
  historico: {
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 6,
    marginBottom: 8,
    maxHeight: 110,
  },
  historicoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historicoTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  limparHistorico: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  historicoLista: {
    maxHeight: 70,
  },
  historicoVazio: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  historicoItem: {
    fontSize: 13,
    marginBottom: 2,
  },
  display: {
    minHeight: 100,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  displayTexto: {
    fontSize: 52,
    fontWeight: '300',
    textAlign: 'right',
  },
  linha: {
    flexDirection: 'row',
    width: '100%',
  },
  botao: {
    flex: 1,
    height: 68,
    margin: 4,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDuplo: {
    flex: 2.08,
    alignItems: 'flex-start',
    paddingLeft: 28,
  },
  botaoPressionado: {
    opacity: 0.6,
  },
  botaoTexto: {
    fontSize: 26,
    fontWeight: '500',
  },
});
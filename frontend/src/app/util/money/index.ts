export const converterEmBigDecimal = (value: string): number => {
  if (!value) {
    return 0;
  }

  // Remover o símbolo "R$" e espaços, separadores de milhar (pontos), e substituir a vírgula por ponto
  const cleanedValue = value.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
  
  const numericValue = parseFloat(cleanedValue);
  return isNaN(numericValue) ? 0 : numericValue;
};

export const formatReal = (valor: any) => {
  // Se o valor for um número, converta para string usando toLocaleString
  if (typeof valor === 'number') {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Para strings, continua o comportamento existente
  const cleanedValue = valor.replace(/\D/g, '');

  if (cleanedValue.length === 0) {
    return '0,00';
  }

  const integerPart = cleanedValue.slice(0, -2);
  const decimalPart = cleanedValue.slice(-2);

  // Formatação correta do valor
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedIntegerPart},${decimalPart}`;
};

/**
 * Função para formatar um valor numérico para o formato de moeda brasileiro (R$)
 * com duas casas decimais.
 * 
 * @param value O valor em string ou número a ser formatado
 * @returns A string formatada como moeda brasileira
 */
export function formatCurrencyBRL(value: string | number): string {
  const rawValue = typeof value === 'number' 
    ? value.toFixed(2).replace('.', '') 
    : value.replace(/\D/g, ''); // Remove todos os caracteres que não são números

  const intValue = parseFloat(rawValue) / 100; // Transforma em valor decimal
  return intValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Função para converter o valor monetário formatado de volta para número
 * @param value String no formato R$ para converter em número
 * @returns O valor numérico como float
 */
export function parseCurrencyBRL(value: string): number {
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.'));
}



export const converterEmBigDecimal = (value: any): number => {
  if (!value || isNaN(value)) {
    return 0;
  }

  // Se o valor for numérico, retornamos diretamente como número
  if (typeof value === 'number') {
    return parseFloat(value.toFixed(2));
  }

  // Remover apenas os pontos e substituir a vírgula por ponto
  const cleanedValue = value.replace(/\./g, "").replace(",", ".");

  // Converter para número com até duas casas decimais
  return parseFloat(cleanedValue);
};


export const formatReal = (valor: any): string => {
  // Se for um número, garantimos que tem duas casas decimais
  if (typeof valor === "number") {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Para outros tipos, como strings, tentamos fazer a formatação adequada
  const numericValue = parseFloat(valor.replace(",", "."));
  if (isNaN(numericValue)) {
    return "R$ 0,00"; // Retorno padrão para valores inválidos
  }

  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CurrencyInput - Input de valor monetário com suporte a internacionalização
 *
 * Características principais:
 * - Suporte a PT-BR (vírgula decimal) e EN-US (ponto decimal)
 * - Sempre normaliza para number no formato internacional internamente
 * - Formata exibição conforme locale
 * - Limita a 2 casas decimais
 * - Permite apenas números e um único separador decimal
 */

export type CurrencyInputLocale = "pt-BR" | "en-US";

export interface CurrencyInputProps {
  /** Valor numérico (sempre no formato internacional: 1234.56) */
  value: number;
  /** Locale para formatação e input ('pt-BR' usa vírgula, 'en-US' usa ponto) */
  locale: CurrencyInputLocale;
  /** Callback chamado com o valor numérico normalizado */
  onChange: (value: number) => void;
  /** Classes CSS adicionais */
  className?: string;
  /** Desabilitar o input */
  disabled?: boolean;
  /** ID do input para associação com labels */
  id?: string;
  /** Nome do campo para formulários */
  name?: string;
}

/**
 * Obtém o separador decimal baseado no locale
 */
const getDecimalSeparator = (locale: CurrencyInputLocale): string => {
  return locale === "pt-BR" ? "," : ".";
};

/**
 * Obtém o placeholder formatado conforme o locale
 */
const getPlaceholder = (locale: CurrencyInputLocale): string => {
  return locale === "pt-BR" ? "0,00" : "0.00";
};

/**
 * Formata um número para exibição conforme o locale
 * Usa Intl.NumberFormat para garantir formatação correta
 */
const formatValueForDisplay = (
  value: number,
  locale: CurrencyInputLocale
): string => {
  // Retorna string vazia para zero (permite campo vazio)
  if (value === 0) return "";

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, // Separador de milhares
  }).format(value);
};

/**
 * Normaliza o valor de entrada para número no formato internacional
 * Converte separador decimal do locale para ponto
 */
const normalizeToNumber = (
  rawValue: string,
  locale: CurrencyInputLocale
): number => {
  if (!rawValue || rawValue.trim() === "") return 0;

  const decimalSep = getDecimalSeparator(locale);
  const thousandSep = locale === "pt-BR" ? "." : ",";

  // Remove separadores de milhar
  let cleaned = rawValue.replace(new RegExp(`\\${thousandSep}`, "g"), "");

  // Substitui separador decimal do locale por ponto (formato internacional)
  cleaned = cleaned.replace(decimalSep, ".");

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Sanitiza a entrada do usuário permitindo apenas números e um separador decimal
 * Limita a 2 casas decimais
 */
const sanitizeInput = (
  rawValue: string,
  locale: CurrencyInputLocale
): string => {
  const decimalSep = getDecimalSeparator(locale);
  const thousandSep = locale === "pt-BR" ? "." : ",";

  // Remove separadores de milhar primeiro (usuário pode ter colado um valor formatado)
  let cleaned = rawValue.replace(new RegExp(`\\${thousandSep}`, "g"), "");

  // Define regex para caracteres permitidos (números e separador decimal do locale)
  const allowedCharsRegex = locale === "pt-BR" ? /[^\d,]/g : /[^\d.]/g;

  // Remove caracteres não permitidos
  let sanitized = cleaned.replace(allowedCharsRegex, "");

  // Garante apenas um separador decimal
  const parts = sanitized.split(decimalSep);
  if (parts.length > 2) {
    sanitized = parts[0] + decimalSep + parts.slice(1).join("");
  }

  // Limita a 2 casas decimais
  if (parts.length === 2 && parts[1].length > 2) {
    sanitized = parts[0] + decimalSep + parts[1].slice(0, 2);
  }

  return sanitized;
};

/**
 * Formata o valor com separadores de milhares durante a digitação
 * Mantém o separador decimal e as casas decimais intactas
 */
const formatWithThousandSeparators = (
  rawValue: string,
  locale: CurrencyInputLocale
): string => {
  if (!rawValue) return "";

  const decimalSep = getDecimalSeparator(locale);
  const thousandSep = locale === "pt-BR" ? "." : ",";

  // Separa parte inteira e decimal
  const parts = rawValue.split(decimalSep);
  let integerPart = parts[0] || "";
  const decimalPart = parts[1];

  // Remove zeros à esquerda (exceto se for apenas "0")
  integerPart = integerPart.replace(/^0+(?=\d)/, "");
  if (integerPart === "") integerPart = "0";

  // Adiciona separadores de milhares na parte inteira
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandSep
  );

  // Reconstrói o valor com a parte decimal se existir
  if (decimalPart !== undefined) {
    return formattedInteger + decimalSep + decimalPart;
  }

  return formattedInteger;
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    { value, locale, onChange, className, disabled, id, name, ...props },
    ref
  ) => {
    // Ref para o input para manipular cursor
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combina ref externo com interno
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Estado local para controlar o valor durante digitação
    const [displayValue, setDisplayValue] = React.useState<string>("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Sincroniza valor externo com display quando não está em foco
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatValueForDisplay(value, locale));
      }
    }, [value, locale, isFocused]);

    /**
     * Handler de mudança: sanitiza input, formata com milhares e propaga valor normalizado
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const cursorPosition = e.target.selectionStart || 0;

      // Sanitiza a entrada
      const sanitized = sanitizeInput(rawValue, locale);

      // Formata com separadores de milhares
      const formatted = formatWithThousandSeparators(sanitized, locale);

      // Calcula a nova posição do cursor considerando os separadores adicionados
      const thousandSep = locale === "pt-BR" ? "." : ",";
      const oldSeparatorCount = (
        rawValue
          .slice(0, cursorPosition)
          .match(new RegExp(`\\${thousandSep}`, "g")) || []
      ).length;
      const newSeparatorCount = (
        formatted
          .slice(0, cursorPosition + (formatted.length - rawValue.length))
          .match(new RegExp(`\\${thousandSep}`, "g")) || []
      ).length;
      const cursorAdjustment = newSeparatorCount - oldSeparatorCount;

      setDisplayValue(formatted);

      // Normaliza e propaga para o callback
      const numericValue = normalizeToNumber(sanitized, locale);
      onChange(numericValue);

      // Restaura a posição do cursor após a renderização
      requestAnimationFrame(() => {
        if (inputRef.current) {
          const newCursorPos = Math.max(0, cursorPosition + cursorAdjustment);
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    };

    /**
     * Handler de foco: mantém formatação com milhares para edição
     */
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Mantém a formatação atual com milhares
      if (value > 0 && !displayValue) {
        setDisplayValue(formatValueForDisplay(value, locale));
      }
      // Seleciona todo o conteúdo para facilitar edição
      e.target.select();
    };

    /**
     * Handler de blur: formata valor para exibição
     */
    const handleBlur = () => {
      setIsFocused(false);
      // Formata para exibição completa (com separadores de milhar)
      setDisplayValue(formatValueForDisplay(value, locale));
    };

    /**
     * Handler de keydown: previne entrada de caracteres inválidos
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const decimalSep = getDecimalSeparator(locale);

      // Permite: backspace, delete, tab, escape, enter, setas
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];

      if (allowedKeys.includes(e.key)) return;

      // Permite Ctrl/Cmd + A, C, V, X
      if (
        (e.ctrlKey || e.metaKey) &&
        ["a", "c", "v", "x"].includes(e.key.toLowerCase())
      ) {
        return;
      }

      // Permite números
      if (/^\d$/.test(e.key)) return;

      // Permite separador decimal (apenas um)
      if (e.key === decimalSep && !displayValue.includes(decimalSep)) {
        return;
      }

      // Bloqueia qualquer outra tecla
      e.preventDefault();
    };

    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        id={id}
        name={name}
        disabled={disabled}
        placeholder={getPlaceholder(locale)}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          // Estilos base do input (compatível com shadcn/ui)
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          // Alinhamento à direita para valores monetários
          "text-right",
          className
        )}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

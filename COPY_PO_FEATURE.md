# Fluxo de Criação de PO com Opção de Cópia

## Visão Geral

O sistema agora permite criar uma nova PO de duas formas:

1. **Criar nova PO** - Formulário vazio, preenchimento do zero
2. **Criar PO a partir de cópia** - Copiar dados de uma PO existente

## Componentes Criados

### POCreationModeDialog

- **Localização**: `src/components/po/POCreationModeDialog.tsx`
- **Função**: Modal inicial que permite escolher o modo de criação
- **Opções**:
  - Criar nova PO
  - Criar PO a partir de cópia

### POSelectorDialog

- **Localização**: `src/components/po/POSelectorDialog.tsx`
- **Função**: Modal de seleção de PO para copiar
- **Recursos**:
  - Busca por número da PO, beneficiário, fornecedor ou status
  - Listagem filtrada de POs
  - Preview dos dados principais da PO

## Fluxo de Uso

1. **Usuário acessa criação de PO**
   - Route: `/pos/new?type=produtos_servicos`
2. **Modal de seleção de modo**

   - Exibe duas opções claras
   - Sem botão de fechar (decisão obrigatória)

3. **Se escolher "Criar nova PO"**

   - Formulário carrega vazio
   - Fluxo padrão

4. **Se escolher "Criar PO a partir de cópia"**
   - Abre modal de seleção de PO
   - Permite busca e filtro
   - Ao selecionar:
     - Carrega dados no formulário
     - Remove campos sensíveis
     - Permite edição antes de salvar

## Regras de Cópia

### Campos Copiados

- Tipo da PO (`typeOfPO`, `subtypeOfPO`)
- Beneficiário (`beneficiaryId`)
- Fornecedor (`supplierId`)
- Natureza da despesa (`expenseNatureId`)
- Moeda (`currencyId`)
- Valor total (`totalValue`)
- Gross Up (`hasGrossUp`)
- Aprovação IC (`isIcApproved`)
- Forma de pagamento (`paymentTerms`, `installmentCount`)
- Janela de pagamento (`paymentWindowDays`, `isOutsidePaymentWindow`)
- Observações (`notes`)
- Rateios (`allocations`)

### Campos NÃO Copiados (Resetados)

- ID da PO → vazio
- Número externo → vazio
- Status → sempre "rascunho"
- Etapa → sempre "rascunho"
- Datas → nova data de criação/atualização
- Histórico de aprovações → limpo
- Logs e auditorias → não copiados

## Traduções Adicionadas

### Português

```typescript
"newPO.selectCreationMode": "Como deseja criar esta PO?"
"newPO.createNewPO": "Criar nova PO"
"newPO.createFromCopy": "Criar PO a partir de cópia"
"newPO.selectPOToCopy": "Selecione a PO para copiar"
"newPO.searchPO": "Buscar por número, beneficiário, fornecedor ou status..."
"newPO.copyFrom": "Cópia de"
```

### Inglês

```typescript
"newPO.selectCreationMode": "How would you like to create this PO?"
"newPO.createNewPO": "Create new PO"
"newPO.createFromCopy": "Create PO from copy"
"newPO.selectPOToCopy": "Select PO to copy"
"newPO.searchPO": "Search by number, beneficiary, supplier or status..."
"newPO.copyFrom": "Copy from"
```

## Arquivos Modificados

1. **src/pages/POs/NewPO.tsx**

   - Adicionado estado para controle dos modais
   - Lógica de cópia de PO
   - Integração com novos componentes

2. **src/contexts/LanguageContext.tsx**
   - Adicionadas traduções PT e EN

## Arquivos Criados

1. **src/components/po/POCreationModeDialog.tsx**
2. **src/components/po/POSelectorDialog.tsx**

## Próximos Passos (Opcionais)

- [ ] Adicionar filtros avançados no seletor de PO (período, valor)
- [ ] Implementar preview detalhado antes da cópia
- [ ] Adicionar histórico de POs copiadas
- [ ] Permitir edição parcial durante a seleção

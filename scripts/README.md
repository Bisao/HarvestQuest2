# Scripts Directory

Este diretório contém scripts utilitários para manutenção e validação do sistema Coletor Adventures.

## 📁 Estrutura Organizacional

```
scripts/
├── core/                    # Utilitários base reutilizáveis
│   ├── migration-utils.ts   # Funções para migração de dados
│   └── validation-utils.ts  # Funções para validação de sistema
├── migrate-uuids.ts        # Script principal de migração UUID
├── validate-system.ts      # Script unificado de validação
├── uuid-migration.ts       # [LEGADO] Script original de migração
├── validate-ids.ts         # [LEGADO] Script original de validação
├── validate-skill-ids.ts   # [LEGADO] Validação específica de skills
└── README.md               # Esta documentação
```

## 🚀 Scripts Principais (Modernizados)

### `migrate-uuids.ts` - Migração UUID Consolidada
```bash
# Migrar todos os IDs para formato UUID
npx tsx scripts/migrate-uuids.ts
```

**Funcionalidades:**
- ✅ Verificação de pré-requisitos
- ✅ Backup automático antes da migração
- ✅ Detecção inteligente de tipos de ID
- ✅ Validação de integridade pós-migração
- ✅ Relatórios detalhados
- ✅ Verificação se migração já foi executada

### `validate-system.ts` - Validação Completa
```bash
# Validação básica
npx tsx scripts/validate-system.ts

# Validação detalhada com relatório
npx tsx scripts/validate-system.ts --detailed

# Validação com tentativa de correção automática
npx tsx scripts/validate-system.ts --fix-errors
```

**Funcionalidades:**
- ✅ Validação do sistema mestre de IDs
- ✅ Verificação de formatos UUID por categoria
- ✅ Detecção de duplicatas
- ✅ Validação de integridade dos dados do jogo
- ✅ Testes de amostra automáticos
- ✅ Relatórios formatados e exportáveis

## 📦 Módulos Core

### `core/migration-utils.ts`
Utilitários reutilizáveis para scripts de migração:
- Geração de UUIDs com prefixo
- Sistema de backup automático
- Migração recursiva de objetos
- Validação de integridade
- Geração de relatórios

### `core/validation-utils.ts`
Utilitários reutilizáveis para validação:
- Padrões de validação por categoria
- Verificação de duplicatas
- Suítes de teste consolidadas
- Validação de estrutura de dados
- Relatórios formatados

## 📚 Scripts Legados (Compatibilidade)

Os scripts originais foram mantidos para compatibilidade, mas **recomenda-se usar os scripts modernizados**:

- `uuid-migration.ts` → Use `migrate-uuids.ts`
- `validate-ids.ts` + `validate-skill-ids.ts` → Use `validate-system.ts`

## 🔧 Melhorias Implementadas

### ✅ Correções de Dependências
- Criados utilitários ausentes em `shared/utils/`
- Resolvidas importações quebradas
- Padronização de interfaces

### ✅ Consolidação e Modularidade
- Scripts unificados para funcionalidades relacionadas
- Utilitários base reutilizáveis em `core/`
- Redução de duplicação de código

### ✅ Robustez e Segurança
- Verificações de pré-requisitos
- Backups automáticos
- Validação de integridade
- Tratamento de erros aprimorado

### ✅ Usabilidade
- Argumentos de linha de comando
- Relatórios detalhados opcionais
- Mensagens de progresso claras
- Documentação integrada

## 🎯 Próximos Passos Recomendados

1. **Testar scripts modernizados** em ambiente de desenvolvimento
2. **Migrar para scripts consolidados** nos workflows de CI/CD
3. **Remover scripts legados** após período de transição
4. **Adicionar testes automatizados** para os utilitários core

## 📖 Uso em Produção

```bash
# Fluxo recomendado para manutenção:

# 1. Validar sistema antes de mudanças
npx tsx scripts/validate-system.ts --detailed

# 2. Executar migração se necessário
npx tsx scripts/migrate-uuids.ts

# 3. Revalidar após mudanças
npx tsx scripts/validate-system.ts

# 4. Verificar logs e relatórios gerados
ls -la *.json *.txt *.backup-*
```

---

**Nota:** Todos os scripts foram otimizados para o ambiente TypeScript/ESM do projeto e seguem as convenções estabelecidas no `replit.md`.
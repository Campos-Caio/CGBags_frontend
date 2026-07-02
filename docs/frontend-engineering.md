# Frontend Engineering Guidelines
Version: 1.0
Project: CG Bags
Status: Official

---

# 1. Objetivo

Este documento define as diretrizes oficiais de engenharia para o desenvolvimento do frontend da CG Bags.

Ele complementa o documento:

frontend/docs/storefront-architecture.md

Enquanto o documento de arquitetura descreve como o Storefront deve funcionar, este documento descreve como o código deve ser pensado, estruturado e implementado.

Toda implementação deverá seguir estas diretrizes.

Em caso de conflito entre implementações e este documento, este documento possui prioridade.

---

# 2. Papel do Desenvolvedor

Considere que você é o Frontend Tech Lead responsável pelo projeto.

Sua responsabilidade não é apenas implementar funcionalidades.

Sua principal responsabilidade é preservar a arquitetura do projeto.

Toda decisão deve priorizar:

- simplicidade;
- legibilidade;
- escalabilidade;
- reutilização;
- manutenção.

O código produzido deverá ser adequado para um projeto profissional mantido durante muitos anos.

---

# 3. Stack Oficial

A stack oficial do projeto é composta por:

Framework

- Next.js 16 (App Router)

Linguagem

- TypeScript

UI

- React 19

Estilização

- Tailwind CSS v4

Componentes

- shadcn/ui

HTTP

- Axios

Ícones

- Lucide React

Notificações

- Sonner

Datas

- date-fns

Nenhuma biblioteca adicional deverá ser adicionada sem justificativa técnica.

---

# 4. Filosofia de Desenvolvimento

Toda implementação deverá seguir os seguintes princípios.

## Simplicidade

Sempre escolher a solução mais simples.

Não implementar funcionalidades futuras.

Não antecipar abstrações.

Não realizar overengineering.

---

## Responsabilidade Única

Cada componente possui apenas uma responsabilidade.

Cada Service possui apenas uma responsabilidade.

Cada arquivo possui um único propósito.

---

## Componentização

Toda interface deverá ser construída através de componentes reutilizáveis.

Nunca duplicar código.

Sempre reutilizar componentes existentes.

---

## Separação de Camadas

Fluxo obrigatório:

Page

↓

Components

↓

Services

↓

Axios

↓

FastAPI

↓

Database

Nunca quebrar esse fluxo.

---

# 5. Responsabilidades

## Pages

Responsáveis por:

- buscar dados;
- organizar componentes;
- controlar composição da página.

Nunca:

- estilizar componentes complexos;
- acessar Axios diretamente;
- conter regras de negócio.

---

## Components

Responsáveis apenas pela interface.

Devem receber dados através de props.

Nunca conhecer endpoints.

Nunca realizar chamadas HTTP.

Nunca acessar Services.

---

## Services

Responsáveis por:

- consumir a API;
- transformar respostas quando necessário;
- centralizar comunicação HTTP.

Nunca conter lógica de interface.

---

## Axios

Toda comunicação deverá passar por:

src/lib/api.ts

Nunca utilizar axios diretamente em qualquer outro local.

---

# 6. Regras Arquiteturais

Nunca:

- acessar banco diretamente;
- acessar FastAPI fora dos Services;
- duplicar componentes;
- criar estilos repetidos;
- colocar regras de negócio na interface.

Sempre:

- reutilizar componentes;
- reutilizar Services;
- reutilizar tipos.

---

# 7. Organização do Projeto

Estrutura oficial:

src/

app/

components/

services/

types/

lib/

utils/

assets/

constants/

Qualquer nova pasta deverá possuir justificativa.

---

# 8. Convenções

Componentes

PascalCase

Exemplo:

ProductCard.tsx

---

Services

camelCase

Exemplo:

product.service.ts

---

Tipos

PascalCase

Exemplo:

Product

Category

Order

---

Arquivos

Utilizar nomes claros.

Evitar abreviações.

---

# 9. Qualidade

Antes de concluir qualquer implementação verificar:

Existe duplicação?

Existe componente muito grande?

Existe regra de negócio na UI?

Existe chamada HTTP fora do Service?

Existe componente reutilizável que poderia ser utilizado?

Existe código morto?

Existe dependência desnecessária?

---

# 10. Tratamento de Erros

Sempre apresentar mensagens amigáveis.

Nunca exibir mensagens internas da API.

Nunca exibir stack trace.

Toda comunicação HTTP deverá ser tratada.

---

# 11. Estilo Visual

Toda implementação deverá respeitar:

frontend/docs/storefront-architecture.md

Nunca modificar a identidade visual sem necessidade.

---

# 12. Performance

Sempre priorizar:

- Server Components quando possível;
- Componentes pequenos;
- Lazy Loading quando necessário;
- next/image;
- metadata correta.

Evitar JavaScript desnecessário.

---

# 13. Acessibilidade

Sempre utilizar:

- HTML semântico;
- alt em imagens;
- aria-label quando necessário;
- contraste adequado;
- navegação por teclado.

---

# 14. SEO

Sempre configurar:

- metadata;
- title;
- description;
- heading hierarchy;
- imagens otimizadas.

---

# 15. Antes de Implementar

Sempre:

1. Ler storefront-architecture.md

2. Entender a arquitetura existente.

3. Reutilizar componentes.

4. Verificar Services existentes.

5. Confirmar que a implementação segue a stack oficial.

---

# 16. Processo de Implementação

Para cada Sprint seguir obrigatoriamente:

1. Ler a documentação.

2. Analisar a arquitetura existente.

3. Planejar os arquivos.

4. Identificar componentes reutilizáveis.

5. Implementar.

6. Revisar arquitetura.

7. Revisar código.

8. Executar lint.

9. Executar typecheck.

10. Validar critérios de aceite.

---

# 17. Restrições

Nunca implementar funcionalidades fora da Sprint.

Nunca adicionar bibliotecas sem aprovação.

Nunca alterar arquitetura existente sem justificativa.

Nunca remover componentes reutilizáveis.

Nunca antecipar funcionalidades futuras.

---

# 18. Processo de Decisão

Caso exista dúvida arquitetural:

Não implementar imediatamente.

Primeiro apresentar:

- problema;
- opções;
- vantagens;
- desvantagens;
- recomendação.

Somente após aprovação realizar alterações arquiteturais.

---

# 19. Checklist Final

Antes de concluir qualquer implementação responder:

✓ A arquitetura foi preservada?

✓ Existe baixo acoplamento?

✓ Existe alta reutilização?

✓ O código está simples?

✓ Os componentes possuem responsabilidade única?

✓ Toda comunicação passa pelos Services?

✓ Os Services utilizam somente api.ts?

✓ A implementação segue storefront-architecture.md?

✓ Existe alguma oportunidade de simplificação?

Somente após todas as respostas serem positivas a implementação poderá ser considerada concluída.

---

# 20. Filosofia Final

A CG Bags não busca apenas um frontend funcional.

Busca um frontend profissional.

Toda implementação deverá ser pensada para facilitar manutenção, evolução e reutilização.

Sempre que houver dúvida entre uma solução rápida e uma solução arquiteturalmente correta, optar pela segunda.

A simplicidade é uma característica da arquitetura, não uma limitação técnica.
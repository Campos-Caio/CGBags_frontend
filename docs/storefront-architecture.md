# Storefront Architecture

| | |
|---|---|
| **Versão** | 1.0 |
| **Projeto** | CG Bags |
| **Status** | Approved |

## Sumário

1. [Objetivo](#1-objetivo)
2. [Público-Alvo](#2-público-alvo)
3. [Filosofia da Aplicação](#3-filosofia-da-aplicação)
4. [Filosofia de Desenvolvimento](#4-filosofia-de-desenvolvimento)
5. [Estrutura Geral da Home](#5-estrutura-geral-da-home)
6. [Seções da Home](#6-seções-da-home)
7. [Footer](#7-footer)
8. [Navegação](#8-navegação)
9. [Identidade Visual](#9-identidade-visual)
10. [Paleta de Cores](#10-paleta-de-cores)
11. [Tipografia](#11-tipografia)
12. [Componentes Obrigatórios](#12-componentes-obrigatórios)
13. [Responsividade](#13-responsividade)
14. [Comunicação com Backend](#14-comunicação-com-backend)
15. [Organização do Código](#15-organização-do-código)
16. [Convenções de Código](#16-convenções-de-código)
17. [Tratamento de Erros](#17-tratamento-de-erros)
18. [Objetivos de UX](#18-objetivos-de-ux)
19. [Fora do Escopo (v1)](#19-fora-do-escopo-v1)
20. [Critérios de Aceite](#20-critérios-de-aceite)
21. [Visão de Longo Prazo](#21-visão-de-longo-prazo)

---

## 1. Objetivo

O Storefront é a aplicação pública da CG Bags.

Seu principal objetivo não é apenas vender produtos, mas construir credibilidade para uma empresa em crescimento, fortalecendo sua marca e apresentando seus produtos de forma profissional.

Diferente de grandes marketplaces ou grandes varejistas, a CG Bags possui um catálogo reduzido e um público específico ligado ao agronegócio.

Portanto, o site deverá priorizar:

- construção de confiança;
- fortalecimento da marca;
- apresentação dos produtos;
- experiência de navegação simples;
- conversão natural para compra.

A venda deve ser consequência da experiência, e não o único objetivo da interface.

---

## 2. Público-Alvo

O principal público da CG Bags é composto por pessoas ligadas ao agronegócio.

Exemplos:

- produtores rurais;
- pecuaristas;
- fazendas;
- empresas agrícolas;
- trabalhadores rurais;
- clientes que buscam produtos resistentes para uso diário.

Todos os elementos visuais devem transmitir robustez, confiabilidade e qualidade.

---

## 3. Filosofia da Aplicação

O Storefront deverá transmitir:

- simplicidade;
- confiança;
- profissionalismo;
- proximidade;
- qualidade;
- durabilidade.

O usuário nunca deve sentir que está em um marketplace. Ele deve sentir que está visitando o site oficial do fabricante.

A marca sempre deve ser protagonista. Os produtos são consequência da marca.

---

## 4. Filosofia de Desenvolvimento

Toda implementação deverá seguir os princípios abaixo.

### 4.1 Simplicidade

Sempre optar pela solução mais simples. Evitar componentes desnecessariamente complexos.

### 4.2 Componentização

Toda interface deve ser construída através de componentes reutilizáveis. Nunca duplicar código.

### 4.3 Responsabilidade Única

Cada componente deverá possuir apenas uma responsabilidade.

Exemplo: a `Navbar` é responsável apenas pela navegação. Nunca deve buscar dados da API nem possuir regras de negócio.

### 4.4 Separação de Responsabilidades

A UI nunca deverá conter regras de negócio.

**Fluxo obrigatório:** Page → Components → Services → Axios → FastAPI

### 4.5 Design Consistente

Todas as páginas devem seguir o mesmo padrão visual. Não criar estilos específicos para cada página quando um componente reutilizável puder resolver o problema.

---

## 5. Estrutura Geral da Home

A Home será composta pelas seguintes seções, nesta ordem obrigatória:

1. Navbar
2. Hero
3. Feito para quem vive o Agro
4. Nossos Produtos
5. Por que escolher a CG Bags
6. Footer

---

## 6. Seções da Home

### 6.1 Hero

**Objetivo:** apresentar imediatamente a identidade da marca.

Conteúdo esperado:

- imagem principal de alta qualidade;
- slogan;
- pequena descrição;
- botão principal (ex.: "Conheça nossos produtos" ou "Ver catálogo").

Não utilizar:

- banners promocionais;
- descontos;
- contagem regressiva;
- popups.

### 6.2 Feito para Quem Vive o Agro

**Objetivo:** apresentar a essência da empresa. Esta seção substitui o tradicional "Quem Somos".

Ela deverá mostrar:

- conexão com o agronegócio;
- compromisso com qualidade;
- propósito da empresa;
- proximidade com o cliente.

A comunicação deve ser emocional. O visitante deve sentir que a empresa conhece sua realidade.

### 6.3 Nossos Produtos

**Objetivo:** apresentar o catálogo principal.

Cada card deverá conter:

- imagem;
- nome;
- descrição curta;
- preço;
- botão "Ver detalhes".

Não utilizar grids enormes — a Home apresentará apenas os principais produtos. O catálogo completo ficará em `/products`.

### 6.4 Por Que Escolher a CG Bags

**Objetivo:** apresentar os diferenciais da empresa.

Exemplos:

- fabricação nacional;
- materiais resistentes;
- produtos desenvolvidos para o agro;
- pagamento seguro;
- entrega para todo Brasil;
- atendimento personalizado.

Utilizar ícones simples. Máximo de 6 diferenciais.

---

## 7. Footer

O rodapé deverá conter:

- Empresa
- Contato
- WhatsApp
- Email
- Instagram
- Facebook
- Política de Privacidade
- Termos de Uso
- Direitos Autorais

---

## 8. Navegação

Navbar fixa, com os itens:

- Home
- Produtos
- Contato
- Carrinho
- Entrar

Nunca utilizar menus extremamente grandes. A navegação deve ser simples.

---

## 9. Identidade Visual

A identidade visual deverá transmitir:

- robustez;
- simplicidade;
- elegância;
- confiança.

Diretrizes:

- evitar excesso de cores;
- utilizar bastante espaço em branco;
- valorizar fotografias reais;
- evitar excesso de elementos decorativos.

---

## 10. Paleta de Cores

Inicialmente utilizar a identidade visual existente da empresa.

As cores deverão ser centralizadas no tema do projeto. Nunca utilizar cores diretamente nos componentes.

---

## 11. Tipografia

Utilizar apenas uma família tipográfica. Priorizar legibilidade. Evitar excesso de tamanhos diferentes.

Hierarquia clara: Título → Subtítulo → Texto.

---

## 12. Componentes Obrigatórios

- Navbar
- Hero
- Section
- Container
- Button
- Card
- ProductCard
- Footer

Todos deverão ser reutilizáveis.

---

## 13. Responsividade

- Desktop é prioridade.
- Tablet deverá possuir layout adaptado.
- Mobile deverá manter todas as funcionalidades.

Nunca esconder funcionalidades importantes apenas no mobile.

---

## 14. Comunicação com Backend

Toda comunicação ocorrerá através da API FastAPI.

**Fluxo obrigatório:** Storefront → Services → Axios → FastAPI → PostgreSQL

Nunca acessar banco diretamente. Nunca colocar URLs da API dentro dos componentes.

---

## 15. Organização do Código

A estrutura deverá seguir:

```
src/
├── app/
├── components/
├── services/
├── types/
├── lib/
├── utils/
└── assets/
```

Cada pasta possui responsabilidade única.

---

## 16. Convenções de Código

| Camada | Responsabilidade | Restrições |
|---|---|---|
| **Pages** | Organizar componentes | Não devem realizar chamadas HTTP diretamente |
| **Components** | Interface | Não devem conhecer endpoints |
| **Services** | Consumir a API | Toda chamada HTTP deverá passar pelos Services |
| **Axios** | Cliente HTTP centralizado em `src/lib/api.ts` | Nunca utilizar axios diretamente em componentes |

---

## 17. Tratamento de Erros

Toda comunicação com a API deverá tratar os status:

- 401
- 403
- 404
- 422
- 500

As mensagens deverão ser amigáveis ao usuário. Nunca exibir mensagens técnicas da API.

---

## 18. Objetivos de UX

Ao acessar a Home, o visitante deverá responder rapidamente às seguintes perguntas, nesta ordem:

1. Quem é a CG Bags?
2. O que ela vende?
3. Por que confiar na empresa?
4. Como visualizar os produtos?

Se essas quatro perguntas forem respondidas naturalmente durante a navegação, o objetivo da Home terá sido atingido.

---

## 19. Fora do Escopo (v1)

Nesta primeira versão não implementar:

- blog;
- avaliações;
- favoritos;
- lista de desejos;
- comparador;
- cupons;
- recomendações;
- chat;
- banners promocionais;
- popups.

Essas funcionalidades poderão ser adicionadas futuramente.

---

## 20. Critérios de Aceite

A Home deverá:

- [ ] transmitir confiança;
- [ ] representar a identidade da CG Bags;
- [ ] apresentar os produtos de forma clara;
- [ ] possuir navegação simples;
- [ ] ser totalmente responsiva;
- [ ] utilizar componentes reutilizáveis;
- [ ] seguir rigorosamente a arquitetura do projeto;
- [ ] consumir exclusivamente a API FastAPI.

---

## 21. Visão de Longo Prazo

O Storefront deverá crescer mantendo a mesma filosofia.

Novas funcionalidades deverão ser adicionadas sem alterar a arquitetura definida neste documento. Toda implementação futura deverá respeitar esta especificação.

Este documento é considerado a referência oficial para o desenvolvimento do Storefront da CG Bags.

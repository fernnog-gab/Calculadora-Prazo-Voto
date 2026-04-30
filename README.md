# 🗓️ Calculadora de Prazos em Dias Úteis (Premium Edition)

Esta é uma aplicação web de alta performance e interface luxuosa, desenvolvida para resolver a complexidade do cálculo de prazos no calendário brasileiro, desconsiderando automaticamente finais de semana e feriados nacionais.

## 1. Contexto da Função da Página
A necessidade desta ferramenta nasce de uma lacuna crítica no planejamento administrativo, jurídico e comercial brasileiro. No Brasil, a contagem de "Dias Úteis" é a norma para o vencimento de boletos, prazos processuais (CPC/2015), entregas logísticas e contratos de prestação de serviço.

**O Desafio:**
O cálculo manual desses prazos é extremamente suscetível a erros humanos por três motivos principais:
1.  **Feriados Móveis:** Diferente de datas fixas, feriados como Carnaval, Sexta-feira Santa e Corpus Christi mudam todos os anos, pois dependem do cálculo do Domingo de Páscoa (Computus).
2.  **Variabilidade de Fim de Semana:** Um prazo de "10 dias úteis" pode levar de 12 a 16 dias corridos, dependendo do dia da semana em que a contagem se inicia e da incidência de feriados no intervalo.
3.  **Impacto Financeiro e Jurídico:** Um erro de apenas um dia na contagem de um prazo pode resultar em multas contratuais, perda de prazos em tribunais ou atrasos em cadeias de suprimentos.

**A Solução Proposta:**
Esta página foi desenvolvida para oferecer uma resposta instantânea e visualmente autoritária. O contexto de uso é focado no profissional que precisa de precisão sem abrir mão da estética. Através de um algoritmo que mapeia os feriados nacionais brasileiros e ignora sábados e domingos, a aplicação entrega a data final exata, detalhando ao usuário quais feriados foram encontrados no caminho para garantir transparência total no cálculo.

---

## 2. Características Principais
* **Design Premium Dark Gold:** Interface inspirada em aplicações financeiras de alto padrão, utilizando contrastes de dourado e grafite.
* **Mobile-First:** Layout totalmente responsivo, otimizado para o toque em dispositivos móveis e leitura rápida em desktops.
* **Cálculo Preciso:** Algoritmo que contempla feriados fixos e móveis (atualizado para 2026 e 2027).
* **Privacidade Total:** Os cálculos são feitos localmente no navegador do usuário (Client-side). Nenhum dado é enviado para servidores.
* **PWA Ready:** Estrutura preparada para ser instalada como um aplicativo no celular.

---

## 3. Estrutura do Projeto
Para o correto funcionamento do sistema visual e do favicon, a estrutura de pastas no seu repositório deve ser:

```text
/
├── index.html          # Código principal (HTML, CSS e JS)
└── imagens/            # Pasta contendo os ícones do sistema
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── android-chrome-192x192.png
    └── android-chrome-512x512.png
```

---

## 4. Tecnologias Utilizadas
* **HTML5 Semântico:** Para melhor acessibilidade e SEO.
* **CSS3 Moderno:** Uso de Variáveis Globais (CSS Variables) para facilitar a manutenção de cores e animações de entrada (`keyframes`).
* **JavaScript (ES6+):** Lógica de manipulação de datas utilizando o objeto `Date` com tratamento de fuso horário local para evitar erros de data retroativa.

---

## 5. Como Implementar
1.  **Repositório:** Suba os arquivos para um repositório no GitHub.
2.  **Favicons:** Certifique-se de que os arquivos de imagem estão dentro da pasta `/imagens`.
3.  **GitHub Pages:**
    * Vá em **Settings** > **Pages**.
    * Em **Branch**, selecione `main` e a pasta `/ (root)`.
    * Clique em **Save**.
4.  **Acesso:** Em instantes, sua calculadora estará online no endereço `https://seu-usuario.github.io/nome-do-repositorio/`.

---

## 6. Notas de Atualização (Release 1.1)
* **Correção de Fuso Horário:** Ajustada a lógica de checagem de feriados para usar o tempo local do navegador, eliminando o bug que adiantava datas após as 21h.
* **Data de Corpus Christi:** Corrigida a data móvel de 2026 para o dia 04/06.
* **Suporte a Favicon:** Implementada a estrutura de ícones múltiplos para compatibilidade com iOS e Android.

---
**Desenvolvido com foco em precisão e elegância.**

// ==========================================
// 1. TEMA CLARO/ESCURO (LOCALSTORAGE GARANTIDO)
// ==========================================
const themeBtn = document.getElementById('themeToggleBtn');
const body = document.body;

// Função centralizada para aplicar e gravar o tema
function applyTheme(themeName) {
    if (themeName === 'ceratocone') {
        body.classList.add('theme-ceratocone');
    } else {
        body.classList.remove('theme-ceratocone');
    }
    localStorage.setItem('themePreference', themeName);
}

// Inicialização segura atrelada ao ciclo de vida do DOM
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('themePreference') || 'default';
    applyTheme(savedTheme);
});

// Evento de clique para alternância fluida
themeBtn.addEventListener('click', () => {
    const newTheme = body.classList.contains('theme-ceratocone') ? 'default' : 'ceratocone';
    applyTheme(newTheme);
});


// ==========================================
// 2. RETROATIVIDADE (-1 a -5 DIAS) COM MEMÓRIA
// ==========================================
let currentOffset = 0;
const savedOffset = localStorage.getItem('prazoOffsetPreference');

function applyOffset(offsetValue) {
    currentOffset = parseInt(offsetValue, 10);
    document.querySelectorAll('.offset-btn').forEach(btn => {
        const isActive = parseInt(btn.getAttribute('data-offset'), 10) === currentOffset;
        btn.classList.toggle('active', isActive);
    });
}

// Aplica se houver salvo
if (savedOffset !== null) applyOffset(savedOffset);

// Escuta os cliques
document.querySelectorAll('.offset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const newOffset = e.target.getAttribute('data-offset');
        applyOffset(newOffset);
        localStorage.setItem('prazoOffsetPreference', newOffset); 
        document.getElementById('resultCard').classList.remove('active');
    });
});


// ==========================================
// 3. EVENTOS DE INPUT — CAMPOS MANUAIS
// Reescrito integralmente: IDs fictoInput/realInput substituem
// o antigo daysInput; sem listeners duplicados.
// ==========================================
['fictoInput', 'realInput'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.getElementById('resultCard').classList.remove('active');
    });
    document.getElementById(id).addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculateDates(null, null, true);
    });
});


// ==========================================
// 4. DICIONÁRIO E MATEMÁTICA DE DATAS
// ==========================================
function checkHoliday(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;
    const monthDay = `${mm}-${dd}`;

    const fixedHolidays = {
        '01-01': 'Confraternização Universal', '04-21': 'Tiradentes', '05-01': 'Dia do Trabalho',
        '09-07': 'Independência do Brasil', '10-12': 'N. Sra. Aparecida', '11-02': 'Finados',
        '11-15': 'Proclamação da República', '11-20': 'Dia da Consciência Negra', '12-25': 'Natal'
    };

    const mobileHolidays = {
        '2026-02-16': 'Carnaval', '2026-02-17': 'Carnaval', '2026-04-03': 'Paixão de Cristo', '2026-06-04': 'Corpus Christi', 
        '2027-02-08': 'Carnaval', '2027-02-09': 'Carnaval', '2027-03-26': 'Paixão de Cristo', '2027-05-27': 'Corpus Christi'
    };

    if (mobileHolidays[dateString]) return mobileHolidays[dateString];
    if (fixedHolidays[monthDay]) return fixedHolidays[monthDay];
    return null;
}

function formatDate(dateObj) {
    return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Avança N dias úteis a partir de uma data-base.
 * @param {Date}   startDate  - Data inicial (clonada internamente; não sofre mutação).
 * @param {number} daysToAdd  - Quantidade de dias úteis a adicionar.
 * @returns {{ finalDate: string, skippedHolidays: Array<{date: string, name: string}> }}
 */
function addBusinessDays(startDate, daysToAdd) {
    // Clona para não mutar o objeto original recebido como parâmetro
    let current    = new Date(startDate);
    let addedDays  = 0;
    let skipped    = [];

    while (addedDays < daysToAdd) {
        current.setDate(current.getDate() + 1);
        const dayOfWeek   = current.getDay();
        const isWeekend   = (dayOfWeek === 0 || dayOfWeek === 6);
        const holidayName = checkHoliday(current);

        if (isWeekend)    continue;
        if (holidayName)  { skipped.push({ date: formatDate(current), name: holidayName }); continue; }
        addedDays++;
    }

    return { finalDate: formatDate(current), skippedHolidays: skipped };
}

/**
 * Ponto de entrada principal. Calcula e exibe os prazos ficto e real.
 * @param {number|null} fictoDays  - Dias úteis do prazo ficto (null = modo manual).
 * @param {number|null} realDays   - Dias úteis do prazo real  (null = não exibir bloco real).
 * @param {boolean}     isManual   - Se verdadeiro, lê os valores dos campos manuais.
 */
function calculateDates(fictoDays, realDays, isManual = false) {
    let fDays = fictoDays;
    let rDays = realDays;

    if (isManual) {
        const fictoVal = parseInt(document.getElementById('fictoInput').value, 10);
        const realVal  = parseInt(document.getElementById('realInput').value,  10);

        if (isNaN(fictoVal) || fictoVal <= 0) {
            alert('Informe ao menos o Prazo Ficto com um número válido de dias úteis.');
            return;
        }

        fDays = fictoVal;
        // Campo real é opcional no modo manual
        rDays = (!isNaN(realVal) && realVal > 0) ? realVal : null;
    }

    // Data-base: hoje, retroagida conforme o seletor de offset
    let baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    if (currentOffset > 0) baseDate.setDate(baseDate.getDate() - currentOffset);

    const baseDateFormatted = formatDate(baseDate);

    // --- Cálculo do Prazo Ficto ---
    const resultFicto = addBusinessDays(baseDate, fDays);
    document.getElementById('fictoDisplay').innerText = resultFicto.finalDate;

    // --- Cálculo do Prazo Real (opcional) ---
    const boxReal    = document.getElementById('boxReal');
    const dualGrid   = document.getElementById('dualResults');
    let allHolidays  = [...resultFicto.skippedHolidays];

    if (rDays !== null) {
        const resultReal = addBusinessDays(baseDate, rDays);
        document.getElementById('realDisplay').innerText = resultReal.finalDate;
        boxReal.style.display  = '';
        dualGrid.classList.remove('single-result');

        // Mescla feriados sem duplicar datas já presentes no período ficto
        const fictoDateSet = new Set(resultFicto.skippedHolidays.map(h => h.date));
        resultReal.skippedHolidays.forEach(h => {
            if (!fictoDateSet.has(h.date)) allHolidays.push(h);
        });
    } else {
        boxReal.style.display = 'none';
        dualGrid.classList.add('single-result');
    }

    // --- Informação de Início ---
    document.getElementById('calculationInfo').innerText = currentOffset === 0
        ? `Contagem iniciada a partir de hoje (${baseDateFormatted})`
        : `Contagem iniciada ${currentOffset} dia(s) atrás (${baseDateFormatted})`;

    // --- Renderização dos Feriados ---
    const holidaysSection = document.getElementById('holidaysSection');
    const holidaysList    = document.getElementById('holidaysList');
    holidaysList.innerHTML = '';

    if (allHolidays.length > 0) {
        allHolidays.forEach(holiday => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${holiday.name}</span>
                            <span class="date">${holiday.date}</span>`;
            holidaysList.appendChild(li);
        });
        holidaysSection.style.display = 'block';
    } else {
        holidaysSection.style.display = 'none';
    }

    // --- Animação do Card de Resultado ---
    // requestAnimationFrame duplo garante que o browser completou
    // um ciclo de renderização antes de reativar a animação CSS.
    const resultCard = document.getElementById('resultCard');
    resultCard.classList.remove('active');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            resultCard.classList.add('active');
        });
    });
}


// ==========================================
// 5. PAINEL DE CITAÇÕES INSPIRACIONAIS (COM FADE E DUPLO CLIQUE)
// ==========================================
const inspirationalQuotes = [
    { text: "Você foi criado com um propósito tão grande que não pode se dar ao luxo de viver uma vida pequena.", author: "Rick Warren" },
    { text: "O único lugar onde o sucesso vem antes do trabalho é no dicionário.", author: "Vidal Sassoon" },
    { text: "Tudo o que você sempre quis está do outro lado do medo.", author: "George Addair" },
    { text: "A sua vida tem um propósito. Você não está aqui por acaso.", author: "Joel Osteen" },
    { text: "Grandes coisas nunca vêm de zonas de conforto.", author: "Neil Strauss" }
];

const quotePanel = document.getElementById('quotePanel');

// Função que sorteia e aplica o efeito visual (Fade Out e Fade In)
function updateQuote() {
    // Esconde suavemente a frase atual
    quotePanel.style.opacity = '0';
    
    // Aguarda meio segundo para trocar o texto enquanto está invisível
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
        const selectedQuote = inspirationalQuotes[randomIndex];
        quotePanel.innerHTML = `"${selectedQuote.text}" <span class="quote-author">— ${selectedQuote.author}</span>`;
        
        // Acende suavemente a nova frase (0.6 para manter elegante e não ofuscar a tela)
        quotePanel.style.opacity = '0.6';
    }, 400); 
}

// Quando o site carrega pela primeira vez
document.addEventListener('DOMContentLoaded', () => {
    // Aguarda meio segundo após a tela abrir antes de revelar a frase inicial
    setTimeout(updateQuote, 500); 
});

// "Easter Egg" / UX: Muda a frase ao dar duplo clique no painel
quotePanel.addEventListener('dblclick', updateQuote);

// ==========================================
// 6. ÁREA DE TRANSFERÊNCIA (COPY TO CLIPBOARD)
// ==========================================
const boxFictoEl = document.getElementById('boxFicto');
const boxRealEl = document.getElementById('boxReal');

// Função cirúrgica para copiar e dar feedback visual sutil
async function copyToClipboard(element, textToCopy, originalLabelElement) {
    try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Feedback visual: altera temporariamente o texto da label para "COPIADO!"
        const originalText = originalLabelElement.innerText;
        originalLabelElement.innerText = "COPIADO!";
        originalLabelElement.style.color = "var(--gold-primary)";
        originalLabelElement.style.fontWeight = "bold";
        
        // Retorna ao estado original após 1.5 segundos
        setTimeout(() => {
            originalLabelElement.innerText = originalText;
            originalLabelElement.style.color = ""; 
            originalLabelElement.style.fontWeight = "";
        }, 1500);
    } catch (err) {
        console.error('Falha ao copiar para a área de transferência: ', err);
        alert('Não foi possível copiar a data. Verifique as permissões do navegador.');
    }
}

// Evento: Cópia do Prazo Ficto (Apenas a data)
boxFictoEl.addEventListener('click', () => {
    const dateText = document.getElementById('fictoDisplay').innerText;
    if (dateText === '--/--/----') return; // Evita ação se não houver cálculo
    
    const labelEl = boxFictoEl.querySelector('.result-box-label');
    copyToClipboard(boxFictoEl, dateText, labelEl);
});

// Evento: Cópia do Prazo Real (Prefixo em caixa alta + Data)
boxRealEl.addEventListener('click', () => {
    const dateText = document.getElementById('realDisplay').innerText;
    if (dateText === '--/--/----') return; // Evita ação se não houver cálculo
    
    const labelEl = boxRealEl.querySelector('.result-box-label');
    const textToCopy = `PRAZO FINAL: ${dateText}`;
    copyToClipboard(boxRealEl, textToCopy, labelEl);
});

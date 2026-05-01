// ==========================================
// 1. TEMA CLARO/ESCURO (LOCALSTORAGE)
// ==========================================
const themeBtn = document.getElementById('themeToggleBtn');
const body = document.body;

// Verifica preferência ao carregar
const currentTheme = localStorage.getItem('themePreference');
if (currentTheme === 'ceratocone') body.classList.add('theme-ceratocone');

// Alterna tema
themeBtn.addEventListener('click', () => {
    body.classList.toggle('theme-ceratocone');
    localStorage.setItem('themePreference', body.classList.contains('theme-ceratocone') ? 'ceratocone' : 'default');
});


// ==========================================
// 2. RETROATIVIDADE (-1 a -5 DIAS) COM MEMÓRIA
// ==========================================
let currentOffset = 0;
const savedOffset = localStorage.getItem('prazoOffsetPreference');

function applyOffset(offsetValue) {
    currentOffset = parseInt(offsetValue, 10);
    document.querySelectorAll('.offset-btn').forEach(btn => {
        if (parseInt(btn.getAttribute('data-offset'), 10) === currentOffset) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
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
// 3. EVENTOS DE INPUT
// ==========================================
document.getElementById('daysInput').addEventListener('input', () => {
    document.getElementById('resultCard').classList.remove('active');
});
document.getElementById('daysInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateDate();
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

function calculateDate(shortcutDays = null) {
    let daysToAdd = shortcutDays !== null ? shortcutDays : parseInt(document.getElementById('daysInput').value, 10);
    if (shortcutDays !== null) document.getElementById('daysInput').value = shortcutDays;
    
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
        alert('Por favor, insira um número válido de dias úteis.');
        return;
    }

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 
    if (currentOffset > 0) currentDate.setDate(currentDate.getDate() - currentOffset);
    
    const startDateFormatted = formatDate(currentDate);
    let addedDays = 0, skippedHolidays = [];

    while (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay(); 
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const holidayName = checkHoliday(currentDate);

        if (isWeekend) continue; 
        if (holidayName) {
            skippedHolidays.push({ date: formatDate(currentDate), name: holidayName });
            continue; 
        }
        addedDays++;
    }

    document.getElementById('finalDateDisplay').innerText = formatDate(currentDate);
    document.getElementById('calculationInfo').innerText = currentOffset === 0 
        ? `Contagem iniciada a partir de hoje (${startDateFormatted})`
        : `Contagem iniciada ${currentOffset} dia(s) atrás (${startDateFormatted})`;
    
    const holidaysSection = document.getElementById('holidaysSection');
    const holidaysList = document.getElementById('holidaysList');
    holidaysList.innerHTML = '';

    if (skippedHolidays.length > 0) {
        skippedHolidays.forEach(holiday => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${holiday.name}</span> <span class="date">${holiday.date}</span>`;
            holidaysList.appendChild(li);
        });
        holidaysSection.style.display = 'block';
    } else {
        holidaysSection.style.display = 'none';
    }

    document.getElementById('resultCard').classList.add('active');
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
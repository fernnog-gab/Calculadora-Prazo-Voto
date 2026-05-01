// --- LÓGICA DO TEMA (LOCALSTORAGE) ---
const themeBtn = document.getElementById('themeToggleBtn');
const body = document.body;

// Verifica preferência de tema ao carregar
const currentTheme = localStorage.getItem('themePreference');
if (currentTheme === 'ceratocone') {
    body.classList.add('theme-ceratocone');
}

// Alterna o tema e salva a preferência
themeBtn.addEventListener('click', () => {
    body.classList.toggle('theme-ceratocone');
    if (body.classList.contains('theme-ceratocone')) {
        localStorage.setItem('themePreference', 'ceratocone');
    } else {
        localStorage.setItem('themePreference', 'default');
    }
});

// Oculta resultado ao digitar novo número manualmente
document.getElementById('daysInput').addEventListener('input', function() {
    document.getElementById('resultCard').classList.remove('active');
});

// Executa o cálculo manual ao apertar Enter
document.getElementById('daysInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculateDate();
});


// --- LÓGICA DE RETROATIVIDADE COM PERSISTÊNCIA ---
let currentOffset = 0;

// 1. Verifica se o usuário já tem uma preferência de data retroativa salva no navegador
const savedOffset = localStorage.getItem('prazoOffsetPreference');

// Função centralizada para atualizar a variável matemática e o visual dos botões
function applyOffset(offsetValue) {
    currentOffset = parseInt(offsetValue, 10);
    
    // Varre todos os botões para ligar o correto e desligar os demais
    document.querySelectorAll('.offset-btn').forEach(btn => {
        if (parseInt(btn.getAttribute('data-offset'), 10) === currentOffset) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 2. Se houver um valor salvo da sessão anterior, aplica assim que a página carregar
if (savedOffset !== null) {
    applyOffset(savedOffset);
}

// 3. Ouve os cliques dos usuários para mudar a seleção e salvar a nova escolha
document.querySelectorAll('.offset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const newOffset = e.target.getAttribute('data-offset');
        
        applyOffset(newOffset); // Atualiza a Interface e a variável de cálculo
        
        // Salva a nova preferência na memória do navegador
        localStorage.setItem('prazoOffsetPreference', newOffset); 
        
        // Oculta o resultado anterior para evitar confusão visual no usuário
        document.getElementById('resultCard').classList.remove('active');
    });
});


// --- DICIONÁRIO DE FERIADOS ---
function checkHoliday(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    
    const dateString = `${yyyy}-${mm}-${dd}`;
    const monthDay = `${mm}-${dd}`;

    // Feriados Nacionais Fixos
    const fixedHolidays = {
        '01-01': 'Confraternização Universal',
        '04-21': 'Tiradentes',
        '05-01': 'Dia do Trabalho',
        '09-07': 'Independência do Brasil',
        '10-12': 'N. Sra. Aparecida',
        '11-02': 'Finados',
        '11-15': 'Proclamação da República',
        '11-20': 'Dia da Consciência Negra',
        '12-25': 'Natal'
    };

    // Feriados Nacionais Móveis mapeados (2026 e 2027)
    const mobileHolidays = {
        '2026-02-16': 'Carnaval', 
        '2026-02-17': 'Carnaval', 
        '2026-04-03': 'Paixão de Cristo', 
        '2026-06-04': 'Corpus Christi', 
        '2027-02-08': 'Carnaval', 
        '2027-02-09': 'Carnaval', 
        '2027-03-26': 'Paixão de Cristo', 
        '2027-05-27': 'Corpus Christi'
    };

    if (mobileHolidays[dateString]) return mobileHolidays[dateString];
    if (fixedHolidays[monthDay]) return fixedHolidays[monthDay];
    
    return null;
}

// Formatador de exibição (pt-BR)
function formatDate(dateObj) {
    return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


// --- LÓGICA PRINCIPAL DE CÁLCULO DE PRAZOS ---
function calculateDate(shortcutDays = null) {
    let daysToAdd;

    // Define a origem do cálculo (se foi clique no atalho ou digitação manual)
    if (shortcutDays !== null) {
        daysToAdd = shortcutDays;
        document.getElementById('daysInput').value = shortcutDays; // Preenche o input visualmente
    } else {
        daysToAdd = parseInt(document.getElementById('daysInput').value, 10);
    }
    
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
        alert('Por favor, insira um número válido de dias úteis.');
        return;
    }

    // Inicializa a data atual zerando as horas para evitar fuso de madrugada
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 
    
    // Aplica a regra de retroatividade baseada na seleção persistida (-1 a -5 dias)
    if (currentOffset > 0) {
        currentDate.setDate(currentDate.getDate() - currentOffset);
    }
    
    const startDateFormatted = formatDate(currentDate);
    let addedDays = 0;
    let skippedHolidays = [];

    // Algoritmo de contagem de dias úteis
    while (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
        
        const dayOfWeek = currentDate.getDay(); 
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const holidayName = checkHoliday(currentDate);

        if (isWeekend) {
            continue; 
        }
        
        if (holidayName) {
            skippedHolidays.push({ date: formatDate(currentDate), name: holidayName });
            continue; 
        }

        addedDays++;
    }

    // Renderização dos resultados na UI
    const resultCard = document.getElementById('resultCard');
    document.getElementById('finalDateDisplay').innerText = formatDate(currentDate);
    
    // Constrói o texto explicativo de retroatividade dinamicamente
    let infoText = currentOffset === 0 
        ? `Contagem iniciada a partir de hoje (${startDateFormatted})`
        : `Contagem iniciada ${currentOffset} dia(s) atrás (${startDateFormatted})`;
    
    document.getElementById('calculationInfo').innerText = infoText;
    
    // Popula a lista de feriados desconsiderados no meio do caminho
    const holidaysSection = document.getElementById('holidaysSection');
    const holidaysList = document.getElementById('holidaysList');
    holidaysList.innerHTML = ''; // Limpa resultados anteriores

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

    // Exibe o card final com animação
    resultCard.classList.add('active');
}
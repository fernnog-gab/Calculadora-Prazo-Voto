// --- LÓGICA DO TEMA (LOCALSTORAGE) ---
const themeBtn = document.getElementById('themeToggleBtn');
const body = document.body;

const currentTheme = localStorage.getItem('themePreference');
if (currentTheme === 'ceratocone') {
    body.classList.add('theme-ceratocone');
}

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

// --- LÓGICA DE RETROATIVIDADE (NOVO) ---
let currentOffset = 0;

document.querySelectorAll('.offset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.offset-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentOffset = parseInt(e.target.getAttribute('data-offset'), 10);
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

// --- LÓGICA PRINCIPAL DE CÁLCULO (ATUALIZADA) ---
function calculateDate(shortcutDays = null) {
    let daysToAdd;

    if (shortcutDays !== null) {
        daysToAdd = shortcutDays;
        document.getElementById('daysInput').value = shortcutDays;
    } else {
        daysToAdd = parseInt(document.getElementById('daysInput').value, 10);
    }
    
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
        alert('Por favor, insira um número válido de dias úteis.');
        return;
    }

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 
    
    // Aplica a regra de retroatividade
    if (currentOffset > 0) {
        currentDate.setDate(currentDate.getDate() - currentOffset);
    }
    
    const startDateFormatted = formatDate(currentDate);
    let addedDays = 0;
    let skippedHolidays = [];

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

    // Renderização dos resultados na UI
    const resultCard = document.getElementById('resultCard');
    document.getElementById('finalDateDisplay').innerText = formatDate(currentDate);
    
    let infoText = currentOffset === 0 
        ? `Contagem iniciada a partir de hoje (${startDateFormatted})`
        : `Contagem iniciada ${currentOffset} dia(s) atrás (${startDateFormatted})`;
    
    document.getElementById('calculationInfo').innerText = infoText;
    
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

    resultCard.classList.add('active');
}

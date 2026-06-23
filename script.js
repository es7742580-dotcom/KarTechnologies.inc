const tg = window.Telegram.WebApp;
tg.expand();

// Переключение между вкладками Науки и КБ
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    if(tabName === 'research') {
        document.getElementById('research-tab').classList.add('active');
        event.currentTarget.classList.add('active');
    } else {
        document.getElementById('constructor-tab').classList.add('active');
        event.currentTarget.classList.add('active');
        calculateNavalWeight(); // Пересчитываем вес при переходе в КБ
    }
}

// Логика изучения технологии прямо внутри интерфейса
function buyTech(techId) {
    // В будущем тут будет fetch-запрос к боту для списания очков. Сейчас делаем локально:
    const btn = document.getElementById(`btn-${techId}`);
    btn.className = "btn-research opened";
    btn.innerText = "✓ Открыто";
    btn.disabled = true;

    // Магия: Разблокируем деталь в выпадающем списке Конструктора!
    const option = document.getElementById(`opt-${techId}`);
    option.disabled = false;
    option.innerText = option.innerText.replace("❌ [НЕ ИЗУЧЕНО]", "🔥 [ДОСТУПНО]");
    
    // Если открыли пушку 305мм — разблокируем цепочку для брони (пример дерева)
    if(techId === 'gun_305') {
        const armorBtn = document.getElementById('btn-armor_harvey');
        armorBtn.className = "btn-research";
        armorBtn.innerText = "Изучить";
        armorBtn.disabled = false;
    }
}

// Подсчет водоизмещения корабля
function calculateNavalWeight() {
    const hullLimit = parseFloat(document.getElementById('hull').value);
    const mainGun = parseFloat(document.getElementById('main-gun').value);
    const secGun = parseFloat(document.getElementById('sec-gun').value);
    const armor = parseFloat(document.getElementById('armor').value);
    const engine = parseFloat(document.getElementById('engine').value);
    
    // Суммируем массу всех узлов флота
    const totalWeight = mainGun + secGun + armor + engine;
    const statusDiv = document.getElementById('weight-status');
    const btn = document.getElementById('send-ship-btn');

    if (totalWeight > hullLimit) {
        statusDiv.className = "status error";
        statusDiv.innerText = `⚠️ ПЕРЕВЕС! Масса: ${totalWeight} т / Предел корпуса: ${hullLimit} т`;
        btn.disabled = true;
        btn.style.opacity = 0.5;
    } else {
        statusDiv.className = "status success";
        statusDiv.innerText = `✓ Вес в норме: ${totalWeight} т / Доступно: ${hullLimit} т`;
        btn.disabled = false;
        btn.style.opacity = 1;
    }
}

// Отправка готового проекта в бота
function sendShipData() {
    const name = document.getElementById('ship-name').value;
    if(!name) return alert("Дайте имя боевому кораблю!");

    const data = {
        name: name,
        hull: document.getElementById('hull').options[document.getElementById('hull').selectedIndex].text,
        main_gun: document.getElementById('main-gun').options[document.getElementById('main-gun').selectedIndex].text,
        sec_gun: document.getElementById('sec-gun').options[document.getElementById('sec-gun').selectedIndex].text,
        armor: document.getElementById('armor').options[document.getElementById('armor').selectedIndex].text
    };

    tg.sendData(JSON.stringify(data));
    tg.close();
}

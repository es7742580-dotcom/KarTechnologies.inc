const tg = window.Telegram.WebApp;
tg.expand();

// 1. БАЗА ДАННЫХ ТЕХНОЛОГИЙ (Тут ты сможешь добавлять свои 15 штук в каждую ветку!)
const db = {
    // КОРЕНЬ (Основа всего)
    "root_steam": { id: "root_steam", name: "Паровой флот", branch: "root", type: "base", parentId: null, cost: 0, 
        desc: "Фундамент военного флота. Позволяет строить паровые корабли.", stats: "Открывает доступ к веткам.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/HMS_Warrior_1860_Portsmouth.jpg/800px-HMS_Warrior_1860_Portsmouth.jpg", unlocked: true },
    
    // ВЕТКА 1: КОРПУСА
    "hull_1": { id: "hull_1", name: "Канонерская лодка", branch: "hulls", type: "hull", parentId: "root_steam", cost: 100,
        desc: "Малый корабль для береговой обороны. Дешевый, но слабый.", stats: "Лимит веса: 800 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=Gunboat", unlocked: false },
    "hull_2": { id: "hull_2", name: "Корвет", branch: "hulls", type: "hull", parentId: "hull_1", cost: 250,
        desc: "Быстрый океанский корабль. Идеален для разведки.", stats: "Лимит веса: 2500 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=Corvette", unlocked: false },

    // ВЕТКА 2: ГЛАВНЫЙ КАЛИБР
    "gun_1": { id: "gun_1", name: "152-мм Гладкоствол", branch: "guns", type: "main", parentId: "root_steam", cost: 100,
        desc: "Старая дульнозарядная пушка. Стреляет ядрами.", stats: "Урон: 15\nВес: 50 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=152mm+Gun", unlocked: false },
    "gun_2": { id: "gun_2", name: "203-мм Нарезная", branch: "guns", type: "main", parentId: "gun_1", cost: 300,
        desc: "Казнозарядное орудие. Пробивает раннюю броню.", stats: "Урон: 40\nВес: 180 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=203mm+Gun", unlocked: false },

    // ВЕТКА 3: ВСПОМОГАТЕЛЬНЫЕ
    "sec_1": { id: "sec_1", name: "Картечница", branch: "sec", type: "sec", parentId: "root_steam", cost: 50,
        desc: "Многоствольный пулемет Гатлинга против шлюпок.", stats: "Урон: 5\nВес: 2 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=Gatling", unlocked: false },
    "sec_2": { id: "sec_2", name: "47-мм Гочкиса", branch: "sec", type: "sec", parentId: "sec_1", cost: 150,
        desc: "Скорострельная пушка. Защита от торпедных катеров.", stats: "Урон: 12\nВес: 15 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=47mm+Hotchkiss", unlocked: false },

    // ВЕТКА 4: БРОНЯ И ДВС
    "arm_1": { id: "arm_1", name: "Железная броня", branch: "armor", type: "armor", parentId: "root_steam", cost: 150,
        desc: "Толстые листы кованого железа.", stats: "Защита: 20\nВес: 300 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=Iron+Armor", unlocked: false },
    "arm_2": { id: "arm_2", name: "Стальная броня", branch: "armor", type: "armor", parentId: "arm_1", cost: 400,
        desc: "Сплав стали. Легче и прочнее железа.", stats: "Защита: 45\nВес: 250 т", img: "https://via.placeholder.com/300x150/1c1c1e/fff?text=Steel+Armor", unlocked: false },
};

let currentSelectedTechId = null;

// Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    if(tabName === 'research') {
        document.getElementById('research-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('constructor-tab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        updateConstructorDropdowns();
    }
}

// Отрисовка Древа
function renderTree() {
    // Очищаем ветки
    document.getElementById('tree-root').innerHTML = '';
    ['hulls', 'guns', 'sec', 'armor'].forEach(b => {
        const branchEl = document.getElementById(`branch-${b}`);
        // Оставляем только заголовок ветки
        branchEl.innerHTML = `<div class="branch-title">${branchEl.firstChild.innerText}</div>`;
    });

    // Пробегаемся по всей базе данных
    Object.values(db).forEach(tech => {
        const node = document.createElement('div');
        node.className = `tech-node`;
        node.innerText = tech.name;
        node.onclick = () => openModal(tech.id);

        // Проверка статуса (Доступно, Заблокировано, Изучено)
        if (tech.unlocked) {
            node.classList.add('unlocked');
        } else {
            // Если родитель изучен - значит доступно к покупке
            if (tech.parentId && db[tech.parentId].unlocked) {
                node.classList.add('available');
            } else {
                node.classList.add('locked'); // Родитель еще не открыт
            }
        }

        if (tech.branch === 'root') {
            document.getElementById('tree-root').appendChild(node);
        } else {
            document.getElementById(`branch-${tech.branch}`).appendChild(node);
        }
    });
}

// Открытие Модального окна (Карточка технологии)
function openModal(id) {
    const tech = db[id];
    currentSelectedTechId = id;
    
    document.getElementById('m-title').innerText = tech.name;
    document.getElementById('m-desc').innerText = tech.desc;
    document.getElementById('m-stats').innerText = tech.stats;
    document.getElementById('m-img').src = tech.img;

    const buyBtn = document.getElementById('m-buy-btn');
    
    if (tech.unlocked) {
        buyBtn.innerText = "Уже изучено";
        buyBtn.disabled = true;
    } else if (tech.parentId && !db[tech.parentId].unlocked) {
        buyBtn.innerText = "🔒 Требуется предыдущая";
        buyBtn.disabled = true;
    } else {
        buyBtn.innerText = `Изучить (${tech.cost} Очков)`;
        buyBtn.disabled = false;
    }

    document.getElementById('tech-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('tech-modal').style.display = 'none';
}

// Покупка технологии
function buyCurrentTech() {
    if (!currentSelectedTechId) return;
    
    // Здесь позже будет отправка данных боту о списании очков
    // Пока просто открываем:
    db[currentSelectedTechId].unlocked = true;
    closeModal();
    renderTree(); // Перерисовываем древо, чтобы открыть следующие узлы
    
    // Телеграм-уведомление (вибрация) если поддерживается
    if(tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
}

// Обновление Конструктора (заполнение только изученными деталями)
function updateConstructorDropdowns() {
    const selects = { 'hull': 'cb-hull', 'main': 'cb-main', 'sec': 'cb-sec', 'armor': 'cb-armor' };
    
    // Очищаем списки
    Object.values(selects).forEach(id => document.getElementById(id).innerHTML = '<option value="0">Выберите узел...</option>');

    // Добавляем только открытые технологии
    Object.values(db).forEach(tech => {
        if (tech.unlocked && tech.type !== 'base') {
            const opt = document.createElement('option');
            opt.value = tech.id;
            opt.innerText = tech.name;
            document.getElementById(selects[tech.type]).appendChild(opt);
        }
    });
}

// Запуск отрисовки при старте
renderTree();

const tg = window.Telegram.WebApp;
tg.expand();

// 1. БАЗА ДАННЫХ ТЕХНОЛОГИЙ (Тут ты сможешь добавлять свои 15 штук в каждую ветку!)
const db = {
    "root_steam": { 
        id: "root_steam", name: "Паровой флот", branch: "root", type: "base", parentId: null, cost: 0, 
        desc: "Фундамент военного флота.", stats: "Открывает доступ к веткам.", 
        img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/HMS_Warrior_1860_Portsmouth.jpg", 
        unlocked: true 
    },
    
    // ВЕТКА: КОРПУСА (Прямая рабочая ссылка)
    "hull_1": { 
        id: "hull_1", name: "Канонерская лодка", branch: "hulls", type: "hull", parentId: "root_steam", cost: 100,
        desc: "Малый корабль для береговой обороны.", stats: "Лимит веса: 800 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Khrabryy1895.jpg", 
        unlocked: false 
    },
    
    // ВЕТКА: ГЛ. КАЛИБР
    "gun_1": { 
        id: "gun_1", name: "152-мм Гладкоствол", branch: "guns", type: "main", parentId: "root_steam", cost: 100,
        desc: "Старая дульнозарядная пушка.", stats: "Урон: 15 / Вес: 50 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/1/17/6in_BL_gun_on_ship.jpg", 
        unlocked: false 
    },

    // ВЕТКА: ВСПОМ. ОРУДИЯ
    "sec_1": { 
        id: "sec_1", name: "Картечница Гатлинга", branch: "sec", type: "sec", parentId: "root_steam", cost: 50,
        desc: "Многоствольный пулемет.", stats: "Урон: 5 / Вес: 2 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Gatling_gun_1865.jpg", 
        unlocked: false 
    },

    // ВЕТКА: БРОНЯ
    "arm_1": { 
        id: "arm_1", name: "Железная броня", branch: "armor", type: "armor", parentId: "root_steam", cost: 150,
        desc: "Толстые листы кованого железа.", stats: "Защита: 20 / Вес: 300 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Ironclad_armor_sample.jpg", 
        unlocked: false 
    }
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

const tg = window.Telegram.WebApp;
tg.expand();

// 1. БАЗА ДАННЫХ (Обновленная с partImg)
const db = {
    "root_steam": { 
        id: "root_steam", name: "Паровой флот", branch: "root", type: "base", parentId: null, cost: 0, 
        desc: "Фундамент военного флота.", stats: "Открывает доступ к веткам.", 
        img: "", 
        partImg: null, // У корня нет детали
        unlocked: true 
    },
    
    // ВЕТКА: КОРПУСА
    "hull_1": { 
        id: "hull_1", name: "Канонерская лодка", branch: "hulls", type: "hull", parentId: "root_steam", cost: 100,
        desc: "Малый корабль для береговой обороны.", stats: "Лимит веса: 800 т", 
        img: "https://war-book.ru/wp-content/uploads/2019/05/00036166.jpg", 
        partImg: "ТУТ_ССЫЛКА_НА_ПРОЗРАЧНЫЙ_КОРПУС_КАНОНЕРКИ.png", 
        unlocked: false 
    },
    
    // ВЕТКА: ГЛ. КАЛИБР
    "gun_1": { 
        id: "gun_1", name: "152-мм Гладкоствол", branch: "guns", type: "main", parentId: "root_steam", cost: 100,
        desc: "Старая дульнозарядная пушка.", stats: "Урон: 15 / Вес: 50 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/1/17/6in_BL_gun_on_ship.jpg", 
        partImg: "ТУТ_ССЫЛКА_НА_ПРОЗРАЧНУЮ_ПУШКУ_152.png", 
        unlocked: false 
    },

    // ВЕТКА: ВСПОМ. ОРУДИЯ
    "sec_1": { 
        id: "sec_1", name: "Картечница Гатлинга", branch: "sec", type: "sec", parentId: "root_steam", cost: 50,
        desc: "Многоствольный пулемет.", stats: "Урон: 5 / Вес: 2 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Gatling_gun_1865.jpg", 
        partImg: "ТУТ_ССЫЛКА_НА_ПРОЗРАЧНЫЙ_ГАТЛИНГ.png", 
        unlocked: false 
    },

    // ВЕТКА: БРОНЯ (Может добавлять визуальные щиты на борта или трубы)
    "arm_1": { 
        id: "arm_1", name: "Железная броня", branch: "armor", type: "armor", parentId: "root_steam", cost: 150,
        desc: "Толстые листы кованого железа.", stats: "Защита: 20 / Вес: 300 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Ironclad_armor_sample.jpg", 
        partImg: "ТУТ_ССЫЛКА_НА_ПРОЗРАЧНЫЕ_ЩИТЫ_ИЛИ_ТРУБЫ.png", 
        unlocked: false 
    }
};

// ... Твои старые функции (switchTab, renderTree, openModal, closeModal, buyCurrentTech, updateConstructorDropdowns) ...

// 2. НОВАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ЧЕРТЕЖА
// Добавь это в самый конец файла script.js
function updateBlueprint() {
    // Собираем данные из выпадающих списков
    const parts = {
        'hull': document.getElementById('cb-hull').value,
        'main': document.getElementById('cb-main').value,
        'sec': document.getElementById('cb-sec').value,
        'armor': document.getElementById('cb-armor').value
    };

    // Проходимся по каждой выбранной детали
    for (const [type, id] of Object.entries(parts)) {
        const layerElement = document.getElementById(`layer-${type}`);
        
        // Если деталь выбрана (не "0") и у неё есть прозрачная картинка (partImg)
        if (id !== "0" && db[id] && db[id].partImg) {
            layerElement.src = db[id].partImg;
            layerElement.style.display = "block"; // Показываем слой
        } else {
            layerElement.style.display = "none";  // Скрываем слой, если ничего не выбрано
            layerElement.src = "";
        }
    }
}

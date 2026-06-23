alert("СКРИПТ ОБНОВИЛСЯ! СЛЕДУЮЩАЯ ВЕРСИЯ");
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg) tg.expand();

// 1. БАЗА ДАННЫХ
const db = {
    "root_steam": { 
        id: "root_steam", name: "Паровой флот", branch: "root", type: "base", parentId: null, cost: 0, 
        desc: "Фундамент военного флота.", stats: "Открывает доступ к веткам.", 
        img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/HMS_Warrior_1860_Portsmouth.jpg", 
        partImg: null, 
        unlocked: true 
    },
    
    // ВЕТКА: КОРПУСА
    "hull_1": { 
        id: "hull_1", name: "Канонерская лодка", branch: "hulls", type: "hull", parentId: "root_steam", cost: 100,
        desc: "Малый корабль для береговой обороны.", stats: "Лимит веса: 800 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Khrabryy1895.jpg", 
        partImg: "https://via.placeholder.com/800x400/000000/000000?text=", 
        unlocked: false 
    },
    "hull_2": { 
        id: "hull_2", name: "Паровой фрегат", branch: "hulls", type: "hull", parentId: "hull_1", cost: 150,          
        desc: "Переходная ступень: дерево, обшитое медью, плюс паруса.", 
        stats: "Характеристики:\nУрон: +50\nВес: 100 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Oleg_fregate_1864.jpg", 
        partImg: "https://via.placeholder.com/800x400/000000/000000?text=", 
        unlocked: false     
    },
    
    // ВЕТКА: ГЛ. КАЛИБР
    "gun_1": { 
        id: "gun_1", name: "152-мм Гладкоствол", branch: "guns", type: "main", parentId: "root_steam", cost: 100,
        desc: "Старая дульнозарядная пушка.", stats: "Урон: 15 / Вес: 50 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/1/17/6in_BL_gun_on_ship.jpg", 
        partImg: "https://via.placeholder.com/800x400/000000/000000?text=", 
        unlocked: false 
    },

    // ВЕТКА: ВСПОМ. ОРУДИЯ
    "sec_1": { 
        id: "sec_1", name: "Картечница Гатлинга", branch: "sec", type: "sec", parentId: "root_steam", cost: 50,
        desc: "Многоствольный пулемет.", stats: "Урон: 5 / Вес: 2 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Gatling_gun_1865.jpg", 
        partImg: "https://via.placeholder.com/800x400/000000/000000?text=", 
        unlocked: false 
    },

    // ВЕТКА: БРОНЯ
    "arm_1": { 
        id: "arm_1", name: "Железная броня", branch: "armor", type: "armor", parentId: "root_steam", cost: 150,
        desc: "Толстые листы кованого железа.", stats: "Защита: 20 / Вес: 300 т", 
        img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Ironclad_armor_sample.jpg", 
        partImg: "https://via.placeholder.com/800x400/000000/000000?text=", 
        unlocked: false 
    }
};

let currentSelectedTechId = null;

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

function renderTree() {
    const rootEl = document.getElementById('tree-root');
    if (!rootEl) return;
    rootEl.innerHTML = '';

    ['hulls', 'guns', 'sec', 'armor'].forEach(b => {
        const branchEl = document.getElementById(`branch-${b}`);
        if (branchEl && branchEl.firstElementChild) {
            const titleText = branchEl.firstElementChild.innerText;
            branchEl.innerHTML = `<div class="branch-title">${titleText}</div>`;
        }
    });

    Object.values(db).forEach(tech => {
        const node = document.createElement('div');
        node.className = `tech-node`;
        node.innerText = tech.name;
        node.onclick = () => openModal(tech.id);

        if (tech.unlocked) {
            node.classList.add('unlocked');
        } else {
            if (tech.parentId && db[tech.parentId] && db[tech.parentId].unlocked) {
                node.classList.add('available');
            } else {
                node.classList.add('locked');
            }
        }

        if (tech.branch === 'root') {
            rootEl.appendChild(node);
        } else {
            const branchContainer = document.getElementById(`branch-${tech.branch}`);
            if (branchContainer) branchContainer.appendChild(node);
        }
    });
}

function openModal(id) {
    const tech = db[id];
    currentSelectedTechId = id;
    
    document.getElementById('m-title').innerText = tech.name;
    document.getElementById('m-desc').innerText = tech.desc;
    document.getElementById('m-stats').innerText = tech.stats;
    
    const imgElement = document.getElementById('m-img');
    imgElement.src = tech.img || ""; 
    imgElement.onerror = function() {
        this.src = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg';
    };

    const buyBtn = document.getElementById('m-buy-btn');
    if (tech.unlocked) {
        buyBtn.innerText = "Уже изучено";
        buyBtn.disabled = true;
    } else if (tech.parentId && db[tech.parentId] && !db[tech.parentId].unlocked) {
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

function buyCurrentTech() {
    if (!currentSelectedTechId) return;
    db[currentSelectedTechId].unlocked = true;
    closeModal();
    renderTree();
    if(tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
}

function updateConstructorDropdowns() {
    const selects = { 'hull': 'cb-hull', 'main': 'cb-main', 'sec': 'cb-sec', 'armor': 'cb-armor' };
    Object.values(selects).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<option value="0">Выберите узел...</option>';
    });

    Object.values(db).forEach(tech => {
        if (tech.unlocked && tech.type !== 'base') {
            const opt = document.createElement('option');
            opt.value = tech.id;
            opt.innerText = tech.name;
            const targetSelect = document.getElementById(selects[tech.type]);
            if (targetSelect) targetSelect.appendChild(opt);
        }
    });
}

// ИСПРАВЛЕНО: Теперь тут стоят правильные косые кавычки ` `
function updateBlueprint() {
    const parts = {
        'hull': document.getElementById('cb-hull').value,
        'main': document.getElementById('cb-main').value,
        'sec': document.getElementById('cb-sec').value,
        'armor': document.getElementById('cb-armor').value
    };

    for (const [type, id] of Object.entries(parts)) {
        const layerElement = document.getElementById(`layer-${type}`);
        if (layerElement) {
            if (id !== "0" && db[id] && db[id].partImg) {
                layerElement.src = db[id].partImg;
                layerElement.style.display = "block";
            } else {
                layerElement.style.display = "none";
                layerElement.src = "";
            }
        }
    }
}

renderTree();

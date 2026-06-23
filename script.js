// Инициализируем Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Расширяем окно на весь экран телефона

function calculateWeight() {
    const gun = parseFloat(document.getElementById('main-gun').value);
    const sec = parseFloat(document.getElementById('sec-gun').value);
    const engineLimit = parseFloat(document.getElementById('engine').value);
    
    const totalWeight = gun + sec;
    const statusDiv = document.getElementById('weight-status');
    const btn = document.getElementById('send-btn');

    if (totalWeight > engineLimit) {
        statusDiv.className = "status error";
        statusDiv.innerText = `⚠️ ПЕРЕВЕС! Вес: ${totalWeight} т / Лимит: ${engineLimit} т`;
        btn.disabled = true;
        btn.style.opacity = 0.5;
    } else {
        statusDiv.className = "status success";
        statusDiv.innerText = `✓ Вес в норме: ${totalWeight} т / Лимит: ${engineLimit} т`;
        btn.disabled = false;
        btn.style.opacity = 1;
    }
}

function sendData() {
    const name = document.getElementById('tech-name').value;
    if(!name) return alert("Введите название техники!");

    // Собираем данные для отправки боту в чат
    const data = {
        name: name,
        main_gun: document.getElementById('main-gun').options[document.getElementById('main-gun').selectedIndex].text,
        sec_gun: document.getElementById('sec-gun').options[document.getElementById('sec-gun').selectedIndex].text
    };

    // Отправляем JSON-строку обратно боту
    tg.sendData(JSON.stringify(data));
    tg.close(); // Закрываем мини-приложение
}

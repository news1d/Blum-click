// ==UserScript==
// @name         Blum Enhanced Autoclicker 6.0
// @version      1.3
// @namespace    Violentmonkey Scripts
// @match        https://telegram.blum.codes/*
// @grant        none
// ==/UserScript==

(() => {
    if (window.BlumAC) return;
    window.BlumAC = true;

    let isPlayClicked = false; // Переменная для отслеживания нажатия на ссылку Play
    let autoClickInterval; // Переменная для хранения идентификатора интервала

    const gc = [208, 216, 0]; // Цвет для кликов (зеленый)
    const bombColor = [255, 0, 0]; // Цвет бомбы
    const t = 5; // Допуск для зеленого цвета
    const bombTolerance = 20; // Допуск для цвета бомбы
    const maxClicks = 2; // Максимальное количество кликов за одну итерацию
    const clickDelay = 50; // Задержка между кликами в миллисекундах

    // Функция для поиска ссылки-кнопки <a class="play-btn">Play</a> и установки обработчика клика
    function setupStartButtonListener() {
        const startButton = document.querySelector('a.play-btn');
        if (startButton) {
            startButton.addEventListener('click', () => {
                isPlayClicked = true;
                console.log("Ссылка Play нажата вручную, включаем авто-клик.");
                startAutoClick();
            });
        } else {
            console.log('Ссылка Play не найдена, повторная попытка через 500 мс');
            setTimeout(setupStartButtonListener, 500); // Повторяем проверку каждые 500 мс
        }
    }

    // Функция, которая будет автоматически нажимать на кнопку <button class="kit-button is-large is-primary">Play</button>
    function startAutoClick() {
        clearInterval(autoClickInterval);

        autoClickInterval = setInterval(() => {
            if (isPlayClicked) {
                const button = document.querySelector("button.kit-button.is-large.is-primary");
                if (button && button.innerText.toLowerCase().includes("play")) {
                    console.log("Автоматический клик по кнопке Play.");
                    button.click();
                }
            }
        }, 5000); // Интервал между автоматическими кликами (5 секунд)
    }

    // Запускаем проверку на наличие кнопки <a> Play при загрузке страницы
    setupStartButtonListener();

    setInterval(() => {
        const canvas = document.querySelector("canvas");
        if (canvas) findAndClickObjects(canvas);
    }, 100);

    function findAndClickObjects(screenCanvas) {
        const context = screenCanvas.getContext('2d');
        const width = screenCanvas.width;
        const height = screenCanvas.height;
        const imageData = context.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        const clickablePositions = [];

        for (let x = 0; x < width; x += 1) {
            for (let y = 0; y < height; y += 1) {
                if (y < 70) continue;

                const index = (y * width + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];

                const isGreen = (gc[0] - t < r && r < gc[0] + t) && (gc[1] - t < g && g < gc[1] + t) && (gc[2] - t < b && b < gc[2] + t);
                const isBomb = (bombColor[0] - bombTolerance < r && r < bombColor[0] + bombTolerance) &&
                    (bombColor[1] - bombTolerance < g && g < bombColor[1] + bombTolerance) &&
                    (bombColor[2] - bombTolerance < b && b < bombColor[2] + bombTolerance);

                // Добавляем только подходящие позиции, игнорируя бомбы
                if (isGreen && !isBomb) {
                    clickablePositions.push({ x, y });
                }
            }
        }

        // Перемешивание массива
        clickablePositions.sort(() => Math.random() - 0.5);

        // Ограничение по количеству кликов
        const positionsToClick = clickablePositions.slice(0, maxClicks);

        // Проверка случайной вероятности клика на каждую позицию
        positionsToClick.forEach((pos, index) => {
            setTimeout(() => {
                if (Math.random() < 0.5) { // Вероятность клика
                    simulateClick(screenCanvas, pos.x, pos.y);
                }
            }, index * clickDelay);
        });
    }

    function simulateClick(canvas, x, y) {
        const prop = {
            clientX: x,
            clientY: y,
            bubbles: true
        };
        canvas.dispatchEvent(new MouseEvent('click', prop));
        canvas.dispatchEvent(new MouseEvent('mousedown', prop));
        canvas.dispatchEvent(new MouseEvent('mouseup', prop));
    }

})();

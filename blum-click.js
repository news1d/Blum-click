// ==UserScript==
// @name         Blum Enhanced Autoclicker 5.0
// @version      1.3
// @namespace    Violentmonkey Scripts
// @match        https://telegram.blum.codes/*
// @grant        none
// ==/UserScript==

(() => {
    if (window.BlumAC) return;
    window.BlumAC = true;

    let isPlayClicked = false; // Переменная для отслеживания нажатия кнопки Play

    const gc = [208, 216, 0]; // Цвет для кликов (зеленый)
    const bombColor = [255, 0, 0]; // Цвет бомбы, замените на фактический цвет
    const t = 5; // Допуск для зеленого цвета
    const bombTolerance = 20; // Допуск для цвета бомбы
    const maxClicks = 2; // Максимальное количество кликов за одну итерацию
    const clickDelay = 50; // Задержка между кликами в миллисекундах (1 секунда)

    const playButton = document.querySelector("button.is-primary, .play-btn");

    if (playButton) {
        playButton.addEventListener('click', () => {
            isPlayClicked = true; // Устанавливаем флаг, если кнопка была нажата
            console.log("Кнопка Play нажата вручную, включаем авто-клик."); // Выводим в консоль
            startAutoClick(); // Запускаем автоматические клики после нажатия
        });
    } else {
        console.log("Кнопка Play не найдена."); // Выводим в консоль, если кнопка не найдена
    }

    function startAutoClick() {
        clearInterval(autoClickInterval);

        autoClickInterval = setInterval(() => {
            if (isPlayClicked) {
                clickPlayButton();
            }
        }, 5000);
    }

    // Функция для автоматического клика на кнопку Play
    const clickPlayButton = () => {
        if (!playButton) return;
        if (!playButton.textContent.toLowerCase().includes("play")) return;
        console.log("Автоматический клик по кнопке Play."); // Выводим в консоль
        playButton.click();
    };

    let autoClickInterval; // Переменная для хранения идентификатора интервала

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
                if (Math.random() < 0.5) { // Вероятность клика, можно настроить
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

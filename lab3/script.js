const canvas = document.getElementById("canvas");
const twoD = canvas.getContext("2d");
const output = document.getElementById("output");
const scaleInput = document.getElementById("scale");
const scaleValueDisplay = document.getElementById("scaleValue");
const drawButton = document.getElementById("drawButton");

let gridSize = parseInt(scaleInput.value, 10);
const width = canvas.width;
const height = canvas.height;

let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let centerPoint = { x: 0, y: 0 };
let radiusLen = 0;
let numberOfClicks = 0;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let lastMousePos = { x: 0, y: 0 };

function updateInput() {
	const algorithm = document.getElementById("algorithm").value;
	const lines = document.getElementById("lines");
	const circles = document.getElementById("circles");

	if (algorithm === "bresenhamCircle") {
		lines.style.display = "none";
		circles.style.display = "block";
	} else {
		lines.style.display = "block";
		circles.style.display = "none";
	}
}

function drawGrid() {
	twoD.clearRect(0, 0, width, height);

	twoD.strokeStyle = "#ddd";
	twoD.lineWidth = 1;

	for (let x = width / 2 + offsetX; x <= width; x += gridSize) {
		twoD.beginPath();
		twoD.moveTo(x, 0);
		twoD.lineTo(x, height);
		twoD.stroke();
	}
	for (let x = width / 2 + offsetX; x >= 0; x -= gridSize) {
		twoD.beginPath();
		twoD.moveTo(x, 0);
		twoD.lineTo(x, height);
		twoD.stroke();
	}

	for (let y = height / 2 + offsetY; y <= height; y += gridSize) {
		twoD.beginPath();
		twoD.moveTo(0, y);
		twoD.lineTo(width, y);
		twoD.stroke();
	}
	for (let y = height / 2 + offsetY; y >= 0; y -= gridSize) {
		twoD.beginPath();
		twoD.moveTo(0, y);
		twoD.lineTo(width, y);
		twoD.stroke();
	}

	drawAxes();
	drawAxisLabels();
}

function drawAxes() {
	twoD.strokeStyle = "lightgreen";
	twoD.lineWidth = 2;

	twoD.beginPath();
	twoD.moveTo(0 + offsetX, height / 2 + offsetY);
	twoD.lineTo(width, height / 2 + offsetY);
	twoD.stroke();

	twoD.beginPath();
	twoD.moveTo(width / 2 + offsetX, 0);
	twoD.lineTo(width / 2 + offsetX, height);
	twoD.stroke();
}

function drawAxisLabels() {
	twoD.fillStyle = "gray";
	twoD.fillText("X", width - 15 + offsetX, height / 2 - 15 + offsetY);
	twoD.fillText("Y", width / 2 - 15 + offsetX, 15 + offsetY);

	let i = 1;
	for (let x = width / 2 + gridSize + offsetX; x <= width; x += gridSize, i++) {
		twoD.fillText(i, x, height / 2 + 10 + offsetY);
	}
	i = -1;
	for (let x = width / 2 - gridSize + offsetX; x >= 0; x -= gridSize, i--) {
		twoD.fillText(i, x, height / 2 + 10 + offsetY);
	}
	i = -1;
	for (
		let y = height / 2 + gridSize + offsetY;
		y <= height;
		y += gridSize, i--
	) {
		twoD.fillText(i, width / 2 + 5 + offsetX, y);
	}
	i = 1;
	for (let y = height / 2 - gridSize + offsetY; y >= 0; y -= gridSize, i++) {
		twoD.fillText(i, width / 2 + 5 + offsetX, y);
	}
}

function toCanvas(x, y) {
	return {
		x: width / 2 + x * gridSize + offsetX,
		y: height / 2 - y * gridSize + offsetY,
	};
}

function paintPixel(x, y, color = "green") {
	const { x: canvasX, y: canvasY } = toCanvas(x, y);
	twoD.fillStyle = color;
	twoD.fillRect(canvasX, canvasY - gridSize, gridSize, gridSize);
}

function toOutput(text) {
	const p = document.createElement("p");
	p.textContent = text;
	output.appendChild(p);
}


function stepAlgorithm() {
	toOutput("Пошаговый алгоритм:");

	let x0 = startPoint.x;
	let y0 = startPoint.y;
	let x1 = endPoint.x;
	let y1 = endPoint.y;
	toOutput(`Отрезок от (${x0}, ${y0}) до (${x1}, ${y1})`);

    if (x0 > x1) {
        [x0, x1] = [x1, x0];
    }
    if (y0 > y1) {
        [y0, y1] = [y1, y0];
    }

	let dx = x1 - x0;
	let dy = y1 - y0;

	toOutput(`dx = ${dx}`);
	toOutput(`dy = ${dy}`);

	if (dy <= dx) {
		toOutput(`|dy| <= |dx|, рисуем, просматривая x от ${x0} до ${x1}`);
		let step = dy / dx;
		if (dx == 0) step = 0;

		for (let x = x0; x <= x1; x++) {
			let y = y0 + step * (x - x0);
			toOutput(
				`Для x = ${x} найдена точка y = ${y} -> рисуем (${x}, ${Math.floor(y)})`
			);
			paintPixel(x, Math.floor(y));
		}
	} else {
		toOutput(`|dx| < |dy|, рисуем, просматривая y от ${y0} до ${y1}`);
		let step = dx / dy;

		for (let y = y0; y <= y1; y++) {
			let x = x0 + step * (y - y0);
			toOutput(
				`Для y = ${y} найдена точка x = ${x} -> рисуем (${Math.floor(x)}, ${y})`
			);
			paintPixel(Math.floor(x), y);
		}
	}
}

function DDA() {
	toOutput("Алгоритм ЦДА:");
	let x0 = startPoint.x;
	let y0 = startPoint.y;
	let x1 = endPoint.x;
	let y1 = endPoint.y;

	let dx = x1 - x0;
	let dy = y1 - y0;
	let steps = Math.max(Math.abs(dx), Math.abs(dy));
	toOutput(`Число шагов: ${steps}`);

	let addX = dx / steps;
	let addY = dy / steps;
	if (steps == 0) {
		addX = 0;
		addY = 0;
	}
	toOutput(`dx = ${addX}`);
	toOutput(`dy = ${addY}`);

	for (let i = 0; i <= steps; i++) {
		let x = x0 + addX * i;
		let y = y0 + addY * i;
		toOutput(`Точка (${x}, ${y}), рисуем (${Math.floor(x)}, ${Math.floor(y)})`);
		paintPixel(Math.floor(x), Math.floor(y));
	}
}

function BresenhamLine() {
	toOutput("Алгоритм Брезенхема:");
	let x0 = startPoint.x;
	let y0 = startPoint.y;
	let x1 = endPoint.x;
	let y1 = endPoint.y;

	toOutput(`Отрезок от (${x0}, ${y0}) до (${x1}, ${y1})`);
	const dx = Math.abs(x1 - x0);
	const dy = Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx - dy;

	toOutput(`Сдвиг по X: ${sx}`);
	toOutput(`Сдвиг по Y: ${sy}`);

	while (true) {
		toOutput(`Рисуем точку (${x0}, ${y0})`);
		paintPixel(x0, y0);
		if (x0 === x1 && y0 === y1) {
			addToOutput(`Алгоритм достиг конечной точки и завершает работу`);
			break;
		}
		const e2 = err * 2;
		if (e2 > -dy) {
			err -= dy;
			x0 += sx;
		}
		if (e2 < dx) {
			err += dx;
			y0 += sy;
		}
		toOutput(`Новая ошибка err = ${err}`);
	}
}

function BresenhamCircle() {
	toOutput("Алгоритм Брезенхема для окружности:");

	let x0 = centerPoint.x;
	let y0 = centerPoint.y;
	toOutput(`Центр в точке (${x0}, ${y0}), радиус равен ${radiusLen}`);
	if (radiusLen < 1) {
		toOutput(`Радиус должен быть положительным!`);
		return;
	}

	let x = 0;
	let y = radiusLen;
	let d = 3 - 2 * radiusLen;

	while (y >= x) {
		toOutput(`Рисуем точку (${x0 + x}, ${y0 + y}) и все симметричные`);
		paintPixel(x0 + x, y0 + y);
		paintPixel(x0 - x, y0 + y);
		paintPixel(x0 + x, y0 - y);
		paintPixel(x0 - x, y0 - y);
		paintPixel(x0 + y, y0 + x);
		paintPixel(x0 - y, y0 + x);
		paintPixel(x0 + y, y0 - x);
		paintPixel(x0 - y, y0 - x);
		if (d < 0) {
			d = d + 4 * x + 6;
		} else {
			d = d + 4 * (x - y) + 10;
			y--;
		}
		x++;
		toOutput(`Ошибка err = ${d}`);
	}
}

function draw() {
	output.innerHTML = "";
	drawGrid();
	const algorithm = document.getElementById("algorithm").value;

	if (algorithm === "bresenhamCircle") {
		const centerX = parseInt(document.getElementById("centerX").value);
		const centerY = parseInt(document.getElementById("centerY").value);
		radiusLen = parseInt(document.getElementById("radius").value);
		centerPoint = { x: centerX, y: centerY };
		BresenhamCircle();
	} else {
		const startX = parseInt(document.getElementById("startX").value);
		const startY = parseInt(document.getElementById("startY").value);
		const endX = parseInt(document.getElementById("endX").value);
		const endY = parseInt(document.getElementById("endY").value);

		startPoint = { x: startX, y: startY };
		endPoint = { x: endX, y: endY };

		if (algorithm === "step") {
			stepAlgorithm();
		} else if (algorithm === "dda") {
			DDA();
		} else if (algorithm === "bresenham") {
			BresenhamLine();
		}
	}
}

function updateScale() {
	gridSize = parseInt(scaleInput.value, 10);
	scaleValueDisplay.textContent = gridSize;
	drawGrid();
	draw();
}

drawButton.addEventListener("click", event => {
	draw();
});

canvas.addEventListener("mousedown", event => {
	isDragging = true;
	lastMousePos.x = event.clientX;
	lastMousePos.y = event.clientY;
});

canvas.addEventListener("mousemove", event => {
	if (isDragging) {
		const dx = event.clientX - lastMousePos.x;
		const dy = event.clientY - lastMousePos.y;

		offsetX += dx;
		offsetY += dy;

		lastMousePos.x = event.clientX;
		lastMousePos.y = event.clientY;

		draw();
	}
});

canvas.addEventListener("mouseup", () => {
	isDragging = false;
});

canvas.addEventListener("mouseout", () => {
	isDragging = false;
});

drawGrid();
updateInput();
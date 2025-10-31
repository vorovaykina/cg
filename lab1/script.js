const color = document.getElementById('color');
const r = document.getElementById('r');
const g = document.getElementById('g');
const b = document.getElementById('b');
const r_range = document.getElementById('r-range');
const g_range = document.getElementById('g-range');
const b_range = document.getElementById('b-range');

const c = document.getElementById('c');
const m = document.getElementById('m');
const y = document.getElementById('y');
const k = document.getElementById('k');
const c_range = document.getElementById('c-range');
const m_range = document.getElementById('m-range');
const y_range = document.getElementById('y-range');
const k_range = document.getElementById('k-range');

const h = document.getElementById('h');
const s = document.getElementById('s');
const v = document.getElementById('v');
const h_range = document.getElementById('h-range');
const s_range = document.getElementById('s-range');
const v_range = document.getElementById('v-range');

function rgbToCmyk(r, g, b) {
    let k = Math.min(1 - r / 255, 1 - g / 255, 1 - b / 255);
    let c = (1 - r / 255 - k) / (1 - k) || 0;
    let m = (1 - g / 255 - k) / (1 - k) || 0;
    let y = (1 - b / 255 - k) / (1 - k) || 0;
    return [
        Math.round(c * 100),
        Math.round(m * 100),
        Math.round(y * 100),
        Math.round(k * 100),
    ];
}

function cmykToRgb(c, m, y, k) {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;
    let r = 255 * (1 - c) * (1 - k) || 0;
    let g = 255 * (1 - m) * (1 - k) || 0;
    let b = 255 * (1 - y) * (1 - k) || 0;
    return [Math.round(r), Math.round(g), Math.round(b)];
}

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    if (max === 0) {
        s = 0;
    } else {
        s = (max - min) / max; // Saturation
    }

    if (max === min) {
        h = 0; // Achromatic
    } else {
        let d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function hsvToRgb(h, s, v) {
    let r, g, b;

    s /= 100;
    v /= 100;

    let c = v * s; // Chroma
    let x = c * (1 - Math.abs((h / 60) % 2 - 1)); 
    let m = v - c; // Match value

    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (h >= 300 && h < 360) {
        r = c;
        g = 0;
        b = x;
    } else {
        // h = 360 (edge case)
        r = 0;
        g = 0;
        b = 0;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}

function updateColor() {
    const rValue = parseInt(r.value);
    const gValue = parseInt(g.value);
    const bValue = parseInt(b.value);

    const [cValue, mValue, yValue, kValue] = rgbToCmyk(rValue, gValue, bValue);
    const [hValue, sValue, vValue] = rgbToHsv(rValue, gValue, bValue);

    const hex = rgbToHex(rValue, gValue, bValue);

    color.value = hex;
    document.getElementById('rgb-box').style.backgroundColor = hex;

    c.value = cValue;
    m.value = mValue;
    y.value = yValue;
    k.value = kValue;
    document.getElementById('cmyk-box').style.backgroundColor = rgbToHex(...cmykToRgb(cValue, mValue, yValue, kValue));

    h.value = hValue;
    s.value = sValue;
    v.value = vValue;
    document.getElementById('hsv-box').style.backgroundColor = rgbToHex(...hsvToRgb(hValue, sValue, vValue));

    r_range.value = rValue;
    g_range.value = gValue;
    b_range.value = bValue;

    c_range.value = cValue;
    m_range.value = mValue;
    y_range.value = yValue;
    k_range.value = kValue;

    h_range.value = hValue;
    s_range.value = sValue;
    v_range.value = vValue;
}

function updateCMYK() {
    const cValue = parseInt(c.value);
    const mValue = parseInt(m.value);
    const yValue = parseInt(y.value);
    const kValue = parseInt(k.value);

    const [rValue, gValue, bValue] = cmykToRgb(cValue, mValue, yValue, kValue);
    r.value = rValue;
    g.value = gValue;
    b.value = bValue;

    updateColor();
}

function updateHSV() {
    const hValue = parseInt(h.value);
    const sValue = parseInt(s.value);
    const vValue = parseInt(v.value);

    const [rValue, gValue, bValue] = hsvToRgb(hValue, sValue, vValue);
    r.value = rValue;
    g.value = gValue;
    b.value = bValue;

    updateColor();
}

color.addEventListener('input', () => {
    const hex = color.value;
    const rgb = hexToRgb(hex);
    r.value = rgb[0];
    g.value = rgb[1];
    b.value = rgb[2];
    updateColor();
});

r.addEventListener('input', updateColor);
g.addEventListener('input', updateColor);
b.addEventListener('input', updateColor);

c.addEventListener('input', updateCMYK);
m.addEventListener('input', updateCMYK);
y.addEventListener('input', updateCMYK);
k.addEventListener('input', updateCMYK);

h.addEventListener('input', updateHSV);
s.addEventListener('input', updateHSV);
v.addEventListener('input', updateHSV);

r_range.addEventListener('input', () => {
    r.value = r_range.value;
    updateColor();
});
g_range.addEventListener('input', () => {
    g.value = g_range.value;
    updateColor();
});
b_range.addEventListener('input', () => {
    b.value = b_range.value;
    updateColor();
});

c_range.addEventListener('input', updateCMYK);
m_range.addEventListener('input', updateCMYK);
y_range.addEventListener('input', updateCMYK);
k_range.addEventListener('input', updateCMYK);

h_range.addEventListener('input', () => {
    h.value = h_range.value;
    updateHSV();
});
s_range.addEventListener('input', () => {
    s.value = s_range.value;
    updateHSV();
});
v_range.addEventListener('input', () => {
    v.value = v_range.value;
    updateHSV();
});

updateColor();

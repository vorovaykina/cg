const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
let image = new Image();
let originalImageData = null; 

document.getElementById("imageUpload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        image.src = URL.createObjectURL(file);
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
    }
});

function resetImage() {
    if (originalImageData) {
        ctx.putImageData(originalImageData, 0, 0);
    }
}

function applyThreshold(method) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
    }

    let threshold;
    if (method === "simple") {
        threshold = 128;
    } else if (method === "otsu") {
        threshold = calculateOtsuThreshold(data);
    }

    for (let i = 0; i < data.length; i += 4) {
        const value = data[i] < threshold ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
}

function calculateOtsuThreshold(data) {
    const histogram = Array(256).fill(0);
    data.forEach((value, index) => {
        if (index % 4 === 0) histogram[value]++;
    });

    let total = data.length / 4;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * histogram[t];

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let max = 0;
    let threshold = 0;

    for (let t = 0; t < 256; t++) {
        wB += histogram[t];
        if (wB === 0) continue;
        wF = total - wB;
        if (wF === 0) break;
        sumB += t * histogram[t];
        let mB = sumB / wB;
        let mF = (sum - sumB) / wF;
        let between = wB * wF * (mB - mF) ** 2;

        if (between > max) {
            max = between;
            threshold = t;
        }
    }
    return threshold;
}

function applyFilter(type) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const newImageData = ctx.createImageData(canvas.width, canvas.height);
    const newData = newImageData.data;

    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = halfKernel; y < canvas.height - halfKernel; y++) {
        for (let x = halfKernel; x < canvas.width - halfKernel; x++) {
            const pixelValuesR = [];
            const pixelValuesG = [];
            const pixelValuesB = [];

            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const px = (y + ky) * canvas.width + (x + kx);
                    pixelValuesR.push(data[px * 4]);     
                    pixelValuesG.push(data[px * 4 + 1]); 
                    pixelValuesB.push(data[px * 4 + 2]); 
                }
            }

            let resultR, resultG, resultB;
            if (type === "median") {
                resultR = median(pixelValuesR);
                resultG = median(pixelValuesG);
                resultB = median(pixelValuesB);
            } else if (type === "max") {
                resultR = Math.max(...pixelValuesR);
                resultG = Math.max(...pixelValuesG);
                resultB = Math.max(...pixelValuesB);
            }
            const index = (y * canvas.width + x) * 4;
            newData[index] = resultR;
            newData[index + 1] = resultG;
            newData[index + 2] = resultB;
            newData[index + 3] = 255; 
        }
    }

    ctx.putImageData(newImageData, 0, 0);
}

function median(values) {
    values.sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    return values.length % 2 === 0 ? (values[middle - 1] + values[middle]) / 2 : values[middle];
}

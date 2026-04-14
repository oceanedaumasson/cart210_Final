const vid = document.getElementById('vid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvasGhost = document.getElementById('canvas-ghost');
const ctxGhost = canvasGhost.getContext('2d');
const placeholder = document.getElementById('placeholder');

const videos = [
    'images/intro.jpg',
    'images/vid1.mp4','images/vid4.mp4','images/vid8.mp4','images/vid11.mp4',
    'images/vid7.mp4','images/vid6.mp4','images/vid10.mp4','images/vid3.mp4',
    'images/vid9.mp4','images/vid5.mp4','images/vid2.mp4','images/vid12.mp4',
    'images/vid13.mp4','images/vid14.mp4','images/vid15.mp4','images/vid16.mp4',
    'images/vid17.mp4','images/vid18.mp4','images/vid20.mp4','images/vid19.mp4'
];

let currentIndex = 0;
let pixelSize = 1;
let displayWidth = window.innerWidth * 0.05;

let chaos = 0;
let nextClicks = 0;
let backClicks = 0;
let clicks = 0;
let lastWentUp = false;

placeholder.style.width = displayWidth + 'px';
placeholder.style.height = 'auto';

const videoEls = {};

function preloadNeighbours(index) {
    [index - 1, index + 1].forEach(i => {
        if (i >= 0 && i < videos.length && !videoEls[i] && !videos[i].endsWith('.jpg')) {
            const v = document.createElement('video');
            v.src = videos[i];
            v.preload = 'auto';
            v.muted = true;
            videoEls[i] = v;
        }
    });
}
preloadNeighbours(currentIndex);

if (!videos[currentIndex].endsWith('.jpg')) {
    vid.src = videos[currentIndex];
}

vid.addEventListener('loadedmetadata', () => {
    canvas.width = displayWidth;
    canvas.height = displayWidth * (vid.videoHeight / vid.videoWidth);
    vid.play().catch(() => {});
});

function draw() {
    if (
        !videos[currentIndex].endsWith('.jpg') &&
        vid.readyState >= 2 &&
        vid.videoWidth &&
        vid.videoHeight
    ) {
        if (canvas.width !== displayWidth) {
            canvas.width = displayWidth;
            canvas.height = displayWidth * (vid.videoHeight / vid.videoWidth);
        }

        const safePixelSize = Math.min(pixelSize, displayWidth);
        const smallW = Math.max(1, Math.floor(displayWidth / safePixelSize));
        const smallH = Math.max(1, Math.floor(canvas.height / safePixelSize));

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(vid, 0, 0, smallW, smallH);
        ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

function switchVideo(newIndex) {
    currentIndex = newIndex;

    if (videos[currentIndex].endsWith('.jpg')) {
        placeholder.src = videos[currentIndex];
        placeholder.style.display = 'block';
        canvas.style.display = 'none';
        vid.pause();
        updateArrows();
        return;
    }

    placeholder.style.display = 'none';
    canvas.style.display = 'block';

    vid.src = videoEls[currentIndex] ? videoEls[currentIndex].src : videos[currentIndex];

    vid.addEventListener('loadedmetadata', () => {
        canvas.width = displayWidth;
        canvas.height = displayWidth * (vid.videoHeight / vid.videoWidth);
        vid.play().catch(() => {});
    }, { once: true });

    if (vid.readyState >= 1) {
        vid.play().catch(() => {});
    }

    updateArrows();
    preloadNeighbours(currentIndex);
}

function updateArrows() {
    document.getElementById('prevBtn').style.visibility =
        currentIndex === 0 ? 'hidden' : 'visible';

    document.getElementById('nextBtn').style.visibility =
        currentIndex === videos.length - 1 ? 'hidden' : 'visible';
}

document.getElementById('nextBtn').addEventListener('click', () => {
    chaos++;
    nextClicks++;
    switchVideo((currentIndex + 1) % videos.length);
});

document.getElementById('prevBtn').addEventListener('click', () => {
    chaos++;
    backClicks++;
    switchVideo((currentIndex - 1 + videos.length) % videos.length);
});

document.getElementById('zoomInBtn').addEventListener('click', () => {
    displayWidth += 80;
    if (placeholder.style.display !== 'none') {
        placeholder.style.width = displayWidth + 'px';
    }
    if (clicks < 10) {
        if (clicks < 5) {
            pixelSize += 3;
        } else {
            pixelSize *= 2;
        }
        clicks++;
    }
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    const goesUp = Math.random() < 0.15;
    displayWidth += goesUp ? 80 : -80;
    displayWidth = Math.max(100, displayWidth);
    if (placeholder.style.display !== 'none') {
        placeholder.style.width = displayWidth + 'px';
    }
});

updateArrows();

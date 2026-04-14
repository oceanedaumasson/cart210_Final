// ------- MEDIA ARRAY ------- //

const media = [
    { type: 'image', src: 'images/intro.jpg' },  
    { type: 'video', src: 'images/vid1.mp4' },
    { type: 'video', src: 'images/vid4.mp4' },
    { type: 'video', src: 'images/vid8.mp4' },
    { type: 'video', src: 'images/vid11.mp4' },
    { type: 'video', src: 'images/vid7.mp4' },
    { type: 'video', src: 'images/vid6.mp4' },
    { type: 'video', src: 'images/vid10.mp4' },
    { type: 'video', src: 'images/vid3.mp4' },
    { type: 'video', src: 'images/vid9.mp4' },
    { type: 'video', src: 'images/vid5.mp4' },
    { type: 'video', src: 'images/vid2.mp4' },
    { type: 'video', src: 'images/vid12.mp4' },
    { type: 'video', src: 'images/vid13.mp4' },
    { type: 'video', src: 'images/vid14.mp4' },
    { type: 'video', src: 'images/vid15.mp4' },
    { type: 'video', src: 'images/vid16.mp4' },
    { type: 'video', src: 'images/vid17.mp4' },
    { type: 'video', src: 'images/vid18.mp4' },
    { type: 'video', src: 'images/vid20.mp4' },
    { type: 'video', src: 'images/vid19.mp4' },
];

// ------- SETUP ------- //

const vid = document.getElementById('vid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvasGhost = document.getElementById('canvas-ghost');
const ctxGhost = canvasGhost.getContext('2d');

let currentIndex = 0;
let pixelSize = 1;
let displayWidth = window.innerWidth * 0.05;

let chaos = 0;
let nextClicks = 0;
let backClicks = 0;
let clicks = 0;
let lastWentUp = false;

const photoImg = new Image();
photoImg.src = media[0].src;

let photoDrawLoop = null;

// ------- LOAD MEDIA ------- //

function loadMedia(index) {
    const item = media[index];

    // Stop any existing photo draw loop
    if (photoDrawLoop !== null) {
        cancelAnimationFrame(photoDrawLoop);
        photoDrawLoop = null;
    }

    if (item.type === 'image') {
        vid.pause();
        vid.src = '';

        function drawPhoto() {
            if (!photoImg.complete || photoImg.naturalWidth === 0) {
                photoDrawLoop = requestAnimationFrame(drawPhoto);
                return;
            }
            canvas.width = 300;
            canvas.height = 300 * (photoImg.naturalHeight / photoImg.naturalWidth);

            const safePixelSize = Math.min(pixelSize, displayWidth);
            const smallW = Math.max(1, Math.floor(displayWidth / safePixelSize));
            const smallH = Math.max(1, Math.floor(canvas.height / safePixelSize));

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(photoImg, 0, 0, canvas.width, canvas.height);

            photoDrawLoop = requestAnimationFrame(drawPhoto);
        }
        drawPhoto();

    } else {
        vid.src = item.src;
        vid.addEventListener('loadedmetadata', () => {
            canvas.width = displayWidth;
            canvas.height = displayWidth * (vid.videoHeight / vid.videoWidth);
            vid.play();
            drawVideo();
        }, { once: true });
    }
}

// ------- DRAW VIDEO ------- //

function drawVideo() {
    if (!vid.videoWidth || !vid.videoHeight) {
        requestAnimationFrame(drawVideo);
        return;
    }

    canvas.width = displayWidth;
    canvas.height = displayWidth * (vid.videoHeight / vid.videoWidth);
    const safePixelSize = Math.min(pixelSize, displayWidth);
    const smallW = Math.max(1, Math.floor(displayWidth / safePixelSize));
    const smallH = Math.max(1, Math.floor(canvas.height / safePixelSize));

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(vid, 0, 0, smallW, smallH);
    ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, canvas.width, canvas.height);

    // Only keep looping if we're still on a video
    if (media[currentIndex].type === 'video') {
        requestAnimationFrame(drawVideo);
    }
}

loadMedia(0);


// ------- AUTONOMOUS  ------- //
let autonomousStarted = false;

function startAutonomous() {
    if (autonomousStarted) return;
    autonomousStarted = true;

    function autonomousLoop() {
        const roll = Math.random();
        if (roll < 0.4) {
            document.getElementById('nextBtn').click();
        } else if (roll < 0.7) {
            document.getElementById('prevBtn').click();
        } else if (roll < 0.85) {
            document.getElementById('zoomInBtn').click();
        } else {
            document.getElementById('zoomOutBtn').click();
        }
        const nextDelay = Math.max(1000, 3000 - chaos * 50);
        setTimeout(autonomousLoop, nextDelay);
    }
    autonomousLoop();
}


// ------- HELPER FUNCTIONS ------- //

function triggerGhost() {
    if (canvas.width === 0 || canvas.height === 0) return;

    const numGhosts = chaos > 10 ? Math.floor(Math.random() * 3) + 1 : 1;
    const lingerDuration = 200 + chaos * 20;

    for (let i = 0; i < numGhosts; i++) {
        const ghost = document.createElement('canvas');
        ghost.width = canvas.width;
        ghost.height = canvas.height;
        ghost.style.position = 'absolute';
        ghost.style.zIndex = 0;
        ghost.style.pointerEvents = 'none';

        const minDist = 20 + chaos * 2;
        const maxDist = 40 + chaos * 4;
        const signX = Math.random() > 0.5 ? 1 : -1;
        const signY = Math.random() > 0.5 ? 1 : -1;
        ghost.style.left = (signX * (minDist + Math.random() * maxDist)) + 'px';
        ghost.style.top = (signY * (minDist + Math.random() * maxDist)) + 'px';

        ghost.getContext('2d').drawImage(canvas, 0, 0);
        document.querySelector('.video-container').appendChild(ghost);

        const duration = chaos > 15 ? 10000 : lingerDuration;
        setTimeout(() => ghost.remove(), duration);
    }
}

function triggerShift() {
    const range = chaos * 8;
    const galleryOuter = document.getElementById('gallery-outer');
    const shiftX = (Math.random() * range * 2) - range;
    const shiftY = (Math.random() * range * 2) - range;
    galleryOuter.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
}


// ------- PREV/NEXT ------- //

function updateArrows() {
    document.getElementById('title').textContent = currentIndex === 0 ? 'MY GALLERY' : 'COME CLOSER';
    
    // Prev is always hidden at index 0 — can never go back to the photo
    document.getElementById('prevBtn').style.visibility = currentIndex <= 1 ? 'hidden' : 'visible';
    document.getElementById('nextBtn').style.visibility = currentIndex === media.length - 1 ? 'hidden' : 'visible';

    const sidebar = document.getElementById('sidebar');
    sidebar.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';   
}

document.getElementById('nextBtn').addEventListener('click', () => {
    chaos++;
    nextClicks++;
    if (chaos > 17) startAutonomous();

    if (chaos >= 3) {
        const ghostChance = Math.min(0.6, chaos * 0.03);
        if (Math.random() < ghostChance) triggerGhost();
    }

    if (chaos >= 15) {
        const shiftChance = Math.min(0.4, chaos * 0.02);
        if (Math.random() < shiftChance) triggerShift();
    }

    if (currentIndex < media.length - 1) {
        currentIndex++;
        loadMedia(currentIndex);
    }
    updateArrows();
});

document.getElementById('prevBtn').addEventListener('click', () => {
    // Never go back to index 0 (the photo)
    if (currentIndex <= 1) return;

    chaos++;
    backClicks++;
    if (chaos > 20) startAutonomous();

    if (chaos >= 10) {
        const shiftChance = Math.min(0.4, chaos * 0.02);
        if (Math.random() < shiftChance) triggerShift();
    }

    if (chaos >= 12) {
        const ghostChance = Math.min(0.5, chaos * 0.03);
        if (Math.random() < ghostChance) triggerGhost();
    }

    currentIndex--;
    loadMedia(currentIndex);
    updateArrows();
});


// ------- SIDEBAR DRAG ------- //

const sidebar = document.getElementById('sidebar');
const sidebarHeader = document.getElementById('sidebar-header');
let isDragging = false;
let dragOffsetX, dragOffsetY;

sidebarHeader.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - sidebar.getBoundingClientRect().left;
    dragOffsetY = e.clientY - sidebar.getBoundingClientRect().top;
    sidebar.style.cursor = 'grabbing';
    sidebar.style.transform = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    sidebar.style.left = (e.clientX - dragOffsetX) + 'px';
    sidebar.style.top = (e.clientY - dragOffsetY) + 'px';
    sidebar.style.right = 'auto';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    sidebar.style.cursor = 'grab';
});


// ------- ZOOM IN ------- //

document.getElementById('zoomInBtn').addEventListener('click', () => {
    displayWidth += 80;
    if (clicks < 10) {
        if (clicks < 5) {
            pixelSize += 3;
        } else {
            pixelSize *= 2;
        }
        clicks++;
    }
});

// ------- ZOOM OUT ------- //

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    const goesUp = Math.random() < 0.15;
    displayWidth += goesUp ? 80 : -80;
    displayWidth = Math.max(100, displayWidth);
});

updateArrows();

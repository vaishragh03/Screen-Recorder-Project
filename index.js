let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-container");
let recordBtn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-container");
let captureBtn = document.querySelector(".capture-btn");
let allFilter = document.querySelectorAll(".filter");
let timer = document.querySelector(".timer");

let recorder;
let chunks = [];
let recordFlag = false;
let timerID;
let counter = 0;
let currentFilterClass = "";

// Setting up canvas for processing
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
let canvasStream;

// Getting user media & setup
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
.then((stream) => {
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    // Drawing video frames into canvas with filter
    function drawFrame() {
        // Applying canvas filter matching current filter
        if (currentFilterClass === "video-filter-orange") {
            ctx.filter = "sepia(0.4) saturate(1.2) brightness(1.1) hue-rotate(10deg)";
        } else if (currentFilterClass === "video-filter-vintage") {
            ctx.filter = "grayscale(0.5) contrast(1.2)";
        } else if (currentFilterClass === "video-filter-pink") {
            ctx.filter = "hue-rotate(300deg) saturate(1.5)";
        } else {
            ctx.filter = "none";
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
    }
    drawFrame();

    // Capturing canvas stream (30fps)
    canvasStream = canvas.captureStream(30);
    recorder = new MediaRecorder(canvasStream);

    recorder.addEventListener("start", () => { chunks = []; });
    recorder.addEventListener("dataavailable", (e) => { chunks.push(e.data); });
    recorder.addEventListener("stop", () => {
        let blob = new Blob(chunks, { type: "video/mp4" });
        let videoURL = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = videoURL;
        a.download = "recorded.mp4";
        a.click();
    });
});

// Recording button logic
recordBtnCont.addEventListener("click", () => {
    if (!recorder) return;
    recordFlag = !recordFlag;
    if (recordFlag) {
        recorder.start();
        recordBtn.classList.add("scale-for-record");
        startTimer();
    } else {
        recorder.stop();
        recordBtn.classList.remove("scale-for-record");
        stopTimer();
    }
});

// Capturing button logic
captureBtnCont.addEventListener("click", () => {
    captureBtnCont.classList.add("scale-for-capture");

    // Appling same filter before drawing
    if (currentFilterClass === "video-filter-orange") {
        ctx.filter = "sepia(0.4) saturate(1.2) brightness(1.1) hue-rotate(10deg)";
    } else if (currentFilterClass === "video-filter-vintage") {
        ctx.filter = "grayscale(0.5) contrast(1.2)";
    } else if (currentFilterClass === "video-filter-pink") {
        ctx.filter = "hue-rotate(300deg) saturate(1.5)";
    } else {
        ctx.filter = "none";
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let imageURL = canvas.toDataURL("image/jpeg");
    let a = document.createElement('a');
    a.href = imageURL;
    a.download = "captured.jpeg";
    a.click();

    setTimeout(() => {
        captureBtn.classList.remove("scale-for-capture");
    }, 500);
});

// Filter buttons
allFilter.forEach((filterElem) => {
    filterElem.addEventListener("click", () => {
   
        if (currentFilterClass) video.classList.remove(currentFilterClass);

        if (filterElem.classList.contains("orange")) {
            currentFilterClass = "video-filter-orange";
        } else if (filterElem.classList.contains("vintage")) {
            currentFilterClass = "video-filter-vintage";
        } else if (filterElem.classList.contains("pink")) {
            currentFilterClass = "video-filter-pink";
        } else {
            currentFilterClass = "";
        }

        if (currentFilterClass) video.classList.add(currentFilterClass);
    });
});

// Timer functions
function startTimer() {
    timer.style.display = "block";
    counter = 0;
    timerID = setInterval(() => {
        let total = counter++;
        let hours = String(Math.floor(total / 3600)).padStart(2, '0');
        let minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
        let seconds = String(total % 60).padStart(2, '0');
        timer.innerText = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}
function stopTimer() {
    clearInterval(timerID);
    timer.innerText = "00:00:00";
    timer.style.display = "none";
}

// Cursor sparkle effect
const cursorDot = document.createElement("div");
const cursorTrail = document.createElement("div");
cursorDot.className = "cursor-dot";
cursorTrail.className = "cursor-trail";
document.body.appendChild(cursorDot);
document.body.appendChild(cursorTrail);

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;
document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.top = `${mouseY}px`;
    cursorDot.style.left = `${mouseX}px`;
});
function animateTrail() {
    trailX += (mouseX - trailX) / 8;
    trailY += (mouseY - trailY) / 8;
    cursorTrail.style.top = `${trailY}px`;
    cursorTrail.style.left = `${trailX}px`;
    requestAnimationFrame(animateTrail);
}
animateTrail();

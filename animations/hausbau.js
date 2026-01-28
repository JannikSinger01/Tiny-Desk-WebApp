const COLS = 8;
const ROWS = 6;
const BRICK_W = 30;
const BRICK_H = 15;

const POS_AI_BOX = 40;
const POS_HOUSE2 = 180;
const POS_HOUSE1 = 500;
const POS_PILE = 880;

// Hilfsfunktion zur Erstellung der Steine im DOM
function createBricks(containerId) {
    const container = document.getElementById(containerId);
    const bricks = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const brick = document.createElement('div');
            brick.className = 'brick';
            brick.style.left = `${c * BRICK_W}px`;
            brick.style.bottom = `${r * BRICK_H}px`;
            container.appendChild(brick);
            bricks.push(brick);
        }
    }
    return bricks;
}

// Initialisierung
const bricks1 = createBricks('house1-bricks');
const bricks2 = createBricks('house2-bricks');
let mainTl = gsap.timeline({ paused: true });

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseBtnText = document.getElementById('pauseBtnText');

// Event-Listener für Steuerung
startBtn.addEventListener('click', () => {
    mainTl.kill();
    mainTl = gsap.timeline({ paused: true });
    gsap.set('.brick, .roof, .tool-icon, .wheelbarrow', { opacity: 0 });
    gsap.set('.tool-icon, .wheelbarrow, .worker', { bottom: 0 });
    gsap.set('#worker', { left: POS_HOUSE1 + 100, bottom: 0, scale: 1 });
    updatePauseButtonUI(false);
    runSimulation();
    mainTl.play();
});

pauseBtn.addEventListener('click', () => {
    if (mainTl.isActive() || mainTl.paused()) {
        const isPaused = !mainTl.paused();
        mainTl.paused(isPaused);
        updatePauseButtonUI(isPaused);
    }
});

function updatePauseButtonUI(isPaused) {
    pauseBtnText.innerText = isPaused ? "Fortsetzen" : "Pause";
    pauseBtn.classList.toggle('bg-blue-50', isPaused);
}

// Die Hauptanimations-Logik (GSAP)
function runSimulation() {
    const worker = "#worker";
    const hammer = "#hammer";
    const ladder = "#ladder";
    const barrow = "#barrow";
    let t = 0;

    // --- HAUS 1: MANUELL ---
    bricks1.forEach((brick, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        const targetX = POS_HOUSE1 + (c * BRICK_W);
        const targetY = r * BRICK_H;

        mainTl.to(worker, { left: POS_PILE, bottom: 0, duration: 0.1, ease: "none" }, t);
        t += 0.1;
        mainTl.to(worker, { left: targetX, bottom: targetY, duration: 0.1, ease: "none" }, t);
        t += 0.1;
        mainTl.to(brick, { opacity: 1, duration: 0.02 }, t);
        t += 0.02;
    });
    mainTl.to("#roof1", { opacity: 1, duration: 0.4 }, t);
    t += 0.5;

    // --- TOOLS HOLEN ---
    mainTl.to(worker, { left: POS_AI_BOX, bottom: 0, duration: 0.5 }, t);
    t += 0.5;

    mainTl.set([hammer, ladder, barrow], { opacity: 1, bottom: 0 }, t);
    mainTl.to([hammer, ladder, barrow, worker], { left: POS_HOUSE2 + 40, duration: 0.6 }, t);
    t += 0.6;

    mainTl.to(hammer, { left: POS_HOUSE2 - 30, bottom: 0, duration: 0.3 }, t);
    mainTl.to(ladder, { left: POS_HOUSE2 - 60, bottom: 0, duration: 0.3 }, t);
    t += 0.3;

    // --- HAUS 2: KI SUPPORT ---
    const batchSize = 12;
    const totalBricks = 48;
    
    for (let b = 0; b < totalBricks; b += batchSize) {
        mainTl.to(worker, { left: POS_PILE, bottom: 0, duration: 0.35 }, t);
        mainTl.to(barrow, { left: POS_PILE - 35, bottom: 0, duration: 0.35 }, t);
        t += 0.6; 

        mainTl.to(worker, { left: POS_HOUSE2 + 20, duration: 0.35 }, t);
        mainTl.to(barrow, { left: POS_HOUSE2 - 15, duration: 0.35 }, t);
        t += 0.35;

        for (let i = 0; i < batchSize; i++) {
            const idx = b + i;
            const r = Math.floor(idx / COLS);
            const c = idx % COLS;
            const targetX = POS_HOUSE2 + (c * BRICK_W);
            const targetY = r * BRICK_H;

            if (c === 0 || i === 0) {
                mainTl.to(ladder, { left: targetX - 10, bottom: targetY, duration: 0.1 }, t);
            }

            mainTl.to([worker, hammer], { 
                left: targetX, 
                bottom: targetY, 
                duration: 0.05 
            }, t);
            
            mainTl.to(bricks2[idx], { opacity: 1, duration: 0.02 }, t + 0.05);
            t += 0.07;
        }
        
        if (b + batchSize < totalBricks) {
            mainTl.to(hammer, { left: POS_HOUSE2 - 30, bottom: 0, duration: 0.2 }, t);
            mainTl.to(ladder, { left: POS_HOUSE2 - 60, bottom: 0, duration: 0.2 }, t);
            t += 0.2;
        }
    }

    mainTl.to("#roof2", { opacity: 1, duration: 0.5, ease: "bounce.out" }, t);
    t += 0.5;
    
    mainTl.add(() => {
        updatePauseButtonUI(false);
    }, t);
}

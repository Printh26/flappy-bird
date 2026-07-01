const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// ================= RESOLUTION ADAPTATIVE =================


let GAME_WIDTH = 400;
let GAME_HEIGHT = 600;


function resizeCanvas(){

    let ratio = GAME_WIDTH / GAME_HEIGHT;

    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;


    if(screenWidth / screenHeight > ratio){

        canvas.height = screenHeight;
        canvas.width = screenHeight * ratio;

    }else{

        canvas.width = screenWidth;
        canvas.height = screenWidth / ratio;

    }


    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";


}



resizeCanvas();


window.addEventListener(
"resize",
resizeCanvas
);




// ================= CREATEUR =================


const creatorName = "harry Aristote CREATION";





// ================= IMAGES =================


const dayBackground = new Image();
dayBackground.src = "images/background_day.png";


const nightBackground = new Image();
nightBackground.src = "images/background_night.png";



const birdImage = new Image();
birdImage.src = "images/bird.png";



const pipeGreen = new Image();
pipeGreen.src = "images/pipe-green.png";



const pipeRed = new Image();
pipeRed.src = "images/pipe-red.png";



const coinImage = new Image();
coinImage.src = "images/coin.png";



const baseImage = new Image();
baseImage.src = "images/base.png";


// ================= SONS =================


let audioContext = null;

let backgroundMusic = null;

let musicEnabled = true;

let soundEffectsEnabled = true;

let vibrationsEnabled = true;


function initAudio(){

    if(audioContext) return;

    audioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

}


function startBackgroundMusic(){

    if(!musicEnabled || !audioContext || backgroundMusic) return;

    const musicGain = audioContext.createGain();
    musicGain.gain.value = 0.025;
    musicGain.connect(audioContext.destination);

    const bass = audioContext.createOscillator();
    bass.type = "sine";
    bass.frequency.value = 110;

    const harmony = audioContext.createOscillator();
    harmony.type = "triangle";
    harmony.frequency.value = 220;

    bass.connect(musicGain);
    harmony.connect(musicGain);

    bass.start();
    harmony.start();

    const melodyNotes = [440, 523, 659, 523, 392, 494, 587, 494];
    let melodyIndex = 0;

    function playMusicNote(){

        if(!backgroundMusic) return;

        const now = audioContext.currentTime;
        const noteGain = audioContext.createGain();
        const note = audioContext.createOscillator();

        note.type = "square";
        note.frequency.value = melodyNotes[melodyIndex];

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.045, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        note.connect(noteGain);
        noteGain.connect(audioContext.destination);

        note.start(now);
        note.stop(now + 0.24);

        melodyIndex = (melodyIndex + 1) % melodyNotes.length;

    }

    backgroundMusic = {
        bass,
        harmony,
        gain:musicGain,
        melodyInterval:setInterval(playMusicNote, 320)
    };

    playMusicNote();

}


function stopBackgroundMusic(){

    if(!backgroundMusic) return;

    const now = audioContext.currentTime;

    backgroundMusic.gain.gain.cancelScheduledValues(now);
    backgroundMusic.gain.gain.setValueAtTime(
        backgroundMusic.gain.gain.value,
        now
    );
    backgroundMusic.gain.gain.linearRampToValueAtTime(0, now + 0.25);

    backgroundMusic.bass.stop(now + 0.3);
    backgroundMusic.harmony.stop(now + 0.3);
    clearInterval(backgroundMusic.melodyInterval);

    backgroundMusic = null;

}


function playCoinSound(){

    if(!soundEffectsEnabled || !audioContext) return;

    const now = audioContext.currentTime;
    const coinGain = audioContext.createGain();
    const firstTone = audioContext.createOscillator();
    const secondTone = audioContext.createOscillator();

    coinGain.gain.setValueAtTime(0, now);
    coinGain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    coinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    coinGain.connect(audioContext.destination);

    firstTone.type = "square";
    firstTone.frequency.setValueAtTime(880, now);
    firstTone.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    secondTone.type = "triangle";
    secondTone.frequency.setValueAtTime(1760, now + 0.08);

    firstTone.connect(coinGain);
    secondTone.connect(coinGain);

    firstTone.start(now);
    secondTone.start(now + 0.08);

    firstTone.stop(now + 0.22);
    secondTone.stop(now + 0.35);

}


function playGameOverSound(){

    if(!soundEffectsEnabled || !audioContext) return;

    const now = audioContext.currentTime;
    const gameOverGain = audioContext.createGain();
    const tone = audioContext.createOscillator();

    gameOverGain.gain.setValueAtTime(0, now);
    gameOverGain.gain.linearRampToValueAtTime(0.24, now + 0.02);
    gameOverGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    gameOverGain.connect(audioContext.destination);

    tone.type = "sawtooth";
    tone.frequency.setValueAtTime(260, now);
    tone.frequency.exponentialRampToValueAtTime(80, now + 0.7);
    tone.connect(gameOverGain);

    tone.start(now);
    tone.stop(now + 0.8);

}


function vibrateDevice(duration){

    if(vibrationsEnabled && navigator.vibrate){

        navigator.vibrate(duration);

    }

}


function triggerGameOver(){

    if(gameOver) return;

    gameOver = true;
    gameState = "gameOver";
    stopBackgroundMusic();
    playGameOverSound();
    vibrateDevice(180);

}


function unlockAudio(){

    initAudio();

    if(audioContext && audioContext.state === "suspended"){

        audioContext.resume();

    }

    if(gameState === "playing"){

        startBackgroundMusic();

    }

}







// ================= ECHELLE =================


function scaleX(value){

    return value * canvas.width / GAME_WIDTH;

}


function scaleY(value){

    return value * canvas.height / GAME_HEIGHT;

}







// ================= OISEAU =================


let bird = {


x:80,


y:250,


width:50,


height:40,


velocity:0,


rotation:0


};





const gravity = 0.25;


const jumpForce = -6;







// ================= VARIABLES JEU =================


let pipes = [];

let coins = [];


let score = 0;


let bestScore =
localStorage.getItem("best")
|| 0;



let gameOver = false;


let gameState = "menu";


let frame = 0;


let speed = 2;


let difficulty = "normal";

const difficulties = {
    facile:{
        label:"FACILE",
        speed:1.7,
        gap:230,
        pipeEvery:120,
        coinEvery:150
    },
    normal:{
        label:"NORMAL",
        speed:2,
        gap:200,
        pipeEvery:100,
        coinEvery:150
    },
    difficile:{
        label:"DIFFICILE",
        speed:2.6,
        gap:170,
        pipeEvery:85,
        coinEvery:135
    }
};






// ================= JOUR / NUIT =================


let isNight = false;


let timeCounter = 0;






// ================= SOL =================


let baseX = 0;


let baseY = 560;






// ================= PIECES =================


let coinRotation = 0;


// ================= MENU =================


let menuButtons = [];


function drawMenuButton(id,label,y,color){

    const width = Math.min(canvas.width * 0.76, 300);
    const height = 48;
    const x = canvas.width/2 - width/2;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, canvas.width/2, y + 31);

    menuButtons.push({
        id,
        x,
        y,
        width,
        height
    });

}


function drawPauseButton(){

    const width = 94;
    const height = 38;
    const x = canvas.width - width - 12;
    const y = 12;

    ctx.fillStyle = "#222";
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSE", x + width/2, y + 25);

    menuButtons.push({
        id:"pause",
        x,
        y,
        width,
        height
    });

    ctx.textAlign = "left";

}


function drawMenu(){

    menuButtons = [];

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 38px Arial";
    ctx.fillText("🐦 FLAPPY BIRD", canvas.width/2, canvas.height * 0.18);

    ctx.drawImage(
        birdImage,
        canvas.width/2 - 32,
        canvas.height * 0.21,
        64,
        50
    );

    ctx.font = "18px Arial";
    ctx.fillText(creatorName, canvas.width/2, canvas.height * 0.35);

    const startY = canvas.height * 0.43;

    drawMenuButton("play", "▶ JOUER", startY, "#22a447");
    drawMenuButton("settings", "⚙ PARAMÈTRES", startY + 66, "#2d7dd2");
    drawMenuButton("best", "🏆 MEILLEUR SCORE", startY + 132, "#d18b00");

    ctx.textAlign = "left";

}


function drawSettings(){

    menuButtons = [];

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 34px Arial";
    ctx.fillText("PARAMÈTRES", canvas.width/2, canvas.height * 0.22);

    const startY = canvas.height * 0.25;

    drawMenuButton("toggleMusic", "MUSIQUE " + (musicEnabled ? "ON" : "OFF"), startY, musicEnabled ? "#22a447" : "#777");
    drawMenuButton("toggleEffects", "EFFETS " + (soundEffectsEnabled ? "ON" : "OFF"), startY + 50, soundEffectsEnabled ? "#22a447" : "#777");
    drawMenuButton("toggleVibrations", "VIBRATIONS " + (vibrationsEnabled ? "ON" : "OFF"), startY + 100, vibrationsEnabled ? "#22a447" : "#777");

    ctx.font = "bold 18px Arial";
    ctx.fillText("DIFFICULTÉ", canvas.width/2, startY + 160);

    drawMenuButton("difficultyFacile", "FACILE", startY + 174, difficulty === "facile" ? "#d18b00" : "#444");
    drawMenuButton("difficultyNormal", "NORMAL", startY + 224, difficulty === "normal" ? "#d18b00" : "#444");
    drawMenuButton("difficultyDifficile", "DIFFICILE", startY + 274, difficulty === "difficile" ? "#d18b00" : "#444");

    drawMenuButton("back", "RETOUR MENU", startY + 326, "#2d7dd2");

    ctx.textAlign = "left";

}


function drawPauseScreen(){

    menuButtons = [];

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 38px Arial";
    ctx.fillText("PAUSE", canvas.width/2, canvas.height * 0.25);

    const startY = canvas.height * 0.38;

    drawMenuButton("resume", "▶ REPRENDRE", startY, "#22a447");
    drawMenuButton("settings", "⚙ PARAMÈTRES", startY + 66, "#2d7dd2");
    drawMenuButton("menu", "MENU", startY + 132, "#444");

    ctx.textAlign = "left";

}


function drawBestScoreScreen(){

    menuButtons = [];

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";
    ctx.fillText("MEILLEUR SCORE", canvas.width/2, canvas.height * 0.24);

    ctx.font = "bold 54px Arial";
    ctx.fillText(bestScore, canvas.width/2, canvas.height * 0.42);

    drawMenuButton("back", "RETOUR", canvas.height * 0.58, "#444");

    ctx.textAlign = "left";

}


function getPointerPosition(e){

    const rect = canvas.getBoundingClientRect();
    const pointer = e.touches ? e.touches[0] : e;

    return {
        x:(pointer.clientX - rect.left) * canvas.width / rect.width,
        y:(pointer.clientY - rect.top) * canvas.height / rect.height
    };

}


function handleMenuPointer(e){

    const position = getPointerPosition(e);
    const button = menuButtons.find(item =>
        position.x >= item.x &&
        position.x <= item.x + item.width &&
        position.y >= item.y &&
        position.y <= item.y + item.height
    );

    if(!button) return false;

    if(button.id === "play"){

        restartGame();
        unlockAudio();

    }

    if(button.id === "pause"){

        gameState = "paused";
        stopBackgroundMusic();

    }


    if(button.id === "resume"){

        gameState = "playing";
        startBackgroundMusic();

    }


    if(button.id === "settings"){

        gameState = "settings";
        stopBackgroundMusic();

    }

    if(button.id === "best"){

        gameState = "bestScore";
        stopBackgroundMusic();

    }

    if(button.id === "back"){

        gameState = "menu";
        stopBackgroundMusic();

    }

    if(button.id === "menu"){

        gameState = "menu";
        gameOver = false;
        stopBackgroundMusic();

    }

    if(button.id === "toggleMusic"){

        musicEnabled = !musicEnabled;

        if(!musicEnabled){

            stopBackgroundMusic();

        }

        else if(gameState === "playing"){

            startBackgroundMusic();

        }

    }

    if(button.id === "toggleEffects"){

        soundEffectsEnabled = !soundEffectsEnabled;

    }

    if(button.id === "toggleVibrations"){

        vibrationsEnabled = !vibrationsEnabled;
        vibrateDevice(40);

    }

    if(button.id === "difficultyFacile"){

        difficulty = "facile";
        speed = difficulties[difficulty].speed;

    }

    if(button.id === "difficultyNormal"){

        difficulty = "normal";
        speed = difficulties[difficulty].speed;

    }

    if(button.id === "difficultyDifficile"){

        difficulty = "difficile";
        speed = difficulties[difficulty].speed;

    }

    return true;

}





// ================= CREATION TUYAU =================


function createPipe(){


    let topHeight =
    Math.random()*250 + 50;

    const difficultyConfig = difficulties[difficulty];



    pipes.push({

        x:GAME_WIDTH,

        width:70,

        topHeight:topHeight,

        gap:difficultyConfig.gap,

        passed:false

    });


}






// ================= CREATION PIECE =================


function createCoin(){


    coins.push({

        x:GAME_WIDTH + 50,

        y:Math.random()*350 + 80,

        size:40

    });


}
// ================= UPDATE =================


function update(){


if(gameState !== "playing") return;



frame++;




// gravité oiseau


bird.velocity += gravity;


bird.y += bird.velocity;



bird.rotation = bird.velocity * 0.05;






// jour nuit


timeCounter++;


if(timeCounter > 600){


isNight = !isNight;


timeCounter = 0;


}






// création tuyaux


if(frame % difficulties[difficulty].pipeEvery === 0){


createPipe();


}






// création pièces


if(frame % difficulties[difficulty].coinEvery === 0){


createCoin();


}







// déplacement tuyaux


pipes.forEach((pipe,index)=>{


pipe.x -= speed;




// collision


if(


bird.x < pipe.x + pipe.width &&


bird.x + bird.width > pipe.x &&


(


bird.y < pipe.topHeight ||


bird.y + bird.height >

pipe.topHeight + pipe.gap


)


){


triggerGameOver();


}





// score


if(

!pipe.passed &&

bird.x > pipe.x + pipe.width

){


pipe.passed = true;


score++;


}






// suppression


if(pipe.x + pipe.width < 0){


pipes.splice(index,1);


}



});








// déplacement pièces


coins.forEach((coin,index)=>{


coin.x -= speed;





// récupération pièce


if(


bird.x < coin.x + coin.size &&


bird.x + bird.width > coin.x &&


bird.y < coin.y + coin.size &&


bird.y + bird.height > coin.y


){


playCoinSound();

vibrateDevice(35);


score += 5;


coins.splice(index,1);


}





if(coin.x < 0){


coins.splice(index,1);


}



});







// sol


if(

bird.y + bird.height >= baseY

){


triggerGameOver();


}






// record


if(score > bestScore){


bestScore = score;


localStorage.setItem(

"best",

bestScore

);


}



}









// ================= DESSIN OISEAU =================



function drawBird(){



ctx.save();



ctx.translate(

scaleX(bird.x + bird.width/2),

scaleY(bird.y + bird.height/2)

);




ctx.rotate(bird.rotation);





ctx.drawImage(


birdImage,


scaleX(-bird.width/2),


scaleY(-bird.height/2),


scaleX(bird.width),


scaleY(bird.height)


);





ctx.restore();



}








// ================= TUYAUX =================


function drawPipes(){



pipes.forEach(pipe=>{





ctx.drawImage(


pipeRed,


scaleX(pipe.x),


scaleY(pipe.topHeight - 500),


scaleX(pipe.width),


scaleY(500)


);








ctx.drawImage(


pipeGreen,


scaleX(pipe.x),


scaleY(pipe.topHeight + pipe.gap),


scaleX(pipe.width),


scaleY(500)


);




});



}








// ================= PIECES =================



function drawCoins(){



if(gameState === "playing"){

coinRotation += 0.15;

}





coins.forEach(coin=>{



ctx.save();




ctx.translate(


scaleX(coin.x + coin.size/2),


scaleY(coin.y + coin.size/2)


);





ctx.rotate(coinRotation);





ctx.drawImage(


coinImage,


scaleX(-coin.size/2),


scaleY(-coin.size/2),


scaleX(coin.size),


scaleY(coin.size)


);





ctx.restore();




});



}






// ================= SOL =================


function drawBase(){



if(gameState === "playing"){

baseX -= speed;

}



if(baseX <= -GAME_WIDTH){


baseX = 0;


}







ctx.drawImage(


baseImage,


scaleX(baseX),


scaleY(baseY),


canvas.width,


scaleY(60)


);






ctx.drawImage(


baseImage,


scaleX(baseX + GAME_WIDTH),


scaleY(baseY),


canvas.width,


scaleY(60)


);



}
// ================= SCORE =================


function drawScore(){


ctx.fillStyle = "white";


ctx.font = "25px Arial";



ctx.fillText(

"Score : " + score,

10,

40

);



ctx.fillText(

"Record : " + bestScore,

10,

70

);




// signature


ctx.font = "18px Arial";


ctx.fillText(

creatorName,

10,

canvas.height - 20

);



}








// ================= AFFICHAGE =================



function draw(){



ctx.clearRect(

0,

0,

canvas.width,

canvas.height

);






// fond


let bg = isNight ?

nightBackground :

dayBackground;





ctx.drawImage(

bg,

0,

0,

canvas.width,

canvas.height

);







drawPipes();


drawCoins();


drawBird();


drawBase();


drawScore();

menuButtons = [];


if(gameState === "playing"){

drawPauseButton();

}


if(gameState === "menu"){

drawMenu();

return;

}


if(gameState === "settings"){

drawSettings();

return;

}


if(gameState === "bestScore"){

drawBestScoreScreen();

return;

}


if(gameState === "paused"){

drawPauseScreen();

return;

}







// GAME OVER


if(gameOver){



ctx.fillStyle = "red";


ctx.font = "40px Arial";



ctx.fillText(

"GAME OVER",

canvas.width/2 - 110,

canvas.height/2

);





ctx.fillStyle="white";


ctx.font="20px Arial";



ctx.fillText(

"TOUCHER POUR REJOUER",

canvas.width/2 - 130,

canvas.height/2 + 40

);

drawMenuButton("play", "▶ REJOUER", canvas.height/2 + 74, "#22a447");
drawMenuButton("menu", "MENU", canvas.height/2 + 136, "#444");



}



}









// ================= RESET JEU =================



function restartGame(){



bird.y = 250;


bird.velocity = 0;



pipes = [];


coins = [];



score = 0;



frame = 0;



speed = difficulties[difficulty].speed;



gameOver = false;


gameState = "playing";


if(audioContext){

    startBackgroundMusic();

}



}









// ================= CONTROLES CLAVIER =================



document.addEventListener(

"keydown",

(e)=>{


if(gameState === "menu" && (e.code === "Space" || e.code === "Enter")){

restartGame();
unlockAudio();
return;

}


if((gameState === "settings" || gameState === "bestScore") && e.code === "Escape"){

gameState = "menu";
return;

}


if(gameState === "playing" && (e.code === "KeyP" || e.code === "Escape")){

gameState = "paused";
stopBackgroundMusic();
return;

}


if(gameState === "paused" && (e.code === "KeyP" || e.code === "Escape" || e.code === "Space")){

gameState = "playing";
unlockAudio();
return;

}


if(gameState === "gameOver" && (e.code === "Space" || e.key.toLowerCase() === "r")){

restartGame();
unlockAudio();
return;

}


if(gameState === "playing" && e.code === "Space"){

unlockAudio();
bird.velocity = jumpForce;

}



}

);









// ================= CONTROLE TACTILE =================



canvas.addEventListener(

"touchstart",

(e)=>{


e.preventDefault();


if(gameState === "menu" || gameState === "settings" || gameState === "bestScore" || gameState === "paused"){

handleMenuPointer(e);
return;

}


if(gameState === "gameOver"){

if(handleMenuPointer(e)) return;



restartGame();
unlockAudio();



}

else if(gameState === "playing"){

if(handleMenuPointer(e)) return;


unlockAudio();

bird.velocity = jumpForce;



}



},



{

passive:false

}

);








// ================= SOURIS =================



canvas.addEventListener(

"mousedown",

(e)=>{


if(gameState === "menu" || gameState === "settings" || gameState === "bestScore" || gameState === "paused"){

handleMenuPointer(e);
return;

}


if(gameState === "gameOver"){

if(handleMenuPointer(e)) return;


restartGame();
unlockAudio();


}

else if(gameState === "playing"){

if(handleMenuPointer(e)) return;


unlockAudio();
bird.velocity = jumpForce;


}



});
// ================= BOUCLE DU JEU =================


function gameLoop(){



update();



draw();




requestAnimationFrame(gameLoop);



}







// ================= ADAPTATION POSITION =================



function updatePosition(){



if(bird.y < 0){



bird.y = 0;



}






if(bird.y > GAME_HEIGHT){



triggerGameOver();



}





}








// ================= LANCEMENT =================



gameLoop();







// ================= SUPPORT MOBILE =================



document.body.addEventListener(

"touchmove",

(e)=>{


e.preventDefault();


},


{

passive:false

}

);







console.log(

"Flappy Bird - " + creatorName

);

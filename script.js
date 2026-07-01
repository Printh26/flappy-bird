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


const creatorName = "HARRY_ARISTOTE CREATION";





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


function initAudio(){

    if(audioContext) return;

    audioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

}


function startBackgroundMusic(){

    if(!audioContext || backgroundMusic) return;

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

    if(!audioContext) return;

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

    if(!audioContext) return;

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


function triggerGameOver(){

    if(gameOver) return;

    gameOver = true;
    stopBackgroundMusic();
    playGameOverSound();

}


function unlockAudio(){

    initAudio();

    if(audioContext && audioContext.state === "suspended"){

        audioContext.resume();

    }

    if(!gameOver){

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


let frame = 0;


let speed = 2;






// ================= JOUR / NUIT =================


let isNight = false;


let timeCounter = 0;






// ================= SOL =================


let baseX = 0;


let baseY = 560;






// ================= PIECES =================


let coinRotation = 0;





// ================= CREATION TUYAU =================


function createPipe(){


    let topHeight =
    Math.random()*250 + 50;



    pipes.push({

        x:GAME_WIDTH,

        width:70,

        topHeight:topHeight,

        gap:200,

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


if(gameOver) return;



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


if(frame % 100 === 0){


createPipe();


}






// création pièces


if(frame % 150 === 0){


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



coinRotation += 0.15;





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



baseX -= 2;



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



speed = 2;



gameOver = false;


if(audioContext){

    startBackgroundMusic();

}



}









// ================= CONTROLES CLAVIER =================



document.addEventListener(

"keydown",

(e)=>{


unlockAudio();



if(e.code === "Space"){



if(!gameOver){



bird.velocity = jumpForce;


}


}




if(

e.key.toLowerCase() === "r"

&&

gameOver

){


restartGame();


}



}

);









// ================= CONTROLE TACTILE =================



canvas.addEventListener(

"touchstart",

(e)=>{


e.preventDefault();


unlockAudio();





if(gameOver){



restartGame();



}

else{



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

()=>{


unlockAudio();



if(gameOver){


restartGame();


}

else{


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

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


gameOver = true;


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


gameOver = true;


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

"Toucher pour rejouer",

canvas.width/2 - 110,

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



}









// ================= CONTROLES CLAVIER =================



document.addEventListener(

"keydown",

(e)=>{



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



gameOver = true;



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
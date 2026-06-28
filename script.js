const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;


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





// ================= JEU =================


let pipes = [];

let coins = [];


let score = 0;


let bestScore = localStorage.getItem("best") || 0;



let gameOver = false;



let frame = 0;


let speed = 2;





// ================= JOUR NUIT =================


let isNight = false;


let timeCounter = 0;





// ================= BASE =================


let baseX = 0;


let baseY = 560;





// ================= PIECE ROTATION =================


let coinRotation = 0;





// ================= CREATION TUYAU =================



function createPipe(){


let topHeight = Math.random()*250 + 50;



pipes.push({


x:canvas.width,


width:70,


topHeight:topHeight,


gap:200,


passed:false



});


}






// ================= CREATION PIECE =================



function createCoin(){


coins.push({


x:canvas.width + 50,


y:Math.random()*350 + 80,


size:40


});


}







// ================= UPDATE =================



function update(){


if(gameOver)return;



frame++;




// attente départ

if(frame > 60){



bird.velocity += gravity;


bird.y += bird.velocity;



bird.rotation = bird.velocity * 0.05;


}




// jour nuit


timeCounter++;



if(timeCounter > 600){


isNight = !isNight;


timeCounter = 0;


}






// tuyaux



if(frame % 100 === 0){


createPipe();


}






// pièces



if(frame % 150 === 0){


createCoin();


}







// mouvement tuyaux



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







if(

!pipe.passed &&

bird.x > pipe.x + pipe.width


){


pipe.passed = true;


score++;


}






if(pipe.x + pipe.width < 0){


pipes.splice(index,1);


}



});









// gestion pièces



coins.forEach((coin,index)=>{



coin.x -= speed;





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


if(bird.y + bird.height >= baseY){


gameOver = true;


}





// meilleur score


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


bird.x + bird.width/2,


bird.y + bird.height/2


);



ctx.rotate(bird.rotation);



ctx.drawImage(


birdImage,


-bird.width/2,


-bird.height/2,


bird.width,


bird.height


);



ctx.restore();


}









// ================= TUYAUX =================



function drawPipes(){


pipes.forEach(pipe=>{



ctx.drawImage(


pipeRed,


pipe.x,


pipe.topHeight - 500,


pipe.width,


500


);





ctx.drawImage(


pipeGreen,


pipe.x,


pipe.topHeight + pipe.gap,


pipe.width,


500


);




});



}










// ================= PIECES =================



function drawCoins(){



coinRotation += 0.15;



coins.forEach(coin=>{



ctx.save();



ctx.translate(


coin.x + coin.size/2,


coin.y + coin.size/2


);



ctx.rotate(coinRotation);



ctx.drawImage(


coinImage,


-coin.size/2,


-coin.size/2,


coin.size,


coin.size


);



ctx.restore();



});



}









// ================= BASE =================



function drawBase(){



baseX -= 2;



if(baseX <= -canvas.width){


baseX = 0;


}



ctx.drawImage(


baseImage,


baseX,


baseY,


canvas.width,


60


);




ctx.drawImage(


baseImage,


baseX + canvas.width,


baseY,


canvas.width,


60


);



}










// ================= SCORE =================



function drawScore(){


ctx.fillStyle="white";


ctx.font="25px Arial";



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



}









// ================= DRAW =================



function draw(){



ctx.clearRect(


0,


0,


canvas.width,


canvas.height


);





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






if(gameOver){



ctx.fillStyle="red";


ctx.font="40px Arial";



ctx.fillText(


"GAME OVER",


70,


300


);



ctx.font="20px Arial";


ctx.fillText(


"R pour rejouer",


120,


340


);



}



}










// ================= LOOP =================



function gameLoop(){



update();


draw();



requestAnimationFrame(gameLoop);


}









// ================= CONTROLES =================



document.addEventListener("keydown",(e)=>{



if(e.code==="Space" && !gameOver){


bird.velocity = jumpForce;


}






if(e.key.toLowerCase()==="r" && gameOver){



bird.y = 250;


bird.velocity = 0;



pipes=[];


coins=[];



score=0;



frame=0;



speed=3;



gameOver=false;



}



});





gameLoop();
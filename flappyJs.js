
// ----------------------------JAVA SCRIPT VARIABLES---------------------------------------------- //
//board **********
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let isNightMode = false;

//bird position and size  **********
let birdWidth = 38;
let birdHeight = 36;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes **********
let pipeArray = [];
let pipeWidth = 60;
let pipeHeight = 508;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// list of top and bottom pipes images
let pipeImages = [
    { top: "./img/Tpipe.png", bottom: "./img/Bpipe.png" },
    { top: "img/NBTpipeBlue.png", bottom: "img/NBBpipeblue.png" },
    { top: "img/NBTpipeOrange.png", bottom: "img/NBBpipeOrange.png" },
    { top: "img/NBTpipeRed.png", bottom: "img/NBBpipeRed.png" },
    { top: "img/NBTpipeViolet.png", bottom: "img/NBBpipeViolet.png" },
]
let indexImage = 0; // current index pipe displayed

//game physics  **********
let velocityX = -2; //pipes moving to left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4 //bird gravity going down

//obstacles
let gameOver = false;

//score
let score = 0;
let topScore = 0;

//points
let points = 0;
let randomPointsReset = 0;
let pointsText = '';


// Skills

// Shield size and img
let shieldActive = false;
let shieldImg;
let shieldHits = 0;

let ReviveActive = false;
let lifeImg;

let invulnerableActive = false;
let invulImg;

let skillActivationText = '';
let insufficientPoints = '';
let hitsTextShield = '';

// Points required to use power-ups
let pointsForShield = 10;
let pointsForRevive = 1;
let pointsForinvulnerable = 30;

// ----------------------------VARIABLES END---------------------------------------------- //


// ----------------------------SETTINGS FOR THE GAME------------------------- //
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        // Reset skill activation and insufficient points text
        context.clearRect(0, 0, board.width, board.height);
        // Draw Game Over Text
        context.font = "45px 'Black Ops One', system-ui"; //font of the score
        context.fillText("Game Over", 50, 150);

        // points
        context.fillStyle = "white"; //color of the text
        context.font = "15px Radio Canada Big";; //font of the score
        context.fillText("Skill Points: " + points, 260, 25);

        // score
        context.fillStyle = "white"; //color of the text
        context.font = "25px Radio Canada Big";; //font of the score
        context.fillText("Score: " + score, 75, 320); // x and y position of the score

        // Top score
        context.fillStyle = "white"; //color of the text
        context.font = "25px Radio Canada Big"; //font of the Top score
        context.fillText("High Score: " + topScore, 75, 350); // x and y position of the Top score

        return;
    } else{
        
    }
    context.clearRect(0, 0, board.width, board.height);

    //pipes functions
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            randomPointsReset += 0.5;

            if (randomPointsReset >= Math.floor(Math.random() * 5) + 1) { // Randomly choose between 3 to 5 pipes
                points += 1;
                randomPointsReset = 0; // Reset counter
                pointsText = "+1pts"; // Set the text
                setTimeout(function () {
                    pointsText = ''; // Clear the text after 1 second
                }, 1000);
            }

            // when the High score is beaten it automatically record the existing
            if (score > topScore) {
                topScore += 1;
            }

            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //bird functions
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, this limits the bird.y to go up
    if (bird.y > board.height) { //The game will end if the bird goes to the bottom
        gameOver = true;
    }

    // Draw bird or active skill
    drawSkill();

    // Draw skill activation text
    drawSkillActivationText();
    drawSkillInsufficientText();
    drawhitsTextShield();

    // pointsText
    drawPointsAcquired();

    // points
    context.fillStyle = "white"; //color of the text
    context.font = "15px Radio Canada Big"; //font of the score
    context.fillText("Skill Points: " + points, 10, 45);

    // score
    context.fillStyle = "white"; //color of the text
    context.font = "50px Radio Canada Big"; //font of the score
    context.fillText(score, 160, 150); // x and y position of the score

    // Top score
    context.fillStyle = "white"; //color of the text
    context.font = "15px Radio Canada Big"; //font of the Top score
    context.fillText("High Score: " + topScore, 10, 25); // x and y position of the Top score
}
// ----------------------------SETTINGS FOR THE GAME END------------------------- //


// -------------------------------- FUNCTIONS ------------------------------- //

function startGame() {
    $('#home-menu').hide();
    $('#game-container').show();
    // Start the game
    gameOver = false;
    points = 0;
    randomPointsReset = 0;
    score = 0;
    bird.y = birdY;
    pipeArray = [];
    requestAnimationFrame(update);
}

function exitGame(){
    $('#home-menu').show();
    $('#game-container').hide();
}

function showMechanics() {
    $('#home-menu').hide();
    $('#game-mechanics').show();
}

function customizeGame() {
    $('#home-menu').hide();
    $('#customize-menu').show();
}

function goBack() {
    $('#game-mechanics').hide();
    $('#customize-menu').hide();
    $('#home-menu').show();
}


// Background Day and Night
function toggleMode() {
    isNightMode = !isNightMode;
    updateBackground();
}

function updateBackground() {
    const board = document.getElementById("board");
    if (isNightMode) {
        board.style.backgroundImage = "url('./img/GdnytBG.jpg')";
    } else {
        board.style.backgroundImage = "url('./img/flappybirdbg.png')";
    }
}

// Pipes position
function placePipes() {
    //Pipes height 
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = boardHeight / 5; //gap of the 2 pipes

    // Top pipe placement **********
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe); //add a new pipe to the Array

    // Bottom pipe placement **********
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(bottomPipe);
}

// pipe images
function pipeImageChange(direction) {
    if (direction == "next"){
        indexImage = (indexImage + 1) % pipeImages.length;
    } else if (direction === "prev") {
        indexImage = (indexImage - 1 + pipeImages.length) % pipeImages.length; // Move to the previous image pair
    }
}

function updatePipeImages() {
    topPipeImg.src = pipeImages[indexImage].top;
    bottomPipeImg.src = pipeImages[indexImage].bottom;
}


// controls for the bird to fly
function moveBird(e) {
    if (e.code == "Space" || e.type == 'click') {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            shieldActive = false;
            shieldHits = 0;
            ReviveActive = false;
            invulnerableActive = false;
        }
    }
}

function detectCollision(a, b) {
    if (invulnerableActive) {
        // If invulnerability is active, return false to ignore collisions with pipes
        return false;
    } else if (shieldActive) {
        // If shield is active, increment the hit counter and deactivate if it reaches 3
        if (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y) {
            shieldHits += 1;
            pipeArray = [];
            bird.x = 150
            bird.y = birdY; //this will reset the bird position when hit
            hitsTextShield = (3 - shieldHits) + " left"; //shield hits counts text
            setTimeout(function() {
                hitsTextShield = '';
            } , 1000);
            if (shieldHits >= 3) {
                deActivateShield();
                bird.x = 45
            }
            return false; // Ignore collision while shield is active
        }
    } else {
        // If skills is not active, use the original collision detection logic
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }
}

//POWER UPS FUNCTIONS

// Skills Shortcut keys
function skills(event) {
    if (event.code == "KeyQ") {
        activateShield();
    } else if (event.code === "KeyW") {
        activateRevive();
    } else if (event.code === "KeyE") {
        activateInvulnerable();
    }
}

// Skills Activation And Insufficient points TEXT
function drawSkillActivationText() {
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(skillActivationText, 70, 320); // Adjust position of the activation text
}

function drawSkillInsufficientText() {
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(insufficientPoints, 70, 350); // Adjust position of the insufficient points text
}

function drawPointsAcquired() {
    context.fillStyle = "white";
    context.font = "15px sans-serif";
    context.fillText(pointsText, 80, 370); // Adjust position of the points text
}

function drawhitsTextShield() {
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(hitsTextShield, 150, 200); // Adjust position of the shield hits left text
}

// SHIELD
function activateShield() {
    if (points >= pointsForShield) {
        shieldActive = true;
        points -= pointsForShield;
        shieldHits = 0;
        skillActivationText = "Shield Activated"; // Set the text
        setTimeout(function () {
            skillActivationText = ''; // Clear the text after 1 second
        }, 1000);
        setTimeout(deActivateShield, 10000); //deactivates the shield in 10 seconds
    } else {
        insufficientPoints = "Insufficient Points"; // Set the text
        setTimeout(function () {
            insufficientPoints = ''; // Clear the text after 1 second
        }, 1000);
    }
}

function deActivateShield() {
    shieldActive = false;
    bird.x = 45
}

// EXTRA LIFE SKILLS

function activateReviveConfirmation() {
    // if game over it shows a prompt to confirm to continue
    let confirmRevive = confirm("Continue the game?");

    if (confirmRevive) {
        // Restart the game with an extra life
        ReviveActive = true;
        points -= pointsForRevive;
        gameOver = false;
        bird.y = birdY;
        pipeArray = [];
    } else {
        // End the game
        gameOver = true;
    }
}


function activateRevive() {
    if (gameOver && points >= pointsForRevive) {
        activateReviveConfirmation();
        setTimeout(deactivateRevive, 5000); // countdown to 5 so it wont get the chance to revive
    }
}

function deactivateRevive() {
    ReviveActive = false;
}

// INVULNERABILITY
function activateInvulnerable() {
    if (points >= pointsForinvulnerable) {
        invulnerableActive = true;
        points -= pointsForinvulnerable;
        skillActivationText = "Invulnerable Activated"; // Set the text
        setTimeout(function () {
            skillActivationText = ''; // Clear the text after 1 second
        }, 1000);
        setTimeout(deactivateInvulnerable, 10000); //deactivates invulnerability in 10 seconds
    } else {
        insufficientPoints = "Insufficient Points"; // Set the text
        setTimeout(function () {
            insufficientPoints = ''; // Clear the text after 1 second
        }, 1000);
    }
}

function deactivateInvulnerable() {
    invulnerableActive = false;
}

function drawSkill() {
    if (shieldActive) {
        context.drawImage(shieldImg, bird.x, bird.y, birdWidth, birdHeight); // apply the shield image
    } else if (invulnerableActive) {
        context.drawImage(invulImg, bird.x, bird.y, birdWidth, birdHeight); // apply the invulnerable image
    } else {
        context.drawImage(birdImg, bird.x, bird.y, birdWidth, birdHeight);
    }
}

// ------------------ ***** FUNCTIONS END ***** ------------------ //


// ----------------------------SETTING THE CANVAS FOR IMAGES------------------------- //
//For the page to load it displays all this
$(document).ready(function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //Flappy Bird
    birdImg = new Image();
    birdImg.src = "./img/ffbrd.png";

    // S K I L L S
    //Shield
    shieldImg = new Image();
    shieldImg.src = "img/BirdShieldNoBg.png";

    invulImg = new Image();
    invulImg.src = "img/stoned.png";

    //PIPE TOP
    topPipeImg = new Image();
    topPipeImg.src = pipeImages[indexImage].top

    //PIPE BOTTOM
    bottomPipeImg = new Image();
    bottomPipeImg.src = pipeImages[indexImage].bottom;

    setInterval(placePipes, 2000); //every 2 seconds for the pipe to appear
    document.addEventListener("keydown", moveBird); //for the bird to fly
    document.addEventListener("click", moveBird); //use the mouse to fly the bird
    document.addEventListener("keydown", skills); // so the skills shortcut key

    $("#pipeNext").click(function() {
        pipeImageChange("next");
        updatePipeImages();
    });

    $("#pipePrev").click(function() {
        pipeImageChange("prev");
        updatePipeImages();
    });

    // Menu buttons
    $("#startGame").click(startGame);
    $("#showMechanics").click(showMechanics);
    $("#customizeGame").click(customizeGame);
    $("#goBackFromMechanics").click(goBack);
    $("#goBackFromCustomize").click(goBack);
    $("#exit").click(exitGame);

    $("#dayNightToggle").click(function() {
        toggleMode();
    });
});
// ----------------------------SETTING THE CANVAS FOR IMAGES END------------------------- //

/*
This file handles all the internal details of the Game. The game comprises of five parts -- the avatar who is the player,
the enemy who's out to get the player's avatar, the gems that the player intends to collect, the time that the player is racing against,
and the points that the player intends to gather.

There are three levels of difficulty. With each level, there's an associated time, points, grace lives and the speed of the enemy.
*/

//All the global variables are declared up front with just a single var command which will save some performance time.
var avatarIndex, difficultyLevel, avatarImages, isGameOn, easy, medium,
    hard, gameMinutes, gameLives, gameGemIndex, gamePointsPerGem,
    totalPoints, sprites, gemImages, possibleGemX, possibleGemY, possibleGemPoints;

//Initializing the points tally to be zero
totalPoints = 0;

//Creating an array of avatars based on images
avatarImages = ["images/char-boy.png",
    "images/char-cat-girl.png",
    "images/char-horn-girl.png",
    "images/char-pink-girl.png",
    "images/char-princess-girl.png"
];

//Creating an array of gem images
gemImages = [
    'images/Gem Green.png',
    'images/Gem Blue.png',
    'images/Gem Orange.png'
];

possibleGemX = [0, 100, 200, 300, 400];
possibleGemY = [60, 140, 220];
possibleGemPoints = [5, 10, 15];//Green, Blue, Orange respectively


//Creating a Difficulty class with lives and time
var Difficulty = function(lives, minutes, gemIndex) {
    this.gameLives = lives;
    this.minutes = minutes;
    this.gemIndex = gemIndex;
};

//Creating a variable for each of the game's levels
easy = new Difficulty(3, 5, 0);
medium = new Difficulty(6, 4, 1);
hard = new Difficulty(10, 3, 2);

/*
Setting the "Game's On" variable to be false and this will be true only when the game is on. This helps in identifying the
timeframe when the canvas has to be rendered. The canvas will not be visible when the game isn't played -- when in the settings pages.
*/

isGameOn = false;

//Creating an Enemy class
var Enemy = function() {
    //Defining some pre-requisites for the Enemy class - x, y, speed and sprite
    this.possibleXloc = [-150, 600];
    this.possibleYloc = [60, 140, 220];
    this.possibleSpeed = [150, 600];
    this.sprites = ['images/enemy-bug.png', 'images/enemy-car.png'];

    this.reset(); //Setting to defaults
}

//Defaults abstracted into a method to be used later to reset the enemy
Enemy.prototype.reset = function() {
    this.x = this.possibleXloc[0];
    this.y = this.randomY();
    this.speed = this.randomSpeed();
    this.sprite = this.randomSprite();
}

//Helper method to get random y location
Enemy.prototype.randomY = function() {
    return this.possibleYloc[Math.floor(Math.random() * this.possibleYloc.length)];
}

//Helper method to get random speed
Enemy.prototype.randomSpeed = function() {
    return (this.possibleSpeed[0] + Math.floor(Math.random() * (this.possibleSpeed[1] - this.possibleSpeed[0])));
}

//Helper method to get random enemy sprite
Enemy.prototype.randomSprite = function() {
    return this.sprites[Math.floor(Math.random() * this.sprites.length)];
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;

    //If the enemy has reached the end of the segment, reset to defaults
    if (this.x > this.possibleXloc[1]) {
        this.reset();
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//Creating a Gem class
var Gem = function() {
    this.x = possibleGemX[Math.floor(Math.random() * 5)];
    this.y = possibleGemY[Math.floor(Math.random() * 3)];
}

Gem.prototype.update = function() {
    if ((player.y === this.y + 8) && (player.y === this.y + 8)) {
        if (player.x === this.x && player.x === this.x) {
            //Bull's Eye
            totalPoints = totalPoints + gamePointsPerGem;

            //Set Next Target
            this.x = possibleGemX[Math.floor(Math.random() * 5)];
            this.y = possibleGemY[Math.floor(Math.random() * 3)];
        }
    }
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(gemImages[gameGemIndex]), this.x, this.y);
}

//Creating a Player class
var Player = function() {
    this.xRange = [-2, 402];
    this.yRange = [-20, 380];
    this.sprite = avatarImages[avatarIndex];

    this.reset();
}

Player.prototype.reset = function() {
    this.x = 200;
    this.y = 380;
}

Player.prototype.update = function() {
    this.checkCollisions();
}

Player.prototype.checkCollisions = function() {
    if (this.y == -20) {
        //Oops, player went to the water. Move the player back to the start
        this.reset();
    } else if (this.y > 60 && this.y <= 220) {
        var thisPlayer = this;
        //Checking if the player has collided with any enemies
        allEnemies.forEach(function(enemy) {
            if (enemy.y == thisPlayer.y) {
                //Player is in the same row as the enemy
                if ((enemy.x >= player.x - 30) && (enemy.x <= player.x + 30)) {
                    //Oops, player lost a life
                    gameLives--;

                    //Check if all lives have been exhausted
                    if (gameLives === 0) {
                        //Stop the game as all the lives have been exhausted
                        stopGame();
                    } else {
                        //Reset the player position
                        thisPlayer.reset();
                    }
                }
            }
        });
    }
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(key) {
    if (key === 'left') {
        this.x -= (this.x - 101 < this.xRange[0]) ? 0 : 101;
    } else if (key === 'right') {
        this.x += (this.x + 101 > this.xRange[1]) ? 0 : 101;
    } else if (key === 'up') {
        this.y -= (this.y - 80 < this.yRange[0]) ? 0 : 80;
    } else if (key === 'down') {
        this.y += (this.y + 80 > this.yRange[1]) ? 0 : 80;
    }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

/* Helper Functions */
//This function is invoked when the user has digested the instructions. This function shows the avatar selection.
//It is possible that this method is invoked when the user isn't satisfied with the avatar selection.

function showAvatarSelection() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('avatarSelectionId').style.display = 'block';
    document.getElementById('gameDifficultyId').style.display = 'none';
    document.getElementById('summaryOfSelection').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
};

function avatarClick(imgId, imgIndex) {
    avatarIndex = imgIndex;
    document.getElementById('chosenAvatar').src = avatarImage(imgIndex);
    document.getElementById('avatarSelectionId').style.display = 'none';
    document.getElementById('gameDifficultyId').style.display = 'block';
    document.getElementById('summaryOfSelection').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
};

function avatarImage(imageIndex) {
    return avatarImages[imageIndex];
};

function difficultyClick(buttonID, level) {
    difficultyLevel = level;
    switch (level) {
        case 'Easy':
            gameMinutes = easy.minutes;
            gameLives = easy.gameLives;
            gameGemIndex = easy.gameGemIndex;
            break;
        case 'Medium':
            gameMinutes = medium.minutes;
            gameLives = medium.gameLives;
            gameGemIndex = medium.gameGemIndex;
            break;
        case 'Hard':
            gameMinutes = hard.minutes;
            gameLives = hard.gameLives;
            gameGemIndex = hard.gameGemIndex;
    }

    gamePointsPerGem = possibleGemPoints[gameGemIndex];

    document.getElementById('chosenAvatarInDiff').src = avatarImage(avatarIndex);
    document.getElementById('gameDifficultyId').style.display = 'none';
    document.getElementById('summaryOfSelection').style.display = 'block';
    var newHeading = document.createElement('h2');
    newHeading.innerHTML = "You are playing difficulty level: " + difficultyLevel;
    document.getElementById('chosenDifficultyId').appendChild(newHeading);
    document.getElementById('gameOver').style.display = 'none';
};

function showDifficultySelection() {
    document.getElementById('chosenAvatar').src = avatarImage(avatarIndex);
    document.getElementById('avatarSelectionId').style.display = 'none';
    document.getElementById('gameDifficultyId').style.display = 'block';
    document.getElementById('summaryOfSelection').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    var myNode = document.getElementById("chosenDifficultyId");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
};

function startClick() {
    document.getElementById('avatarSelectionId').style.display = 'none';
    document.getElementById('gameDifficultyId').style.display = 'none';
    document.getElementById('summaryOfSelection').style.display = 'none';
    document.getElementById('stats').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';

    document.getElementById('livesText').innerHTML = "Lives: " + gameLives;
    document.getElementById('difficultyText').innerHTML = "Difficulty: " + difficultyLevel;
    document.getElementById('timerText').innerHTML = "Timer: " + gameMinutes + ": 00 mins";

    isGameOn = true;
    countdown(gameMinutes);
};

function countdown(minutes) {
    var seconds = 60;
    var mins = minutes

    function tick() {
        var counter = document.getElementById("timerText");
        var currentMinutes = mins - 1
        seconds--;
        counter.innerHTML = "Timer: " + currentMinutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds) + " mins";
        if (seconds >
            0) {
            setTimeout(tick, 1000);
        } else {
            if (mins > 1) {
                setTimeout(function() {
                    countdown(mins - 1);
                }, 1000);
            }
        }
        if (currentMinutes === 0 && seconds === 0) {
            stopGame();
        }
    }
    tick();
}

function stopGame() {
    isGameOn = false;
    document.getElementById('pointsSummary').innerHTML = totalPoints;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('stats').style.display = 'none';
}

/* Objects */
var allEnemies = [];

var tough = new Enemy();
allEnemies.push(tough);

var tougher = new Enemy();
allEnemies.push(tougher);

var toughest = new Enemy();
allEnemies.push(toughest);

var moreTough = new Enemy();
allEnemies.push(moreTough);

var theToughest = new Enemy();
allEnemies.push(theToughest);

var player = new Player();

var gem = new Gem();


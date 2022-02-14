// TODO
/**
 * Increase world size
 * Add theme toggle
 * make speed stat actual walker speed
 * Add support for multiple walkers
 * Add hunting/gathering
 * 
 * Add stress,depression based on hunger and proximity to other snakes
 */

// Globals

var organic = false;
var initDirection = randomIntFromInterval(0, 3);

// Colors

let snakeColor  = [14,109,147];
let foodColor   = [99,159,77];

// World Props 
let tick;
let spawnedFood = [];

// Walker Props
let walker;

let minSize = 12;
let maxSize = 48;

let minEndurance = 10;
let maxEndurance = 50;

let minCuriosity = 1;
let maxCuriosity = 10;

function setup() {
    console.log();
    createCanvas(document.body.offsetWidth/2, document.body.offsetHeight/2);
    frameRate(60);
    pixelDensity(4);

    // Force reset frame counter
    frameCount = 0;

    // World Props 
    tick = 100;

    // Init walker
    walker = new Walker();
}

function draw() {
    // End sim on death
    if (walker.dead) {
        return false;
    }

    // Wait for walker to be full length before starting dying process
    if (walker.born) {
        if( Math.random() < walker.energy/100) {
            walker.live();
        }
    } else {
        walker.live();
    }

    // Check if walker is full length (born)
    if (frameCount > walker.size) {
        walker.born = true;
    }

    // Spawn food
    if( Math.random() < 0.1/100) {
        var food = new Food();
        food.display();
    }

    // Display stats after movement
    displayStats();
}

// Classes

class Walker {
    constructor() {
        this.x                      = width/2;
        this.y                      = height/2;
        this.pos                    = [];
        this.direction              = initDirection;
        this.weightedDirections     = [];
        
        this.born   = false;
        this.dead   = false;
        
        this.size       = randomIntFromInterval(minSize, maxSize);
        this.speed      = 2;
        this.endurance  = randomIntFromInterval(minEndurance, maxEndurance);
        this.curiosity  = randomIntFromInterval(minCuriosity, maxCuriosity);

        this.hunger = 0;
        this.energy = 100;
    }

    live() {
        this.step();
        this.display();
        this.checkFood();
        this.updateHunger();
        this.updateEnergy();
    }

    step() {
        var choice = 0;

        if (walker.born) {
            choice = this.decideDirection();
        }

        for (let i = 0; i < this.speed; i++) {
            switch (choice) {
                case 0:
                    this.moveLeft();
                    break;
                case 1:
                    this.moveRight();
                    break;
                case 2:
                    this.moveUp();
                    break;
                case 3:
                    this.moveDown();
                    break;                
                default:
                    break;
            }
        }

        if (this.pos.length < this.size) {
            this.pos.unshift([this.x, this.y])
        } else {
            this.pos.pop();
            this.pos.unshift([this.x, this.y])
        }
    }

    decideDirection() {
        var direction;
        var dirArray = [0, 1, 2, 3];

        // Pick initial direction first
        if (initDirection) {
            direction       = initDirection;
            initDirection   = false;

            return direction;
        } else {
            for (let i = 0; i < this.curiosity; i++) {
                dirArray.push(this.direction);
              
            }

            this.weightedDirections = dirArray;            
            return direction = this.weightedDirections[randomIntFromInterval(0, this.weightedDirections.length - 1)];
        }
    }

    moveLeft() {
        if (this.x > 0) {
            if (organic || !walker.born) {
                this.x--;
                this.direction = 0;
            } else {
                var x = this.x - 1;
                if (checkVal(this.pos, x, 0)) {
                    this.x--;
                    this.direction = 0;
                } else {
                    if( Math.random() < 50/100) {
                        this.moveDown();
                    } else {
                        this.moveUp();
                    }
                }
            }
        }
    }

    moveRight() {
        if (this.x < width) {
            if (organic) {
                this.x++;
                this.direction = 1;
            } else {
                var x = this.x + 1;
                if (checkVal(this.pos, x, 0)) {
                    this.x++;
                    this.direction = 1;
                } else {     
                    if( Math.random() < 50/100) {
                        this.moveDown();
                    } else {
                        this.moveUp();
                    }                
                }
            }        
        }
    }

    moveUp() {
        if (this.y < height) {
            if (organic) {
                this.y++;
                this.direction = 2;
            } else {
                var y = this.y + 1;
                if (checkVal(this.pos, y, 1)) {
                    this.y++;
                    this.direction = 2;
                } else {
                    if( Math.random() < 50/100) {
                        this.moveLeft();
                    } else {
                        this.moveRight();
                    }                
                }
            }
        }
    }

    moveDown() {
        if (this.y > 0) {
            if (organic) {
                this.y--;
                this.direction = 3;
            } else {
                var y = this.y - 1;
                if (checkVal(this.pos, y, 1)) {
                    this.y--;
                    this.direction = 3;
                } else {
                    if( Math.random() < 50/100) {
                        this.moveLeft();
                    } else {
                        this.moveRight();
                    }                
                }
            }        
        }
    }

    display() {
        stroke(snakeColor[0],snakeColor[1],snakeColor[2]);
        strokeWeight(2);
        noErase();
        point(this.x, this.y);

        if (frameCount >= this.size) {
            var x = this.pos[this.size - 1][0];
            var y = this.pos[this.size - 1][1];
            erase();
            point(x, y);
        }
    }

    updateHunger() {

        // Convert length range to 0 - 2 and convert to float
        var hungerChange    = ( ( this.size - minSize ) / (maxSize - minSize) ) * (2 - 0) + 0;
        hungerChange        = parseFloat(hungerChange.toFixed(2))

        if (frameCount % tick == 0 && this.hunger < 100) {
            this.hunger += hungerChange;
            this.hunger = parseFloat(this.hunger.toFixed(2));

            // ensure hunger is 100 max
            if (this.hunger > 100) {
                this.hunger = 100;
            }
        }
    }

    updateEnergy() {
        if (frameCount % tick == 0 && this.energy > 0) {
            var percentage  = (100 - this.endurance) / 100;
            var fatigue     = this.hunger * percentage;

            if (this.energy > this.endurance) {
                this.energy = 100 - fatigue.toFixed(2);
            } else {
                this.energy--;
            }
            
            this.energy = this.energy.toFixed(2);
        }
    }

    checkFood() {
        var wX = this.x;
        var wY = this.y;
        var fX;
        var fY;

        var range = 3;

        for (const [i, item] of spawnedFood.entries()) {
            fX = item.x;
            fY = item.y;

            if (wX > fX - range && wX < fX + range) {
                if (wY > fY - range && wY < fY + range) {
                    spawnedFood.splice(i, 1);
                    stroke(255);
                    circle(fX, fY, item.size);
                    console.log(`I ate those food: +${item.nutricion} Nutriction`);

                    if (this.hunger < 10) {
                        this.hunger = 0;
                    } else {
                        var percentage  = item.nutricion / 100;
                        var reduction   = this.hunger * percentage
                        this.hunger     = this.hunger - reduction;
                        this.hunger     = parseFloat(this.hunger.toFixed(2));
                    }

                }
            }
        }
    }
}

class Food {
    constructor() {
        this.x          = randomIntFromInterval(0, width),
        this.y          = randomIntFromInterval(0, height),
        this.size       = 1,
        this.nutricion  = randomIntFromInterval(10, 100)
    }

    display() {
        stroke(foodColor[0], foodColor[1], foodColor[2])
        noErase();
        circle(this.x, this.y, this.size);
        spawnedFood.push(this);
        // console.log(`Food spawn: ${this.x}, ${this.y}, Nutricion: ${this.nutricion}`);
    }
}

// Functions

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function checkVal(array, value, axis) {
    var miss;

    for (const item of array) {
        if (value === item[axis]) {
            // console.log('hit')
            // return false;
        } else {
            miss = true;
        }
    }

    return miss;
}

function displayStats() {2
    if (walker.hunger == 100 && walker.energy > 0) {
        document.getElementById('status').textContent = "STARVING";
    } else if (walker.energy == 0) {
        document.getElementById('status').textContent = "DEAD";
        walker.dead = true;
    }

    document.getElementById('speed').textContent = walker.speed;
    document.getElementById('length').textContent = walker.size;
    document.getElementById('endurance').textContent = walker.endurance;
    document.getElementById('curiosity').textContent = walker.curiosity;


    posX = String(walker.x).padStart(3, '0');
    posY = String(walker.y).padStart(3, '0');

    document.getElementById('position').textContent = `${posX}, ${posY}`;
    document.getElementById('lifespan').textContent = frameCount;

    document.getElementById('hunger').textContent = walker.hunger;
    document.getElementById('energy').textContent = walker.energy;
}

function playSim() {
    loop();
}

function pauseSim() {
    noLoop();
}

function resetSim() {
    setup();
}
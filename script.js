// TODO
/**
 * 
 * Add self collision detection // Conditional
 * make speed stat actual walker speed
 * Add food items
 * Add hunting/gathering
 * 
 * 
 */


// World Props 
let tick;

// Walker Props
let walker;
let born;
let dead;
let speed;
let length;
let endurance;

let minLength = 12;
let maxLength = 48;

let minEndurance = 10;
let maxEndurance = 50;

function setup() {
    createCanvas(300, 200);
    frameRate(60);

    // Force reset frame counter
    frameCount = 0;

    // World Props 
    tick = 200;

    // Walker Props
    walker      = new Walker();
    born        = false;
    dead        = false;
    speed       = 2;
    length      = randomIntFromInterval(minLength, maxLength);
    endurance   = randomIntFromInterval(minEndurance, maxEndurance);

}

function draw() {
    // End sim on death
    if (dead) {
        return false;
    }

    // Wait for walker to be full length before starting dying process
    if (born) {
        if( Math.random() < walker.energy/100) {
            walker.live();
        }
    } else {
        walker.live();
    }

    // Check if walker is full length (born)
    if (frameCount > length) {
        born = true;
    }

    // Display stats after movement
    displayStats();
}

class Walker {
    constructor() {
        this.x   = width/2;
        this.y   = height/2;
        this.pos = [];

        this.hunger = 0;
        this.energy = 100;
    }

    live() {
        this.step();
        this.display();
        this.updateHunger();
        this.updateEnergy();
    }

    step() {
        var choice = randomIntFromInterval(0, 3);

        // Before making step, compare generated step to x,y pos in array to avoid collisions 
        // if x matches go y, if y matches go x

        for (let i = 0; i < speed; i++) {
            if (choice == 0) {
                (this.x < width) ? this.x++ : false;
            } else if (choice == 1) {
                (this.x > 0) ? this.x-- : false;
            } else if (choice == 2) {
                (this.y < height) ? this.y++: false;
            } else {
                (this.y > 0) ? this.y--: false;
            }
        }

        if (this.pos.length < length) {
            this.pos.unshift([this.x, this.y])
        } else {
            this.pos.pop();
            this.pos.unshift([this.x, this.y])
        }
    }

    display() {
        strokeWeight(2);
        noErase();
        point(this.x, this.y);

        if (frameCount >= length) {
            var x = this.pos[length - 1][0];
            var y = this.pos[length - 1][1];
            erase();
            point(x, y);
        }
    }

    updateHunger() {

        // Convert length range to 0 - 2 and convert to float
        var hungerChange    = ( ( length - minLength ) / (maxLength - minLength) ) * (2 - 0) + 0;
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
            var percentage  = (100 - endurance) / 100;
            var fatigue     = this.hunger * percentage;

            if (this.energy > endurance) {
                this.energy = 100 - fatigue.toFixed(2);
            } else {
                this.energy--;
            }
            
            this.energy = this.energy.toFixed(2);
        }
    }
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function displayStats() {
    if (walker.hunger == 100 && walker.energy > 0) {
        document.getElementById('status').textContent = "STARVING";
    } else if (walker.energy == 0) {
        document.getElementById('status').textContent = "DEAD";
        dead = true;
    }

    document.getElementById('speed').textContent = speed;
    document.getElementById('length').textContent = length;
    document.getElementById('endurance').textContent = endurance;

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
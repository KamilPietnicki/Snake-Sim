// TODO
/**
 * 
 * Add menu
 * Randomize walker stats
 * Add self collision detection // Conditional
 * Set hunger based on size
 * Add food items
 * Add hunting/gathering
 * 
 * 
 */



let counter = 0;

// World Props 
let tick = 200;

// Walker Props
let walker;
let born = false;
let dead = false;
let speed = 2;
let length = 24;
let endurance = 20;

function setup() {
    createCanvas(300, 200);
    frameRate(60);

    walker = new Walker();
}

function draw() {
    if (dead) {
        return false;
    }

    counter++;

    if (born) {
        if( Math.random() < walker.energy/100) {
            walker.live();
        }
    } else {
        walker.live();
    }

    displayStats();

    if (counter > length) {
        born = true;
    }
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
        // stroke(0);
        strokeWeight(2);
        noErase();
        point(this.x, this.y);

        if (counter >= length) {
            var x = this.pos[length - 1][0];
            var y = this.pos[length - 1][1];
            erase();
            point(x, y);
        }
    }

    updateHunger() {
        if (counter % tick == 0 && this.hunger < 100) {
            this.hunger++;
        }
    }

    updateEnergy() {
        if (counter % tick == 0 && this.energy > 0) {
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
    document.getElementById('lifespan').textContent = counter;

    document.getElementById('hunger').textContent = walker.hunger;
    document.getElementById('energy').textContent = walker.energy;
}
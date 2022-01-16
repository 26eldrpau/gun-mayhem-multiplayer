import geckos from '@geckos.io/client';
import  * as PIXI from 'pixi.js';
import * as Keyboard from 'pixi.js-keyboard';


const app = new PIXI.Application({
    antialias: true,
});
document.body.appendChild(app.view);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoDensity = true;
app.resizeTo = window;


let rectangles = {};

const channel = geckos({port: 3000});

channel.onConnect(error => {
    if(error) {
        console.error(error.message);
        return;
    }

    channel.on('update', data => {
        for(const key in data) {
            if(rectangles[key] === undefined) {
                rectangles[key] = PIXI.Sprite.from(PIXI.Texture.WHITE);
                rectangles[key].width = 100;
                rectangles[key].height = 100;
                rectangles[key].position.set(data[key].x, data[key].y);
                rectangles[key].tint = 0xFF00FF;
                app.stage.addChild(rectangles[key]);
            } else {
                rectangles[key].position.set(data[key].x, data[key].y);
            }
        }
    });
});

app.ticker.add((delta) => gameLoop(delta));

function tryMove(_x, y, dx, dy) {
    if(y + dy < 400) return {dx, dy};
    else return {dx: dx, dy: 400 - y};
}

class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.verticalVelocity = 0;
    }

    update(left, right, jump) { 
        let dx = 0;
        let onGround = tryMove(this.x, this.y, 0, 1).dy <= 0.01;
        
        if(left) dx -= 8;
        if(right) dx += 8;
        if(onGround) {
            if(jump) this.verticalVelocity = -20;
            else this.verticalVelocity = 0;
        } else this.verticalVelocity += 1;

        let d = tryMove(this.x, this.y, dx, this.verticalVelocity);
        this.x += d.dx;
        this.y += d.dy;
    }
}

let player = new Player();

function gameLoop(delta) {
    const right = Keyboard.isKeyDown("KeyD");
    const left = Keyboard.isKeyDown("KeyA");
    const jump = Keyboard.isKeyDown("Space");
    player.update(left, right, jump);
    channel.emit('update', {x: player.x, y: player.y});
    Keyboard.update();
}

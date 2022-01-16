import geckos from '@geckos.io/client';
import  * as PIXI from 'pixi.js';
import * as Keyboard from 'pixi.js-keyboard';
import Player from 'common/Player.js';


const app = new PIXI.Application({
    backgroundColor: 0x222222,
    antialias: true,
});
document.body.appendChild(app.view);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoDensity = true;
app.resizeTo = window;


let rectangles = {};

const channel = geckos({port: 3000});

let current_frame = -1;

let others = {};
let last_action = {};

channel.onConnect(error => {
    if(error) {
        console.error(error.message);
        return;
    }

    channel.on('update', data => {
        if(current_frame > data['current_frame']) return;
        current_frame = data['current_frame'];
        console.log(current_frame);
        const players = data['players'];
        for(const key in players) {
            if(key == data['my_id']) {
                me.x = players[key].x;
                me.y = players[key].y;
                me.verticalVelocity = players[key].verticalVelocity;
                for(let i = first_frame[data['my_last_frame']]; i < unprocessed_frames.length; i++)
                    me.update(unprocessed_frames[i].left, unprocessed_frames[i].right, unprocessed_frames[i].jump);
                continue;
            }
            if(rectangles[key] === undefined) {
                others[key] = new Player(players[key].x, players[key].y);
                last_action[key] = data['last_action'][key];
                rectangles[key] = PIXI.Sprite.from(PIXI.Texture.WHITE);
                rectangles[key].width = 100;
                rectangles[key].height = 100;
                rectangles[key].position.set(players[key].x, players[key].y);
                rectangles[key].tint = 0x21A300;
                app.stage.addChild(rectangles[key]);
            } else {
                others[key].x = players[key].x;
                others[key].y = players[key].y;
                others[key].verticalVelocity = players[key].verticalVelocity;
                last_action[key] = data['last_action'][key];
                rectangles[key].position.set(players[key].x, players[key].y);
            }
        }
        for(const key in rectangles) {
            if(players[key] === undefined) {
                rectangles[key] = undefined;
                others[key] = undefined;
            }
        }
    });
});

app.ticker.add((delta) => gameLoop(delta));


let queued_frames = [];
let unprocessed_frames = [];
let first_frame = {};


let me = new Player();
let my_rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
my_rectangle.width = 100;
my_rectangle.height = 100;
my_rectangle.tint = 0xA32100;
app.stage.addChild(my_rectangle);


function gameLoop(delta) {
    const right = Keyboard.isKeyDown("KeyD");
    const left = Keyboard.isKeyDown("KeyA");
    const jump = Keyboard.isKeyDown("Space");
    queued_frames.push({right, left, jump});
    unprocessed_frames.push({right, left, jump});
    for(const key in others) {
        const last = last_action[key];
        others[key].update(last.left, last.right, last.jump);
        rectangles[key].position.set(others[key].x, others[key].y);
    }
    me.update(left, right, jump);
    my_rectangle.position.set(me.x, me.y);
    Keyboard.update();
}

setInterval(() => {
    first_frame[current_frame] = unprocessed_frames.length;
    channel.emit('update', {current_frame, queued_frames});
    queued_frames = [];
}, 50);

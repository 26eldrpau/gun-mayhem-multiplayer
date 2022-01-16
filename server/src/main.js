import geckos, {iceServers} from '@geckos.io/server';
import express from 'express';
import Player from '../../common/Player.js';

const website = express();
website.use(express.static('dist'));
website.listen(8080);



const io = geckos({iceServers: iceServers});

io.listen(3000);

let players = {};
let last_received_frame = {}
let queued_frames = {};
let current_frame = 0;
let is_active = {};
let last_action = {};

io.onConnection(channel => {
    console.log(`${channel.id} connected`);
    players[channel.id] = new Player(0, 0);
    last_received_frame[channel.id] = -1;
    last_action[channel.id] = {left: false, right: false, jump: false};
    queued_frames[channel.id] = [];

    channel.onDisconnect(() => {
        players[channel.id] = undefined;
        is_active[channel.id] = undefined;
        console.log(`${channel.id} got disconnected`)
    });

    channel.on('update', data => {
        if(last_received_frame[channel.id] >= data['current_frame']
            || data['current_frame'] > current_frame ) {
            last_received_frame[channel.id] = data['current_frame'];
            return;
        }

        last_received_frame[channel.id] = data['current_frame'];
        for(const inputs of data['queued_frames'])
            queued_frames[channel.id].push(inputs);
    });
    is_active[channel.id] = true;
});



setInterval(() => {
    current_frame++;
    for(const connection of io.connectionsManager.connections) {
        if(is_active[connection[0]])
            for(let i = 0; i < 3; i++)
                if(queued_frames[connection[0]][i] !== undefined) {
                    last_action[connection[0]] = queued_frames[connection[0]][i];
                    players[connection[0]].update(
                        queued_frames[connection[0]][i].left, 
                        queued_frames[connection[0]][i].right, 
                        queued_frames[connection[0]][i].jump, 
                    ); 
                } else players[connection[0]].update(
                        last_action[connection[0]].left, 
                        last_action[connection[0]].right, 
                        last_action[connection[0]].jump
                );
        queued_frames[connection[0]] = [];
        connection[1].channel.emit('update', {
            my_id: connection[0],
            my_last_frame: last_received_frame[connection[0]],
            current_frame,
            players,
            last_action,
        });
    }
}, 50);

import geckos, {iceServers} from '@geckos.io/server';
import express from 'express';

const website = express();
website.use(express.static('dist'));
website.listen(8080);



const io = geckos({iceServers: iceServers});

io.listen(3000);

let players = {};

io.onConnection(channel => {
    console.log(`${channel.id} connected`);
    players[channel.id] = {x: 0, y: 0};

    channel.onDisconnect(() => {
        players[channel.id] = undefined;
        console.log(`${channel.id} got disconnected`)
    });

    channel.on('update', ({x, y}) => {
        players[channel.id] = {x, y};
    });
});



setInterval(() => {
    io.emit('update', players);
}, 50);

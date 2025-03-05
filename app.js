const express   = require("express");       //require/import = include in C++
const app       = express();                //initialize the code we loaded
const http      = require("http");          //built-in package so we don't have to npm install ...
const server    = http.createServer(app);
const io        = require('socket.io')(server);

//what port is our web content goingto be served on
const LISTEN_PORT = 8080;   

//this tell the sever the "root" path of web-loaded files
const ABS_STATIC_PATH = __dirname + '/public';

//set our routes
//when someone accesses this path, send them something back
app.get('/', function(req, res) {
    res.sendFile('index.html', {root:ABS_STATIC_PATH});
});

// Constants

const KEYS = [
    {type: 'white', note: 'C3'},
    {type: 'black', note: 'C#3'},
    {type: 'white', note: 'D3'},
    {type: 'black', note: 'D#3'},
    {type: 'white', note: 'E3'},
    {type: 'white', note: 'F3'},
    {type: 'black', note: 'F#3'},
    {type: 'white', note: 'G3'},
    {type: 'black', note: 'G#3'},
    {type: 'white', note: 'A3'},
    {type: 'black', note: 'A#3'},
    {type: 'white', note: 'B3'},
    {type: 'white', note: 'C4'},
    {type: 'black', note: 'C#4'},
    {type: 'white', note: 'D4'},
    {type: 'black', note: 'D#4'},
    {type: 'white', note: 'E4'},
    {type: 'white', note: 'F4'},
    {type: 'black', note: 'F#4'},
    {type: 'white', note: 'G4'},
    {type: 'black', note: 'G#4'},
    {type: 'white', note: 'A4'},
    {type: 'black', note: 'A#4'},
    {type: 'white', note: 'B4'},
    {type: 'white', note: 'C5'}
]

const GAME_STATES = {
    INSTRUCTIONS: 'instructions',
    WAITING: 'waiting',
    READY: 'ready',
    ACTIVE: 'active',
    FINISHED: 'finished'
}

const ROUND_STATE = {
    PREPLAY: 'preplay',
    POSTPLAY: 'postplay',
    RESULT: 'result'
}


// Server-persistent data
let appMode;
let playerPositions = {};

// Competitive game data
let answerKey = [];
let roundResults = [];
let gameState = '';
let roundState = '';
let roundNum = 0;
const numRounds = 5;
let players = [];

// player schema
// id: string
// ready: bool
// winCount: num


io.on('connection', (socket) => {
    console.log(socket.id + ' connected.')

    // Add players to state
    if (!players.includes(socket.id)) {
        players.push({id: socket.id, ready: false, winCount: 0});
        console.log('Added player to list: ' + socket.id);
    }

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected.')
        // Delete player from player positions
        // delete playerPositions[socket.id];
        players = players.filter(player => player.id !== socket.id);

        console.log(players);
        io.emit('player_disconnect', socket.id);
    })

    // Competitive game events

    socket.on('set_player_ready', (data) => {
        let player = players.find(player => player.id === data.id);

        player.ready = true;
        console.log(player);
        console.log(players);

        if (players.length > 1 && players.every(player => player.ready === true)) {
            console.log('ALL PLAYERS ARE READY');

            gameState = GAME_STATES.ACTIVE;
            roundState = ROUND_STATE.PREPLAY;
            io.emit('update_game_state', {state: gameState, roundState});

            answerKey = generateRandomNotes();

            io.emit('play_note', {note: answerKey[roundNum]});
            console.log('emitted note play');
        }
        console.log(player.ready);

        io.emit('get_player_data', {players});
    })


    socket.on('play_note', (data) => {
        console.log(data);
        io.emit('send_note', {id: socket.id, ...data});
    })

    socket.on('note_played', (data) => {
        console.log('note was played');
        roundState = ROUND_STATE.POSTPLAY;
        io.emit('update_game_state', {state: gameState, roundState});
    })

    socket.on('piano_note', (data) => {
        if (gameState !== GAME_STATES.ACTIVE) {
            return
        }
        if (data.note === answerKey[roundNum] && roundResults[roundNum] === undefined) {
            console.log(data.note, answerKey[roundNum], roundResults[roundNum]);
            let player = players.find(player => player.id === data.id);
            player.winCount += 1;
            roundResults.push(player.id)
            roundState = ROUND_STATE.RESULT;
            
            if (roundNum === numRounds - 1) {
                console.log('game finished');

                gameState = GAME_STATES.FINISHED;
                roundState = ROUND_STATE.RESULT;
                io.emit('game_over', {state: gameState, roundState, players, roundResults});
            } else {
                console.log('round won by: ' + data.id);

                io.emit('round_result', {id: data.id, gameState, roundState});

                setTimeout(() => {
                    console.log('round num was: ' + roundNum);
                    roundNum++;
                    console.log('round num is now: ' + roundNum);
                    roundState = ROUND_STATE.PREPLAY;
                    io.emit('update_game_state', {state: gameState, roundState});
                    io.emit('play_note', {note: answerKey[roundNum]});
                }, 3000);
            }
        } 
    })

    socket.on('restart_game', () => {
        answerKey = [];
        roundResults = [];
        gameState = GAME_STATES.INSTRUCTIONS;
        roundState = ROUND_STATE.PREPLAY;
        roundNum = 0;
        io.emit('update_game_state', {state: gameState, roundState});
    })

    // Updating player positions on server-side
    socket.on('set_player_info', (data) => {
        playerPositions[data.id] = data.pos;
        io.emit('update_co', playerPositions);
    });

    // Looping events
    player_update();
})

// Competitive game functions

function generateRandomNotes () {
    const keyArrLen = KEYS.length;
    const randKeyArr = [];
    for (let i = 0; i < numRounds; i++) {
        let randNum = Math.floor(Math.random() * keyArrLen);

        while (randKeyArr.includes(KEYS[randNum].note)) {
            randNm = Math.random() * keyArrLen;
        }
        randKeyArr.push(KEYS[randNum].note);
    }
    return randKeyArr
}

function player_update() {
    setTimeout(player_update, 20);
    io.emit('get_player_info');
}

app.use(express.static(ABS_STATIC_PATH));
server.listen(LISTEN_PORT);
console.log("Listening on port: " + LISTEN_PORT);

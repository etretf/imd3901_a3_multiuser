const express   = require("express");   
const app       = express();       
const http      = require("http");    
const server    = http.createServer(app);
const io        = require('socket.io')(server);

const LISTEN_PORT = 8080;   

const ABS_STATIC_PATH = __dirname + '/public';

app.get('/', function(req, res) {
    res.sendFile('index.html', {root:ABS_STATIC_PATH});
});

// Constants

// Keys to use in competitive note-guessing game
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

// Competitive games states
const GAME_STATES = {
    INSTRUCTIONS: 'instructions',
    WAITING: 'waiting',
    READY: 'ready',
    ACTIVE: 'active',
    FINISHED: 'finished'
}

// States for a round: preplay is before the sound, postplay is guessing the sound, result is who won
const ROUND_STATE = {
    PREPLAY: 'preplay',
    POSTPLAY: 'postplay',
    RESULT: 'result'
}


// Server data

// Competitive game data
let answerKey = [];
let roundResults = [];
let gameState = '';
let roundState = '';
let roundNum = 0;
const numRounds = 5;
let players = [];

// Step sequencer scene data
let stepSequencerData = {
    columns: 16,
    rows: 4,
    isPlaying: false
};
let playerTransforms = {};
let matrix = generateEmptyMatrixArray();


io.on('connection', (socket) => {
    console.log(socket.id + ' connected.');

    // Add players to the players list
    if (!players.includes(socket.id)) {
        players.push({id: socket.id, ready: false, winCount: 0});
        console.log('Added player to list: ' + socket.id);
    }

    socket.on('player_connect', () => {
        // On player_connect, send an event to initialise the note matrix on the client side
        io.emit('init_note_matrix', {matrix});
    });

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected.')
        // Delete player from player transforms data
        delete playerTransforms[socket.id];

        // Update the player list to exclude the disconnected player
        players = players.filter(player => player.id !== socket.id);

        // Send event to update the player element on the client side
        io.emit('player_disconnect', {id: socket.id});
    });

    // Competitive game events

    // Event emitted when player clicks to start the note-guessing game
    socket.on('set_player_ready', (data) => {
        // Check if player is in list
        let player = players.find(player => player.id === data.id);

        // If player is not in list, add player to list
        if (!player) {
            players.push({id: socket.id, ready: false, winCount: 0});
            player = players.find(player => player.id === data.id);
            console.log('Added player to list: ' + socket.id);
        }
        // Set player to true so we can track that participants are ready
        player.ready = true;

        // If there are multiple players and every player is ready, start the game
        if (players.length > 1 && players.every(player => player.ready === true)) {
            gameState = GAME_STATES.ACTIVE;
            roundState = ROUND_STATE.PREPLAY;

            // Send event to update game state to ready on client side
            io.emit('update_game_state', {state: gameState, roundState});

            // Generate the note answer key for the note guessing
            answerKey = generateRandomNotes();

            // Play the first note in the sequence
            io.emit('play_note', {note: answerKey[roundNum]});
        }

        // Send event to update the player list for the game
        io.emit('get_player_data', {players});
    });

    // When the note to guess is played, update the game state to postplay and send an update event to the client
    socket.on('note_played', (data) => {
        roundState = ROUND_STATE.POSTPLAY;
        io.emit('update_game_state', {state: gameState, roundState});
    });

    // Event is received when the player plays a piano note
    socket.on('piano_note', (data) => {
        // If the game state is not active, ignore since we don't need to track the note correctness
        if (gameState !== GAME_STATES.ACTIVE) {
            return
        }
        // If the note matches the answer and it hasn't already been guessed already, update the player's win count and the round results
        if (data.note === answerKey[roundNum] && roundResults[roundNum] === undefined) {
            let player = players.find(player => player.id === data.id);
            player.winCount += 1;
            roundResults.push(player.id)
            roundState = ROUND_STATE.RESULT;
            
            // If the round number is the last one, update the game state to be finished and emit a game over event to tell the client
            if (roundNum === numRounds - 1) {
                gameState = GAME_STATES.FINISHED;
                roundState = ROUND_STATE.RESULT;
                io.emit('game_over', {state: gameState, roundState, players, roundResults});
            } else {
                // Else, if there are more rounds, emit an event to tell the client who won the round
                io.emit('round_result', {id: data.id, gameState, roundState});

                // Start the next round after 3 seconds to give players some buffer time then emit events to the client side to play a note and update the game state
                setTimeout(() => {
                    roundNum++;
                    roundState = ROUND_STATE.PREPLAY;
                    io.emit('update_game_state', {state: gameState, roundState});
                    io.emit('play_note', {note: answerKey[roundNum]});
                }, 3000);
            }
        } 
    });

    // Received when a player clicks to restart the game
    // Clears all game and player data then updates the game state on the client side
    socket.on('restart_game', () => {
        answerKey = [];
        roundResults = [];
        gameState = GAME_STATES.INSTRUCTIONS;
        roundState = ROUND_STATE.PREPLAY;
        roundNum = 0;
        players = [];
        io.emit('update_game_state', {state: gameState, roundState});
    });


    // Collaborative/step sequencer scene events

    // Received when a user clicks on a note box, updates the corresponding note in the matrix
    socket.on('send_note_box', (data) => {
        const {colIdx, rowIdx, noteIdx} = data;

        // Update note matrix
        matrix[colIdx][rowIdx] = noteIdx;

        // Sends an event to all clients to update the note box in each client's sequencer matrix
        io.emit('update_note_box', data);
    });

    // Received when user clicks on start or stop buttons for the step sequencer, updates the playing state
    socket.on('update_server_is_playing', (data) => {
        stepSequencerData.isPlaying = data.isPlaying;

        // Sends an event to all clients to update the sequencer playing state
        io.emit('update_client_is_playing', {isPlaying: stepSequencerData.isPlaying});
    });

    // Received when user clicks on clear button for the step sequencer, clears out the matrix
    socket.on('update_server_clear_matrix', (data) => {
        matrix = generateEmptyMatrixArray();

        // Sends an event to all clients to empty the sequencer matrix
        io.emit('update_client_clear_matrix');
    });

    // Received when user clicks on drum pad, sends event out to all clients to play the sound
    socket.on('send_server_note', (data) => {
        io.emit('send_client_note', (data));
    });

    // Continuously receives this event after an interval to update player transforms
    socket.on('set_player_info', (data) => {
        playerTransforms[data.id] = {
            position: data.position,
            rotation: data.rotation
        };
        // Sends update player transforms data back to each client to render other users
        io.emit('update_client_player_transforms', {playerTransforms});
    });

    // Start a recursive function to continously poll for user positions
    player_update();
});


// Function generates a note array with no duplicates
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

// Function generates an empty matrix array using the column and row count for its dimensions
function generateEmptyMatrixArray () {
    const indexedColumns = getIndexedArray(stepSequencerData.columns);
    const indexedRows = getIndexedArray(stepSequencerData.rows);
    return indexedColumns.map(() => indexedRows.map(() => undefined));
}

// Function returns an indexed array from a passed-in number, each element is the index itself
function getIndexedArray (count) {
    const indices = [];
    for (let i = 0; i < count; i++) {
        indices.push(i);
    }
    return indices;
}

// Function to continously send an event out to clients to get player transforms data
function player_update () {
    setTimeout(player_update, 20);
    io.emit('get_player_info');
}

app.use(express.static(ABS_STATIC_PATH));
server.listen(LISTEN_PORT);
console.log("Listening on port: " + LISTEN_PORT);

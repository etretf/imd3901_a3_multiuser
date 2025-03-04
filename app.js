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


// Server-persistent data

let playerPositions = {};


io.on('connection', (socket) => {
    console.log(socket.id + ' connected.')

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected.')
        delete playerPositions[socket.id];
        io.emit('player_disconnect', socket.id);
    })

    socket.on("blue", (data) => {
        console.log( "blue event received" );
        io.emit("change", {r:0, g:0, b:255});
    });

    socket.on('set_player_info', (data) => {
        playerPositions[data.id] = data.pos;
        io.emit('update_co', playerPositions);
    });

    socket.on('play_note', (data) => {
        console.log(data);
        io.emit('send_note', {id: socket.id, ...data});
    })

    // Looping events
    player_update();
})

function player_update() {
    setTimeout(player_update, 20);
    io.emit('get_player_info');
}

app.use(express.static(ABS_STATIC_PATH));
server.listen(LISTEN_PORT);
console.log("Listening on port: " + LISTEN_PORT);

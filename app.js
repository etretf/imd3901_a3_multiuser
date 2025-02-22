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

io.on('connection', (socket) => {
    console.log(socket.id + ' connected.')

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected.')
    })
})

app.use(express.static(ABS_STATIC_PATH));
server.listen(LISTEN_PORT);
console.log("Listening on port: " + LISTEN_PORT);

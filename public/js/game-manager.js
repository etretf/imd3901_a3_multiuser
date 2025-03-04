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
    ACTIVE: 'active',
    FINISHED: 'finished'
}

const SCREEN_TEXT = {
    INSTRUCTIONS: 'You will be playing an ear training game.\nA note will be played, then you will press a key on the piano and try to match the note.\nYou will compete with other players! Try to guess the note the fastest to win!\n\nPress to start',
    ROUND_PREPLAY: 'A sound will be played. Try to match the note on the keyboard.',
    ROUND_POSTPLAY: 'Match the sound!'
}

const ROUND_STATE = {
    PREPLAY: 'preplay',
    POSTPLAY: 'postplay'
}

AFRAME.registerComponent('game-manager', {
    schema: {
        gameState: {type: 'string', default: GAME_STATES.INSTRUCTIONS},
        roundNum: {type: 'number', default: 0},
        numRounds: {type: 'number', default: 5},
        roundState: {type: 'string', default: ROUND_STATE.PREPLAY},
        isPlaying: {type: 'boolean', default: false},
        answerKey: {type: 'array'}
    },
    init: function () {
        // Generate random note array
        const CONTEXT_AF = this;

        // Select DOM elements
        CONTEXT_AF.gameButton = document.querySelector('#game-button');
        CONTEXT_AF.gameScreen = document.querySelector('#game-screen');
        CONTEXT_AF.self       = document.querySelector('#game-manager');
        CONTEXT_AF.setupGame();

        CONTEXT_AF.gameButton.addEventListener('click', function () {
            console.log('start');
            CONTEXT_AF.el.setAttribute('game-manager', 'data', {...CONTEXT_AF.el.getAttribute('game-manager'), gameState: GAME_STATES.ACTIVE});
            debugger
            CONTEXT_AF.playNote(CONTEXT_AF.data.answerKey[CONTEXT_AF.data.roundNum]);

        })
    },
    tick: function () {
        let {data: {gameState, roundNum, roundState, answerKey, isPlaying}, gameScreen, playNote} = this;
        if (gameState === GAME_STATES.INSTRUCTIONS) {
            console.log('Instructions stage');
            this.gameScreen.setAttribute('text', {value: SCREEN_TEXT.INSTRUCTIONS})
        }
        
        if (gameState === GAME_STATES.ACTIVE) {
            console.log('Active stage');
            if (roundState === ROUND_STATE.PREPLAY) {
                gameScreen.setAttribute('text', {value: SCREEN_TEXT.ROUND_PREPLAY, wrapCount: 24})
            }
            if (roundState === ROUND_STATE.POSTPLAY) {
                gameScreen.setAttribute('text', {value: SCREEN_TEXT.ROUND_POSTPLAY, wrapCount: 24})
            }
        }
    },
    update: function (oldData) {
        console.log(oldData);

        debugger

    },
    generateRandomNotes: function () {
        const keyArrLen = KEYS.length;
        const randKeyArr = [];
        for (let i = 0; i < this.data.numRounds; i++) {
            let randNum = Math.floor(Math.random() * keyArrLen);

            while (randKeyArr.includes(KEYS[randNum].note)) {
                randNm = Math.random() * keyArrLen;
            }
            randKeyArr.push(KEYS[randNum].note);
        }
        return randKeyArr;
    },
    setupGame: function () {
        this.data.answerKey = this.generateRandomNotes();
        debugger

    },
    playNote: function (note) {
        console.log('play note');
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease(note, "4n");
        this.data.isPlaying = false;
        console.log('done playing note');
    },
    setupServerState: function () {
        // Set up
        socket.emit('setupGameState', {
            answerKey: this.data.answerKey,
            participantId: socket.id
        });
    }
})
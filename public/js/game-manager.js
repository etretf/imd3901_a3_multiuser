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
    ACTIVE: 'active',
    FINISHED: 'finished'
}

const SCREEN_TEXT = {
    INSTRUCTIONS: 'You will be playing an ear training game.\n\nA note will be played, then you will try to match the note on the keyboard.\n\nYou will compete with other players! Try to guess the note first to win!\n\n',
    WAITING: 'Waiting for another player to join...',
    ROUND_PREPLAY: 'A sound will be played.',
    ROUND_POSTPLAY: 'Match the sound!',
    FINISHED: 'Game over.'
}

const ROUND_STATE = {
    PREPLAY: 'preplay',
    POSTPLAY: 'postplay',
    RESULT: 'result'
}

AFRAME.registerComponent('game-manager', {
    schema: {
        gameState: {type: 'string', default: GAME_STATES.INSTRUCTIONS},
        roundNum: {type: 'number', default: 0},
        numRounds: {type: 'number', default: 5},
        roundState: {type: 'string', default: ROUND_STATE.PREPLAY},
        roundWinner:  {type: 'string'},
        roundResults: {type: 'array'},
        currentPlayerId: {type: 'string'},
        answerKey: {type: 'array'}
    },
    init: function () {
        // Generate random note array
        const CONTEXT_AF = this;

        // Select DOM elements
        CONTEXT_AF.startButton = document.querySelector('#start-button');
        CONTEXT_AF.playerCount = document.querySelector('#player-count');
        CONTEXT_AF.playSoundButton = document.querySelector('#play-sound-button');
        CONTEXT_AF.restartButton = document.querySelector('#restart-button');
        CONTEXT_AF.gameScreen = document.querySelector('#game-screen');

        CONTEXT_AF.startButton.addEventListener('click', function () {
            console.log('start');

            // Make start button unclickable and hidden
            CONTEXT_AF.startButton.setAttribute('visible', false);
            CONTEXT_AF.startButton.classList.remove('interactive');

            // Make player count UI visible
            CONTEXT_AF.playerCount.setAttribute('visible', true);

            CONTEXT_AF.el.setAttribute('game-manager', {...CONTEXT_AF.data, gameState: GAME_STATES.WAITING});
            socket.emit('set_player_ready', {id: socket.id});
        });

        CONTEXT_AF.restartButton.addEventListener('click', function () {
            socket.emit('restart_game');
        })
    },
    tick: function () {},
    update: function (oldData) {
        console.log(oldData);

        const {data: {gameState, roundState}} = this

        if (gameState === GAME_STATES.INSTRUCTIONS) {
            console.log('Instructions stage');
            this.gameScreen.setAttribute('text', {value: SCREEN_TEXT.INSTRUCTIONS, align: 'center', width: 5.5, wrapCount: 40});
            
            // Show start button and make clickable
            this.startButton.setAttribute('visible', true);
            this.startButton.classList.add('interactive');

            // Hide restart button and make unclickable
            this.restartButton.setAttribute('visible', false);
            this.restartButton.classList.remove('interactive');
        }

        if (gameState === GAME_STATES.WAITING) {
            console.log('Waiting for another player...');
            this.gameScreen.setAttribute('text', {value: SCREEN_TEXT.WAITING, align: 'center', wrapCount: 24});
        }

        if (gameState === GAME_STATES.ACTIVE) {
            console.log('Active game state');

            // Hide restart button and make unclickable
            this.startButton.setAttribute('visible', false);
            this.startButton.classList.remove('interactive');

            if (roundState === ROUND_STATE.PREPLAY) {
                console.log('preplay');
                this.gameScreen.setAttribute('text', {value: SCREEN_TEXT.ROUND_PREPLAY, align: 'center', wrapCount: 24});
                this.playerCount.setAttribute('visible', false);
            }
            if (roundState === ROUND_STATE.POSTPLAY) {
                console.log('postplay');
                this.gameScreen.setAttribute('text', {value: SCREEN_TEXT.ROUND_POSTPLAY, align: 'center', wrapCount: 24})
            }
            if (roundState === ROUND_STATE.RESULT) {
                console.log('round result');
                const isWinner = this.data.roundWinner === this.data.currentPlayerId;
                const screenText = isWinner ? 'You won the round!' : 'You were too slow...'
                this.gameScreen.setAttribute('text', {value: screenText, align: 'center', wrapCount: 24})
            }
        }

        if (gameState === GAME_STATES.FINISHED) {
            console.log('Finished game state');
            const {data: {roundResults, currentPlayerId}} = this;
            const numRoundsPlayed = roundResults.length
            const numRoundsWon = roundResults.filter(res => res === currentPlayerId).length;
            const isWinner = numRoundsWon >= Math.ceil(numRoundsPlayed / 2);
            const screenText = isWinner ? `You won ${numRoundsWon}/${numRoundsPlayed} rounds!` : `You lost.\n\n You won ${numRoundsWon}/${numRoundsPlayed} rounds.`
            this.gameScreen.setAttribute('text', {value: screenText, align: 'center', wrapCount: 28});

            // Show restart button and allow clicking
            this.restartButton.setAttribute('visible', true);
            this.restartButton.classList.add('interactive');

        }
    }
})
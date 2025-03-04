const ALL_KEYS = [
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

AFRAME.registerComponent('game-manager', {
    schema: {
        gameState: {type: 'string', default: GAME_STATES.INSTRUCTIONS},
        roundNum: {type: 'number', default: 0},
        numRounds: {type: 'number', default: 5},
        answerKey: {type: 'array'}
    },
    init: function () {
        // Generate random note array
        const CONTEXT_AF = this;
        CONTEXT_AF.data.answerKey = this.generateRandomNotes();

        // Select DOM elements
        CONTEXT_AF.gameButton = document.querySelector('#game-button');

        CONTEXT_AF.gameButton.addEventListener('click', function () {
            console.log('start');
        })
    },
    tick: function () {},
    update: function () {
        const {data} = this;
    },
    generateRandomNotes: function () {
        const keyArrLen = ALL_KEYS.length;
        const randKeyArr = [];
        for (let i = 0; i < this.data.numRounds; i++) {
            let randNum = Math.floor(Math.random() * keyArrLen);

            while (randKeyArr.includes(ALL_KEYS[randNum].note)) {
                randNm = Math.random() * keyArrLen;
            }
            randKeyArr.push(ALL_KEYS[randNum].note);
        }
        return randKeyArr;
    }
})
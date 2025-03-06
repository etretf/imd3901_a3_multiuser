// Note units reference: https://github.com/Tonejs/Tone.js/blob/cf73c22874ddbaf361ca62a8caf0edea155ef50a/Tone/core/type/NoteUnits.ts#L40

const LETTERS = ['null', 'C', 'D', 'E', 'F', 'G', 'A', 'B']
const ACCIDENTALS = {
    FLAT: 'b',
    SHARP: '#'
}
const NOTES = [undefined, 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const OCTAVE = ['-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7', '8']

const NOTE_COLOURS = [
    '#777777',
    '#FF88DB',
    '#EA00FF',
    '#9000FF',
    '#4D00FF',
    '#00C8FF',
    '#04FFFF',
    '#00FFB7',
    '#00FF44',
    '#BBFF00',
    '#FFFF00',
    '#FF9D00',
    '#FF0000'
]


AFRAME.registerComponent('note-box', {
    schema: {
        note: {type: 'string'},
        colour: {type: 'string'},
        noteIdx: {type: 'number', default: 0},
        startPosition: {type: 'vec3'},
        oscillationValue: {type: 'number'},
        colIdx: {type: 'number'},
        rowIdx: {type: 'number'}
    },
    init: function () {
        const CONTEXT_AF = this;

        // Init position

        CONTEXT_AF.data.startPosition = CONTEXT_AF.el.object3D.position;

        CONTEXT_AF.sequencerEl = document.querySelector('#step-sequencer');

        // Set box dimensions
        CONTEXT_AF.el.setAttribute('width', 0.5);
        CONTEXT_AF.el.setAttribute('height', 0.5);
        CONTEXT_AF.el.setAttribute('depth', 0.5);


        // Set box note and colour
        CONTEXT_AF.data.note = NOTES[CONTEXT_AF.data.noteIdx];
        CONTEXT_AF.data.colour = NOTE_COLOURS[CONTEXT_AF.data.noteIdx];

        CONTEXT_AF.el.setAttribute('material', 'color', NOTE_COLOURS[CONTEXT_AF.data.noteIdx]);
        CONTEXT_AF.el.setAttribute('material', 'shader', 'flat');
        CONTEXT_AF.el.setAttribute('text', {value: `${CONTEXT_AF.data.note}`});


        CONTEXT_AF.el.addEventListener('click', function () {
            console.log('click note');


            CONTEXT_AF.data.noteIdx++;

            const noteIdx = CONTEXT_AF.data.noteIdx % 13;
            console.log(noteIdx);

            CONTEXT_AF.data.note = NOTES[CONTEXT_AF.data.noteIdx];

            CONTEXT_AF.el.setAttribute('material', 'color', NOTE_COLOURS[noteIdx]);
            CONTEXT_AF.sequencerEl.emit('note-change', {note: CONTEXT_AF.data.note, colIdx: CONTEXT_AF.data.colIdx, rowIdx: CONTEXT_AF.data.rowIdx});
        });
    },
    update: function () {
    },
    tick: function () {
        this.data.oscillationValue += 0.005;
        const oscillationPos = Math.sin(this.data.oscillationValue) * 0.0005;
        this.el.setAttribute('position', 'y', this.data.startPosition.y + oscillationPos);
    }
})
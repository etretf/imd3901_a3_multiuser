// Note units reference: https://github.com/Tonejs/Tone.js/blob/cf73c22874ddbaf361ca62a8caf0edea155ef50a/Tone/core/type/NoteUnits.ts#L40

const LETTERS = ['null', 'C', 'D', 'E', 'F', 'G', 'A', 'B']
const ACCIDENTALS = {
    FLAT: 'b',
    SHARP: '#'
}
const NOTES = [undefined, 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const OCTAVE = ['-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7', '8']

// Array of note colours for a null note and 12 notes in the scale
const NOTE_COLOURS = [
    '#777777',
    '#F100A9',
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

// Array of note emission colours for a null note and 12 notes in the scale
const NOTE_EMISSION_COLOURS = [
    '#404040',
    '#BE0085',
    '#AF00BF',
    '#6B00BD',
    '#3600B5',
    '#008DB4',
    '#00C0C0',
    '#00BF89',
    '#00B731',
    '#95CB00',
    '#D8D800',
    '#C17700',
    '#B80000'
]


AFRAME.registerComponent('note-box', {
    schema: {
        note: {type: 'string'},
        colour: {type: 'string'},
        noteIdx: {type: 'number', default: 0},
        startPosition: {type: 'vec3'},
        oscillationValue: {type: 'number'},
        colIdx: {type: 'number'},
        rowIdx: {type: 'number'},
        mousedownDur: {type: 'number', default: 0},
        isMousedown: {type: 'boolean', default: false}
    },
    init: function () {
        const CONTEXT_AF = this;

        // Init start position of the note box
        CONTEXT_AF.data.startPosition = CONTEXT_AF.el.object3D.position;

        // Set box attributes
        const boxSize = 0.4;
        CONTEXT_AF.el.setAttribute('width', boxSize);
        CONTEXT_AF.el.setAttribute('height', boxSize);
        CONTEXT_AF.el.setAttribute('depth', boxSize);

        // Set box note and colour
        CONTEXT_AF.data.note = NOTES[CONTEXT_AF.data.noteIdx];
        CONTEXT_AF.data.colour = NOTE_COLOURS[CONTEXT_AF.data.noteIdx];
        CONTEXT_AF.el.setAttribute('material', {
            color: NOTE_COLOURS[CONTEXT_AF.data.noteIdx],
            emissive: NOTE_EMISSION_COLOURS[CONTEXT_AF.data.noteIdx],
            emissiveIntensity: 1.5
        });

        // Set animations
        // This animation scales it when the step sequencer 'activates' the current column the notebox is in
        CONTEXT_AF.el.setAttribute('animation__scale', {
            property: 'scale',
            from: {x: 0.6, y: 0.6, z: 0.6},
            to: {x: 1, y: 1, z: 1},
            elasticity: 800,
            startEvents: 'note-animate',
            dur: 300
        });

        // Scales it up on click
        CONTEXT_AF.el.setAttribute('animation__scale_click', {
            property: 'scale',
            from: {x: 0.8, y: 0.8, z: 0.8},
            to: {x: 1, y: 1, z: 1},
            startEvents: 'click',
            dur: 300
        });

        // Scales it up slightly on mouseenter
        CONTEXT_AF.el.setAttribute('animation__mouseenter', {
            property: 'scale',
            from: {x: 1, y: 1, z: 1},
            to: {x: 1.1, y: 1.1, z: 1.1},
            startEvents: 'mouseenter',
            dur: 200
        });

        // Scales it down on mouseleave
        CONTEXT_AF.el.setAttribute('animation__mouseleave', {
            property: 'scale',
            from: {x: 1.1, y: 1.1, z: 1.1},
            to: {x: 1, y: 1, z: 1},
            startEvents: 'mouseleave',
            dur: 200
        });

        // Select sequencer element
        CONTEXT_AF.sequencerEl = document.querySelector('#step-sequencer');

        // Create sampler for playing notes
        CONTEXT_AF.sampler = new Tone.Sampler({
            urls: {
                C3: '../assets/sounds/8n/C3.wav',
                C4:  '../assets/sounds/8n/C4.wav',
                E4:  '../assets/sounds/8n/E4.wav',
                C5:  '../assets/sounds/8n/C5.wav',
            }
        }).toDestination();


        // On click - change the note
        CONTEXT_AF.el.addEventListener('click', function (e) {
            // Cycle through notes
            // Increment note index
            CONTEXT_AF.data.noteIdx++; 
            // Use modulo to remain within the set number of notes
            const noteIdx = CONTEXT_AF.data.noteIdx % 13;

            // Update note and colour data
            CONTEXT_AF.data.note = NOTES[noteIdx];
            CONTEXT_AF.data.colour = NOTE_COLOURS[noteIdx];

            // Update material colour
            CONTEXT_AF.el.setAttribute('material', {
                color: CONTEXT_AF.data.colour,
                emissive: NOTE_EMISSION_COLOURS[noteIdx],
                emissiveIntensity: 1.5
            });
            // Emit event to step sequencer to update note
            CONTEXT_AF.sequencerEl.emit('note-change', {note: CONTEXT_AF.data.note, colIdx: CONTEXT_AF.data.colIdx, rowIdx: CONTEXT_AF.data.rowIdx});

            // Emit socket event that note has been played
            socket.emit('send_note_box', {noteIdx: CONTEXT_AF.data.noteIdx, colIdx: CONTEXT_AF.data.colIdx, rowIdx: CONTEXT_AF.data.rowIdx, id: socket.id});
        });

        // Add socket event listeners

        // When note matrix is initialised, reset note value to received note index
        socket.on('init_note_matrix', (data) => {
            const {colIdx, rowIdx} = CONTEXT_AF.data;
            const targetNoteIdx = data.matrix[colIdx][rowIdx];
            CONTEXT_AF.el.setAttribute('note-box', 'noteIdx', targetNoteIdx);
        });

        // When note box update event is received, if original source is current user, ignore
        // Else, check that the note data is for the current notebox and update the current notebox's note index if true
        socket.on('update_note_box', (data) => {
            if (data.id === socket.id) {
                return
            }
            if (CONTEXT_AF.data.colIdx === data.colIdx && CONTEXT_AF.data.rowIdx === data.rowIdx) {
                CONTEXT_AF.el.setAttribute('note-box', 'noteIdx', data.noteIdx);
            }
        });

        // When clear matrix event is received, reset the notebox's note index to 8
        socket.on('update_client_clear_matrix', () => {
            CONTEXT_AF.el.setAttribute('note-box', {...CONTEXT_AF.el.getAttribute('note-box'),
                noteIdx: 0
            });
        })
    },
    update: function () {
        // Logic for updating the notebox's data based on an updated note index value
        
        const noteIdx = this.data.noteIdx % 13;
        // Update note and colour data
        this.data.note = NOTES[noteIdx];
        this.data.colour = NOTE_COLOURS[noteIdx];

        // Update material colour
        this.el.setAttribute('material', {
            color: this.data.colour,
            emissive: NOTE_EMISSION_COLOURS[noteIdx],
            emissiveIntensity: 1.5
        });
        // Emit event to step sequencer to update note
        this.sequencerEl.emit('note-change', {note: this.data.note, colIdx: this.data.colIdx, rowIdx: this.data.rowIdx});
    },
    tick: function () {
        // Add slight oscillation for y position
        this.data.oscillationValue += 0.005;
        const oscillationPos = Math.sin(this.data.oscillationValue) * 0.0005;
        this.el.setAttribute('position', 'y', this.data.startPosition.y + oscillationPos);
    }
})
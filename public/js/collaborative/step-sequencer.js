// Referred to Tone.js's step sequencer example: https://github.com/Tonejs/ui/blob/master/src/components/input/step-sequencer.ts

AFRAME.registerComponent('step-sequencer', {
    schema: {
        columns: {type: 'number', default: 16},
        rows: {type: 'number', default: 4},
        subdivision: {type: 'string', default: '8n'},
        matrix: {type: 'array', default: []},
        octave: {type: 'string', default: 4}
    },
    init: function () {
        const CONTEXT_AF = this;

        // Select elements
        CONTEXT_AF.col1 = document.querySelector('#col-1');
        CONTEXT_AF.col2 = document.querySelector('#col-2');
        CONTEXT_AF.col3 = document.querySelector('#col-3');
        CONTEXT_AF.col4 = document.querySelector('#col-4');

        const indexedColumns = this.indexArray(CONTEXT_AF.data.columns);
        const indexedRows = this.indexArray(CONTEXT_AF.data.rows);
        CONTEXT_AF.data.matrix = indexedColumns.map(() => indexedRows.map(() => undefined));


        indexedColumns.forEach((col, colIdx) => {
            let newColEl = document.createElement('a-entity');
            newColEl.setAttribute('id', `col-${colIdx+1}`);
            newColEl.setAttribute('position', {x: 0 + (1 + colIdx * 0.8), y: 0, z: 0})

            indexedRows.forEach((arr, rowIdx) => {
                let noteBoxEl = document.createElement('a-box');
                noteBoxEl.setAttribute('position', {x: 0, y: 0 + (rowIdx + 1) * 0.6, z: 0});
                noteBoxEl.setAttribute('note-box', {});
                noteBoxEl.classList.add('interactive');
                noteBoxEl.setAttribute('id', `notebox-${colIdx}-${rowIdx}`);

                newColEl.appendChild(noteBoxEl);

                this.data.matrix[colIdx][rowIdx] = noteBoxEl;
            })

            CONTEXT_AF.el.appendChild(newColEl);

        })

        CONTEXT_AF.synth = new Tone.PolySynth(Tone.Synth).toDestination();


        // Init sequencer
        CONTEXT_AF.sequencer = new Tone.Sequence(this.columnTick.bind(this), this.indexArray(CONTEXT_AF.data.columns), CONTEXT_AF.data.subdivision).start(0);
        
        CONTEXT_AF.startLoopButton = document.querySelector('#start-loop-button');
        CONTEXT_AF.stopLoopButton = document.querySelector('#stop-loop-button');

        // Add event listeners to buttons

        CONTEXT_AF.startLoopButton.addEventListener('click', function () {
            console.log('start transport');
            Tone.getTransport().start();
        });

        CONTEXT_AF.stopLoopButton.addEventListener('click', function () {
            console.log('stop transport');
            Tone.getTransport().stop();
        });

        // Add event listener for note box change

        CONTEXT_AF.el.addEventListener('note-change', function (e) {
            console.log('note changed detected by sequencer');
            const {detail: {note, colIdx, rowIdx}} = e;
        })
    },
    update: function (oldData) {
        console.log(oldData, this);

        if (this.sequencer) {
            this.sequencer.dispose();
        }
        this.sequencer = new Tone.Sequence(this.columnTick.bind(this), this.indexArray(this.data.columns), this.data.subdivision).start(0);
    },
    columnTick: function (time, index) {
        console.log('Time: ' + time + '\t\t\t' + 'Index: ' + index);

        const notesToPlay = [];

        this.data.matrix[index].forEach((el) => {
            const octaveNote = el.getAttribute('note-box').note + this.data.octave;
            if (octaveNote) {
                notesToPlay.push(octaveNote);
            }
        })
        debugger
        this.synth.triggerAttackRelease(notesToPlay, this.data.subdivision);
    },
    indexArray: function (count) {
        const indices = [];
        for (let i = 0; i < count; i++) {
            indices.push(i);
        }
        return indices;
    }
})
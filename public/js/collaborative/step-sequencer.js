// Referred to Tone.js's step sequencer example: https://github.com/Tonejs/ui/blob/master/src/components/input/step-sequencer.ts

AFRAME.registerComponent('step-sequencer', {
    schema: {
        columns: {type: 'number', default: 16},
        rows: {type: 'number', default: 4},
        subdivision: {type: 'string', default: '8n'},
        matrix: {type: 'array', default: []},
        octave: {type: 'string', default: 4},
        indexedColumns: {type: 'array'},
        indexedArray: {type: 'array'}
    },
    init: function () {
        const CONTEXT_AF = this;

        CONTEXT_AF.data.indexedColumns = this.indexArray(CONTEXT_AF.data.columns);
        CONTEXT_AF.data.indexedRows = this.indexArray(CONTEXT_AF.data.rows);
        CONTEXT_AF.data.matrix = this.generateEmptyMatrixArray(CONTEXT_AF.data.indexedColumns, CONTEXT_AF.data.indexedRows);

        CONTEXT_AF.data.indexedColumns.forEach((col, colIdx) => {
            let newColEl = document.createElement('a-entity');
            newColEl.setAttribute('id', `col-${colIdx+1}`);
            newColEl.setAttribute('position', {x: 0 + (1 + colIdx * 0.8), y: 0, z: 0})

            CONTEXT_AF.data.indexedRows.forEach((arr, rowIdx) => {
                let noteBoxEl = document.createElement('a-box');
                noteBoxEl.setAttribute('position', {x: 0, y: 0 + (rowIdx + 1) * 0.6, z: 0});
                noteBoxEl.setAttribute('note-box', {
                    colIdx,
                    rowIdx
                });
                noteBoxEl.classList.add('interactive');
                noteBoxEl.setAttribute('id', `notebox-${colIdx}-${rowIdx}`);

                newColEl.appendChild(noteBoxEl);

                this.data.matrix[colIdx][rowIdx] = noteBoxEl;
            })

            CONTEXT_AF.el.appendChild(newColEl);
        })

        // Create sampler for playing notes
        CONTEXT_AF.sampler = new Tone.Sampler({
            urls: {
                C3: '../assets/sounds/8n/C3.mp3',
                C4:  '../assets/sounds/8n/C4.mp3',
                E4:  '../assets/sounds/8n/E4.mp3',
                C5:  '../assets/sounds/8n/C5.mp3',
            }
        }).toDestination();


        // Init sequencer
        CONTEXT_AF.sequencer = new Tone.Sequence(this.columnTick.bind(this), this.indexArray(CONTEXT_AF.data.columns), CONTEXT_AF.data.subdivision).start(0);
        
        CONTEXT_AF.startLoopButton = document.querySelector('#start-loop-button');
        CONTEXT_AF.stopLoopButton = document.querySelector('#stop-loop-button');
        CONTEXT_AF.clearLoopButton = document.querySelector('#clear-button');

        // Add event listeners to buttons

        CONTEXT_AF.startLoopButton.addEventListener('click', function () {
            socket.emit('update_server_is_playing', {isPlaying: true});
            Tone.getTransport().start();
        });

        CONTEXT_AF.stopLoopButton.addEventListener('click', function () {
            socket.emit('update_server_is_playing', {isPlaying: false});
            Tone.getTransport().stop();
        });

        CONTEXT_AF.clearLoopButton.addEventListener('click', function () {
            socket.emit('update_server_clear_matrix');
        })

        // Add event listener for note box change

        CONTEXT_AF.el.addEventListener('note-change', function (e) {
            const {detail: {note}} = e;
            const octaveNote = note + CONTEXT_AF.data.octave;
            if (octaveNote) {
                CONTEXT_AF.sampler.triggerAttackRelease(octaveNote, '8n');
            }
        })

        // Add socket events
        socket.on('update_client_is_playing', (data) => {
            if (data.id === socket.id) {
                return
            }
            if (!data.isPlaying) {
                Tone.getTransport().stop();
            } else {
                Tone.getTransport().start();
            }
        });
    },
    update: function (oldData) {
        if (this.sequencer) {
            this.sequencer.dispose();
        }
        this.sequencer = new Tone.Sequence(this.columnTick.bind(this), this.indexArray(this.data.columns), this.data.subdivision).start(0);
    },
    columnTick: function (time, index) {
        const notesToPlay = [];

        this.data.matrix[index].forEach((el) => {
            const octaveNote = el.getAttribute('note-box').note + this.data.octave;
            if (octaveNote) {
                notesToPlay.push(octaveNote);
            }
            el.emit('note-animate');
        })

        socket.emit('send_sequence_column', {notes: notesToPlay, id: socket.id});
        this.sampler.triggerAttackRelease(notesToPlay, this.data.subdivision);
    },
    indexArray: function (count) {
        const indices = [];
        for (let i = 0; i < count; i++) {
            indices.push(i);
        }
        return indices;
    },
    generateEmptyMatrixArray: function (indexedColumns, indexedRows) {
        return indexedColumns.map(() => indexedRows.map(() => undefined));
    }
})
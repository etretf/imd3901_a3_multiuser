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

        const indexedColumns = this.indexArray(CONTEXT_AF.data.columns);
        const indexedRows = this.indexArray(CONTEXT_AF.data.rows);
        CONTEXT_AF.data.matrix = indexedColumns.map(() => indexedRows.map(() => undefined));

        // // Select elements
        // CONTEXT_AF.col1 = document.querySelector('#col-1');
        // CONTEXT_AF.col2 = document.querySelector('#col-2');
        // CONTEXT_AF.col3 = document.querySelector('#col-3');
        // CONTEXT_AF.col4 = document.querySelector('#col-4');
        // CONTEXT_AF.col5 = document.querySelector('#col-5');
        // CONTEXT_AF.col6 = document.querySelector('#col-6');
        // CONTEXT_AF.col7 = document.querySelector('#col-7');
        // CONTEXT_AF.col8 = document.querySelector('#col-8');
        // CONTEXT_AF.col9 = document.querySelector('#col-9');
        // CONTEXT_AF.col10 = document.querySelector('#col-10');
        // CONTEXT_AF.col11 = document.querySelector('#col-11');
        // CONTEXT_AF.col12 = document.querySelector('#col-12');
        // CONTEXT_AF.col13 = document.querySelector('#col-13');
        // CONTEXT_AF.col14 = document.querySelector('#col-14');
        // CONTEXT_AF.col15 = document.querySelector('#col-15');
        // CONTEXT_AF.col16 = document.querySelector('#col-16');

        // CONTEXT_AF.columnElements = [
        //     CONTEXT_AF.col1,
        //     CONTEXT_AF.col2,
        //     CONTEXT_AF.col3,
        //     CONTEXT_AF.col4,
        //     CONTEXT_AF.col5,
        //     CONTEXT_AF.col6,
        //     CONTEXT_AF.col7,
        //     CONTEXT_AF.col8,
        //     CONTEXT_AF.col9,
        //     CONTEXT_AF.col10,
        //     CONTEXT_AF.col11,
        //     CONTEXT_AF.col12,
        //     CONTEXT_AF.col13,
        //     CONTEXT_AF.col14,
        //     CONTEXT_AF.col15,
        //     CONTEXT_AF.col16,
        // ]

        // CONTEXT_AF.columnElements.forEach((col, colIdx) => {
        //     const rowElements = col.children;

        //     debugger
        //     for (let i = 0; i < rowElements.length; i++) {
        //         CONTEXT_AF.data.matrix[colIdx][i] = rowElements[i];
        //     }
        // });


        indexedColumns.forEach((col, colIdx) => {
            let newColEl = document.createElement('a-entity');
            newColEl.setAttribute('id', `col-${colIdx+1}`);
            newColEl.setAttribute('position', {x: 0 + (1 + colIdx * 0.8), y: 0, z: 0})

            indexedRows.forEach((arr, rowIdx) => {
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

        // Add event listeners to buttons

        CONTEXT_AF.startLoopButton.addEventListener('click', function () {
            socket.emit('update_server_is_playing', {isPlaying: true});
            Tone.getTransport().start();
        });

        CONTEXT_AF.stopLoopButton.addEventListener('click', function () {
            socket.emit('update_server_is_playing', {isPlaying: false});
            Tone.getTransport().stop();
        });

        // Add event listener for note box change

        CONTEXT_AF.el.addEventListener('note-change', function (e) {
            const {detail: {note}} = e;
            const octaveNote = () => CONTEXT_AF.getNoteWithOctave(note, CONTEXT_AF.data.octave);
            // CONTEXT_AF.data.synth.triggerAttackRelease(octaveNote, '8n');
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
        // console.log('Time: ' + time + '\t\t\t' + 'Index: ' + index);

        const notesToPlay = [];

        this.data.matrix[index].forEach((el) => {
            const octaveNote = el.getAttribute('note-box').note + this.data.octave;
            if (octaveNote) {
                notesToPlay.push(octaveNote);
            }

            el.emit('note-animate');
            el.emit('note-animate-end');
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
    getNoteWithOctave: function (letter, octave) {

    }
})
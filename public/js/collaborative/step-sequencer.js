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

        // Initialise the matrix data by creating an empty matrix array with 16 columns with 4 rows each
        CONTEXT_AF.data.indexedColumns = this.indexArray(CONTEXT_AF.data.columns);
        CONTEXT_AF.data.indexedRows = this.indexArray(CONTEXT_AF.data.rows);
        CONTEXT_AF.data.matrix = this.generateEmptyMatrixArray(CONTEXT_AF.data.indexedColumns, CONTEXT_AF.data.indexedRows);

        // Generate noteboxes for each column and row
        CONTEXT_AF.data.indexedColumns.forEach((col, colIdx) => {
            // Create column element to hold 4 rows of noteboxes
            let newColEl = document.createElement('a-entity');
            // Set column atttributes
            newColEl.setAttribute('id', `col-${colIdx+1}`);
            newColEl.setAttribute('position', {x: 0 + (1 + colIdx * 0.8), y: 0, z: 0})

            // Create a notebox element for each row
            CONTEXT_AF.data.indexedRows.forEach((arr, rowIdx) => {
                // Create notebox element
                let noteBoxEl = document.createElement('a-box');
                // Set notebox attributes
                noteBoxEl.setAttribute('position', {x: 0, y: 0 + (rowIdx + 1) * 0.6, z: 0});
                noteBoxEl.setAttribute('note-box', {
                    colIdx,
                    rowIdx
                });
                noteBoxEl.classList.add('interactive');
                noteBoxEl.setAttribute('id', `notebox-${colIdx}-${rowIdx}`);

                // Append the notebox to the current column
                newColEl.appendChild(noteBoxEl);

                // Update the matrix to point to the notebox element at the current column index and row index
                this.data.matrix[colIdx][rowIdx] = noteBoxEl;
            })

            // Append the column element to the step-sequencer element
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


        // Init Tone.js Sequencer based on the column count and subdivision
        // Bind this to the callback function (columnTick) that will be fired for every event in the sequencer
        CONTEXT_AF.sequencer = new Tone.Sequence(this.columnTick.bind(this), this.indexArray(CONTEXT_AF.data.columns), CONTEXT_AF.data.subdivision).start(0);
        

        // Get reference to buttons for controlling the sequencer playback or state
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

        // Add event listener for note change emitted from a notebox component
        CONTEXT_AF.el.addEventListener('note-change', function (e) {
            const {detail: {note}} = e;
            const octaveNote = note + CONTEXT_AF.data.octave;
            // Play a note from the received note event after concatenating the note letter with the sequencer's set octave
            if (octaveNote) {
                CONTEXT_AF.sampler.triggerAttackRelease(octaveNote, '8n');
            }
        })

        // Add socket events
        // When receiving an is playing update, check that the originator is not the client themself
        // Then start or stop the Tone Transport based on the boolean data
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
    update: function () {
        // Instantiate new sequencer if component data gets updated
        if (this.sequencer) {
            this.sequencer.dispose();
        }
        this.sequencer = new Tone.Sequence(this.columnTick.bind(this), this.indexArray(this.data.columns), this.data.subdivision).start(0);
    },
    columnTick: function (time, index) {
        // Callback function for the Tone Sequencer that gets called for every column in the sequence
        
        // Create array to collect notes that should be played in the column
        const notesToPlay = [];

        // Loop over each row element/notebox in the current column
        this.data.matrix[index].forEach((el) => {
            // Concatenate the note from each element with the sequencer's set octave
            const octaveNote = el.getAttribute('note-box').note + this.data.octave;

            // Add the note to the array if the string is valid
            if (octaveNote) {
                notesToPlay.push(octaveNote);
            }
            // Emit an event to the note box element to start a scaling animation
            el.emit('note-animate');
        })

        // Play the valid notes using the sampler
        this.sampler.triggerAttackRelease(notesToPlay, this.data.subdivision);
    },
    indexArray: function (count) {
        // Function creates an array of index values
        // I.e. pass in (4)  -> return [0, 1, 2, 3]
        const indices = [];
        for (let i = 0; i < count; i++) {
            indices.push(i);
        }
        return indices;
    },
    generateEmptyMatrixArray: function (indexedColumns, indexedRows) {
        // Creates a matrix array of undefined values based on indexedColumns length and indexedRows length
        return indexedColumns.map(() => indexedRows.map(() => undefined));
    }
})
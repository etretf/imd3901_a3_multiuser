
AFRAME.registerComponent('piano-note', {
    schema: {
        note: {type: 'string', default: 'C4'},
        duration: {type: 'string', default: '4n'}
    },
    init: function () {
        const CONTEXT_AF = this;

        // Create text 
        const noteText = document.createElement('a-text');
        CONTEXT_AF.noteTextId = CONTEXT_AF.data.note.replace('#', 'sharp') + '-label';
        noteText.setAttribute('id', CONTEXT_AF.noteTextId);
        noteText.setAttribute('value', CONTEXT_AF.data.note);
        noteText.setAttribute('position', '-0.2 0.5 0');
        noteText.setAttribute('visible', false);
        CONTEXT_AF.el.appendChild(noteText);

        CONTEXT_AF.sampler = new Tone.Sampler({
            urls: {
                C3: '../assets/sounds/4n/C3.wav',
                C4:  '../assets/sounds/4n/C4.wav',
                E4:  '../assets/sounds/4n/E4.wav',
                C5:  '../assets/sounds/4n/C5.wav',
            },
            onload: () => {
                CONTEXT_AF.el.addEventListener('mousedown', function () {
                    CONTEXT_AF.sampler.triggerAttackRelease(CONTEXT_AF.data.note, "4n");
        
                    socket.emit('piano_note', {note: CONTEXT_AF.data.note, id: socket.id});
                })
            }
        }).toDestination();

        CONTEXT_AF.el.addEventListener('mouseenter', function () {
            const textEl = document.querySelector(`#${CONTEXT_AF.noteTextId}`);
            textEl.setAttribute('visible', true);
        });

        CONTEXT_AF.el.addEventListener('mouseleave', function () {
            const textEl = document.querySelector(`#${CONTEXT_AF.noteTextId}`);
            textEl.setAttribute('visible', false);
        });
    }
})
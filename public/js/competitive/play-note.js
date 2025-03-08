AFRAME.registerComponent('play-note', {
    schema: {
        note: {type: 'string'}
    },
    init: function () {
        const CONTEXT_AF = this;

        // Receives a play_note event from the server and plays the note that players need to gues
        CONTEXT_AF.el.addEventListener('play_note', function (e) {
            const playNote = function () {
                const synth = new Tone.Synth().toDestination();
                synth.triggerAttackRelease(e.detail, "4n");

                // Emits event back to server to tell server the note was played
                socket.emit('note_played');
            };

            // Play the note only after a delay so the user has time to react to the game state change
            setTimeout(playNote, 1000);
        });
    }
})
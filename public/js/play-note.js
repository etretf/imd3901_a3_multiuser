AFRAME.registerComponent('play-note', {
    schema: {
        note: {type: 'string'}
    },
    init: function () {
        const CONTEXT_AF = this;

        CONTEXT_AF.gameManagerEl = document.querySelector('#game-manager');

        CONTEXT_AF.el.addEventListener('play_note', function (e) {
            const playNote = function () {
                const synth = new Tone.Synth().toDestination();
                synth.triggerAttackRelease(e.detail, "4n");

                socket.emit('note_played');
                console.log('emitting note_played');
            };

            setTimeout(playNote, 1000);
        });
    },
    tick: function () {},
    update: function () {}
})
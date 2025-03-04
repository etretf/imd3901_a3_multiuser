AFRAME.registerComponent('play-note', {
    schema: {},
    init: function () {
        const CONTEXT_AF = this;

        CONTEXT_AF.el.addEventListener('mousedown', function () {
            socket.emit('play_note', {note: 'C4'});
            const synth = new Tone.Synth().toDestination();
            // play a note from that synth
            synth.triggerAttackRelease("C4", "8n");
        })

        socket.on('send_note', (data) => {
            if (data.id !== socket.id) {
                const synth = new Tone.Synth().toDestination();
                // play a note from that synth
                synth.triggerAttackRelease("C4", "8n");
            }
            console.log(data);
        })
    },
    tick: function () {},
    update: function () {}
})
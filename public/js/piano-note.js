
AFRAME.registerComponent('piano-note', {
    schema: {
        note: {type: 'string', default: 'C4'},
        duration: {type: 'string', default: '8n'}
    },
    init: function () {
        const CONTEXT_AF = this;

        CONTEXT_AF.el.addEventListener('mousedown', function () {
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(CONTEXT_AF.data.note, "8n");
        })
    }
})
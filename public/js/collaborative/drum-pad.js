const BEAT_MAP = {
    bass: 'C1',
    clap: 'C#1',
    cowbell: 'D1',
    hihat: 'D#1',
    hihatOpen: 'E1',
    ride: 'F1',
    snare: 'F#1',
    tom1: 'G1',
    tom2: 'G#1',
    tom3: 'A1'
}

const BEAT_COLOUR_MAP = {
    bass: NOTE_COLOURS[1],
    clap: NOTE_COLOURS[2],
    cowbell: NOTE_COLOURS[3],
    hihat: NOTE_COLOURS[4],
    hihatOpen: NOTE_COLOURS[5],
    ride: NOTE_COLOURS[6],
    snare: NOTE_COLOURS[7],
    tom1: NOTE_COLOURS[8],
    tom2: NOTE_COLOURS[9],
    tom3: NOTE_COLOURS[10]
}

const BEAT_EMISSIVE_MAP = {
    bass: NOTE_EMISSION_COLOURS[1],
    clap: NOTE_EMISSION_COLOURS[2],
    cowbell: NOTE_EMISSION_COLOURS[3],
    hihat: NOTE_EMISSION_COLOURS[4],
    hihatOpen: NOTE_EMISSION_COLOURS[5],
    ride: NOTE_EMISSION_COLOURS[6],
    snare: NOTE_EMISSION_COLOURS[7],
    tom1: NOTE_EMISSION_COLOURS[8],
    tom2: NOTE_EMISSION_COLOURS[9],
    tom3: NOTE_EMISSION_COLOURS[10]
}

const DRUM_COLOUR = '#000';
const DRUM_HOVER_COLOUR = '#AAA';

AFRAME.registerComponent('drum-pad', {
    schema: {
        beatType: {type: 'string'},
        colour: {type: 'string'},
        padId: {type: 'string'}
    },
    init: function () {
        const CONTEXT_AF = this;

        // Set attributes
        CONTEXT_AF.el.classList.add('interactive');
        CONTEXT_AF.el.setAttribute('height', 0.05);
        CONTEXT_AF.el.setAttribute('radius', 0.4);
        CONTEXT_AF.el.setAttribute('material', {
            color: DRUM_COLOUR,
            shader: 'flat'
        });
        CONTEXT_AF.data.padId = CONTEXT_AF.data.beatType + '-pad';

        // Create torus outline
        const torusEl = document.createElement('a-entity');
        const torusElId = `${CONTEXT_AF.data.beatType}-torus`;
        torusEl.setAttribute('id', `${CONTEXT_AF.data.beatType}-torus`);
        torusEl.setAttribute('geometry', {
            primitive: 'torus',
            radius: 0.42,
            radiusTubular: 0.015,
        });
        torusEl.setAttribute('position', '0 0.04 0');
        torusEl.setAttribute('rotation', '-90 0 0');
        torusEl.setAttribute('material', {
            color: BEAT_COLOUR_MAP[CONTEXT_AF.data.beatType],
            emissive: BEAT_COLOUR_MAP[CONTEXT_AF.data.beatType]
            // emissiveIntensity: 9.34
        });

        CONTEXT_AF.el.appendChild(torusEl);

        CONTEXT_AF.torusEl = document.querySelector(`#${torusElId}`);

        // Set animations

        CONTEXT_AF.el.setAttribute('animation__hit', {
            property: 'scale',
            from: {x: 0.8, y: 0.8, z: 0.8},
            to: {x: 1, y: 1, z: 1},
            elasticity: 800,
            startEvents: 'mousedown',
            dur: 300
        });

        // CONTEXT_AF.torusEl.setAttribute('animation__mouseenter', {
        //     property: 'material.color',
        //     type: 'color',
        //     from: DRUM_COLOUR,
        //     to: DRUM_HOVER_COLOUR,
        //     startEvents: 'mouseenter',
        //     dur: 300
        // });

        // CONTEXT_AF.el.setAttribute('animation__mouseleave', {
        //     property: 'material.color',
        //     type: 'color',
        //     from: DRUM_HOVER_COLOUR,
        //     to: DRUM_COLOUR,
        //     startEvents: 'mouseleave',
        //     dur: 300
        // });

        // Add socket events

        socket.on('send_client_note', (data) => {
            if (data.padId === CONTEXT_AF.data.padId && data.id !== socket.id) {
                CONTEXT_AF.sampler.triggerAttackRelease(BEAT_MAP[CONTEXT_AF.data.beatType], "8n");
            }
        });

        // Set animations

        // Create sampler for playing notes
        CONTEXT_AF.sampler = new Tone.Sampler({
            urls: {
                C1: '../assets/sounds/8n/808/Bass.wav',
                'C#1': '../assets/sounds/8n/808/Clap.wav',
                D1: '../assets/sounds/8n/808/Cowbell.wav',
                'D#1': '../assets/sounds/8n/808/HiHat.wav',
                E1: '../assets/sounds/8n/808/HiHatOpen.wav',
                F1: '../assets/sounds/8n/808/Ride.wav',
                'F#1': '../assets/sounds/8n/808/Snare.wav',
                G1: '../assets/sounds/8n/808/Tom1.wav',
                'G#1': '../assets/sounds/8n/808/Tom2.wav',
                A1: '../assets/sounds/8n/808/Tom3.wav',
            }
        }).toDestination();
        
        CONTEXT_AF.el.addEventListener('mousedown', function () {
            CONTEXT_AF.sampler.triggerAttackRelease(BEAT_MAP[CONTEXT_AF.data.beatType], "8n");
            socket.emit('send_server_note', {padId: CONTEXT_AF.data.padId, id: socket.id});
        });
    }
})
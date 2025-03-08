// Array of all possible keys to be played in the game
const ALL_KEYS = [
    {type: 'white', note: 'C3'},
    {type: 'black', note: 'C#3'},
    {type: 'white', note: 'D3'},
    {type: 'black', note: 'D#3'},
    {type: 'white', note: 'E3'},
    {type: 'white', note: 'F3'},
    {type: 'black', note: 'F#3'},
    {type: 'white', note: 'G3'},
    {type: 'black', note: 'G#3'},
    {type: 'white', note: 'A3'},
    {type: 'black', note: 'A#3'},
    {type: 'white', note: 'B3'},
    {type: 'white', note: 'C4'},
    {type: 'black', note: 'C#4'},
    {type: 'white', note: 'D4'},
    {type: 'black', note: 'D#4'},
    {type: 'white', note: 'E4'},
    {type: 'white', note: 'F4'},
    {type: 'black', note: 'F#4'},
    {type: 'white', note: 'G4'},
    {type: 'black', note: 'G#4'},
    {type: 'white', note: 'A4'},
    {type: 'black', note: 'A#4'},
    {type: 'white', note: 'B4'},
    {type: 'white', note: 'C5'}
]

// Filtered arrays for black keys and white keys
const WHITE_KEYS = ALL_KEYS.filter(key => key.type === 'white')
const BLACK_KEYS = ALL_KEYS.filter(key => key.type === 'black')

AFRAME.registerComponent('piano-spawn', {
    schema: {
    },
    init: function () {
        const CONTEXT_AF = this;

        // Generate white keys for the piano
        // Did not do black keys because the positioning was harder to code than to place
        const createKeys = function () {
            const whiteKeys = WHITE_KEYS

            // Loop through white keys length and create a new piano note for each
            for (let i = 0; i < whiteKeys.length; i++) {
                const keyEl = document.createElement('a-box');

                // Set piano note attributes
                keyEl.classList.add('interactive');
                keyEl.setAttribute('piano-note', {note: whiteKeys[i].note});

                // Set key type and size
                const keyType = whiteKeys[i].type;
                let depth = 1.5;
                let height = 0.3;
                let width = 0.48;

                const widthOffset = -1 * (CONTEXT_AF.el.getAttribute('width') / 2) + (width + 0.01) * i + width * 0.6
                keyEl.setAttribute('position', {x: widthOffset, y: height / 2, z: 0.1})
                keyEl.setAttribute('depth', depth);
                keyEl.setAttribute('height', height);
                keyEl.setAttribute('width', width);
                keyEl.setAttribute('material', {color: keyType});

                // Add animations for mousedown, mouseenter, and mouseleave events

                // Moves the key up from a lowered position after a click
                keyEl.setAttribute('animation__mousedown', {
                    property: 'position',
                    from: {x: widthOffset, y: height / 4, z: 0.1},
                    to: {x: widthOffset, y: height / 2, z: 0.1},
                    startEvents: 'mousedown',
                    dur: 300
                });

                // Makes the key coloured when hovering over it
                keyEl.setAttribute('animation__mouseenter', {
                    property: 'material.color',
                    type: 'color',
                    from: '#FFF',
                    to: '#d15858',
                    startEvents: 'mouseenter',
                    dur: 0
                });

                // Resets the key colour back to white after hover
                keyEl.setAttribute('animation__mouseleave', {
                    property: 'material.color',
                    type: 'color',
                    from: '#d15858',
                    to: '#FFF',
                    startEvents: 'mouseleave',
                    dur: 50
                });

                // Append the note to the piano element
                CONTEXT_AF.el.appendChild(keyEl);
            }
        }
        createKeys();
    }
})
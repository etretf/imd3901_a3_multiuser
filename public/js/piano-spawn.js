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

const WHITE_KEYS = ALL_KEYS.filter(key => key.type === 'white')
const BLACK_KEYS = ALL_KEYS.filter(key => key.type === 'black')
const SORTED_KEYS = {white: WHITE_KEYS, black: BLACK_KEYS}

AFRAME.registerComponent('piano-spawn', {
    schema: {
    },
    init: function () {
        const CONTEXT_AF = this;

        const createKeys = function () {
            const whiteKeys = WHITE_KEYS

            for (let i = 0; i < whiteKeys.length; i++) {
                const keyEl = document.createElement('a-box');
                keyEl.classList.add('interactive');
                keyEl.setAttribute('piano-note', {note: whiteKeys[i].note});
                
                const keyType = whiteKeys[i].type;
                let depth = 1.5;
                let height = 0.3;
                let width = 0.48;

                const widthOffset = -1 * (CONTEXT_AF.el.getAttribute('width') / 2) + (width + 0.01) * i + width * 0.6
                keyEl.setAttribute('position', {x: widthOffset, y: height / 2, z: 0.1})
                keyEl.setAttribute('depth', depth);
                keyEl.setAttribute('height', height);
                keyEl.setAttribute('width', width);
                keyEl.setAttribute('material', {color: keyType})
                keyEl.setAttribute('animation__click', {
                    property: 'position',
                    from: {x: widthOffset, y: height / 4, z: 0.1},
                    to: {x: widthOffset, y: height / 2, z: 0.1},
                    startEvents: 'click',
                    dur: 300
                }),
                keyEl.setAttribute('animation__mouseenter', {
                    property: 'material.color',
                    type: 'color',
                    from: '#FFF',
                    to: '#d15858',
                    startEvents: 'mouseenter',
                    dur: 0
                }),
                keyEl.setAttribute('animation__mouseleave', {
                    property: 'material.color',
                    type: 'color',
                    from: '#d15858',
                    to: '#FFF',
                    startEvents: 'mouseleave',
                    dur: 50
                }),
                CONTEXT_AF.el.appendChild(keyEl);
            }
        }
        createKeys();
    }
})
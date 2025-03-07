AFRAME.registerComponent('animated-button', {
    schema: {
        duration: {type: 'number', default: 300}
    },
    init: function () {
        const CONTEXT_AF = this;

        const pos = CONTEXT_AF.el.object3D.position;

        CONTEXT_AF.el.setAttribute('animation__mouseclick', {
            property: 'position',
            from: {x: pos.x, y: pos.y - 0.1, z: pos.z},
            to: pos,
            dur: CONTEXT_AF.data.duration,
            startEvents: 'click'
        })
    }
})
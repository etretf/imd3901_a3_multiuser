AFRAME.registerComponent('black-key', {
    schema: {},
    init: function () {
        const CONTEXT_AF = this;

        const pos = CONTEXT_AF.el.getAttribute('position');

        // Add animations to the element

        // Adds a y position animation of the element rising up
        CONTEXT_AF.el.setAttribute('animation__click', {
            property: 'position',
            from: {x: pos.x, y: pos.y / 1.5, z: pos.z},
            to: {x: pos.x, y: pos.y, z: pos.z},
            startEvents: 'click',
            dur: 300
        });

        // Add a hover colour
        CONTEXT_AF.el.setAttribute('animation__mouseenter', {
            property: 'material.color',
            type: 'color',
            from: '#000',
            to: '#d15858',
            startEvents: 'mouseenter',
            dur: 0
        });

        // Go back to the original colour after hovering
        CONTEXT_AF.el.setAttribute('animation__mouseleave', {
            property: 'material.color',
            type: 'color',
            from: '#d15858',
            to: '#000',
            startEvents: 'mouseleave',
            dur: 50
        });
    }
})
AFRAME.registerComponent('teleport-pad', {
    init: function () {
        const CONTEXT_AF = this;

        // Set properties on the teleport pad
        CONTEXT_AF.el.setAttribute('radius', 0.3);
        CONTEXT_AF.el.setAttribute('height', 0.15);
        CONTEXT_AF.el.setAttribute('material', {color: 'rgb(0, 128, 0)', emissive: 'rgb(0, 80, 0)'});
        CONTEXT_AF.el.classList.add('interactive');
        
        // Set animation for mouseenter to be light green
        CONTEXT_AF.el.setAttribute('animation__mouseenter', {
            property: 'material.color',
            type: 'color',
            to: 'rgb(255, 255, 255)',
            startEvents: 'mouseenter',
            dur: '200'
        });

        // Set animation for mouseleave to return to base colour
        CONTEXT_AF.el.setAttribute('animation__mouseleave', {
            property: 'material.color',
            type: 'color',
            to: 'rgb(0, 128, 0)',
            startEvents: 'mouseleave',
            dur: '200'
        });

        // Teleport the player to the teleport pad's world position
        CONTEXT_AF.el.addEventListener('click', function () {
            const player = document.querySelector('#player');
            let elPos = CONTEXT_AF.el.object3D.position;
            const newPos = {...elPos};
            newPos.y += 1.6;
            player.setAttribute('position', newPos);
        })
    }
});
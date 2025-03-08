AFRAME.registerComponent('instructions-ui', {
    schema: {},
    init: function () {
        const CONTEXT_AF = this;

        CONTEXT_AF.closeButton = document.querySelector('#close-instructions-button');

        CONTEXT_AF.closeButton.addEventListener('click', function () {
            CONTEXT_AF.el.parentNode.removeChild(CONTEXT_AF.el);
        });
    }
});
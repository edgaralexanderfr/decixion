var game = {
    players: {
        player1: {}
    },
    state: {},

    init: function (dcx) {
        /**
         * TODO: Initialise game logic here...
         */
    },

    functions: {},

    entrySection: 'hello',
    sections: {
        hello: {
            text: 'Hello game!',
            options: [
                {
                    text: 'Exit game',
                    section: 'bye'
                }
            ]
        },
        bye: {
            text: 'Bye game!',
            options: [
                {
                    text: 'Play again',
                    section: 'hello'
                }
            ]
        }
    }
};

if (typeof module != 'undefined') {
    module.exports = game;
}

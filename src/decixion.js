/**
 * @class
 */
var decixion = {
    IS_MODULE: false,

    _game: null,
    _players: {},
    _state: {},

    init: function (game) {
        decixion._game = game;
    },

    get: function (name, player) {
        if (player) {
            if (decixion._players[player]
                && decixion._players[player][name]
            ) {
                return decixion._players[player][name];
            }

            return undefined;
        }

        if (decixion._state[name]) {
            return decixion._state[name];
        }

        return undefined;
    },

    set: function (name, value, player) {
        if (player) {
            if (!decixion._players[player]) {
                decixion._players[player] = {};
            }

            decixion._players[player][name] = value;
        } else {
            decixion._state[name] = value;
        }
    }
};

decixion.IS_MODULE = typeof module != 'undefined';

if (decixion.IS_MODULE) {
    module.exports = decixion;
}

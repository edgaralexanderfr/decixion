/**
 * @class
 */
var decixion = {
    IS_MODULE: false,

    _game: null,
    _players: {},
    _state: {},
    _rangeMin: 0,
    _rangeMax: 100,

    setRangeMin: function (rangeMin) {
        decixion._rangeMin = rangeMin;
    },

    setRangeMax: function (rangeMax) {
        decixion._rangeMax = rangeMax;
    },

    init: function (game) {
        decixion._game = game;

        decixion._initPlayers(game);
        decixion._initState(game);
    },

    get: function (name, player) {
        if (player) {
            if (decixion._players[player]
                && typeof decixion._players[player][name] != 'undefined'
            ) {
                return decixion._players[player][name];
            }

            return undefined;
        }

        if (typeof decixion._state[name] != 'undefined') {
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

        return value;
    },

    increase: function (name, value, player, rangeMax) {
        rangeMax = rangeMax || decixion._rangeMax;

        var nextValue = decixion.get(name, player) + value;

        if (nextValue > rangeMax) {
            nextValue = rangeMax;
        }

        decixion.set(name, nextValue, player);

        return nextValue;
    },

    decrease: function (name, value, player, rangeMin) {
        rangeMin = rangeMin || decixion._rangeMin;

        var nextValue = decixion.get(name, player) - value;

        if (nextValue < rangeMin) {
            nextValue = rangeMin;
        }

        decixion.set(name, nextValue, player);

        return nextValue;
    },

    _initPlayers: function (game) {
        if (typeof game['players'] == 'object') {
            var playerKey, player, name;

            for (playerKey in game.players) {
                player = game.players[playerKey];

                for (name in player) {
                    decixion.set(
                        name,
                        player[name],
                        playerKey
                    );
                }
            }
        }
    },

    _initState: function (game) {
        if (typeof game['state'] == 'object') {
            var name;

            for (name in game.state) {
                decixion.set(
                    name,
                    game.state[name]
                );
            }
        }
    },

    _getObjectChain: function (object, attributeChain) {
        var chain = attributeChain.split('.');
        var total = chain.length;
        var i;

        for (i = 0; i < total; i++) {
            if (typeof object[chain[i]] == 'undefined') {
                return undefined;
            }

            object = object[chain[i]];
        }

        return object;
    },

    _setObjectChain: function (object, attributeChain, value) {
        var chain = attributeChain.split('.');
        var total = chain.length;
        var last = total - 1;
        var i;

        for (i = 0; i < total; i++) {
            if (i == last) {
                object[chain[i]] = value;
            } else {
                if (typeof object[chain[i]] != 'object') {
                    object[chain[i]] = {};
                }

                object = object[chain[i]];
            }
        }

        return value;
    }
};

decixion.IS_MODULE = typeof module != 'undefined';

if (decixion.IS_MODULE) {
    module.exports = decixion;
}

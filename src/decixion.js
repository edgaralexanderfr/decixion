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
            if (decixion._players[player]) {
                return decixion._getObjectChain(
                    decixion._players[player],
                    name
                );
            }

            return undefined;
        }

        return decixion._getObjectChain(
            decixion._state,
            name
        );
    },

    set: function (name, value, player) {
        if (player) {
            if (!decixion._players[player]) {
                decixion._players[player] = {};
            }

            decixion._setObjectChain(
                decixion._players[player],
                name,
                value
            );
        } else {
            decixion._setObjectChain(
                decixion._state,
                name,
                value
            );
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
            decixion._setValuesRecursive(
                decixion._players, 
                game.players
            );
        }
    },

    _initState: function (game) {
        if (typeof game['state'] == 'object') {
            decixion._setValuesRecursive(
                decixion._state, 
                game.state
            );
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
    },

    _setValuesRecursive: function (object1, object2) {
        var isArray = Array.isArray(object2);
        var key, value, isArrayValue, isObjectValue, object;

        for (key in object2) {
            value = object2[key];
            isArrayValue = Array.isArray(value);
            isObjectValue = typeof value == 'object';

            if (isArrayValue || isObjectValue) {
                if (isArrayValue) {
                    object = [];
                } else {
                    object = {};
                }

                decixion._setValuesRecursive(
                    object,
                    value
                );

                if (isArray) {
                    object1.push(object);
                } else {
                    object1[key] = object;
                }
            } else {
                if (isArray) {
                    object1.push(value);
                } else {
                    object1[key] = value;
                }
            }
        }
    }
};

decixion.IS_MODULE = typeof module != 'undefined';

if (decixion.IS_MODULE) {
    module.exports = decixion;
}

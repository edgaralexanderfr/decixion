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
    _currentSection: null,
    _textEl: null,
    _selectEl: null,
    _buttonEl: null,

    init: function (game) {
        decixion._game = game;

        decixion._initPlayers(game);
        decixion._initState(game);

        decixion.select();
    },

    setRangeMin: function (rangeMin) {
        decixion._rangeMin = rangeMin;
    },

    setRangeMax: function (rangeMax) {
        decixion._rangeMax = rangeMax;
    },

    text: function () {
        return decixion._currentSection.text;
    },

    options: function () {
        var options = [];
        var currentOptions = decixion._currentSection.options;
        var total = currentOptions.length;
        var i;

        for (i = 0; i < total; i++) {
            options.push(currentOptions[i].text);
        }

        return options;
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

    select: function (optionIndex) {
        var game = decixion._game;

        if (!decixion._currentSection) {
            decixion._currentSection = decixion._getObjectChain(
                game.sections,
                game.entrySection
            );

            return true;
        }

        var currentSection = decixion._currentSection;

        if (!currentSection['options']) {
            return false;
        }

        if (optionIndex < 0) {
            optionIndex = 0;
        } else {
            if (optionIndex >= currentSection.options.length) {
                optionIndex = currentSection.options.length - 1;
            }
        }

        var option = currentSection.options[optionIndex];

        if (!option['section']) {
            return false;
        }

        decixion._currentSection = decixion._getObjectChain(
            game.sections, 
            decixion._retrieveSection(option)
        );

        if (decixion._textEl) {
            decixion._textEl.innerText = decixion.text();
        }

        if (decixion._selectEl) {
            currentSection = decixion._currentSection;

            if (currentSection['options']) {
                decixion._updateSelectElOptions(
                    currentSection.options
                );
            } else {
                decixion._updateSelectElOptions([]);
            }
        }

        return true;
    },

    bindtext: function (textEl) {
        decixion._textEl = textEl;
        decixion._textEl.innerText = decixion.text();
    },

    unbindtext: function () {
        decixion._textEl = null;
    },

    bindselect: function (selectEl) {
        decixion.unbindselect();

        var currentSection = decixion._currentSection;
        decixion._selectEl = selectEl;

        if (currentSection && currentSection['options']) {
            decixion._updateSelectElOptions(currentSection.options);
        }

        decixion._selectEl.addEventListener(
            'change', 
            decixion._onSelectElChange, 
            false
        );
    },

    unbindselect: function () {
        if (decixion._selectEl) {
            decixion._selectEl.removeEventListener(
                'change', 
                decixion._onSelectElChange, 
                false
            );
        }

        decixion._selectEl = null;
    },

    bindbutton: function (buttonEl) {
        decixion.unbindbutton();

        decixion._buttonEl = buttonEl;

        decixion._buttonEl.addEventListener(
            'click', 
            decixion._onButtonElClick, 
            false
        );
    },

    unbindbutton: function () {
        if (decixion._buttonEl) {
            decixion._buttonEl.removeEventListener(
                'click', 
                decixion._onButtonElClick, 
                false
            );
        }

        decixion._buttonEl = null;
    },

    _initPlayers: function (game) {
        if (typeof game['players'] == 'object') {
            decixion._setRecursiveValues(
                decixion._players, 
                game.players
            );
        }
    },

    _initState: function (game) {
        if (typeof game['state'] == 'object') {
            decixion._setRecursiveValues(
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

    _setRecursiveValues: function (object1, object2) {
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

                decixion._setRecursiveValues(
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
    },

    _updateSelectElOptions: function (options) {
        if (!decixion._selectEl) {
            return null;
        }

        var total = decixion._selectEl.length;
        var i, option;

        for (i = total - 1; i >= 0; i--) {
            decixion._selectEl.remove(i);
        }

        total = options.length;

        for (i = 0; i < total; i++) {
            option = document.createElement('option');
            option.text = options[i].text;
            option.value = i;
            decixion._selectEl.appendChild(option);
        }

        return decixion._selectEl;
    },

    _retrieveSection: function (option) {
        return typeof option['section'] == 'function' 
            ? option.section(decixion) 
            : option.section;
    },

    _onSelectElChange: function (e) {
        if (decixion._selectEl) {
            decixion.select(
                decixion._selectEl.selectedIndex
            );
        }
    },

    _onButtonElClick: function (e) {
        if (decixion._selectEl) {
            decixion.select(
                decixion._selectEl.selectedIndex
            );
        }
    }
};

decixion.IS_MODULE = typeof module != 'undefined';

if (decixion.IS_MODULE) {
    module.exports = decixion;
}

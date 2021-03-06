/**
 * @class
 */
var decixion = {
    VERSION: '0.5.0',
    IS_MODULE: false,

    _game: null,
    _players: {},
    _state: {},
    _rangeMin: 0,
    _rangeMax: 100,
    _currentSection: null,
    _countdown: 0,
    _countdownInterval: null,
    _sounds: {},
    _textEl: null,
    _countdownEl: null,
    _selectEl: null,
    _buttonEl: null,

    init: function (game) {
        decixion._game = game;

        decixion._initModules(game);
        decixion._initPlayers(game);
        decixion._initState(game);
        decixion._initKeys(game);
        decixion._initSounds(game);
        decixion._initGame(game);

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

    countdown: function () {
        return decixion._countdown;
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

    include: function (gameModule) {
        var game = decixion._game;
        var objectsToMerge = [
            'players',
            'state',
            'functions',
            'sections'
        ];

        decixion.each(objectsToMerge, function (i, objectToMerge) {
            if (typeof gameModule[objectToMerge] == 'object') {
                if (typeof game[objectToMerge] != 'object') {
                    game[objectToMerge] = {};
                }

                decixion._setRecursiveValues(
                    game[objectToMerge],
                    gameModule[objectToMerge]
                );
            }
        });
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
            decixion._goToSection(game.entrySection);

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

        decixion._clearCountdownInterval();
        decixion._goToSection(option.section);

        return true;
    },

    call: function (call, args) {
        var params = args || {};

        var func = decixion._getObjectChain(
            decixion._game.functions, 
            call
        );

        return func(decixion, params);
    },

    each: function (iterable, callback) {
        if (Array.isArray(iterable)) {
            var length = iterable.length;
            var i, continueLoop;

            for (i = 0; i < length; i++) {
                continueLoop = callback(i, iterable[i]);

                if (continueLoop === false) {
                    break;
                }
            }
        } else {
            var key;

            for (key in iterable) {
                continueLoop = callback(key, iterable[key]);

                if (continueLoop === false) {
                    break;
                }
            }
        }
    },

    bindkeys: function () {
        if (!decixion.IS_MODULE) {
            decixion.unbindkeys();
            window.addEventListener('keyup', decixion._onKeyUp, false);
        }
    },

    unbindkeys: function () {
        if (!decixion.IS_MODULE) {
            window.removeEventListener('keyup', decixion._onKeyUp, false);
        }
    },

    bindtext: function (textEl) {
        decixion._textEl = textEl;
        decixion._textEl.innerText = decixion.text();
    },

    unbindtext: function () {
        decixion._textEl = null;
    },

    bindcountdown: function (countdownEl) {
        decixion._countdownEl = countdownEl;

        if (decixion._countdown > 0) {
            decixion._countdownEl.innerText = decixion.countdown();
        } else {
            decixion._countdownEl.innerText = '';
        }
    },

    unbindcountdown: function () {
        decixion._countdownEl = null;
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

    _initModules: function (game) {
        if (Array.isArray(game['require'])) {
            var includes = game.require;
            var i, include;

            for (i = 0; i < includes.length; i++) {
                include = includes[i];

                if (decixion.IS_MODULE) {
                    if (typeof include.module == 'function') {
                        decixion.include(require(include.module()));
                    } else 
                    if (typeof include.module != 'undefined') {
                        decixion.include(require(include.module));
                    }
                } else {
                    if (typeof include.object == 'function') {
                        decixion.include(include.object());
                    } else 
                    if (typeof include.object != 'undefined') {
                        decixion.include(include.object);
                    }
                }
            }
        }
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

    _initKeys: function (game) {
        if (game['bindKeys'] !== false) {
            decixion.bindkeys();
        }
    },

    _initSounds: function (game) {
        if (typeof game['sounds'] == 'object') {
            if (!decixion.IS_MODULE) {
                var audioChecker = new Audio();
                var canPlayMp3 = audioChecker.canPlayType('audio/mp3');
                var canPlayOgg = audioChecker.canPlayType('audio/ogg');

                decixion.each(game.sounds, function (name, uris) {
                    if (!Array.isArray(uris)) {
                        uris = [uris];
                    }

                    var mp3Uri = '';
                    var oggUri = '';

                    decixion.each(uris, function (i, uri) {
                        if (uri.indexOf('.mp3') !== -1) {
                            mp3Uri = uri;
                        }

                        if (uri.indexOf('.ogg') !== -1) {
                            oggUri = uri;
                        }
                    });

                    if (mp3Uri != '' || oggUri != '') {
                        var finalUri = null;

                        if (canPlayMp3 == 'probably' && mp3Uri != '') {
                            finalUri = mp3Uri;
                        } else 
                        if (canPlayOgg == 'probably' && oggUri != '') {
                            finalUri = oggUri;
                        } else 
                        if (canPlayMp3 == 'maybe' && mp3Uri != '') {
                            finalUri = mp3Uri;
                        } else 
                        if (canPlayOgg == 'maybe' && oggUri != '') {
                            finalUri = oggUri;
                        } else 
                        if (oggUri != '') {
                            finalUri = oggUri;
                        } else 
                        if (mp3Uri != '') {
                            finalUri = mp3Uri;
                        }

                        if (finalUri) {
                            decixion._sounds[name] = {
                                loaded: false
                            };

                            var audio = new Audio(finalUri);
                            audio.setAttribute('data-dcx-sound-name', name);
                            audio.oncanplay = decixion._onSoundCanPlay;
                            audio.oncanplaythrough = decixion._onSoundCanPlay;
                            audio.load();

                            decixion._sounds[name].audio = audio;
                        }
                    }
                });
            }
        }
    },

    _initGame: function (game) {
        if (typeof game['init'] == 'function') {
            game.init(decixion);
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
        var key,
            value,
            isFunctionValue,
            isArrayValue,
            isObjectValue,
            existentValueType,
            object;

        for (key in object2) {
            value = object2[key];
            isFunctionValue = typeof value == 'function';
            isArrayValue = Array.isArray(value);
            isObjectValue = typeof value == 'object';
            existentValueType = typeof object1[key];

            if (!isFunctionValue 
                && (isArrayValue || isObjectValue)
            ) {
                if (isArrayValue) {
                    object = [];
                } else {
                    object = {};
                }

                if (existentValueType != 'undefined'
                    && (
                        (isArrayValue && Array.isArray(object1[key]))
                        || (!isArrayValue && !Array.isArray(object1[key]))
                    )
                ) {
                    decixion._setRecursiveValues(
                        object,
                        object1[key]
                    );
                }

                decixion._setRecursiveValues(
                    object,
                    value
                );

                if (isArray) {
                    if (existentValueType == 'undefined') {
                        object1.push(object);
                    } else {
                        object1[parseInt(key)] = object;
                    }
                } else {
                    object1[key] = object;
                }
            } else {
                if (isArray) {
                    if (existentValueType == 'undefined') {
                        object1.push(value);
                    } else {
                        object1[parseInt(key)] = value;
                    }
                } else {
                    object1[key] = value;
                }
            }
        }
    },

    _goToSection: function (section) {
        var game = decixion._game;

        decixion._currentSection = decixion._getObjectChain(
            game.sections, 
            decixion._evaluateGameValue(section)
        );

        var currentSection = decixion._currentSection;

        if (currentSection['countdown']) {
            var timeOutSection = currentSection.countdown.section;
            decixion._countdown = currentSection.countdown.time;

            if (decixion._countdownEl) {
                decixion._countdownEl.innerText = decixion._countdown;
            }

            decixion._countdownInterval = setInterval(function () {
                if (decixion._countdown == 0) {
                    clearInterval(decixion._countdownInterval);
                    decixion._countdownInterval = null;

                    if (decixion._countdownEl) {
                        decixion._countdownEl.innerText = '';
                    }

                    decixion._goToSection(timeOutSection);
                    decixion._updateEls();
                } else {
                    decixion._countdown--;

                    if (decixion._countdownEl) {
                        decixion._countdownEl.innerText = decixion._countdown;
                    }
                }
            }, 1000);
        }

        if (currentSection['set']) {
            decixion._evaluateStateValue(
                currentSection.set, 
                function (value) {
                    decixion.set(
                        value.name, 
                        decixion._evaluateGameValue(value.value), 
                        value['player']
                    );
                }
            );
        }

        if (currentSection['increase']) {
            decixion._evaluateStateValue(
                currentSection.increase, 
                function (value) {
                    decixion.increase(
                        value.name, 
                        decixion._evaluateGameValue(value.value), 
                        value['player']
                    );
                }
            );
        }

        if (currentSection['decrease']) {
            decixion._evaluateStateValue(
                currentSection.decrease, 
                function (value) {
                    decixion.decrease(
                        value.name, 
                        decixion._evaluateGameValue(value.value), 
                        value['player']
                    );
                }
            );
        }

        if (currentSection['enter']) {
            decixion._evaluateGameValue(currentSection['enter']);
        }

        if (currentSection['sound']) {
            var playedSounds = {};
            var sounds = currentSection.sound;

            if (!Array.isArray(sounds)) {
                sounds = [sounds];
            }

            decixion.each(sounds, function (i, soundName) {
                var sound = decixion._evaluateGameValue(soundName);

                if (!decixion.IS_MODULE) {
                    if (sound
                        && typeof playedSounds[sound] == 'undefined'
                        && typeof decixion._sounds[sound] != 'undefined'
                        && decixion._sounds[sound].loaded
                    ) {
                        if (!decixion._sounds[sound].audio.paused) {
                            decixion._sounds[sound].audio.pause();
                            decixion._sounds[sound].audio.currentTime = 0;
                        }

                        decixion._sounds[sound].audio.play();
                        playedSounds[sound] = true;
                    }
                }
            });
        }

        decixion._updateEls();
    },

    _updateEls: function () {
        if (decixion._textEl) {
            decixion._textEl.innerText = decixion.text();
        }

        var currentSection = decixion._currentSection;

        if (decixion._selectEl) {
            if (currentSection['options']) {
                decixion._updateSelectElOptions(
                    currentSection.options
                );
            } else {
                decixion._updateSelectElOptions([]);
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

    _evaluateStateValue: function (value, callback) {
        if (!Array.isArray(value)) {
            value = [value];
        }

        decixion.each(value, function (i, value) {
            callback(value);
        });
    },

    _evaluateGameValue: function (value) {
        if (typeof value == 'function') {
            return value(decixion);
        }

        if (value['call']) {
            var args 
                = value['args'] 
                ? value.args : 
                {};

            return decixion.call(value.call, args);
        }

        return value;
    },

    _clearCountdownInterval: function () {
        if (decixion._countdownInterval) {
            clearInterval(decixion._countdownInterval);

            decixion._countdownInterval = null;
            decixion._countdown = 0;

            if (decixion._countdownEl) {
                decixion._countdownEl.innerText = '';
            }
        }
    },

    _onKeyUp: function (e) {
        var keys = [
            '0', '1', '2',
            '3', '4', '5',
            '6', '7', '8',
            '9'
        ];

        if (typeof keys[e.key] != 'undefined') {
            decixion.select(e.key - 1);
        } else {
            if (e.key == 'Enter') {
                decixion.select(0);
            }
        }
    },

    _onSoundCanPlay: function (e) {
        var name = this.getAttribute('data-dcx-sound-name');
        decixion._sounds[name].loaded = true;
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

var dcx = decixion;
decixion.IS_MODULE = typeof module != 'undefined';

if (decixion.IS_MODULE) {
    module.exports = decixion;
}

var decixion = {
    init: function () {
        console.log('Engine started...');
    }
};

if (typeof module != 'undefined') {
    module.exports = decixion;
}

decixion.init();

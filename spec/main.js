require.config({
    // to set the default folder
    // baseUrl: '../node_modules/jasmine-core/lib/jasmine-core',
    // paths: maps ids with paths (no extension)
    paths: {
        'jasmine': ['../node_modules/jasmine-core/lib/jasmine-core']
    },
    // shim: makes external libraries compatible with requirejs (AMD)
    shim: {
        'jasmine/jasmine-html': {
            deps: ['jasmine/jasmine']
        },
        'jasmine/boot': {
            deps: ['jasmine/jasmine', 'jasmine/jasmine-html']
        }
    }
});

require(['jasmine/boot'], function (jasmineBoot) {
    require(["armcalc-clientSpec", "fetchSpec"], function () {
        window.onload();
    });
});
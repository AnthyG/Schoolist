module.exports = {
    staticFileGlobs: [
        'assets/css/**.css',
        'assets/images/**.*',
        'assets/flags/1x1/**.svg',
        'assets/flags/4x3/**.svg',
        'assets/js/**.js'
    ],
    stripPrefix: 'assets/',
    runtimeCaching: [{
        urlPattern: /.*/,
        handler: 'networkFirst'
    }]
};
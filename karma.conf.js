/* eslint-env es6 */
'use strict'

const getBaseWebpackConfig = require('./getBaseWebpackConfig')

const webpackConfig = getBaseWebpackConfig()
webpackConfig.devtool = 'inline-source-map'
webpackConfig.module.rules = webpackConfig.module.rules || []
webpackConfig.module.rules.push({
    test: /\.[tj]sx?$/,
    enforce: 'post',
    exclude: /(browser-test-bundle\.js|\.spec|node_modules|mock|\.mock|\.stub)/,
    use: {
        loader: 'istanbul-instrumenter-loader'
    }
})

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha'],

        // list of files / patterns to load in the browser
        files: [
            require.resolve('expect.js'),
            'test/browser-test-bundle.js'
        ],

        preprocessors: {
            'test/browser-test-bundle.js': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                {type: 'text-summary'},
                {type: 'lcov'}
            ]
        },

        port: 9876,
        colors: true,
        autoWatch: false,
        browsers: ['PhantomJS'],
        singleRun: true
    })
}

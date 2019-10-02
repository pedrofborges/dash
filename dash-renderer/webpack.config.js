const webpack = require('webpack');
const R = require('ramda');
const path = require('path');
const packagejson = require('./package.json');
const dashLibraryName = packagejson.name.replace(/-/g, '_');

const defaults = {
    plugins: [],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
            {
                test: /\.txt$/i,
                use: 'raw-loader',
            }
        ]
    }
};

const asyncHelperOptions = {
    mode: 'production',
    entry: './src/isComponentReady.js',
    output: {
        path: path.resolve(__dirname, dashLibraryName),
        filename: `dash_renderer.async.min.js`,
        library: `dash_renderer_async`,
        libraryTarget: 'umd'
    },
    externals: {
        react: {
            'commonjs': 'react',
            'commonjs2': 'react',
            'amd': 'react',
            'root': 'React'
        },
        'react-dom': 'ReactDOM',
        'plotly.js': 'Plotly',
        'prop-types': 'PropTypes'
    },
    ...defaults
}

const rendererOptions = {
    mode: 'development',
    entry: {
        main: ['whatwg-fetch', './src/index.js'],
    },
    output: {
        path: path.resolve(__dirname, dashLibraryName),
        filename: `${dashLibraryName}.dev.js`,
        library: dashLibraryName,
        libraryTarget: 'window',
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'plotly.js': 'Plotly',
        'prop-types': 'PropTypes'
    },
    ...defaults
};

module.exports = (_, argv) => {
    const devtool = argv.build === 'local' ? 'source-map' : 'none';
    return [
        R.mergeDeepLeft({ devtool }, rendererOptions),
        R.mergeDeepLeft({
            devtool,
            mode: 'production',
            output: {
                filename: `${dashLibraryName}.min.js`,
            },
            plugins: [
                new webpack.NormalModuleReplacementPlugin(
                    /(.*)GlobalErrorContainer.react(\.*)/,
                    function (resource) {
                        resource.request = resource.request.replace(
                            /GlobalErrorContainer.react/,
                            'GlobalErrorContainerPassthrough.react'
                        );
                    }
                ),
            ],
        }, rendererOptions),
        asyncHelperOptions
    ];
};

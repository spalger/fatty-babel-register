'use strict';
var resolve = require('path').resolve;
var ReplaceSource = require('webpack-core/lib/ReplaceSource');
var CachedSource = require('webpack-core/lib/CachedSource');

module.exports = {
  entry: 'babel/register',
  target: 'node',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'fatty-babel-register.js',
    library: 'fatty-babel-register',
    libraryTarget: 'commonjs2',
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.js$/,
        loader: 'replace',
        query: {
          flags: 'g',
          regex: '\\brequire\\.extensions\\b',
          sub: '__nodereq__.extensions'
        }
      },
      {
        test: /\.md$/,
        loader: 'raw'
      }
    ]
  },
  plugins: [
    function () {
      this.plugin('compilation', function(compilation) {
        compilation.plugin('optimize-assets', function(assets, cb) {
          Object.keys(assets).forEach(function (name) {
            const inSource = assets[name];
            const original = inSource.source();
            const reg = /\b__nodereq__\b/g;

            const source = new ReplaceSource(inSource);
            let match;
            const replacement = 'require';

            while((match = reg.exec(original)) !== null) {
              const start = match.index;
              const end = match.index + match[0].length - 1;

              console.log('replacing', match[0], 'from', start, 'to', end, 'with', replacement);
              source.replace(start, end, replacement);
            }

            assets[name] = new CachedSource(source);
          });

          cb();
        });
      });
    }
  ]
}

const webpack = require('webpack')
const {
    createConfig,
    match,

    // Feature blocks
    babel,
    devServer,
    file,
    uglify,

    // Shorthand setters
    addPlugins,
    setEnv,
    entryPoint,
    env,
    setOutput,
    sourceMaps
} = require('webpack-blocks')
const autoprefixer = require('autoprefixer')
const path = require('path')

module.exports = createConfig([
      entryPoint('./src/main.jsx'),
      setOutput('./build/bundle.js'),
      babel(),
      match(['*.gif', '*.jpg', '*.jpeg', '*.png', '*.webp'], [
          file()
      ]),
      setEnv({
          NODE_ENV: process.env.NODE_ENV
      }),
      env('development', [
          devServer(),
          devServer.proxy({
              '/api': { target: 'http://localhost:3000' }
          }),
          sourceMaps()
      ]),
      env('production', [
          uglify(),
          addPlugins([
              new webpack.LoaderOptionsPlugin({ minimize: true })
          ])
      ])
])

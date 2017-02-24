module.exports = {
  entry: ['./client/index.js'],
  output: {
    path: __dirname + '/public/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: '/node_modules/',
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.scss$/,
        include: /client/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
        // loader: ExtractTextPlugin.extract('css-loader!sass-loader')
      }
    ]
  }
  // ,
  // plugins: [
  //   new ExtractTextPlugin('dist/styles/main.css', {
  //     allChunks: true
  //   })
  // ]
};
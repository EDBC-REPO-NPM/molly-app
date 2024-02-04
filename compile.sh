#!/bin/bash

echo 'building app.js'
#browserify -t [ babelify --presets [@babel/preset-env] ] ./js/main.js > ./minify.js
browserify ./src/app.js -o ./app.js
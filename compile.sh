#!/bin/bash

echo 'building bundle.js (molly-js)'
#browserify -t [ babelify --presets [@babel/preset-env] ] ./js/main.js > ./minify.js
browserify ./bundle/js/main.js > ./main.js

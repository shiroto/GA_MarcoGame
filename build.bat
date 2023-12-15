powershell -Command "Remove-Item -Path '..\Build\*' -Recurse -Force"
powershell -Command "New-Item -ItemType Directory -Path '..\Build\graphics\' -Force"
powershell -Command "Copy-Item -Path '.\src\graphics\*' -Destination '..\Build\graphics\' -Recurse -Force"
powershell -Command "Copy-Item -Path '.\src\index.html' -Destination '..\Build\index.html' -Force"

powershell -Command "webpack-cli --config webpack.config.js"
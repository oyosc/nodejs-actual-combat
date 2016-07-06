var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var chatServer = require('./lib/chat_server');
"use strict"
const send404 = (response) => {
   response.writeHead(404, {'Content-Type': 'text/plain'});
   response.write('Error 404: resource not found');
   response.end();
}

const sendFile = (response, filePath, fileContents) => {
   response.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))});
   response.end(fileContents);
}

const serveStatic = (response, cache, absPath) => {
   if(cache[absPath]){
      sendFile(response, absPath, cache[absPath]);
   }else{
       fs.stat(absPath, (err, stats) => { //fs.exists被废弃,API文档里显示可以Use fs.statSync() or fs.accessSync() instead.
         if(err){
             send404(response);
         }else{
             fs.readFile(absPath, (err, data) => {
              if(err){
                send404(response);
              }else{
                  cache[absPath] = data;
                  sendFile(response, absPath, data);
              }
            });
         }
       });
   }
}

var server = http.createServer((request, response) => {
    var filePath = false;
    if(request.url == '/'){
      filePath = 'public/index.html';
    }else{
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(3000, () => {
    console.log("Server listening on port 3000.");
});
chatServer.listen(server);//不能放在最前面
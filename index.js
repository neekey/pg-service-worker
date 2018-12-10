var static = require('node-static');
var http = require('http');
var qs = require('querystring');
var url = require('url');

var staticFiles = new static.Server('./static', { cache: 0 });
var port = 8000;

function getDataListByPage(page) {
    const result = [];
    for (i = 0; i < 10; i++) {
        result.push(page || 0);
    }
    return result;
}

http.createServer(function (request, response) {
    console.log('request received: ', request.url);
    const reqURL = url.parse(request.url);
    if (reqURL.pathname === '/api/data_list') {
        const query = qs.parse(reqURL.query);
        response.end(JSON.stringify(getDataListByPage(query.page)));
    } else {
        request.addListener('end', function () {
            staticFiles.serve(request, response);
        }).resume();
    }
}).listen(port, function() {
    console.log('Static server is now listening on port ' + port);
});
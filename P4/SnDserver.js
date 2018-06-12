//Staticserver.js!
var http = require('http');
var static = require('node-static');
var file = new static.Server('./public');
const url = require('url');



// global variables
var fs = require('fs');  // file access module

var imgList = [];

// code run on startup
loadImageList();



function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}


function fileServer(request, response) {

    const myURL = url.parse(request.url, true);
    

    var thequery = myURL.path.split('/query/');

    if (thequery[0] === "") {

        response.writeHead(200, {
            "Content-Type": "text/html"
        });
        response.write("<h1>Hello!</h1>");
        response.write("<p>You asked for <code>" + thequery[1] + "</code></p>");
        response.end();
    }
    else if (myURL.pathname === '/query' && myURL.query && myURL.query.num  )
    {
        if (myURL.query.num >= 0 && myURL.query.num < 989)
        {
            response.writeHead(200, {"Content-Type": "application/json"});
            var json = imgList[myURL.query.num];
            response.end(json);
        }
        else
        {
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end("imagenotfound");
        }

    }


    else
        {
            request.addListener('end', function() {
        file.serve(request, response, function(err, result) {
            if (err && (err.status === 404)) { // If the file wasn't found
                file.serveFile('/not-found.html', 404, {}, request, response);
            }
        });
    }).resume();
        }
    
}

var server = http.createServer(fileServer);


// fill in YOUR port number!
server.listen("53890");
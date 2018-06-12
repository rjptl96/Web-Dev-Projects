//Staticserver.js!
var http = require('http');
var static = require('node-static');
var file = new static.Server('./public');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('PhotoQ.db');
var fs = require('fs');  // file access module
var auto = require("./makeTagTable");
var autocompleteOjb = {};  // global
auto.makeTagTable(tagTableCallBack);
function tagTableCallBack(tagTable){
    autocompleteOjb = tagTable;

}

function fileServer(request, response) {

    const myURL =url.parse(request.url, true);
    

    var thequery = myURL.path.split('/query/');

    if (myURL.pathname === '/query' && myURL.query && (myURL.query.keyList ||  myURL.query.fileName ||  myURL.query.autocomplete ))
    {
        var thenums = myURL.query.keyList;
        if (myURL.query.autocomplete != undefined)
        {
            var listObj =JSON.stringify(autocompleteOjb[myURL.query.autocomplete.toLowerCase()]);
            listObj = JSON.parse(listObj);
            listObj = Object.keys(listObj.tags);
            //listObj = JSON.parse(listObj);
            listObj = JSON.stringify(listObj)
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(listObj);
        }
        else if(myURL.query.fileName != undefined)
        {
            var tags = myURL.query["query?taglist"][0];
            for (var i = 1; i < myURL.query["query?taglist"].length; i++)
            {
                tags = tags+ ', '+ myURL.query["query?taglist"][i];
            }
            var string = 'UPDATE photoTags SET (tags) = ("'+tags+'") ' + 'WHERE fileName = \'' + encodeURI(myURL.query.fileName) + '\'';
            auto.makeTagTable(tagTableCallBack);
            console.log(string);
            db.all( string, function (err, rowData) {
                updateCallback(err, rowData);

            });
        }
        else
        {
            if ( myURL.query["keyList"] != undefined)
            {

                if ((typeof myURL.query.keyList) == "string")
                {
                    var theDBstring = 'SELECT * FROM photoTags WHERE (landmark = "'+myURL.query["keyList"]+'" OR tags LIKE "%'+myURL.query["keyList"]+'%")';                }
                else
                {
                    var theDBstring = 'SELECT * FROM photoTags WHERE (landmark = "'+myURL.query["keyList"][0]+'" OR tags LIKE "%'+myURL.query["keyList"][0]+'%")';
                    for (var i = 1; i < myURL.query["keyList"].length; i++)
                    {
                        theDBstring = theDBstring+ 'AND (landmark = "'+myURL.query["keyList"][i]+'" OR tags LIKE "%'+myURL.query["keyList"][i]+'%")';
                    }
                }

            }
            else
            {
                var theDBstring = 'SELECT * FROM photoTags WHERE (landmark = "'+thenums+'" OR tags LIKE "%'+thenums+'%")';

            }
            db.all( theDBstring, function (err, rowData) {
                dataCallback(err, rowData,response);

            });
        }





        // if (myURL.query.num >= 0 && myURL.query.num < 989)
        // {
        //     response.writeHead(200, {"Content-Type": "application/json"});
        //     var json = imgList[myURL.query.num];
        //     response.end(json);
        // }
        // else
        // {
        //     response.writeHead(200, {"Content-Type": "application/json"});
        //     response.end("imagenotfound");
        // }

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

function dataCallback(err, rowData,response) {
    if (err) {
        console.log("error: ",err);
        response.writeHead(404, {"Content-Type": "application/json"});
        response.end();
    }
    else {
        var listObj = JSON.stringify(rowData);
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(listObj);

        //console.log("got: ",rowData,"\n");
    }
}

function updateCallback(err, rowData,response) {
    if (err) {
        console.log("error: ",err);
    }
    else {

        console.log("Updated");
    }
}


var server = http.createServer(fileServer);


// fill in YOUR port number!
server.listen("53890");
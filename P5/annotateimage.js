// Node module for working with a request to an API or other fellow-server
var APIrequest = require('request');
var dotenv = require('dotenv');
const result = dotenv.config({path: 'apikey.env'})
var fs = require('fs');
var url = require('url');
var http = require('http');
var i = 881;



const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('PhotoQ.db');

if (result.error) {
    throw result.error;
}
// An object containing the data the CCV API wants
// Will get stringified and put into the body of an HTTP request, below



// URL containing the API key
// You'll have to fill in the one you got from Google


// function to send off request to the API
function annotateImage() {

    theurl = 'https://vision.googleapis.com/v1/images:annotate?key=' + process.env.MYAPIKEY;


    var data = fs.readFileSync('photoList.json');
    if (! data) {
        console.log("cannot read 6whs.json");
    } else {
        listObj = JSON.parse(data);
        imgList = listObj.photoURLs;
    }

    if (i < imgList.length) {
        // myURL = url.parse(imgList[i], true);
        imgUrl = imgList[i];
        APIrequestObject = {
            "requests":[
                {
                    "image":{
                        "source":{
                            "imageUri":
                                imgUrl
                        }
                    },
                    "features":[
                        {
                            "type":"LABEL_DETECTION",
                            "maxResults":6
                        },{
                            "type":"LANDMARK_DETECTION",
                            "maxResults":6
                        }
                    ]
                }
            ]
        }

        APIrequest(
            { // HTTP header stuff
                url: theurl,
                method: "POST",
                headers: {"content-type": "application/json"},
                // will turn the given object into JSON
                json: APIrequestObject
            },
            // callback function for API request
            APIcallback
        );

    }


    // The code that makes a request to the API
    // Uses the Node request module, which packs up and sends off
    // an HTTP message containing the request to the API server



    // callback function, called when data is received from API
    function APIcallback(err, APIresponse, body) {
        if ((err) || (APIresponse.statusCode != 200)) {
            console.log("Got API error");
            console.log(body);
        } else {
            APIresponseJSON = body.responses[0];
            console.log(APIresponseJSON);
            var bod = JSON.parse(APIresponse.request.body);
            var requesturl = url.parse(bod.requests[0].image.source.imageUri);
            var str = requesturl.path;
            var n = str.lastIndexOf('/');
            var result = str.substring(n + 1);
            var thelandmark = null;
            var thelable = null;
            if (APIresponseJSON.labelAnnotations != null ||APIresponseJSON.labelAnnotations != undefined )
            {
                thelable = APIresponseJSON.labelAnnotations;
            }
            if (APIresponseJSON.landmarkAnnotations != null ||APIresponseJSON.landmarkAnnotations != undefined )
            {

                thelandmark = APIresponseJSON.landmarkAnnotations;
            }
            
            if (thelable != null && thelandmark != null)
            {
                var thelables = thelable[0].description;
                for (var i = 1; i< thelable.length ; i ++)
                {
                    thelables = thelables + ", " + thelable[i].description;
                }
                if (thelandmark[0].description != undefined)
                {
                    if (thelandmark[0].description.search("\\(") != -1)
                    {
                        thelandmark[0].description = thelandmark[0].description.substring(0, thelandmark[0].description.indexOf('('));
                    }
                    var thelandmarkss = thelandmark[0].description.toLowerCase();
                }
                else {
                    var thelandmarkss = thelandmark[0].description;
                }


                var string = 'UPDATE photoTags SET (landmark , tags) = ("'+thelandmarkss + '","'+thelables+'") ' + 'WHERE fileName = \'' + result + '\'';

                console.log(string);
                db.all( string, function (err, rowData) {
                    dataCallback(err, rowData);

                });
            }
            else if (thelable != null && thelandmark == null)
            {
                var thelables = thelable[0].description;
                for (var i = 1; i< thelable.length ; i ++)
                {
                    thelables = thelables + ", " + thelable[i].description;
                }
                var string = 'UPDATE photoTags SET (landmark , tags) = ("","'+thelables+'") ' + 'WHERE fileName = \'' + result + '\'';

                console.log(string);
                db.all( string, function (err, rowData) {
                    dataCallback(err, rowData);

                });

            }
            else if (thelable == null && thelandmark != null)
            {
                if (thelandmark[0].description != undefined)
                {
                    var thelandmarkss = thelandmark[0].description.toLowerCase();
                }
                else {
                    var thelandmarkss = thelandmark[0].description;
                }
                var string = 'UPDATE photoTags SET (landmark , tags) = ("'+thelandmarkss + '","") ' + 'WHERE fileName = \'' + result + '\'';

                console.log(string);
                db.all( string, function (err, rowData) {
                    dataCallback(err, rowData);

                });
            }
            else
            {
                var string = 'UPDATE photoTags SET (landmark , tags) = ("","") ' + 'WHERE fileName = \'' + result + '\'';
                console.log(string);
                db.all( string, function (err, rowData) {
                    dataCallback(err, rowData);

                });
            }
            //var string = 'UPDATE photoTags SET tags = \'' + result + '\' WHERE fileName = \'' + result + '\'';



            //console.log(APIresponseJSON.landmarkAnnotations[0].landmarks);
        }
    } // end callback function

} // end annotateImage

function dataCallback(err, rowData,response) {
    if (err) {
        console.log("error: ",err);
    }
    else {
        i++;
        annotateImage();
        // var listObj = JSON.stringify(rowData);
        // response.writeHead(200, {"Content-Type": "application/json"});
        // response.end(listObj);
        //
        // //console.log("got: ",rowData,"\n");
    }
}
// Do it!
annotateImage();
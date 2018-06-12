
/* This array is just for testing purposes.  You will need to
   get the real image data using an AJAX query. */
/*An array containing all the country names in the world:*/
var countries = [];
var selectedtags = [];
let photoss = [
];

/* function to add an onclick value to a DOM element */
function addOnclick(element, func, param) {

    // the closure of noarg includes local variables
    // "func" and "param"
    function noarg() {
        func(param);
    }
    element.onclick = noarg; // it will remember its closure
}

function disappear(bird) {
    var birdDiv = document.getElementById(bird);
    var par = birdDiv.parentElement;
    birdDiv.parentElement.removeChild(birdDiv);

    for (var k = 1; k < par.children.length; k++)
    {

        selectedtags.push(par.children[k].innerHTML.replace("      x",""))
    }

    if(selectedtags.length>0)
    {
        photoByNumber();
    }
    else
    {
        photoss = [];
        ReactDOM.render(React.createElement(App),reactContainer);

    }

    // Note: in Assn 3 you need to actually remove the tile from the DOM,
    // not just give it 'display: "none"'.
}

function disappear2(bird) {
    var birdDiv = document.getElementById(bird);
    var par = birdDiv.parentElement;
    birdDiv.parentElement.removeChild(birdDiv);

    selectedtags = selectedtags.filter(a => a !== bird);

    // Note: in Assn 3 you need to actually remove the tile from the DOM,
    // not just give it 'display: "none"'.
}

function getautocomplete()
{
    var numString = document.getElementById("num").value;
    numString.replace(/^\s+ | ^\,+ | \s+$ | \,+$/,'');
    if (numString.length == 2)
    {
        var oReq = new XMLHttpRequest();
        //numString = numString.replace(", ", ",");
        //var numList = numString.split(',');
        var url = "query?autocomplete="+numString;
        // var numQueryString = numList.join('+');
        // var url = "query?keyList="+numQueryString;
        oReq.open("GET", url);  // setup callback
        oReq.addEventListener("load", autoListener);    // load event occurs when response comes back
        oReq.send();
    }
}
function createbutton()
{
    document.getElementById('headerFB').style.display = "flex";
    document.getElementById('num').style.display = "none";
    document.getElementById('sub').style.display = "none";
    document.getElementById('theform').style.display = "none";




        var header = document.getElementById("query");
    if (document.getElementById("srch_bttn") === null) {
            var search_buttn = document.createElement("button");
            var theglass = document.createElement("i");
            theglass.id = "smallglass";
            theglass.className = "fa fa-search"

            //<button id ="sub" onclick="photoByNumber()"><i id= "magglass" class="fa fa-search"></i></button>
            search_buttn.id = "srch_bttn"
            //search_buttn.src = "search_icon.jpg";
            search_buttn.innerHTML
            search_buttn.style.border = "none";

            search_buttn.appendChild(theglass);
            header.appendChild(search_buttn);
            search_buttn.onclick = function() {

                document.getElementById('headerFB').style.display = "block";
                document.getElementById('num').style.display = "block";
                document.getElementById('theform').style.display = "block";
                document.getElementById('sub').style.display = "block";
                document.getElementById("srch_bttn").style.display = "none";
                document.getElementById('bookClubTitle').style.display = "none";
            };
            search_buttn.style.display = "block";
        }
}

window.onresize = function() {
    var w = window.innerWidth;
    if (w > 480) {
        document.getElementById('bookClubTitle').style.display = "block";
        ReactDOM.render(React.createElement(App),reactContainer);
        document.getElementById('num').style.display = "block";
        document.getElementById('sub').style.display = "block";
        var search_button = document.getElementById('srch_bttn');
        if (search_button != null)
            {
                search_button.parentNode.removeChild(search_button);
            }



    }
    if (w < 481) {
        ReactDOM.render(React.createElement(App),reactContainer);



        createbutton();



    }
}






// A react component for a tag
class Tag extends React.Component {

    render () {
        var _onClick = this.props.onClick;
        var _index = this.props.text;
        //var _tags = this.props.tagarray;
        return React.createElement('p',  // type
            { className: 'tagText',onClick: function onClick(e) {
                    console.log("tile onclick");
                    e.stopPropagation();
                    // call Gallery's onclick
                    return _onClick (e,
                        { index: _index })
                }}, // properties
            this.props.text);  // contents
    }
};


// A react component for controls on an image tile
class TileControl extends React.Component {

    constructor(props) {
        super(props);
        this.state = { thetagarray: this.props.tags, theimage:this.props.filename};
        this.selectTag = this.selectTag.bind(this);
    }
    selectTag(event, obj) {
        console.log("in onclick!", obj);
        //let photos = this.state.photos;
        let array = this.state.thetagarray;
        array = array.filter(a => a !== obj.index.replace("      x",""));
        var update = array.join(',');
        this.setState({ thetagarray: array });
        if (this.state.theimage != "")
        {
            var oReq = new XMLHttpRequest();
            //numString = numString.replace(", ", ",");
            //var numList = numString.split(',');
            var url = "query?fileName="+this.state.theimage;
            for (var i = 0; i < array.length ;i++)
            {
                url = url + "&query?taglist="+array[i];
            }

            // var numQueryString = numList.join('+');
            // var url = "query?keyList="+numQueryString;
            oReq.open("GET", url);  // setup callback
            //oReq.addEventListener("load", reqListener);    // load event occurs when response comes back
            oReq.send();
        }

    }
    render () {
        // remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;
        var _tags = this.state.thetagarray;

        // parse image src for photo name
        var photoName = _src.split("/").pop();
        photoName = photoName.split('%20').join(' ');
        var objects = [];

        for (var x = 0; x < _tags.length; x++) {
            //objects.push({key: _tags[x], text: _tags[x] });
            objects.push(React.createElement(Tag,
                {key: _tags[x], text: _tags[x] + "      x", onClick: this.selectTag }));
        }
        return ( React.createElement('div',
                {className: _selected ? 'selectedControls' : 'normalControls'},
                // div contents - so far only one tag

                objects
            )// createElement div
        )// return
    } // render
};


// A react component for an image tile
class ImageTile extends React.Component {

    render() {
        // onClick function needs to remember these as a closure
        var _onClick = this.props.onClick;
        var _index = this.props.index;
        var _photo = this.props.photo;
        var _selected = _photo.selected; // this one is just for readability

        return (
            React.createElement('div',
                {style: {margin: this.props.margin, width: _photo.width},
                    className: 'tile',
                    onClick: function onClick(e) {
                        console.log("tile onclick");
                        // call Gallery's onclick
                        return _onClick (e,
                            { index: _index, photo: _photo })
                    }
                }, // end of props of div
                // contents of div - the Controls and an Image
                React.createElement(TileControl,
                    {selected: _selected,
                        src: _photo.src, tags: _photo.tags.split(','), filename: _photo.fname}),
                React.createElement('img',
                    {className: _selected ? 'selected' : 'normal',
                        src: _photo.src,
                        width: _photo.width,
                        height: _photo.height
                    })
            )//createElement div
        ); // return
    } // render
} // class

class Popup extends React.Component
{
    render () {

        var objects = [];

        for (var x = 0; x < 1; x++) {
            //objects.push({key: _tags[x], text: _tags[x] });
            objects.push(React.createElement(Tag,
                {key: "YO", text:"YO", onClick: this.selectTag }));
        }
        return ( React.createElement('div',
                {}
            )// createElement div
        )// return
    } // render

}
class Chosen extends React.Component
{

}
class Options extends React.Component
{

}

class DisplayedTag extends React.Component
{

}


// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { photos: photoss };
        this.selectTile = this.selectTile.bind(this);
    }

    selectTile(event, obj) {
        console.log("in onclick!", obj);
        var photoses = photoss;
        this.setState({ photos: photoss });
        photoses[obj.index].selected = !photoses[obj.index].selected;

    }

    render() {
        var w = window.innerWidth;
        var columns1;
        if (w >= 480){
            columns1 = 2;
        }
        if (w >= 1024){
            columns1 = 3;
        }
        if (w >= 1824){
            columns1 = 4;
        }
        if(w<480)
        {
            columns1 = 1;
        }

        return (
            React.createElement( Gallery, {photos: photoss,columns: columns1,
                onClick: this.selectTile,
                ImageComponent: ImageTile} )
        );



    }

}

/* Finally, we actually run some code */

const reactContainer = document.getElementById("react");
//const reaccontainer2 = document.getElementById("react2");

ReactDOM.render(React.createElement(App),reactContainer);
//ReactDOM.render(React.createElement(Popup),reaccontainer2);

// Called when the user pushes the "submit" button 
function photoByNumber() {
    closeAllLists2();
    var w = window.innerWidth;
    if (w > 480) {

        document.getElementById('headerFB').style.display = "flex";
        document.getElementById('bookClubTitle').style.display = "block";


    }
    if (w < 481) {
        document.getElementById('headerFB').style.display = "block";
        document.getElementById('bookClubTitle').style.display = "block";
        var search_button = document.getElementById('srch_bttn');
        if (search_button != null)
            {
                search_button.parentNode.removeChild(search_button);
            }
        createbutton();


    }

	var numString = document.getElementById("num").value;
    numString.replace(/^\s+ | ^\,+ | \s+$ | \,+$/,'')
	if (selectedtags.length >0 || numString != "" )
    {
        if (selectedtags.length == 0)
        {
            var oReq = new XMLHttpRequest();
            numString = numString.replace(", ", ",");
            var numList = numString.split(',');
            var url = "query?keyList="+numList[0];
            for (var i = 1; i < numList.length ;i++)
            {
                url = url + "&keyList="+numList[i];
            }

            while (document.getElementById("selected").firstChild) {
                document.getElementById("selected").removeChild(document.getElementById("selected").firstChild);
            }
            var j = document.createElement("DIV");
            j.id = "selectedLabel";
            j.innerHTML = "You Searched For: ";
            document.getElementById("selected").appendChild(j);
            for (var i = 0; i < numList.length ;i++)
            {
                var j = document.createElement("DIV");
                j.className = "selectedtags";
                j.id = numList[i];
                j.innerHTML = numList[i] + "      x";
                addOnclick(j, disappear, numList[i]);
                document.getElementById("selected").appendChild(j);

            }
            selectedtags = [];

            // var numQueryString = numList.join('+');
            // var url = "query?keyList="+numQueryString;
            oReq.open("GET", url);  // setup callback
            oReq.addEventListener("load", reqListener);    // load event occurs when response comes back
            oReq.send();







        }
        else
        {
            var oReq = new XMLHttpRequest();
            numString = numString.replace(', ', ',');
            // var numList = numString.split(',');
            var url = "query?keyList="+selectedtags[0];
            for (var i = 1; i < selectedtags.length ;i++)
            {
                url = url + "&keyList="+selectedtags[i];
            }

            while (document.getElementById("selected").firstChild) {
                document.getElementById("selected").removeChild(document.getElementById("selected").firstChild);
            }
            var j = document.createElement("DIV");
            j.id = "selectedLabel";
            j.innerHTML = "You Searched For: ";
            document.getElementById("selected").appendChild(j);
            for (var i = 0; i < selectedtags.length ;i++)
            {
                var j = document.createElement("DIV");
                j.className = "selectedtags";
                j.id = selectedtags[i];
                j.innerHTML = selectedtags[i] + "      x";
                addOnclick(j, disappear, selectedtags[i]);
                document.getElementById("selected").appendChild(j);

            }
            selectedtags = [];

            // var numQueryString = numList.join('+');
            // var url = "query?keyList="+numQueryString;
            oReq.open("GET", url);  // setup callback
            oReq.addEventListener("load", reqListener);    // load event occurs when response comes back
            oReq.send();
        }

    }


}

function autoListener() {
    var photoURL = this.responseText;
    if (photoURL != "")
    {
        var json = JSON.parse(photoURL);
        countries = json;
        /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
        autocomplete(document.getElementById("num"), countries);
        console.log(json);
    }

}

function reqListener () {
    var photoURL = this.responseText;
    var json = JSON.parse(photoURL);
    var display = document.getElementById("photoImg");


    if (photoURL !== "imagenotfound")
    {
        //display.src = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + json[0].fileName;
        var i;
        if(json.length > 0)
        {
            document.getElementById('initialtext').style.display = "none";
        }

        photoss = [];
        for (i = 0; i< json.length ; i++)
        {
            var theimage = {src:"http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + json[i].fileName, width: json[i].width, height: json[i].height, tags: json[i].tags, fname: json[i].fileName };
            photoss.push(theimage);
        }


        ReactDOM.render(React.createElement(App),reactContainer);
    }
    else
    {
        alert("Image not found");
    }

}


function closeAllLists2(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    inp = document.getElementById("num");
    var x = document.getElementsByClassName("autocomplete-items");
    var y = document.getElementsByClassName("autocomplete-selected");
    for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
            y[i].parentNode.removeChild(y[i]);
        }
    }
}




function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        if (document.getElementById("numautocomplete-selected") == undefined)
        {
            x = document.createElement("DIV");
            x.setAttribute("id", this.id + "autocomplete-selected");
            x.setAttribute("class", "autocomplete-selected");
            this.parentNode.appendChild(x);
        }




        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/


                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    selectedtags.push(this.getElementsByTagName("input")[0].value);
                    x = document.getElementById("numautocomplete-selected");
                    var j = document.createElement("DIV");
                    j.className = "selectedtags";
                    j.id = this.getElementsByTagName("input")[0].value;
                    j.innerHTML = this.getElementsByTagName("input")[0].value + "      x";
                    addOnclick(j, disappear2, this.getElementsByTagName("input")[0].value);
                    x.appendChild(j);

                    inp.value = "";
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    //closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        //var y = document.getElementsByClassName("autocomplete-selected");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
                //y[i].parentNode.removeChild(y[i]);
            }
        }
    }


    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        //closeAllLists(e.target);
    });
}


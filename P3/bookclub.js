/* function to add an onclick value to a DOM element */
function addOnclick(element, func, param) {

    // the closure of noarg includes local variables
    // "func" and "param"
    function noarg() {
        func(param);
    }
    element.onclick = noarg; // it will remember its closure
}
window.onresize = function() {
    var w = window.innerWidth;
    if (w > 480) {
        var form = document.getElementById('HeaderForm');
        var theflexbok = document.getElementById("headerFB");
        theflexbok.style.display = "flex";
        if (form.style.display === 'none') {
            form.style.display = 'flex';
            var search_button = document.getElementById('srch_bttn');
            search_button.parentNode.removeChild(search_button);
        }
    }
    if (w < 481) {
        var theform = document.getElementById("HeaderForm");

        var header = document.getElementById("headerFB");
        var title = document.getElementById("bookClubTitle");
        theform.style.display = "none";
        if (document.getElementById("srch_bttn") === null) {
            var search_buttn = document.createElement("img");
            search_buttn.id = "srch_bttn"
            search_buttn.src = "search_icon.jpg";
            search_buttn.width = 50;
            search_buttn.height = 35;
            search_buttn.style.paddingTop = "20px";
            header.appendChild(search_buttn);
            search_buttn.onclick = function() {
                var theflexbok = document.getElementById("headerFB");
                theflexbok.style.display = "block";
                var theform = document.getElementById("HeaderForm");
                theform.style.display = "flex";
            };
        }
    }
}

/* Called when the user pushes the "submit" button */
/* Sends a request to the API using the JSONp protocol */
function newRequest() {

    var title = document.getElementById("title").value;
    title = title.trim();
    title = title.replace(" ", "+");

    var author = document.getElementById("author").value;
    author = author.trim();
    author = author.replace(" ", "+");

    var isbn = document.getElementById("isbn").value;
    isbn = isbn.trim();
    isbn = isbn.replace("-", "");

    // Connects possible query parts with pluses
    var query = ["", title, author, isbn].reduce(fancyJoin);

    // The JSONp part.  Query is executed by appending a request for a new
    // Javascript library to the DOM.  It's URL is the URL for the query. 
    // The library returned just calls the callback function we specify, with
    // the JSON data we want as an argument. 
    if (query != "") {

        // remove old script
        var oldScript = document.getElementById("jsonpCall");
        if (oldScript != null) {
            document.body.removeChild(oldScript);
        }
        // make a new script element
        var script = document.createElement('script');

        // build up complicated request URL
        var beginning = "https://www.googleapis.com/books/v1/volumes?q="
        var callback = "&callback=newRequest.handleResponseM"

        script.src = beginning + query + callback
        script.id = "jsonpCall";

        // put new script into DOM at bottom of body
        document.body.appendChild(script);
    }

    newRequest.handleResponseM = function(bookListObj) {
        handleResponse(bookListObj, title, author, isbn);
    }

}


/* Used above, for joining possibly empty strings with pluses */
function fancyJoin(a, b) {
    if (a == "") {
        return b;
    } else if (b == "") {
        return a;
    } else {
        return a + "+" + b;
    }
}



function handleResponse(bookListObj, title, author, isbn) {
    /*

Extract the title, author and description of all the books in the JSON response. Find the cover image and extract that. There may be more than one size image, but we will stick with the "thumbnail" size, which seems pretty common.
Extract the first 30 words or so from the description.
*/

    var bookList = bookListObj.items;

    /* where to put the data on the Web page */
    var fetchedBooks = document.getElementById("fetchedBooks");
    fetchedBooks.style.display = "none";
    if (bookList != null) {
        /* write each title as a new paragraph */
        for (var i = 0; i < bookList.length; i++) {
            var thebook = document.createElement("div");
            var book = bookList[i];
            var bookid = book.id;
            var title = book.volumeInfo.title;
            var authors = book.volumeInfo.authors;

            if (book.volumeInfo.imageLinks != null) {
                var thumbnail = book.volumeInfo.imageLinks.thumbnail;
                thumbnail = thumbnail.replace("&edge=curl", "");
            } else {
                var thumbnail = "bknotfound.jpg"
            }

            var description = book.volumeInfo.description;

            var truncatedDescription;
            var titlePgh = document.createElement("p");
            var authorsPgh = document.createElement("p");
            var descriptionPgh = document.createElement("p");
            var thumbnailpgh = document.createElement("IMG");

            /* ALWAYS AVOID using the innerHTML property */
            if (description == null) {
                description = "No Description Availiable";
            } else {
                description = truncate(description, 30);
            }

            thebook.id = "b" + bookid;
            titlePgh.textContent = title;
            authorsPgh.textContent = authors;
            descriptionPgh.textContent = description;
            thumbnailpgh.src = thumbnail;

            descriptionPgh.id = "bookdescription";
            authorsPgh.textContent = "by " + authorsPgh.textContent;
            authorsPgh.id = "bookauthor";
            titlePgh.id = "booktitle";
            thebook.appendChild(titlePgh);
            thebook.appendChild(authorsPgh);
            thebook.appendChild(descriptionPgh);
            thebook.appendChild(thumbnailpgh);
            fetchedBooks.appendChild(thebook);

        }
    }


    bringupOverlay(title, author, isbn);
}

function displayNextImg() {

    var currBookID = document.getElementById("modalcontent").firstElementChild.id;
    var fetchedBooks = document.getElementById("fetchedBooks");
    var fetchedCurrBook = fetchedBooks.querySelectorAll("#" + currBookID);
    var nextBook = fetchedCurrBook[0].nextElementSibling;
    if (nextBook != null) {
        while (document.getElementById("imgcolumn").firstChild) {
            document.getElementById("imgcolumn").removeChild(document.getElementById("imgcolumn").firstChild);

        }

        while (document.getElementById("txtcolumn").firstChild) {
            document.getElementById("txtcolumn").removeChild(document.getElementById("txtcolumn").firstChild);
        }
        var nextBookCloned = nextBook.cloneNode(true);
        var modalcontent = document.getElementById("modalcontent");
        var booktoreplace = modalcontent.firstElementChild;
        modalcontent.replaceChild(nextBookCloned, booktoreplace);
        modalcontent.firstElementChild.style.display = "none";
        var image = nextBookCloned.children[3];
        var title = nextBookCloned.children[0];
        var author = nextBookCloned.children[1];
        var description = nextBookCloned.children[2];

        var imagecloned = image.cloneNode(true);
        var titlecloned = title.cloneNode(true);
        var authorcloned = author.cloneNode(true);
        var descriptioncloned = description.cloneNode(true);

        document.getElementById("imgcolumn").append(imagecloned);
        document.getElementById("txtcolumn").append(titlecloned);
        document.getElementById("txtcolumn").append(authorcloned);
        document.getElementById("txtcolumn").append(descriptioncloned);
    }



}

function displayPrevImg() {

    var currBookID = document.getElementById("modalcontent").firstElementChild.id;
    var fetchedBooks = document.getElementById("fetchedBooks");
    var fetchedCurrBook = fetchedBooks.querySelectorAll("#" + currBookID);
    var nextBook = fetchedCurrBook[0].previousElementSibling;
    if (nextBook != null) {
        while (document.getElementById("imgcolumn").firstChild) {
            document.getElementById("imgcolumn").removeChild(document.getElementById("imgcolumn").firstChild);

        }

        while (document.getElementById("txtcolumn").firstChild) {
            document.getElementById("txtcolumn").removeChild(document.getElementById("txtcolumn").firstChild);
        }
        var nextBookCloned = nextBook.cloneNode(true);
        var modalcontent = document.getElementById("modalcontent");
        var booktoreplace = modalcontent.firstElementChild;
        modalcontent.replaceChild(nextBookCloned, booktoreplace);
        modalcontent.firstElementChild.style.display = "none";
        var image = nextBookCloned.children[3];
        var title = nextBookCloned.children[0];

        var author = nextBookCloned.children[1];

        var description = nextBookCloned.children[2];
        var imagecloned = image.cloneNode(true);
        var titlecloned = title.cloneNode(true);
        var authorcloned = author.cloneNode(true);
        var descriptioncloned = description.cloneNode(true);

        document.getElementById("imgcolumn").append(imagecloned);
        document.getElementById("txtcolumn").append(titlecloned);
        document.getElementById("txtcolumn").append(authorcloned);
        document.getElementById("txtcolumn").append(descriptioncloned);
    }


}

function bringupOverlay(title, author, isbn) {

    /* where to put the data on the Web page */
    moveformtoHeader();
    document.getElementsByTagName('main')[0].style.backgroundColor = "#eeeced";
    document.getElementsByTagName('body')[0].style.backgroundColor = "#eeeced";
    document.getElementsByTagName('header')[0].style.backgroundColor = "white";
    document.getElementsByTagName('header')[0].style.boxShadow = "0px 0px 7px black";
    var fetchedBooks = document.getElementById("fetchedBooks");
    if (fetchedBooks.children.length > 0) {
        var selectedBook = fetchedBooks.children[0];
        var cloneselectedBook = selectedBook.cloneNode(true);
        cloneselectedBook.style.display = "none";
        var bookOverlay = document.getElementById("bookOverlay");
        var themodal = document.getElementById("modalcontent");
        bookOverlay.style.display = "block";
        themodal.insertAdjacentElement('afterbegin', cloneselectedBook);
        var image = cloneselectedBook.children[3];
        var title = cloneselectedBook.children[0];

        var author = cloneselectedBook.children[1];


        var description = cloneselectedBook.children[2];

        var imagecloned = image.cloneNode(true);
        var titlecloned = title.cloneNode(true);
        var authorcloned = author.cloneNode(true);
        var descriptioncloned = description.cloneNode(true);

        document.getElementById("imgcolumn").append(imagecloned);
        document.getElementById("txtcolumn").append(titlecloned);
        document.getElementById("txtcolumn").append(authorcloned);
        document.getElementById("txtcolumn").append(descriptioncloned);
    } else {
        var nobookOverlay = document.getElementById("nobookOverlay");
        var nobooktxt = document.getElementById("nobooktxt");
        nobookOverlay.style.display = "block";
        nobooktxt.textContent = "The book ";
        if (title != "") {
            nobooktxt.textContent = nobooktxt.textContent + "\"" + title + "\"";
        }
        if (author != "") {
            nobooktxt.textContent = nobooktxt.textContent + " by ";
        }
        if (author != "") {
            nobooktxt.textContent = nobooktxt.textContent + "\"" + author + "\"";
        }
        if (isbn != "") {
            nobooktxt.textContent = nobooktxt.textContent + " with ISBN number ";
        }
        if (isbn != "") {
            nobooktxt.textContent = nobooktxt.textContent + "\"" + isbn + "\"";
        }
        nobooktxt.textContent = nobooktxt.textContent + " was not found\r\n\r\n Please Try Another Search\r\n";
    }




}

function truncate(str, no_words) {
    return str.split(" ").splice(0, no_words).join(" ");
}

function closeOverlay() {
    document.getElementById("bookOverlay").style.display = "none";
    document.getElementById("modalcontent").removeChild(document.getElementById("modalcontent").firstElementChild);

    while (document.getElementById("fetchedBooks").firstChild) {
        document.getElementById("fetchedBooks").removeChild(document.getElementById("fetchedBooks").firstChild);
    }
    var theModal = document.getElementById("modalcontent");
    while (document.getElementById("imgcolumn").firstChild) {
        document.getElementById("imgcolumn").removeChild(document.getElementById("imgcolumn").firstChild);

    }

    while (document.getElementById("txtcolumn").firstChild) {
        document.getElementById("txtcolumn").removeChild(document.getElementById("txtcolumn").firstChild);
    }
}

function moveformtoHeader() {
    var theform = document.getElementById("form");
    theform.id = "HeaderForm";
    theform.removeChild(theform.children[0]);
    document.getElementById("headerFB").append(theform);
    document.getElementById("prompt2").append(document.getElementById("submit"));
    removeclass("or");
    document.getElementById("prompt2").style.fontWeight = 400;
    document.getElementById("prompt2").style.color = "black";
    var opts = document.getElementsByClassName("opt");
    for (var i = 0; i < opts.length; i++) {
        opts[i].style.paddingRight = "20px";
    };

    moveformtoHeader = function() {};
}


function addtoTile() {
    var w = window.innerWidth;
    if (w < 481) {
        var theform = document.getElementById("HeaderForm");
        var header = document.getElementById("headerFB");
        var title = document.getElementById("bookClubTitle");
        theform.style.display = "none";
        if (document.getElementById("srch_bttn") === null) {
            var search_buttn = document.createElement("img");
            search_buttn.id = "srch_bttn"
            search_buttn.src = "search_icon.jpg";
            search_buttn.width = 50;
            search_buttn.height = 35;
            search_buttn.style.paddingTop = "20px";
            header.appendChild(search_buttn);
            search_buttn.onclick = function() {
                var theflexbok = document.getElementById("headerFB");
                theflexbok.style.display = "block";
                var theform = document.getElementById("HeaderForm");
                theform.style.display = "flex";
            };
        }
    }

    var theBookFlexBox = document.getElementById("modalcontent");
    var theBookFlexBoxCloned = theBookFlexBox.cloneNode(true);
    theBookFlexBoxCloned.className = "EachTile";
    theBookFlexBoxCloned.id = "tile" + theBookFlexBoxCloned.children[0].id;
    var theBox = document.getElementById("theFlexBox");
    theBookFlexBoxCloned.children[1].id = "tile" + theBookFlexBoxCloned.children[1].id;
    theBookFlexBoxCloned.children[2].id = "tile" + theBookFlexBoxCloned.children[2].id;
    var delete_button = document.createElement("i");
    delete_button.className = "far fa-times-circle fa-2x";
    delete_button.id = "tileCloseButton";

    theBookFlexBoxCloned.append(delete_button);
    var theButton = theBookFlexBoxCloned.querySelector("#tileCloseButton");
    var theID = theBookFlexBoxCloned.id;
    theBox.append(theBookFlexBoxCloned);
    addOnclick(theButton, disappear, theID);

    closeOverlay();
}

function removeclass(className) {
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function closeNoBookOverlay() {
    document.getElementById("nobookOverlay").style.display = "none";
    document.getElementById("nobooktxt").textContent = "";
}

function disappear(bird) {
    var birdDiv = document.getElementById(bird);
    birdDiv.parentElement.removeChild(birdDiv);

    // Note: in Assn 3 you need to actually remove the tile from the DOM,
    // not just give it 'display: "none"'.
}
'use strict'
var mouseIsDown = false;
var highlightedAlbums = [];
var shouldHighlight = false;
var lastSingleClick = 0;
var mouseY = 0;
var scrollMode = 0;
var albumClicked = false;
var disableFocus = false;
var album;

window.onload = function() {
    startUp();
}

function startUp() {
    checkLogin();
    let createForm = document.getElementById("createAlbum");
    createForm.addEventListener('submit', function(event) {
        const createFormInput = document.getElementById("albumCreationInput");
        const albumName = createFormInput.value;
        console.log(albumName);
        makeCreateMenuInvisible();
        if (albumName.length !== 0) {
            event.preventDefault();
            requestCreateAlbum(albumName);
        }
        location.reload();
    }, true);
    displayAlbums();
}

function checkLogin() {
    var cookies = document.cookie.split(";");
    console.log(cookies);
    for (var x = 0; x < cookies.length; x++) {
        let cookie = cookies[x].split("=")
        if (cookie[0].trim() == "passwordChecked") {
            let filledInPassword = cookie[1].trim();
            if (filledInPassword !== "true") {
                location.href = './password.html';
            } else {
                return
            }
        }
    }
    location.href = './password.html';
}

function navToHomePage() {
    window.location.href = "./index.html"
}

window.addEventListener('mousemove', function(event) {
    mouseY = event.clientY;
    scrollBasedOnMouse();
})

function scrollBasedOnMouse() {
    if (shouldHighlight && mouseY > window.innerHeight - 50) {
        scrollMode = 1;
    } else if (shouldHighlight && mouseY > window.innerHeight - 100) {
        scrollMode = 2;
    } else if (shouldHighlight && mouseY < 50) {
        scrollMode = -2;
    } else if (shouldHighlight && mouseY < 100) {
        scrollMode = -1;
    } else {
        scrollMode = 0;
    }
    setTimeout(function() {
        manualScroll();
        if (scrollMode !== 0) {
            scrollBasedOnMouse();
        }
    }, 100);
}

function manualScroll() {
    if (scrollMode === 1) {
        var x=window.scrollX;
        var y=window.scrollY+10;
        window.scrollTo(x, y);
    } else if (scrollMode === 2) {
        var x=window.scrollX;
        var y=window.scrollY+3;
        window.scrollTo(x, y);
    } else if (scrollMode === -1) {
        var x=window.scrollX;
        var y=window.scrollY-3;
        window.scrollTo(x, y);
    } else if (scrollMode === -2) {
        var x=window.scrollX;
        var y=window.scrollY-10;
        window.scrollTo(x, y);
    }
}

window.addEventListener('mousedown', function() {
    setTimeout(function() {
        if (!albumClicked) {
            unhighlightAll();
        }
        albumClicked = false;
    }, 25);
});

// Load in albums
function displayAlbums() {
    let req = new XMLHttpRequest();
    const reqString = "http://localhost:8080/album/get-all"
    req.open("GET", reqString);
    req.send();
    req.onload = function() {
        const response = eval(req.response);
        for (var index = 0; index < response.length; index++) {
            addAlbum(response[index]["albumName"]);
        }
    }
}

function addAlbum (albumName) {
    var albumContainer = document.getElementById("album-feed");
    var singleAlbumContainer = document.createElement('div');
    var textContainer = document.createElement('p');
    singleAlbumContainer.classList.add("album-element");
    textContainer.innerHTML = albumName; 
    singleAlbumContainer.appendChild(textContainer);
    // Handler for clicking on an album
    singleAlbumContainer.addEventListener('click', function(event) {
        pressAlbum(event, this);
    });
    // Handler for blocking the unhighlighting
    textContainer.addEventListener('mousedown', function() {
        stopUnhighlight();
    });
    // Handler for highlighting albums when in mouse over highlight mode
    singleAlbumContainer.addEventListener('mouseover', function() {
        mouseOverHighlight(this);
    });
    // Handler for starting the mouse over highlight mode
    singleAlbumContainer.addEventListener('mousedown', function() {
        mouseIsDown = true;
        var albumContainer = this;
        setTimeout(function() {
            if(mouseIsDown) {
                disableFocus = true;
                if (!albumContainer.classList.contains('highlight')) {
                    highlight(albumContainer, true);
                }
                shouldHighlight = true;
            }
        }, 350);
    });
    // Handler to not focus on album if press and hold done
    singleAlbumContainer.addEventListener('mouseup', function() {
        setTimeout(function() {
            disableFocus = false;
        }, 25)
    });
    albumContainer.appendChild(singleAlbumContainer);  
}

// Create albums
function makeCreateMenuVisible () {
    disableScrolling();
    let createMenuContainer = document.getElementById("create-menu");
    createMenuContainer.classList.add("show");
}

function makeCreateMenuInvisible() {
    enableScrolling();
    let createMenuContainer = document.getElementById("create-menu");
    createMenuContainer.classList.remove("show");
}

function disableScrolling() {
    var x=window.scrollX;
    var y=window.scrollY;
    window.onscroll=function() {
        window.scrollTo(x, y);
    };
}

function enableScrolling() {
    window.onscroll=function() {
        
    };
}

function requestCreateAlbum(albumName) {
    var formData = new FormData();
    formData.append("albumName", albumName);

    fetch ("http://localhost:8080/album/post", {
        method: 'POST',
        body: formData
    })
}

// Delete albums

var waitList = [];

function deleteHighlighted() {
    let albumFeedChildren = document.getElementById("album-feed").children;
    var idsToDelete = [];
    for (var x = 0; x < highlightedAlbums.length; x++) {
        let albumId = albumFeedChildren[highlightedAlbums[x]].children[0].textContent;
        idsToDelete.push(albumId);
    }

    for (var x = 0; x < idsToDelete.length; x++) {
        deleteAlbum(idsToDelete[x]);
    }
    
    location.reload();
}

function deleteAlbum(albumId) {
    let req = new XMLHttpRequest();
    const reqString = "http://localhost:8080/album/delete/" + albumId;
    req.open("DELETE", reqString);
    req.send();
    req.onload = function() {
        console.log(req.response);
    }
}

function makeDeleteMenuVisible () {
    disableScrolling();
    let deleteMenuContainer = document.getElementById("delete-menu");
    deleteMenuContainer.classList.add("show");
}

function makeDeleteMenuInvisible() {
    enableScrolling();
    let deleteMenuContainer = document.getElementById("delete-menu");
    deleteMenuContainer.classList.remove("show");
}

// Highlight albums
window.addEventListener('mouseup', function() {
    mouseIsDown = false;
    shouldHighlight = false;
});

function mouseOverHighlight(albumContainer) {
    if (shouldHighlight) {
        if (!albumContainer.classList.contains('highlight')) {
            highlight(albumContainer, false);
        }
    }
}

function unhighlightAll() {
    const albumFeed = document.getElementById("album-feed");
    var albumsToUnhighlight = [];
    for (var x = 0; x < highlightedAlbums.length; x++) {
        let albumContainer = albumFeed.children[highlightedAlbums[x]];
        albumsToUnhighlight.push(albumContainer);
    }

    for (var x = 0; x < albumsToUnhighlight.length; x++) {
        unhighlight(albumsToUnhighlight[x], false);
    }
    highlightedAlbums = [];
}

function handleAlbumShiftPress(albumContainer) {
    unhighlightAll();
    const albumFeed = albumContainer.parentNode;
    const albumIndex = Array.prototype.indexOf.call(albumFeed.children, albumContainer);
    if (albumIndex >= lastSingleClick) {
        // Highgight all albums from lastsingleclickt o album index
        for (var x = lastSingleClick; x <= albumIndex; x++) {
            highlight(albumFeed.children[x], false);
        }
    } else {
        //highlight all albums from album index to lastclick
        for (var x = albumIndex; x <= lastSingleClick; x++) {
            highlight(albumFeed.children[x], false);
        }
    }
}

function handleAlbumCtrlPress(albumContainer) {
    if (albumContainer.classList.contains('highlight')) {
        unhighlight(albumContainer, true);
    } else {
        highlight(albumContainer, true);
    }
}

function highlight(albumContainer, fromSingleClick) {
    const albumFeed = albumContainer.parentNode;
    const albumIndex = Array.prototype.indexOf.call(albumFeed.children, albumContainer);
    if (fromSingleClick) {
        lastSingleClick = albumIndex;
    }
    highlightedAlbums.push(albumIndex);
    highlightedAlbums.sort();
    albumContainer.classList.add("highlight");
}

function unhighlight(albumContainer, fromSingleClick) {
    const albumFeed = albumContainer.parentNode;
    const albumIndex = Array.prototype.indexOf.call(albumFeed.children, albumContainer);
    const indexInList = highlightedAlbums.indexOf(albumIndex);
    if (fromSingleClick) {
        lastSingleClick = albumIndex;
    }
    highlightedAlbums.splice(indexInList, 1);
    highlightedAlbums.sort();
    albumContainer.classList.remove("highlight");
}

function stopUnhighlight() {
    albumClicked = true;
}

//Album pressed
function pressAlbum(event, albumContainer) {
    if (event.ctrlKey) {
        handleAlbumCtrlPress(albumContainer);
    } else if (event.shiftKey){
        handleAlbumShiftPress(albumContainer);
    } else if (!disableFocus) {
        navToHomePageWithAlbum(albumContainer)
    }
}

function navToHomePageWithAlbum(albumContainer) {
    window.location.href = "./index.html?album=" + albumContainer.textContent;
}


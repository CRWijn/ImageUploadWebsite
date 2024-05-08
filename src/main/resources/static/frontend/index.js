'use strict'
localStorage.setItem("imageIndex", 0);
var mouseIsDown = false;
var highlightedImages = [];
var shouldHighlight = false;
var lastSingleClick = 0;
var mouseY = 0;
var scrollMode = 0;
var imageClicked = false;
var imageInFocus = false;
var disableFocus = false;
var album;

window.onload = function() {
    startUp();
}

function hideAllPopups() {
    makeAlbumAddMenuInvisible();
    makeDeleteMenuInvisible();
    makeUploadMenuInvisible();
}

function startUp() {
    checkLogin();
    getAlbum();
    let uploadForm = document.getElementById("uploadImages");
    uploadForm.addEventListener('submit', function(event) {
        const uploadFormInput = document.querySelector("#fileUploadInput");
        const files = uploadFormInput.files;
        if (files.length !== 0) {
            event.preventDefault();
            uploadFiles(files);
        }
        makeUploadMenuInvisible();
    }, true);
    requestImages(1);
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

function cookieExists(name) {
    var cks = document.cookie.split(';');
    for(i = 0; i < cks.length; i++)
      if (cks[i].split('=')[0].trim() == name) return true;
  }

function getAlbum() {
    var winUrl = new URL(window.location.href);
    let inputParams = new URLSearchParams(winUrl.search);
    if (inputParams.has('album')) {
        album = inputParams.get('album');
    } else {
        album = ''
    }
}

function navToAlbumPage() {
    window.location.href = "./albums.html";
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
        if (!imageClicked) {
            unhighlightAll();
        }
        imageClicked = false;
    }, 25);
});

// Load in images
function requestImages (number) {
    let req = new XMLHttpRequest();
    var reqString = '';
    if (album === '') {
        reqString = "http://localhost:8080/image/get-n-images/" + localStorage.getItem("imageIndex") + "/" + number;
    } else {
        reqString = "http://localhost:8080/image/get-n-images-from-album/" + album + "/" + localStorage.getItem("imageIndex") + "/" + number;
    }
    req.open("GET", reqString);
    req.send();
    req.onload = function() {
        const response = eval(req.response);
        for (let index = 0; index < response.length; index++) {
            addImage(response[index])
            localStorage.setItem("imageIndex", Number(localStorage.getItem("imageIndex"))+1)
        }
        if (window.innerHeight === document.documentElement.scrollHeight && response.length !== 0) {
            requestImages(1);
        }
    }
}

function addImage (imageSrc) {
    const imagesContainer = document.getElementById("image-feed");
    const singleImageContainer = document.createElement('div');
    var newImage = document.createElement('img');
    if (imageSrc.imageSuffix.toUpperCase() === ".JPG" || imageSrc.imageSuffix === ".JPEG") {
        newImage.src = "data:image/jpg;base64," + imageSrc.imageBytes;
    } else if (imageSrc.imageSuffix.toUpperCase() === ".PNG") {
        newImage.src = "data:image/png;base64," + imageSrc.imageBytes;
    }
    newImage.className = "image-box";
    newImage.id = imageSrc.imageId;
    newImage.draggable = false;
    // Handler for clicking on an image
    newImage.addEventListener('click', function(event) {
        pressImage(event, this.parentElement);
    });
    // Handler for blocking the unhighlighting
    newImage.addEventListener('mousedown', function() {
        stopUnhighlight();
    });
    // Handler for highlighting images when in mouse over highlight mode
    singleImageContainer.addEventListener('mouseover', function() {
        mouseOverHighlight(this);
    });
    // Handler for starting the mouse over highlight mode
    singleImageContainer.addEventListener('mousedown', function() {
        mouseIsDown = true;
        var imageContainer = this;
        setTimeout(function() {
            if(mouseIsDown) {
                disableFocus = true;
                if (!imageContainer.classList.contains('highlight')) {
                    highlight(imageContainer, true);
                }
                shouldHighlight = true;
            }
        }, 350);
    });
    // Handler to not focus on image if press and hold done
    singleImageContainer.addEventListener('mouseup', function() {
        setTimeout(function() {
            disableFocus = false;
        }, 25)
    });
    singleImageContainer.appendChild(newImage);
    imagesContainer.appendChild(singleImageContainer);
}

function onScroll () {
    const scrolledTo = window.scrollY + window.innerHeight
    const isReachBottom = document.documentElement.scrollHeight === scrolledTo
    if (isReachBottom) {
        requestImages(4);
    }
}


// Upload images
function makeUploadMenuVisible () {
    hideAllPopups();
    disableScrolling();
    let uploadMenuContainer = document.getElementById("upload-menu");
    uploadMenuContainer.classList.add("show");
    getAlbums("album-list-on-upload");
}

function makeUploadMenuInvisible() {
    enableScrolling();
    let uploadMenuContainer = document.getElementById("upload-menu");
    uploadMenuContainer.classList.remove("show");
    removeAlbumsFromList("album-list-on-upload");
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
        onScroll()
    };
}

function uploadFiles(files) {
    var formData = new FormData();
    for (var x = 0; x < files.length; x++) {
        formData.append("images[]", files[x]);
    }

    const albumList = document.getElementById("album-list-on-upload");
    console.log(albumList.children.length);
    var albums = [];
    for (var x = 0; x < albumList.children.length; x++) {
        let boxInput = albumList.children[x].children[0];
        console.log(boxInput.innerHTML);
        if (boxInput.checked) {
            albums.push(boxInput.id);
        }
    }
    formData.append("albums", albums);


    fetch ("http://localhost:8080/image/post", {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.text();
    })
    .then(function(response) {
        console.log(response);
    });
}

// Delete images
function deleteHighlighted() {
    let imageFeedChildren = document.getElementById("image-feed").children;
    var idsToDelete = [];
    for (var x = 0; x < highlightedImages.length; x++) {
        let imageId = imageFeedChildren[highlightedImages[x]].children[0].id;
        idsToDelete.push(imageId);
    }

    for (var x = 0; x < idsToDelete.length; x++) {
        deleteImage(idsToDelete[x]);
    }
    location.reload();
}

function deleteImage(imageId) {
    let req = new XMLHttpRequest();
    const reqString = "http://localhost:8080/image/delete/" + imageId;
    req.open("DELETE", reqString);
    req.send();
    req.onload = function() {
        removeImageFromHtml(imageId);
    }
}

function removeImageFromHtml(imageId) {
    var imageContainer = document.getElementById(imageId).parentElement;
    imageContainer.remove();
    requestImages(1);
}

function makeDeleteMenuVisible () {
    hideAllPopups();
    disableScrolling();
    let deleteMenuContainer = document.getElementById("delete-menu");
    deleteMenuContainer.classList.add("show");
}

function makeDeleteMenuInvisible() {
    enableScrolling();
    let deleteMenuContainer = document.getElementById("delete-menu");
    deleteMenuContainer.classList.remove("show");
}

// Highlight images
window.addEventListener('mouseup', function() {
    mouseIsDown = false;
    shouldHighlight = false;
});

function mouseOverHighlight(imageContainer) {
    if (shouldHighlight) {
        if (!imageContainer.classList.contains('highlight')) {
            highlight(imageContainer, false);
        }
    }
}

function unhighlightAll() {
    const imageFeed = document.getElementById("image-feed");
    var imagesToUnhighlight = [];
    for (var x = 0; x < highlightedImages.length; x++) {
        let imageContainer = imageFeed.children[highlightedImages[x]];
        imagesToUnhighlight.push(imageContainer);
    }

    for (var x = 0; x < imagesToUnhighlight.length; x++) {
        unhighlight(imagesToUnhighlight[x], false);
    }
    highlightedImages = [];
}

function handleImageShiftPress(imageContainer) {
    unhighlightAll();
    const imageFeed = imageContainer.parentNode;
    const imageIndex = Array.prototype.indexOf.call(imageFeed.children, imageContainer);
    if (imageIndex >= lastSingleClick) {
        // Highgight all images from lastsingleclickt o image index
        for (var x = lastSingleClick; x <= imageIndex; x++) {
            highlight(imageFeed.children[x], false);
        }
    } else {
        //highlight all images from image index to lastclick
        for (var x = imageIndex; x <= lastSingleClick; x++) {
            highlight(imageFeed.children[x], false);
        }
    }
}

function handleImageCtrlPress(imageContainer) {
    if (imageContainer.classList.contains('highlight')) {
        unhighlight(imageContainer, true);
    } else {
        highlight(imageContainer, true);
    }
}

function highlight(imageContainer, fromSingleClick) {
    const imageFeed = imageContainer.parentNode;
    const imageIndex = Array.prototype.indexOf.call(imageFeed.children, imageContainer);
    if (fromSingleClick) {
        lastSingleClick = imageIndex;
    }
    highlightedImages.push(imageIndex);
    highlightedImages.sort();
    imageContainer.classList.add("highlight");
    const albumMenu = document.getElementById("add-to-album").parentNode;
    if (highlightedImages.length > 0 && !albumMenu.classList.contains("show")) {
        makeAlbumMenuVisible();
    }
}

function unhighlight(imageContainer, fromSingleClick) {
    const imageFeed = imageContainer.parentNode;
    const imageIndex = Array.prototype.indexOf.call(imageFeed.children, imageContainer);
    const indexInList = highlightedImages.indexOf(imageIndex);
    if (fromSingleClick) {
        lastSingleClick = imageIndex;
    }
    highlightedImages.splice(indexInList, 1);
    highlightedImages.sort();
    imageContainer.classList.remove("highlight");
    const albumMenu = document.getElementById("add-to-album").parentNode;
    if (highlightedImages.length < 1 && albumMenu.classList.contains("show")) {
        makeAlbumMenuInvisible();
    }
}

function stopUnhighlight() {
    imageClicked = true;
}

//Image pressed
function pressImage(event, imageContainer) {
    if (event.ctrlKey) {
        handleImageCtrlPress(imageContainer);
    } else if (event.shiftKey){
        handleImageShiftPress(imageContainer);
    } else if (!disableFocus) {
        focusImage(imageContainer)
    }
}

function focusImage(imageContainer) {
    imageInFocus = true;
    const imageSrc = imageContainer.firstChild.src;
    var image = document.createElement('img');
    image.src = imageSrc;
    image.id = "focussed-image"
    const focusImageContainer = document.getElementById("focus-image-container");
    const focusImageHead = document.getElementById("focus-image-head");
    focusImageContainer.appendChild(image);
    disableScrolling();
    focusImageHead.classList.add("show");
}

function unfocusImage() {
    if (!imageInFocus) {
        return;
    }
    const focusImageContainer = document.getElementById("focus-image-container");
    const focusImageHead = document.getElementById("focus-image-head");
    focusImageContainer.removeChild(focusImageContainer.lastChild);
    enableScrolling();
    focusImageHead.classList.remove("show");
    imageInFocus = false;
}

// Add to album menu
function makeAlbumMenuVisible() {
    let albumMenu = document.getElementById("add-to-album").parentNode;
    albumMenu.classList.add("show");
}

function makeAlbumMenuInvisible() {
    let albumMenu = document.getElementById("add-to-album").parentNode;
    albumMenu.classList.remove("show");
}

function removeFromAlbum() {
    if (album === '') {
        alert("Not viewing an album!");
        return;
    }

    let imageFeedChildren = document.getElementById("image-feed").children;
    for (var x = 0; x < highlightedImages.length; x++) {
        let imageId = imageFeedChildren[highlightedImages[x]].children[0].id
        requestRemoveFromAlbum(imageId);
    }
    
    location.reload();
}

function requestRemoveFromAlbum(imageId) {
    let req = new XMLHttpRequest();
    const reqString = "http://localhost:8080/image/update/remove-from-album/" + imageId + "/" + album;
    req.open("PATCH", reqString);
    req.send();
    req.onload = function() {
        console.log(req.response);
    }
}

function makeAlbumAddMenuVisible() {
    hideAllPopups();
    if (highlightedImages.length > 0) {
        makeAlbumMenuInvisible();
    }
    disableScrolling();
    let albumMenu = document.getElementById("add-to-album-menu");
    albumMenu.classList.add("show");
    getAlbums("album-list");
}

function makeAlbumAddMenuInvisible() {
    enableScrolling();
    if (highlightedImages.length > 0) {
        makeAlbumMenuVisible();
    }
    let albumMenu = document.getElementById("add-to-album-menu");
    albumMenu.classList.remove("show");
    removeAlbumsFromList("album-list");
}

function getAlbums(parentId) {
    let req = new XMLHttpRequest();
    const reqString = "http://localhost:8080/album/get-all"
    req.open("GET", reqString);
    req.send();
    req.onload = function() {
        const response = eval(req.response);
        for (var index = 0; index < response.length; index++) {
            addAlbum(response[index]["albumName"], parentId);
        }
    }
}

function removeAlbumsFromList(parentId) {
    let albumsList = document.getElementById(parentId);
    albumsList.innerHTML = "";
}

function addAlbum(albumName, parentId) {
    let albumsList = document.getElementById(parentId);
    var newAlbum = document.createElement('li');
    var newCheckbox = document.createElement('input');
    var newLabel = document.createElement('label');
    newCheckbox.type = "checkbox";
    newCheckbox.id = albumName;
    newLabel.htmlFor = albumName;
    newLabel.innerHTML = albumName;
    newAlbum.appendChild(newCheckbox);
    albumsList.appendChild(newAlbum);
    newAlbum.appendChild(newLabel);
}

var disableClose = false;

function tryCloseAlbums() {
    setTimeout(function() {
        if (disableClose) {
            disableClose = false;
        } else {
            makeAlbumAddMenuInvisible();
        }
    }, 25);
}

function stopFromClosing() {
    disableClose = true;
}

function requestAddToAlbum() {
    const albumList = document.getElementById("album-list");
    var albumsToAddTo = [];
    for (var x = 0; x < albumList.children.length; x++) {
        let boxInput = albumList.children[x].children[0];
        if (boxInput.checked) {
            albumsToAddTo.push(boxInput.id);
        }
    }
    sendAddToAlbumRequest(albumsToAddTo)
    makeAlbumAddMenuInvisible();
    unhighlightAll();
}

var canContinue = true;

function sendAddToAlbumRequest(albumList) {
    const imageFeedChildren = document.getElementById("image-feed").children;
    var imageIds = [];
    for (var x = 0; x < highlightedImages.length; x++) {
        let imageId = imageFeedChildren[highlightedImages[x]].children[0].id;
        imageIds.push(imageId);
    }

    var formData = new FormData();
    formData.append('imageIds', imageIds);
    formData.append("albums", albumList);

    fetch ("http://localhost:8080/image/update/add-to-album", {
        method: 'PATCH',
        body: formData
    })
    .then(function(response) {
        return response.text();
    })
    .then(function(response) {
        console.log(response);
    });
}
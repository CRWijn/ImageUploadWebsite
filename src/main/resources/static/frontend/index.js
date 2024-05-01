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

window.onload = function() {
    startUp();
}

function startUp() {
    let uploadForm = document.getElementById("uploadImages");
    uploadForm.addEventListener('submit', function(event) {
        const uploadFormInput = document.querySelector("#fileUploadInput");
        const files = uploadFormInput.files;
        makeUploadMenuInvisible();
        if (files.length !== 0) {
            event.preventDefault();
            uploadFiles(files);
        }
    }, true);
    requestImages(1);
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
function createBox () {
    const imagesContainer = document.getElementById("image-feed");
    var newImage = document.createElement('div');
    newImage.className = "placeholder";
    imagesContainer.appendChild(newImage);
}

function requestImages (number) {
    let req = new XMLHttpRequest();
    const reqString = "http://localhost:8080/image/get-n-images/" + localStorage.getItem("imageIndex") + "/" + number;
    req.open("GET", reqString);
    req.send();
    req.onload = function() {
        const response = eval(req.response);
        for (let index = 0; index < response.length; index++) {
            addImage(response[index])
            localStorage.setItem("imageIndex", Number(localStorage.getItem("imageIndex"))+1)
        }
        if (window.innerHeight === document.documentElement.scrollHeight) {
            requestImages(1);
        }
    }
}

function addImage (imageSrc) {
    const imagesContainer = document.getElementById("image-feed");
    const singleImageContainer = document.createElement('div');
    var newImage = document.createElement('img');
    newImage.src = "data:image/jpg;base64," + imageSrc.imageBytes;
    newImage.className = "image-box";
    newImage.id = imageSrc.imageId;
    newImage.draggable = false;
    newImage.addEventListener('click', function(event) {
        pressImage(event, this.parentElement);
    });
    newImage.addEventListener('mousedown', function() {
        stopUnhighlight();
    });
    singleImageContainer.addEventListener('mouseover', function() {
        mouseOverHighlight(this);
    });
    singleImageContainer.addEventListener('mousedown', function() {
        mouseIsDown = true;
        var imageContainer = this;
        setTimeout(function() {
            if(mouseIsDown) {
                if (!imageContainer.classList.contains('highlight')) {
                    highlight(imageContainer, true);
                }
                shouldHighlight = true;
            }
        }, 350);
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
    disableScrolling();
    let uploadMenuContainer = document.getElementById("upload-menu");
    uploadMenuContainer.classList.add("show");
}

function makeUploadMenuInvisible() {
    enableScrolling();
    let uploadMenuContainer = document.getElementById("upload-menu");
    uploadMenuContainer.classList.remove("show");
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
    formData.append("albums", "[]");

    fetch ("http://localhost:8080/image/post", {
        method: 'POST',
        body: formData
    })
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
    } else {
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

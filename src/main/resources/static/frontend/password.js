function submitPassword() {
    var formData = new FormData();
    let inp = document.getElementById("inputPassword").value;
    let response = formData.append("password", inp);
    fetch ("http://localhost:8080/check-password", {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.text();
    })
    .then(function(response) {
        if (response === "Correct Password") {
            var d = new Date();
            d.setTime(d.getTime() + (24 * 60 * 60 * 
            1000));
            let expires = "expires="+ d.toUTCString();
            console.log(expires);
            document.cookie = "passwordChecked=true; " + expires;
            console.log(document.cookie);
            location.href = "./index.html";
        } else {
            showIncPass();
        }
    });
}

function showIncPass() {
    let headerEl = document.getElementById("incPass");
    document.cookie = "passwordChecked=false";
    headerEl.classList.add('show');
}
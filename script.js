document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("loginForm");

    if (!form) {
        alert("Login form not found");
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Login button works");
    });

});

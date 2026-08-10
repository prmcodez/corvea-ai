let selectedCategory = "skin";
let selectedFile = null;

const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const uploadError = document.getElementById("uploadError");
const results = document.getElementById("results");


/* -------------------------
   CATEGORY SELECTION
------------------------- */

function selectCategory(category) {

    selectedCategory = category;

    document.querySelectorAll(".category-option")
        .forEach(button => {

            button.classList.remove("active");

            if (button.dataset.category === category) {
                button.classList.add("active");
            }

        });

    document.getElementById("analyze").scrollIntoView({
        behavior: "smooth"
    });
}


/* -------------------------
   SCROLL
------------------------- */

function scrollToAnalysis() {

    document.getElementById("analyze").scrollIntoView({
        behavior: "smooth"
    });

}


/* -------------------------
   FILE INPUT
------------------------- */

imageInput.addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (file) {
        processFile(file);
    }

});


/* -------------------------
   DRAG AND DROP
------------------------- */

uploadArea.addEventListener("dragover", function(event) {

    event.preventDefault();

    uploadArea.classList.add("dragover");

});


uploadArea.addEventListener("dragleave", function() {

    uploadArea.classList.remove("dragover");

});


uploadArea.addEventListener("drop", function(event) {

    event.preventDefault();

    uploadArea.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (file) {
        processFile(file);
    }

});


/* -------------------------
   PROCESS IMAGE
------------------------- */

function processFile(file) {

    clearError();

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ];

    const maxSize = 10 * 1024 * 1024;


    if (!allowedTypes.includes(file.type)) {

        showError(
            "Please upload a JPG, JPEG, or PNG image."
        );

        return;
    }


    if (file.size > maxSize) {

        showError(
            "The image is too large. Maximum size is 10 MB."
        );

        return;
    }


    selectedFile = file;

    fileName.textContent = file.name;

    fileSize.textContent =
        formatFileSize(file.size);


    const reader = new FileReader();


    reader.onload = function(event) {

        imagePreview.src = event.target.result;

        imagePreviewContainer.classList.remove("hidden");

        uploadArea.classList.add("hidden");

    };


    reader.readAsDataURL(file);

}


/* -------------------------
   REMOVE IMAGE
------------------------- */

function removeImage() {

    selectedFile = null;

    imageInput.value = "";

    imagePreview.src = "";

    imagePreviewContainer.classList.add("hidden");

    uploadArea.classList.remove("hidden");

    results.classList.add("hidden");

}


/* -------------------------
   FILE SIZE
------------------------- */

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";

}


/* -------------------------
   ERROR
------------------------- */

function showError(message) {

    uploadError.textContent = message;

    uploadError.classList.remove("hidden");

}


function clearError() {

    uploadError.textContent = "";

    uploadError.classList.add("hidden");

}


/* -------------------------
   ANALYSIS
------------------------- */

function analyzeImage() {

    clearError();


    if (!selectedFile) {

        showError(
            "Please upload an image before starting the analysis."
        );

        return;

    }


    results.classList.remove("hidden");

    results.scrollIntoView({
        behavior: "smooth"
    });


    /*
        IMPORTANT:

        This is currently a DEMONSTRATION result.

        The uploaded image is real and the upload system works,
        but no medical AI model is being called yet.

        The next development phase will connect this interface
        to a secure backend and computer-vision model.
    */

}


/* -------------------------
   INITIAL STATE
------------------------- */

selectCategory("skin");

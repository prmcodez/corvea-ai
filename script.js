console.log("CORVEA SCRIPT VERSION 2");

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


/* CATEGORY SELECTION */

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


/* SCROLL */

function scrollToAnalysis() {

    document.getElementById("analyze").scrollIntoView({
        behavior: "smooth"
    });

}


/* FILE INPUT */

imageInput.addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (file) {
        processFile(file);
    }

});


/* DRAG AND DROP */

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


/* PROCESS IMAGE */

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


/* REMOVE IMAGE */

function removeImage() {

    selectedFile = null;

    imageInput.value = "";

    imagePreview.src = "";

    imagePreviewContainer.classList.add("hidden");

    uploadArea.classList.remove("hidden");

    results.classList.add("hidden");

}


/* FILE SIZE */

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";

}


/* ERROR */

function showError(message) {

    uploadError.textContent = message;

    uploadError.classList.remove("hidden");

}


function clearError() {

    uploadError.textContent = "";

    uploadError.classList.add("hidden");

}


/* ANALYSIS */

async function analyzeImage() {

    clearError();

    if (!selectedFile) {
        showError(
            "Please upload an image before starting the analysis."
        );
        return;
    }

    const analyzeButton =
        document.querySelector(".analyze-button");

    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analyzing...";

    try {

        const image =
            document.getElementById("imagePreview");

        console.log("Starting Corvea visual analysis...");

        /*
         * Load the general computer-vision model.
         *
         * IMPORTANT:
         * MobileNet is NOT a medical model.
         * Its predictions must not be treated as diagnoses.
         */

        console.log("Loading MobileNet...");

        const model = await mobilenet.load();

        console.log("MobileNet loaded.");

        const predictions =
            await model.classify(image);

        console.log(
            "MobileNet predictions:",
            predictions
        );

        /*
         * SHOW RESULTS
         */

        results.classList.remove("hidden");

        results.scrollIntoView({
            behavior: "smooth"
        });

        const tags =
            document.querySelector(".result-card .tags");

        const possibleResult =
            document.querySelector(".possible-result");

        const qualityBadge =
            document.querySelector(".quality-badge");

        const warnings =
            document.querySelectorAll(".result-warning");

        /*
         * DETECTED VISUAL CHARACTERISTICS
         *
         * These are general computer-vision classifications,
         * NOT medical findings.
         */

        tags.innerHTML = "";

        const imageTag =
            document.createElement("span");

        imageTag.textContent =
            "Image successfully analyzed";

        tags.appendChild(imageTag);

        const categoryTag =
            document.createElement("span");

        categoryTag.textContent =
            "Category: " +
            selectedCategory.charAt(0).toUpperCase() +
            selectedCategory.slice(1);

        tags.appendChild(categoryTag);

        /*
         * MODEL STATUS
         */

        qualityBadge.textContent =
            "General Vision Model";

        /*
         * POSSIBLE EXPLANATIONS
         */

        let explanation = "";

        if (selectedCategory === "skin") {

            explanation = `
                <strong>Educational interpretation</strong>

                <p>
                    Corvea can examine an uploaded image for
                    general visual characteristics, but the
                    current model cannot determine whether a
                    skin condition is present.
                </p>

                <p>
                    Similar visible changes can occur with
                    acne, eczema, irritation, inflammation,
                    allergic reactions, infections, and other
                    causes.
                </p>
            `;

        } else if (selectedCategory === "teeth") {

            explanation = `
                <strong>Educational interpretation</strong>

                <p>
                    Corvea can examine an uploaded dental image,
                    but the current model cannot determine
                    whether a dental condition is present.
                </p>

                <p>
                    Visible changes can have different causes,
                    including plaque, staining, gum inflammation,
                    irritation, or other oral health concerns.
                </p>
            `;

        } else if (selectedCategory === "eyes") {

            explanation = `
                <strong>Educational interpretation</strong>

                <p>
                    Corvea can examine an uploaded eye image,
                    but the current model cannot determine
                    whether an eye condition is present.
                </p>

                <p>
                    Visible redness, swelling, or irritation can
                    have many different causes, so an image alone
                    should not be treated as a diagnosis.
                </p>

            `;

        }

        possibleResult.innerHTML = explanation;

        /*
         * WARNINGS
         */

        warnings[0].textContent =
            "The current computer-vision model provides general image classifications. These are not medical findings.";

        warnings[1].textContent =
            "Corvea does not currently use a medically trained diagnostic model. These results must not be interpreted as a diagnosis.";

        /*
         * BIOLOGY SECTION
         */

        const biologyText =
            document.querySelector(".biology-card > p");

        if (selectedCategory === "skin") {

            biologyText.textContent =
                "Visible skin changes can be influenced by biological processes involving the skin barrier, immune system, inflammation, follicles, microorganisms, and other tissues.";

        } else if (selectedCategory === "teeth") {

            biologyText.textContent =
                "Visible dental changes can be influenced by plaque, bacteria, inflammation, tooth structure, saliva, and the tissues surrounding the teeth.";

        } else if (selectedCategory === "eyes") {

            biologyText.textContent =
                "Visible eye changes can involve blood vessels, inflammation, irritation, the tear film, and tissues on or around the eye.";

        }

        console.log(
            "Corvea educational analysis completed."
        );

    }

    catch (error) {

        console.error(
            "Analysis error:",
            error
        );

        showError(
            "The image could not be analyzed. Please try another image."
        );

    }

    finally {

        analyzeButton.disabled = false;

        analyzeButton.textContent =
            "Analyze Image";

    }
}

````javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));

const PORT = process.env.PORT || 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ------------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Corvea backend is running."
    });
});

// ------------------------------------------------------------
// IMAGE ANALYSIS
// ------------------------------------------------------------

app.post("/api/analyze", async (req, res) => {

    try {

        const {
            category,
            image,
            concern,
            duration,
            symptoms
        } = req.body;

        if (!image) {
            return res.status(400).json({
                error: "No image was provided."
            });
        }

        if (!category) {
            return res.status(400).json({
                error: "No category was selected."
            });
        }

        console.log(
            `Analyzing ${category} image...`
        );

        // ----------------------------------------------------
        // AI PROMPT
        // ----------------------------------------------------

        const prompt = `
You are the educational visual-analysis system for Corvea.

Corvea is NOT a medical diagnostic service.

Analyze the uploaded image for visible characteristics only.

Your job is NOT to say that the person definitely has a disease.

Instead, identify visible features and explain which conditions
those features may be CONSISTENT WITH.

Category:
${category}

User concern:
${concern || "Not provided"}

Duration:
${duration || "Not provided"}

Additional symptoms:
${symptoms || "Not provided"}

IMPORTANT RULES:

1. Do not provide a definitive diagnosis.

2. Use wording such as:
   "The image shows features that are consistent with..."
   "These features can be seen with..."
   "One possible explanation is..."

3. Do not claim certainty.

4. Base the answer on visible characteristics in the image.

5. Do not invent symptoms that cannot be observed or were not
provided by the user.

6. If the image quality is poor, say that the image cannot be
reliably interpreted.

7. Give specific observations rather than generic statements.

8. Explain the biology behind the observed characteristics.

9. If multiple explanations are reasonable, provide several,
with the most visually consistent possibility first.

10. Tell the user that a healthcare professional is needed for
a real diagnosis.

Return ONLY valid JSON in this exact structure:

{
    "visualCharacteristics": [
        "specific visible characteristic",
        "specific visible characteristic",
        "specific visible characteristic"
    ],
    "possibleExplanation": "The image shows features that are consistent with ______-like changes.",
    "biology": "Explain the relevant biology in clear educational language.",
    "biologicalMechanisms": "Explain the biological mechanisms that could produce the observed features.",
    "whyItLooksThisWay": "Explain why those biological processes can create the visible appearance.",
    "uncertainty": "Explain the main limitations or uncertainty of this image-based assessment."
}
`;

        // ----------------------------------------------------
        // OPENAI VISION REQUEST
        // ----------------------------------------------------

        const response = await client.responses.create({

            model: "gpt-4.1-mini",

            input: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: prompt
                        },
                        {
                            type: "input_image",
                            image_url: `data:image/jpeg;base64,${image}`
                        }
                    ]
                }
            ]

        });

        // ----------------------------------------------------
        // GET AI RESPONSE
        // ----------------------------------------------------

        const output = response.output_text;

        console.log("AI response received.");

        // Remove possible markdown code fences
        const cleanedOutput = output
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let result;

        try {

            result = JSON.parse(cleanedOutput);

        } catch (parseError) {

            console.error(
                "Could not parse AI JSON:",
                output
            );

            return res.status(500).json({
                error: "The AI returned an invalid response."
            });
        }

        // ----------------------------------------------------
        // SEND RESULT TO WEBSITE
        // ----------------------------------------------------

        res.json(result);

    } catch (error) {

        console.error(
            "Corvea analysis error:",
            error
        );

        res.status(500).json({
            error:
                "The image could not be analyzed."
        });
    }
});

// ------------------------------------------------------------
// START SERVER
// ------------------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `Corvea backend running on port ${PORT}`
    );

});
````

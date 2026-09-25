"use strict";

/*
========================================
SUPABASE CONFIGURATION
========================================
*/

const SUPABASE_URL = "https://eckftzfyllgscqfcdhgg.supabase.co";

// Paste your PUBLIC / PUBLISHABLE key here.
// Do NOT use the secret/service-role key.
const SUPABASE_KEY = "sb_publishable__-lqU59W3cxcY5CnksN2Eg_lPZfEtNE";


/*
========================================
CHECK SUPABASE LIBRARY
========================================
*/

if (typeof supabase === "undefined") {
    console.error("Supabase library was not loaded.");

    const statusElement = document.getElementById("status");

    if (statusElement) {
        statusElement.textContent =
            "Supabase library failed to load.";
        statusElement.className = "status error";
    }

    throw new Error("Supabase library is unavailable.");
}


/*
========================================
CREATE SUPABASE CLIENT
========================================
*/

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/*
========================================
HTML ELEMENTS
========================================
*/

const motivationElement =
    document.getElementById("motivation");

const disciplineElement =
    document.getElementById("discipline-tip");

const selfCareElement =
    document.getElementById("self-care-tip");

const challengeElement =
    document.getElementById("challenge");

const dateElement =
    document.getElementById("current-date");

const statusElement =
    document.getElementById("status");


/*
========================================
CHECK HTML ELEMENTS
========================================
*/

if (
    !motivationElement ||
    !disciplineElement ||
    !selfCareElement ||
    !challengeElement ||
    !dateElement ||
    !statusElement
) {
    console.error("One or more required HTML elements are missing.");

    throw new Error("Required HTML elements are missing.");
}


/*
========================================
GET LOCAL DATE
========================================
*/

function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/*
========================================
DISPLAY CURRENT DATE
========================================
*/

function displayCurrentDate() {
    const now = new Date();

    const formattedDate = now.toLocaleDateString(
        undefined,
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

    dateElement.textContent = formattedDate;
}


/*
========================================
SET STATUS
========================================
*/

function setStatus(message, type = "") {
    statusElement.textContent = message;

    statusElement.className = "status";

    if (type !== "") {
        statusElement.classList.add(type);
    }
}


/*
========================================
DISPLAY CONTENT
========================================
*/

function displayContent(content) {

    motivationElement.textContent =
        content.motivation ||
        "No motivation added yet.";

    disciplineElement.textContent =
        content.discipline ||
        content.discipline_tip ||
        "No discipline tip added yet.";

    selfCareElement.textContent =
        content.self_care ||
        content.self_care_tip ||
        "No self-care tip added yet.";

    challengeElement.textContent =
        content.challenge ||
        "No challenge added yet.";
}


/*
========================================
LOAD TODAY'S CONTENT
========================================
*/

async function loadDailyContent() {

    const today = getTodayDate();

    console.log("================================");
    console.log("Daily Reset");
    console.log("Today's date:", today);
    console.log("================================");

    setStatus("Loading today's content...");

    try {

        /*
        ========================================
        FIRST ATTEMPT

        Expected database columns:
        motivation
        discipline
        self_care
        challenge
        ========================================
        */

        let result = await supabaseClient
            .from("daily_content")
            .select(
                "id, content_date, motivation, discipline, self_care, challenge"
            )
            .eq("content_date", today)
            .maybeSingle();


        /*
        ========================================
        FALLBACK

        Some earlier versions used:
        discipline_tip
        self_care_tip

        Try those if the first query fails.
        ========================================
        */

        if (result.error) {

            console.warn(
                "First database query failed:",
                result.error
            );

            result = await supabaseClient
                .from("daily_content")
                .select(
                    "id, content_date, motivation, discipline_tip, self_care_tip, challenge"
                )
                .eq("content_date", today)
                .maybeSingle();
        }


        const data = result.data;
        const error = result.error;


        /*
        ========================================
        HANDLE ERROR
        ========================================
        */

        if (error) {

            console.error(
                "Supabase error:",
                error
            );

            const message =
                error.message ||
                "Unknown Supabase error.";

            setStatus(
                "Supabase error: " + message,
                "error"
            );

            return;
        }


        /*
        ========================================
        NO CONTENT
        ========================================
        */

        if (!data) {

            console.warn(
                "No daily_content row found for:",
                today
            );

            setStatus(
                `No content found for ${today}.`,
                "error"
            );

            return;
        }


        /*
        ========================================
        SUCCESS
        ========================================
        */

        console.log(
            "Daily content loaded:",
            data
        );

        displayContent(data);

        setStatus(
            "Today's content loaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Unexpected JavaScript error:",
            error
        );

        setStatus(
            "Unexpected error: " + error.message,
            "error"
        );
    }
}


/*
========================================
START WEBSITE
========================================
*/

displayCurrentDate();
loadDailyContent();

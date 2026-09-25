"use strict";

/*
========================================
SUPABASE CONFIGURATION
========================================

Get these from:

Supabase Dashboard
→ Project Settings
→ Data API

IMPORTANT:
Use the project's PUBLIC / PUBLISHABLE key here.

DO NOT put your secret/service-role key
into this file.
*/

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";


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

const motivationElement = document.getElementById("motivation");
const disciplineElement = document.getElementById("discipline-tip");
const selfCareElement = document.getElementById("self-care-tip");
const challengeElement = document.getElementById("challenge");
const dateElement = document.getElementById("current-date");
const statusElement = document.getElementById("status");


/*
========================================
GET LOCAL DATE
========================================

Using the user's local date is better than
toISOString() here because toISOString()
uses UTC and can produce the previous day
depending on timezone.
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
DISPLAY DATE
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
        content.motivation || "No motivation added yet.";

    disciplineElement.textContent =
        content.discipline_tip || "No discipline tip added yet.";

    selfCareElement.textContent =
        content.self_care_tip || "No self-care tip added yet.";

    challengeElement.textContent =
        content.challenge || "No challenge added yet.";
}


/*
========================================
LOAD TODAY'S CONTENT
========================================
*/

async function loadDailyContent() {

    const today = getTodayDate();

    console.log("Loading content for:", today);

    setStatus("Loading today's content...");

    try {

        const { data, error } = await supabaseClient
            .from("daily_content")
            .select(
                "id, content_date, motivation, discipline_tip, self_care_tip, challenge"
            )
            .eq("content_date", today)
            .single();


        /*
        ========================================
        HANDLE SUPABASE ERROR
        ========================================
        */

        if (error) {

            console.error("Supabase error:", error);

            /*
            PGRST116 usually means no matching row
            was found when using .single().
            */

            if (error.code === "PGRST116") {

                setStatus(
                    "No content has been added for today yet.",
                    "error"
                );

                return;
            }

            setStatus(
                "Unable to load today's content.",
                "error"
            );

            return;
        }


        /*
        ========================================
        DISPLAY RESULT
        ========================================
        */

        console.log("Daily content:", data);

        displayContent(data);

        setStatus(
            "Today's content loaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );

        setStatus(
            "Something went wrong while loading the website.",
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
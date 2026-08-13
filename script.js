/* ============================================================
   COMMANDO FORCE 2026/27
   MAIN WEBSITE + PREMIUM PDF
============================================================ */


/* ============================================================
   CLUBS
============================================================ */

const clubs = [
  "Arsenal",
  "Aston Villa",
  "Bournemouth",
  "Brentford",
  "Brighton & Hove Albion",
  "Chelsea",
  "Coventry City",
  "Crystal Palace",
  "Everton",
  "Fulham",
  "Hull City",
  "Ipswich Town",
  "Leeds United",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Nottingham Forest",
  "Sunderland",
  "Tottenham Hotspur"
];


/* ============================================================
   BONUS PREDICTIONS
============================================================ */

const bonusFields = [
  {
    id: "topScorer",
    pdfId: "pdfTopScorer"
  },
  {
    id: "mostAssists",
    pdfId: "pdfMostAssists"
  },
  {
    id: "faCupWinner",
    pdfId: "pdfFaCupWinner"
  },
  {
    id: "carabaoCupWinner",
    pdfId: "pdfCarabaoCupWinner"
  },
  {
    id: "firstSacked",
    pdfId: "pdfFirstSacked"
  },
  {
    id: "goldenGlove",
    pdfId: "pdfGoldenGlove"
  }
];


/* ============================================================
   GENERAL HELPERS
============================================================ */

function normaliseText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


function safeFileName(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}


function formatDateForDisplay(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}


/* ============================================================
   START WEBSITE
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================
     LIVE WEBSITE DOM ELEMENTS
  ========================================================== */

  const form =
    document.getElementById("predictionForm");

  const leagueTable =
    document.getElementById("leagueTable");

  const clubOptions =
    document.getElementById("clubOptions");

  const tableCount =
    document.getElementById("tableCount");

  const bonusCount =
    document.getElementById("bonusCount");

  const dateInput =
    document.getElementById("predictionDate");

  const nameInput =
    document.getElementById("name");

  const messageBox =
    document.getElementById("message");

  const downloadButton =
    document.getElementById("downloadBtn");


  /* ==========================================================
     SAFETY CHECK

     If the main table container is somehow missing,
     log the problem instead of crashing silently.
  ========================================================== */

  if (!leagueTable) {
    console.error(
      "Commando Force error: #leagueTable could not be found."
    );

    return;
  }


  /* ==========================================================
     GET TEAM INPUTS
  ========================================================== */

  function getTeamInputs() {
    return Array.from(
      document.querySelectorAll(".team-input")
    );
  }


  /* ==========================================================
     GET BONUS INPUTS
  ========================================================== */

  function getBonusInputs() {
    return bonusFields
      .map((field) =>
        document.getElementById(field.id)
      )
      .filter(Boolean);
  }


  /* ==========================================================
     CLEAR MESSAGE
  ========================================================== */

  function clearMessage() {
    if (!messageBox) {
      return;
    }

    messageBox.textContent = "";
    messageBox.className = "message";
  }


  /* ==========================================================
     SHOW MESSAGE
  ========================================================== */

  function showMessage(
    text,
    type = "error"
  ) {
    if (!messageBox) {
      return;
    }

    messageBox.textContent = text;

    messageBox.className =
      `message message--${type}`;

    messageBox.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }


  /* ==========================================================
     CLEAR INPUT ERRORS
  ========================================================== */

  function clearErrors() {
    document
      .querySelectorAll(".input-error")
      .forEach((input) => {
        input.classList.remove(
          "input-error"
        );
      });
  }


  /* ==========================================================
     UPDATE PROGRESS
  ========================================================== */

  function updateProgress() {
    const teamInputs =
      getTeamInputs();

    const bonusInputs =
      getBonusInputs();

    const completedTeams =
      teamInputs.filter((input) =>
        input.value.trim() !== ""
      ).length;

    const completedBonuses =
      bonusInputs.filter((input) =>
        input.value.trim() !== ""
      ).length;

    if (tableCount) {
      tableCount.textContent =
        completedTeams;
    }

    if (bonusCount) {
      bonusCount.textContent =
        completedBonuses;
    }
  }


  /* ==========================================================
     BUILD CLUB DROPDOWN

     Clubs already selected disappear from the datalist.
  ========================================================== */

  function createClubOptions() {
    if (!clubOptions) {
      return;
    }

    const selectedTeams =
      getTeamInputs()
        .map((input) =>
          normaliseText(input.value)
        )
        .filter(Boolean);

    clubOptions.innerHTML = "";

    clubs.forEach((club) => {
      const normalisedClub =
        normaliseText(club);

      if (
        !selectedTeams.includes(
          normalisedClub
        )
      ) {
        const option =
          document.createElement(
            "option"
          );

        option.value = club;

        clubOptions.appendChild(
          option
        );
      }
    });
  }


  /* ==========================================================
     CREATE 20 LEAGUE ROWS

     THIS RUNS BEFORE ANY PDF CODE.
  ========================================================== */

  function createLeagueTable() {
    leagueTable.innerHTML = "";

    for (
      let position = 1;
      position <= 20;
      position += 1
    ) {
      const row =
        document.createElement(
          "div"
        );

      row.className =
        "prediction-row";


      const positionNumber =
        document.createElement(
          "div"
        );

      positionNumber.className =
        "position-number";

      positionNumber.textContent =
        position;


      const input =
        document.createElement(
          "input"
        );

      input.className =
        "team-input";

      input.type = "text";

      input.name =
        `position-${position}`;

      input.id =
        `position-${position}`;

      input.placeholder =
        "Select or type a club";

      input.setAttribute(
        "list",
        "clubOptions"
      );

      input.setAttribute(
        "autocomplete",
        "off"
      );

      input.setAttribute(
        "maxlength",
        "50"
      );

      input.required = true;


      input.addEventListener(
        "input",
        () => {
          input.classList.remove(
            "input-error"
          );

          updateProgress();

          createClubOptions();

          clearMessage();
        }
      );


      row.appendChild(
        positionNumber
      );

      row.appendChild(
        input
      );

      leagueTable.appendChild(
        row
      );
    }
  }


  /* ==========================================================
     SET TODAY'S DATE
  ========================================================== */

  function setCurrentDate() {
    if (!dateInput) {
      return;
    }

    const today =
      new Date();

    const localDate =
      new Date(
        today.getTime() -
          today.getTimezoneOffset() *
            60000
      );

    dateInput.value =
      localDate
        .toISOString()
        .split("T")[0];
  }


  /* ==========================================================
     DUPLICATE CHECK
  ========================================================== */

  function findDuplicateTeams(
    values
  ) {
    const seen =
      new Set();

    const duplicates =
      new Set();

    values.forEach((value) => {
      const normalisedValue =
        normaliseText(value);

      if (!normalisedValue) {
        return;
      }

      if (
        seen.has(
          normalisedValue
        )
      ) {
        duplicates.add(
          normalisedValue
        );
      }

      seen.add(
        normalisedValue
      );
    });

    return duplicates;
  }


  /* ==========================================================
     CHECK CLUB NAMES

     This makes sure users haven't typed a team
     that is not one of the 20 valid clubs.
  ========================================================== */

  function findInvalidTeams(
    values
  ) {
    const validClubs =
      clubs.map((club) =>
        normaliseText(club)
      );

    return values.filter(
      (value) =>
        !validClubs.includes(
          normaliseText(value)
        )
    );
  }


  /* ==========================================================
     FORM VALIDATION
  ========================================================== */

  function validateForm() {
    clearErrors();

    clearMessage();


    const teamInputs =
      getTeamInputs();

    const bonusInputs =
      getBonusInputs();


    const requiredInputs = [
      nameInput,
      dateInput,
      ...teamInputs,
      ...bonusInputs
    ].filter(Boolean);


    let firstInvalidInput =
      null;

    let missingFields = 0;


    requiredInputs.forEach(
      (input) => {
        if (
          !input.value.trim()
        ) {
          input.classList.add(
            "input-error"
          );

          missingFields += 1;

          if (
            !firstInvalidInput
          ) {
            firstInvalidInput =
              input;
          }
        }
      }
    );


    if (missingFields > 0) {
      showMessage(
        `Please complete all fields before downloading. ${missingFields} field${
          missingFields === 1
            ? " is"
            : "s are"
        } still empty.`
      );

      firstInvalidInput?.focus();

      return false;
    }


    const teamValues =
      teamInputs.map(
        (input) =>
          input.value.trim()
      );


    /* ========================================================
       INVALID CLUB CHECK
    ======================================================== */

    const invalidTeams =
      findInvalidTeams(
        teamValues
      );


    if (
      invalidTeams.length > 0
    ) {
      teamInputs.forEach(
        (input) => {
          const isValid =
            clubs.some(
              (club) =>
                normaliseText(
                  club
                ) ===
                normaliseText(
                  input.value
                )
            );

          if (!isValid) {
            input.classList.add(
              "input-error"
            );
          }
        }
      );

      showMessage(
        "Please select clubs from the official Premier League list."
      );

      document
        .querySelector(
          ".team-input.input-error"
        )
        ?.focus();

      return false;
    }


    /* ========================================================
       DUPLICATE CLUB CHECK
    ======================================================== */

    const duplicateTeams =
      findDuplicateTeams(
        teamValues
      );


    if (
      duplicateTeams.size > 0
    ) {
      teamInputs.forEach(
        (input) => {
          if (
            duplicateTeams.has(
              normaliseText(
                input.value
              )
            )
          ) {
            input.classList.add(
              "input-error"
            );
          }
        }
      );

      showMessage(
        "Each club can only be selected once. Please remove the highlighted duplicate teams."
      );

      document
        .querySelector(
          ".team-input.input-error"
        )
        ?.focus();

      return false;
    }


    return true;
  }


  /* ==========================================================
     PDF POSITION CLASS
  ========================================================== */

  function getPdfRowClass(
    position
  ) {
    if (position === 1) {
      return "pdf-league-row--champion";
    }

    if (
      position >= 2 &&
      position <= 5
    ) {
      return "pdf-league-row--ucl";
    }

    if (position === 6) {
      return "pdf-league-row--europa";
    }

    if (position === 7) {
      return "pdf-league-row--conference";
    }

    if (position >= 18) {
      return "pdf-league-row--relegation";
    }

    return "";
  }


  /* ==========================================================
     POPULATE PDF TEMPLATE

     PDF elements are only fetched HERE.
     They are not touched during normal page startup.
  ========================================================== */

  function populatePdfTemplate() {
    const pdfName =
      document.getElementById(
        "pdfName"
      );

    const pdfDate =
      document.getElementById(
        "pdfDate"
      );

    const pdfLeagueRows =
      document.getElementById(
        "pdfLeagueRows"
      );


    if (
      !pdfName ||
      !pdfDate ||
      !pdfLeagueRows
    ) {
      throw new Error(
        "Premium PDF template is missing required elements."
      );
    }


    pdfName.textContent =
      nameInput.value.trim();

    pdfDate.textContent =
      formatDateForDisplay(
        dateInput.value
      );


    /* ========================================================
       PDF LEAGUE TABLE
    ======================================================== */

    pdfLeagueRows.innerHTML =
      "";


    const teams =
      getTeamInputs().map(
        (input) =>
          input.value.trim()
      );


    teams.forEach(
      (team, index) => {
        const position =
          index + 1;


        const row =
          document.createElement(
            "div"
          );

        row.className =
          "pdf-league-row";


        const specialClass =
          getPdfRowClass(
            position
          );


        if (specialClass) {
          row.classList.add(
            specialClass
          );
        }


        const positionElement =
          document.createElement(
            "div"
          );

        positionElement.className =
          "pdf-league-row__position";

        positionElement.textContent =
          position === 1
            ? "C."
            : position;


        const teamElement =
          document.createElement(
            "div"
          );

        teamElement.className =
          "pdf-league-row__team";

        teamElement.textContent =
          team;


        row.appendChild(
          positionElement
        );

        row.appendChild(
          teamElement
        );

        pdfLeagueRows.appendChild(
          row
        );
      }
    );


    /* ========================================================
       PDF BONUS PREDICTIONS
    ======================================================== */

    bonusFields.forEach(
      (field) => {
        const liveField =
          document.getElementById(
            field.id
          );

        const pdfField =
          document.getElementById(
            field.pdfId
          );


        if (
          liveField &&
          pdfField
        ) {
          pdfField.textContent =
            liveField.value.trim();
        }
      }
    );
  }


  /* ==========================================================
     WAIT FOR FONTS
  ========================================================== */

  async function waitForFonts() {
    if (
      document.fonts &&
      document.fonts.ready
    ) {
      try {
        await document.fonts.ready;
      } catch (error) {
        console.warn(
          "Font loading warning:",
          error
        );
      }
    }
  }


  /* ==========================================================
     WAIT FOR NEXT RENDER
  ========================================================== */

  function waitForRender() {
    return new Promise(
      (resolve) => {
        requestAnimationFrame(
          () => {
            requestAnimationFrame(
              resolve
            );
          }
        );
      }
    );
  }


  /* ==========================================================
     CREATE PREMIUM PDF
  ========================================================== */

  async function createPremiumPDF() {

    /* ========================================================
       CHECK LIBRARIES
    ======================================================== */

    if (
      typeof window.html2canvas !==
      "function"
    ) {
      throw new Error(
        "html2canvas has not loaded."
      );
    }


    if (
      !window.jspdf ||
      !window.jspdf.jsPDF
    ) {
      throw new Error(
        "jsPDF has not loaded."
      );
    }


    const pdfDocument =
      document.getElementById(
        "pdfDocument"
      );


    if (!pdfDocument) {
      throw new Error(
        "#pdfDocument could not be found."
      );
    }


    populatePdfTemplate();


    await waitForFonts();

    await waitForRender();


    /* ========================================================
       CAPTURE PDF HTML
    ======================================================== */

    const canvas =
      await window.html2canvas(
        pdfDocument,
        {
          scale: 2.5,

          backgroundColor:
            "#ffffff",

          useCORS: true,

          allowTaint: false,

          logging: false,

          width: 794,

          height: 1123,

          windowWidth: 794,

          windowHeight: 1123,

          scrollX: 0,

          scrollY: 0
        }
      );


    /* ========================================================
       CONVERT TO IMAGE
    ======================================================== */

    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.96
      );


    /* ========================================================
       CREATE A4 PDF
    ======================================================== */

    const { jsPDF } =
      window.jspdf;


    const pdf =
      new jsPDF({
        orientation:
          "portrait",

        unit:
          "mm",

        format:
          "a4",

        compress:
          true
      });


    const pageWidth =
      pdf.internal.pageSize
        .getWidth();


    const pageHeight =
      pdf.internal.pageSize
        .getHeight();


    pdf.addImage(
      imageData,
      "JPEG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST"
    );


    /* ========================================================
       DOWNLOAD FILENAME
    ======================================================== */

    const name =
      nameInput.value.trim();


    const safeName =
      safeFileName(name) ||
      "Predictions";


    pdf.save(
      `CommandoForce-2026-27-${safeName}.pdf`
    );
  }


  /* ==========================================================
     BONUS INPUT EVENTS
  ========================================================== */

  getBonusInputs().forEach(
    (input) => {
      input.addEventListener(
        "input",
        () => {
          input.classList.remove(
            "input-error"
          );

          updateProgress();

          clearMessage();
        }
      );
    }
  );


  /* ==========================================================
     NAME EVENT
  ========================================================== */

  if (nameInput) {
    nameInput.addEventListener(
      "input",
      () => {
        nameInput.classList.remove(
          "input-error"
        );

        clearMessage();
      }
    );
  }


  /* ==========================================================
     DATE EVENT
  ========================================================== */

  if (dateInput) {
    dateInput.addEventListener(
      "change",
      () => {
        dateInput.classList.remove(
          "input-error"
        );

        clearMessage();
      }
    );
  }


  /* ==========================================================
     FORM SUBMISSION
  ========================================================== */

  if (form) {
    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();


        if (
          !validateForm()
        ) {
          return;
        }


        const buttonText =
          downloadButton
            ?.querySelector(
              "span"
            );


        if (downloadButton) {
          downloadButton.disabled =
            true;
        }


        if (buttonText) {
          buttonText.textContent =
            "Creating premium PDF...";
        }


        try {
          await createPremiumPDF();


          showMessage(
            "Your premium prediction PDF has been downloaded.",
            "success"
          );
        } catch (error) {
          console.error(
            "Premium PDF generation error:",
            error
          );


          showMessage(
            "The PDF could not be created. Please refresh the page and try again."
          );
        } finally {

          if (downloadButton) {
            downloadButton.disabled =
              false;
          }


          if (buttonText) {
            buttonText.textContent =
              "Download prediction PDF";
          }
        }
      }
    );
  }


  /* ==========================================================
     INITIALISE LIVE WEBSITE

     IMPORTANT:
     These happen LAST in this script but before any user PDF
     action, and none rely on premium-PDF elements.
  ========================================================== */

  try {
    createLeagueTable();

    setCurrentDate();

    createClubOptions();

    updateProgress();

    console.log(
      "Commando Force website initialised successfully."
    );
  } catch (error) {
    console.error(
      "Commando Force website initialisation error:",
      error
    );
  }

});

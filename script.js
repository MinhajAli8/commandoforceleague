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

const leaderboard = [
  {
    position: "1st",
    name: "Minzzy",
    points: 76
  },
  {
    position: "2nd",
    name: "Hussein",
    points: 80
  },
  {
    position: "3rd",
    name: "Waji",
    points: 84
  },
  {
    position: "4th",
    name: "Shami",
    points: 92
  },
  {
    position: "5th",
    name: "Shabal",
    points: 96
  }
];

const bonusFields = [
  {
    id: "topScorer",
    label: "Top Scorer",
    pdfId: "pdfTopScorer"
  },
  {
    id: "mostAssists",
    label: "Most Assists",
    pdfId: "pdfMostAssists"
  },
  {
    id: "faCupWinner",
    label: "FA Cup Winner",
    pdfId: "pdfFaCupWinner"
  },
  {
    id: "carabaoCupWinner",
    label: "Carabao Cup Winner",
    pdfId: "pdfCarabaoCupWinner"
  },
  {
    id: "firstSacked",
    label: "First Manager to be Sacked",
    pdfId: "pdfFirstSacked"
  },
  {
    id: "goldenGlove",
    label: "Golden Glove",
    pdfId: "pdfGoldenGlove"
  }
];

/* ============================================================
   DOM REFERENCES
============================================================ */

const form = document.getElementById("predictionForm");
const leagueTable = document.getElementById("leagueTable");
const clubOptions = document.getElementById("clubOptions");

const tableCount = document.getElementById("tableCount");
const bonusCount = document.getElementById("bonusCount");

const dateInput = document.getElementById("predictionDate");
const nameInput = document.getElementById("name");

const messageBox = document.getElementById("message");

const downloadButton = document.getElementById("downloadBtn");

const pdfRenderArea = document.getElementById("pdfRenderArea");
const pdfDocument = document.getElementById("pdfDocument");
const pdfLeagueRows = document.getElementById("pdfLeagueRows");

const pdfName = document.getElementById("pdfName");
const pdfDate = document.getElementById("pdfDate");

/* ============================================================
   HELPERS
============================================================ */

function normaliseText(value) {
  return value.trim().toLowerCase();
}

function getTeamInputs() {
  return Array.from(
    document.querySelectorAll(".team-input")
  );
}

function getBonusInputs() {
  return bonusFields.map((field) => {
    return document.getElementById(field.id);
  });
}

function safeFileName(value) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message";
}

function showMessage(text, type = "error") {
  messageBox.textContent = text;
  messageBox.className = `message message--${type}`;

  messageBox.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function clearErrors() {
  document.querySelectorAll(".input-error").forEach((input) => {
    input.classList.remove("input-error");
  });
}

/* ============================================================
   CLUB DROPDOWN
============================================================ */

function createClubOptions() {
  const selectedTeams = getTeamInputs()
    .map((input) => normaliseText(input.value))
    .filter(Boolean);

  clubOptions.innerHTML = "";

  clubs.forEach((club) => {
    const normalisedClub = normaliseText(club);

    if (!selectedTeams.includes(normalisedClub)) {
      const option = document.createElement("option");

      option.value = club;

      clubOptions.appendChild(option);
    }
  });
}

/* ============================================================
   CREATE 20 LEAGUE ROWS
============================================================ */

function createLeagueTable() {
  leagueTable.innerHTML = "";

  for (let position = 1; position <= 20; position += 1) {
    const row = document.createElement("div");

    row.className = "prediction-row";

    const positionNumber = document.createElement("div");

    positionNumber.className = "position-number";
    positionNumber.textContent = position;

    const input = document.createElement("input");

    input.className = "team-input";
    input.type = "text";

    input.name = `position-${position}`;
    input.id = `position-${position}`;

    input.placeholder = "Select or type a club";

    input.setAttribute("list", "clubOptions");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("maxlength", "50");

    input.required = true;

    input.addEventListener("input", () => {
      input.classList.remove("input-error");

      updateProgress();
      createClubOptions();
      clearMessage();
    });

    row.appendChild(positionNumber);
    row.appendChild(input);

    leagueTable.appendChild(row);
  }
}

/* ============================================================
   DATE
============================================================ */

function setCurrentDate() {
  const today = new Date();

  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  );

  dateInput.value = localDate
    .toISOString()
    .split("T")[0];
}

function formatDateForDisplay(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

/* ============================================================
   PROGRESS COUNTERS
============================================================ */

function updateProgress() {
  const completedTeams = getTeamInputs().filter((input) => {
    return input.value.trim() !== "";
  }).length;

  const completedBonuses = getBonusInputs().filter((input) => {
    return input.value.trim() !== "";
  }).length;

  tableCount.textContent = completedTeams;
  bonusCount.textContent = completedBonuses;
}

/* ============================================================
   DUPLICATE TEAM CHECK
============================================================ */

function findDuplicateTeams(values) {
  const seen = new Set();
  const duplicates = new Set();

  values.forEach((value) => {
    const normalisedValue = normaliseText(value);

    if (!normalisedValue) {
      return;
    }

    if (seen.has(normalisedValue)) {
      duplicates.add(normalisedValue);
    }

    seen.add(normalisedValue);
  });

  return duplicates;
}

/* ============================================================
   VALIDATION
============================================================ */

function validateForm() {
  clearErrors();
  clearMessage();

  const teamInputs = getTeamInputs();
  const bonusInputs = getBonusInputs();

  let firstInvalidInput = null;
  let missingFields = 0;

  const requiredInputs = [
    nameInput,
    dateInput,
    ...teamInputs,
    ...bonusInputs
  ];

  requiredInputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("input-error");

      missingFields += 1;

      if (!firstInvalidInput) {
        firstInvalidInput = input;
      }
    }
  });

  if (missingFields > 0) {
    showMessage(
      `Please complete all fields before downloading. ${missingFields} field${
        missingFields === 1 ? " is" : "s are"
      } still empty.`
    );

    firstInvalidInput?.focus();

    return false;
  }

  const teamValues = teamInputs.map((input) => {
    return input.value.trim();
  });

  const duplicateTeams = findDuplicateTeams(teamValues);

  if (duplicateTeams.size > 0) {
    teamInputs.forEach((input) => {
      if (
        duplicateTeams.has(
          normaliseText(input.value)
        )
      ) {
        input.classList.add("input-error");
      }
    });

    showMessage(
      "Each club can only be selected once. Please remove the highlighted duplicate teams."
    );

    document
      .querySelector(".team-input.input-error")
      ?.focus();

    return false;
  }

  return true;
}

/* ============================================================
   PDF TABLE ROW CLASS
============================================================ */

function getPdfRowClass(position) {
  if (position === 1) {
    return "pdf-league-row--champion";
  }

  if (position >= 2 && position <= 5) {
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

/* ============================================================
   POPULATE PREMIUM PDF TEMPLATE
============================================================ */

function populatePdfTemplate() {
  const name = nameInput.value.trim();

  const selectedDate = dateInput.value;

  const teams = getTeamInputs().map((input) => {
    return input.value.trim();
  });

  pdfName.textContent = name;

  pdfDate.textContent =
    formatDateForDisplay(selectedDate);

  /* =========================
     TABLE
  ========================= */

  pdfLeagueRows.innerHTML = "";

  teams.forEach((team, index) => {
    const position = index + 1;

    const row = document.createElement("div");

    row.className = "pdf-league-row";

    const competitionClass =
      getPdfRowClass(position);

    if (competitionClass) {
      row.classList.add(competitionClass);
    }

    const positionElement =
      document.createElement("div");

    positionElement.className =
      "pdf-league-row__position";

    positionElement.textContent =
      position === 1
        ? "C."
        : position;

    const teamElement =
      document.createElement("div");

    teamElement.className =
      "pdf-league-row__team";

    teamElement.textContent = team;

    row.appendChild(positionElement);
    row.appendChild(teamElement);

    pdfLeagueRows.appendChild(row);
  });

  /* =========================
     BONUS PREDICTIONS
  ========================= */

  bonusFields.forEach((field) => {
    const input =
      document.getElementById(field.id);

    const pdfField =
      document.getElementById(field.pdfId);

    if (pdfField) {
      pdfField.textContent =
        input.value.trim();
    }
  });
}

/* ============================================================
   WAIT FOR FONTS
============================================================ */

async function waitForFonts() {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (error) {
      console.warn(
        "Could not wait for fonts:",
        error
      );
    }
  }
}

/* ============================================================
   CREATE PREMIUM PDF
============================================================ */

async function createPremiumPDF() {
  populatePdfTemplate();

  await waitForFonts();

  /*
    Give the browser a moment to apply all PDF styles
    after the text and table rows are inserted.
  */

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

  const canvas = await html2canvas(
    pdfDocument,
    {
      scale: 2.5,

      useCORS: true,

      backgroundColor: "#ffffff",

      logging: false,

      width: 794,

      height: 1123,

      windowWidth: 794,

      windowHeight: 1123,

      scrollX: 0,

      scrollY: 0
    }
  );

  const imageData = canvas.toDataURL(
    "image/jpeg",
    0.96
  );

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",

    unit: "mm",

    format: "a4",

    compress: true
  });

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

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

  const name =
    nameInput.value.trim();

  const fileName =
    `CommandoForce-2026-27-${safeFileName(name)}.pdf`;

  pdf.save(fileName);
}

/* ============================================================
   BONUS INPUT EVENTS
============================================================ */

getBonusInputs().forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("input-error");

    updateProgress();

    clearMessage();
  });
});

/* ============================================================
   NAME EVENT
============================================================ */

nameInput.addEventListener(
  "input",
  () => {
    nameInput.classList.remove(
      "input-error"
    );

    clearMessage();
  }
);

/* ============================================================
   DATE EVENT
============================================================ */

dateInput.addEventListener(
  "change",
  () => {
    dateInput.classList.remove(
      "input-error"
    );

    clearMessage();
  }
);

/* ============================================================
   FORM SUBMISSION / PDF DOWNLOAD
============================================================ */

form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const buttonText =
      downloadButton.querySelector("span");

    downloadButton.disabled = true;

    buttonText.textContent =
      "Creating premium PDF...";

    try {
      await createPremiumPDF();

      showMessage(
        "Your premium prediction PDF has been downloaded.",
        "success"
      );
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      showMessage(
        "The PDF could not be created. Please refresh the page and try again."
      );
    } finally {
      downloadButton.disabled = false;

      buttonText.textContent =
        "Download prediction PDF";
    }
  }
);

/* ============================================================
   INITIALISE WEBSITE
============================================================ */

createLeagueTable();

createClubOptions();

setCurrentDate();

updateProgress();

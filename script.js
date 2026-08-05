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
    label: "Top Scorer"
  },
  {
    id: "faCupWinner",
    label: "FA Cup Winner"
  },
  {
    id: "underperforming",
    label: "Most Underperforming Team"
  },
  {
    id: "surprisePackage",
    label: "Surprise Package"
  },
  {
    id: "mostAssists",
    label: "Most Assists"
  },
  {
    id: "firstSacked",
    label: "First Manager to be Sacked"
  },
  {
    id: "goldenGlove",
    label: "Golden Glove"
  }
];

const form = document.getElementById("predictionForm");
const leagueTable = document.getElementById("leagueTable");
const clubOptions = document.getElementById("clubOptions");
const tableCount = document.getElementById("tableCount");
const bonusCount = document.getElementById("bonusCount");
const dateInput = document.getElementById("predictionDate");
const messageBox = document.getElementById("message");
const downloadButton = document.getElementById("downloadBtn");

function createClubOptions() {
  clubOptions.innerHTML = "";

  clubs.forEach((club) => {
    const option = document.createElement("option");
    option.value = club;
    clubOptions.appendChild(option);
  });
}

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
      clearMessage();
    });

    row.appendChild(positionNumber);
    row.appendChild(input);
    leagueTable.appendChild(row);
  }
}

function setCurrentDate() {
  const today = new Date();

  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  );

  dateInput.value = localDate.toISOString().split("T")[0];
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

function normaliseText(value) {
  return value.trim().toLowerCase();
}

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

function clearErrors() {
  document.querySelectorAll(".input-error").forEach((input) => {
    input.classList.remove("input-error");
  });
}

function showMessage(text, type = "error") {
  messageBox.textContent = text;
  messageBox.className = `message message--${type}`;

  messageBox.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message";
}

function validateForm() {
  clearErrors();
  clearMessage();

  const nameInput = document.getElementById("name");
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
        duplicateTeams.has(normaliseText(input.value))
      ) {
        input.classList.add("input-error");
      }
    });

    showMessage(
      "Each club can only be selected once. Please remove the highlighted duplicate teams."
    );

    document.querySelector(".team-input.input-error")?.focus();
    return false;
  }

  return true;
}

function formatDateForPDF(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function safeFileName(value) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}

function addRoundedBox(
  pdf,
  x,
  y,
  width,
  height,
  fillColour,
  borderColour
) {
  pdf.setFillColor(...fillColour);
  pdf.setDrawColor(...borderColour);
  pdf.roundedRect(x, y, width, height, 2, 2, "FD");
}

function createPDF() {
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const name = document.getElementById("name").value.trim();
  const selectedDate = dateInput.value;
  const teams = getTeamInputs().map((input) => {
    return input.value.trim();
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(7, 23, 63);
  pdf.rect(0, 0, pageWidth, 36, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(
    "Commando Force 2026/27 Predictions",
    12,
    15
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(205, 217, 245);

  pdf.text(
    `Name: ${name}`,
    12,
    26
  );

  pdf.text(
    `Date: ${formatDateForPDF(selectedDate)}`,
    108,
    26
  );

  const tableX = 12;
  const tableY = 43;
  const tableWidth = 104;
  const positionWidth = 13;
  const rowHeight = 9.6;

  teams.forEach((team, index) => {
    const position = index + 1;
    const y = tableY + index * rowHeight;

    let fillColour = [255, 255, 255];
    let positionColour = [237, 241, 248];
    let borderColour = [218, 224, 235];
    let positionTextColour = [52, 64, 91];

    if (position === 1) {
      fillColour = [255, 249, 223];
      positionColour = [244, 197, 66];
      borderColour = [229, 187, 56];
      positionTextColour = [93, 66, 0];
    } else if (position >= 2 && position <= 5) {
      fillColour = [241, 245, 255];
      positionColour = [71, 112, 224];
      borderColour = [124, 155, 231];
      positionTextColour = [255, 255, 255];
    } else if (position >= 18) {
      fillColour = [255, 241, 243];
      positionColour = [217, 39, 56];
      borderColour = [231, 130, 140];
      positionTextColour = [255, 255, 255];
    }

    addRoundedBox(
      pdf,
      tableX,
      y,
      tableWidth,
      rowHeight - 0.7,
      fillColour,
      borderColour
    );

    pdf.setFillColor(...positionColour);
    pdf.roundedRect(
      tableX,
      y,
      positionWidth,
      rowHeight - 0.7,
      2,
      2,
      "F"
    );

    pdf.rect(
      tableX + positionWidth - 2,
      y,
      2,
      rowHeight - 0.7,
      "F"
    );

    pdf.setTextColor(...positionTextColour);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);

    pdf.text(
      position === 1 ? "C." : `${position}.`,
      tableX + positionWidth / 2,
      y + 6.1,
      {
        align: "center"
      }
    );

    pdf.setTextColor(25, 35, 58);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.7);

    pdf.text(
      team,
      tableX + positionWidth + 4,
      y + 6.1,
      {
        maxWidth: tableWidth - positionWidth - 8
      }
    );
  });

  const sideX = 123;
  const sideWidth = 75;

  addRoundedBox(
    pdf,
    sideX,
    43,
    sideWidth,
    61,
    [249, 250, 253],
    [219, 225, 236]
  );

  pdf.setTextColor(27, 39, 69);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.text(
    "2025/26 Leaderboard",
    sideX + 5,
    51
  );

  leaderboard.forEach((entry, index) => {
    const y = 60 + index * 8.5;

    pdf.setFontSize(8.6);
    pdf.setFont(
      "helvetica",
      index === 0 ? "bold" : "normal"
    );

    pdf.setTextColor(31, 43, 69);

    pdf.text(
      `${entry.position}  ${entry.name}`,
      sideX + 5,
      y
    );

    pdf.text(
      `${entry.points} pts`,
      sideX + sideWidth - 5,
      y,
      {
        align: "right"
      }
    );
  });

  addRoundedBox(
    pdf,
    sideX,
    109,
    sideWidth,
    27,
    [255, 249, 224],
    [231, 202, 108]
  );

  pdf.setTextColor(138, 104, 19);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text(
    "FANTASY PREMIER LEAGUE",
    sideX + 5,
    117
  );

  pdf.setTextColor(55, 44, 17);
  pdf.setFontSize(11);
  pdf.text(
    "FPL Champ: Minzzy",
    sideX + 5,
    126
  );

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(121, 103, 57);
  pdf.setFontSize(7.5);
  pdf.text(
    "2025/26 winner",
    sideX + 5,
    132
  );

  addRoundedBox(
    pdf,
    sideX,
    142,
    sideWidth,
    98,
    [255, 255, 255],
    [219, 225, 236]
  );

  pdf.setTextColor(27, 39, 69);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.text(
    "Bonus Predictions",
    sideX + 5,
    151
  );

  let bonusY = 160;

  bonusFields.forEach((field) => {
    const value = document
      .getElementById(field.id)
      .value
      .trim();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.2);
    pdf.setTextColor(89, 100, 123);

    pdf.text(
      field.label.toUpperCase(),
      sideX + 5,
      bonusY
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.4);
    pdf.setTextColor(27, 39, 69);

    const wrappedValue = pdf.splitTextToSize(
      value,
      sideWidth - 10
    );

    pdf.text(
      wrappedValue,
      sideX + 5,
      bonusY + 5
    );

    bonusY += wrappedValue.length > 1 ? 14 : 11.5;
  });

  pdf.setDrawColor(219, 225, 236);
  pdf.line(12, 245, pageWidth - 12, 245);

  pdf.setTextColor(104, 113, 132);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);

  pdf.text(
    "Predictions are final — no changes after submission!",
    pageWidth / 2,
    253,
    {
      align: "center"
    }
  );

  pdf.setTextColor(150, 157, 171);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);

  pdf.text(
    "Commando Force · 2026/27",
    pageWidth / 2,
    pageHeight - 9,
    {
      align: "center"
    }
  );

  const fileName = `CommandoForce-2026-27-${safeFileName(
    name
  )}.pdf`;

  pdf.save(fileName);
}

getBonusInputs().forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("input-error");
    updateProgress();
    clearMessage();
  });
});

document
  .getElementById("name")
  .addEventListener("input", (event) => {
    event.target.classList.remove("input-error");
    clearMessage();
  });

dateInput.addEventListener("change", () => {
  dateInput.classList.remove("input-error");
  clearMessage();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  downloadButton.disabled = true;
  downloadButton.querySelector("span").textContent =
    "Creating PDF...";

  try {
    createPDF();

    showMessage(
      "Your prediction PDF has been downloaded.",
      "success"
    );
  } catch (error) {
    console.error(error);

    showMessage(
      "The PDF could not be created. Please refresh the page and try again."
    );
  } finally {
    downloadButton.disabled = false;
    downloadButton.querySelector("span").textContent =
      "Download prediction PDF";
  }
});

createClubOptions();
createLeagueTable();
setCurrentDate();
updateProgress();

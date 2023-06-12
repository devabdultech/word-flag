const analyzeForm = document.getElementById("analyze-form");
const analyzeBtn = document.getElementById("analyze-btn");
const loader = document.getElementById("loader");
const resultsDiv = document.getElementById("results");
const resultsBody = document.getElementById("results-body");

analyzeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(analyzeForm);

  // Display loader animation
  analyzeBtn.disabled = true;
  analyzeBtn.innerText = "Analyzing...";
  loader.style.display = "block";
  resultsDiv.style.display = "none";

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("An error occurred during analysis");
    }

    const flaggedResults = await response.json();

    // Update the UI with flagged results
    displayFlaggedResults(flaggedResults);
  } catch (error) {
    console.error(error);
    // Handle error and display appropriate message to the user
    alert("An error occurred during analysis. Please try again.");
  } finally {
    // Hide the loader and restore analyze button state
    analyzeBtn.disabled = false;
    analyzeBtn.innerText = "Analyze";
    loader.style.display = "none";
  }
});

function displayFlaggedResults(flaggedResults) {
  resultsBody.innerHTML = ""; // Clear previous results

  if (flaggedResults.length === 0) {
    resultsBody.innerHTML =
      "<tr><td colspan='3'>No flagged words found</td></tr>";
    return;
  }

  // Populate the results table with flagged words
  flaggedResults.forEach((result) => {
    const row = document.createElement("tr");

    const wordCell = document.createElement("td");
    wordCell.innerText = result.word;
    row.appendChild(wordCell);

    const countCell = document.createElement("td");
    countCell.innerText = result.count;
    row.appendChild(countCell);

    const threatLevelCell = document.createElement("td");
    threatLevelCell.innerText = result.threatLevel;
    row.appendChild(threatLevelCell);

    resultsBody.appendChild(row);
  });

  // Display the results div
  resultsDiv.style.display = "block";
}

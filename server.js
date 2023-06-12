const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { storage, fileFilter } = require("./utils/multerStorage");
const PdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();
app.use(express.static("public"));
app.use(cors());

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.post("/analyze", upload.single("file"), async (req, res) => {
  let keywords;
  let file;

  keywords = req.body.keywords.split(" ");
  file = req.file;

  if (!keywords || !file) {
    return res.status(400).send("Error: Missing keywords or file");
  }

  const filePath = path.join(__dirname, file.path);
  try {
    let content;
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (fileExtension === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await PdfParse(dataBuffer);
      content = pdfData.text;
    } else if (fileExtension === ".docx") {
      const fileData = fs.readFileSync(filePath);
      const { value } = await mammoth.extractRawText({ buffer: fileData });
      content = value;
    } else if (fileExtension === ".txt") {
      content = fs.readFileSync(filePath, "utf-8");
    } else {
      return res.status(400).send("Error: Invalid file type");
    }

    const flagCounts = {};
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = content.match(regex) || [];
      flagCounts[keyword] = matches.length;
    });

    const flaggedWords = Object.keys(flagCounts).filter(
      (keyword) => flagCounts[keyword] > 0
    );

    const threatLevels = {
      1: "Low",
      2: "Risky",
      3: "Critical",
      4: "Demon",
    };

    const flaggedResults = flaggedWords.map((word) => ({
      word,
      count: flagCounts[word],
      threatLevel:
        flagCounts[word] > 5
          ? threatLevels[4]
          : flagCounts[word] > 2
          ? threatLevels[3]
          : flagCounts[word] > 1
          ? threatLevels[2]
          : threatLevels[1],
    }));

    console.log(flaggedResults);

    // Send the flagged results to the client
    res.json(flaggedResults);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the file");
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

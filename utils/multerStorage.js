const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [".txt", ".pdf", ".docx"];
  const fileExtension = path.extname(file.originalname);
  if (allowedFileTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only .txt, .pdf, and .docx files are allowed."
      )
    );
  }
};

module.exports = {
  storage,
  fileFilter,
};

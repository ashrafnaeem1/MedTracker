const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SOUNDS_DIR = path.join(PUBLIC_DIR, "sounds");
const ZIP_PATH = path.join(PUBLIC_DIR, "sounds.zip");

async function makeSoundsZip() {
  if (!fs.existsSync(SOUNDS_DIR)) {
    console.error(`✗ Sounds directory not found: ${SOUNDS_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Remove an old archive so we never append to it
  if (fs.existsSync(ZIP_PATH)) {
    fs.unlinkSync(ZIP_PATH);
  }

  console.log("Creating sounds.zip...");

  const output = fs.createWriteStream(ZIP_PATH);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", () => {
    const sizeMb = (archive.pointer() / (1024 * 1024)).toFixed(2);
    console.log(`✓ Created ${ZIP_PATH} (${sizeMb} MB)`);
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      console.warn("Archive warning:", err.message);
    } else {
      throw err;
    }
  });

  archive.on("error", (err) => {
    console.error("✗ Failed to create sounds.zip:", err.message);
    process.exit(1);
  });

  archive.pipe(output);

  // Put the contents of public/sounds at the ZIP root:
  // sounds.zip/sound-file.mp3
  archive.directory(SOUNDS_DIR, false);

  await archive.finalize();
}

makeSoundsZip();

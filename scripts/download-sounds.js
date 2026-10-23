const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

// Define release tag & URL
const ASSET_VERSION = "v1.0.0-assets"; // Update this tag when releasing new sounds
const SOUNDS_ZIP_URL = `https://github.com/ashrafnaeem1/MedTracker/releases/download/${ASSET_VERSION}/sounds.zip`;

const PUBLIC_DIR = path.join(__dirname, "../public");
const ZIP_PATH = path.join(PUBLIC_DIR, "sounds.zip");
const EXTRACT_DIR = path.join(PUBLIC_DIR, "sounds");
const VERSION_FILE = path.join(EXTRACT_DIR, ".version");

async function setupSounds() {
  // Check if current installed version matches target version
  if (fs.existsSync(VERSION_FILE)) {
    const installedVersion = fs.readFileSync(VERSION_FILE, "utf8").trim();
    if (installedVersion === ASSET_VERSION) {
      console.log(`✓ UI sounds (${ASSET_VERSION}) are up to date.`);
      return;
    }
    console.log(
      `↺ New asset version detected (${installedVersion} -> ${ASSET_VERSION}). Updating...`,
    );
  }

  // Prevent collisions: Remove old extracted directory completely
  if (fs.existsSync(EXTRACT_DIR)) {
    fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
  }

  console.log(`Downloading UI sounds release (${ASSET_VERSION})...`);

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  function downloadFile(url) {
    https
      .get(url, { headers: { "User-Agent": "Node.js" } }, (response) => {
        // Handle GitHub redirects (301 / 302 / 307)
        if ([301, 302, 307].includes(response.statusCode)) {
          downloadFile(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          console.error(`Failed to download asset: HTTP ${response.statusCode}`);
          return;
        }

        const fileStream = fs.createWriteStream(ZIP_PATH);
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          extractAndClean();
        });
      })
      .on("error", (err) => {
        console.error("Download failed:", err.message);
        if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
      });
  }

  function extractAndClean() {
    console.log("Extracting UI sounds...");

    try {
      // Cross-platform overwrite extraction
      if (process.platform === "win32") {
        execSync(
          `powershell -command "Expand-Archive -Force -Path '${ZIP_PATH}' -DestinationPath '${EXTRACT_DIR}'"`,
        );
      } else {
        execSync(`unzip -o "${ZIP_PATH}" -d "${EXTRACT_DIR}"`);
      }

      // Write version marker file
      fs.writeFileSync(VERSION_FILE, ASSET_VERSION, "utf8");
      console.log(`✓ UI sounds successfully updated to ${ASSET_VERSION}.`);
    } catch (err) {
      console.error("Error during extraction:", err.message);
    } finally {
      // Clean up temporary download file
      if (fs.existsSync(ZIP_PATH)) {
        fs.unlinkSync(ZIP_PATH);
      }
    }
  }

  downloadFile(SOUNDS_ZIP_URL);
}

setupSounds();

import { convert } from "./index";
import * as fs from "fs";
import * as path from "path";

// Get command line arguments
const inputFile = process.argv[2];
const outputDir = process.argv[3] || "../output-test/src";

if (!inputFile) {
  console.error("Please provide an input JSON file path");
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read input JSON
try {
  const jsonData = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  // Convert to React and CSS
  const { reactCode, cssCode } = convert(jsonData);

  // Write output files
  fs.writeFileSync(path.join(outputDir, "FigmaComponent.jsx"), reactCode);
  fs.writeFileSync(path.join(outputDir, "styles.css"), cssCode);

  console.log(`✅ Successfully generated:
  - ${path.join(outputDir, "FigmaComponent.jsx")}
  - ${path.join(outputDir, "styles.css")}`);
} catch (error) {
  console.error("Error processing file:", error);
  process.exit(1);
}

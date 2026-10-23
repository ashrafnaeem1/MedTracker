const fs = require("fs");
const path = require("path");

(async () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No active editor found.");
    return;
  }

  const document = editor.document;
  const line = document.lineAt(editor.selection.active.line);
  const text = line.text;

  const workspaceFolder =
    vscode.workspace.getWorkspaceFolder(document.uri) ?? vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showInformationMessage("No workspace folder open.");
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;

  // Direction state is stored in the project so it persists between runs.
  const stateFile = path.join(workspaceRoot, ".damolinx-audio-cycle-direction");

  const readDirection = () => {
    if (!fs.existsSync(stateFile)) return 1;

    const saved = Number(fs.readFileSync(stateFile, "utf8").trim());
    return saved === -1 ? -1 : 1;
  };

  const writeDirection = (direction) => {
    fs.writeFileSync(stateFile, String(direction));
  };

  // Single toggle marker:
  //   // cycle:invert
  if (/cycle\s*:\s*invert/i.test(text)) {
    const newDirection = readDirection() === 1 ? -1 : 1;
    writeDirection(newDirection);

    vscode.window.showInformationMessage(
      `Audio cycle direction: ${newDirection === 1 ? "forward" : "reverse"}.`,
    );
    return;
  }

  const direction = readDirection();

  const match = text.match(/(['"])(\/?(?:[^'"\\/]+\/)*)([^'"\\/]+)\1/);

  if (!match) {
    vscode.window.showInformationMessage("No valid file path found on this line.");
    return;
  }

  const quote = match[1];
  const relativeDirPath = match[2];
  const currentFilename = match[3];

  const absoluteDirPath = relativeDirPath.startsWith("/")
    ? path.join(workspaceRoot, relativeDirPath)
    : path.join(path.dirname(document.uri.fsPath), relativeDirPath);

  if (!fs.existsSync(absoluteDirPath)) {
    vscode.window.showInformationMessage(`Directory not found: ${absoluteDirPath}`);
    return;
  }

  const files = fs
    .readdirSync(absoluteDirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

  if (files.length === 0) {
    vscode.window.showInformationMessage("No files found in directory.");
    return;
  }

  const currentIndex = files.indexOf(currentFilename);

  const nextIndex =
    currentIndex === -1
      ? direction === 1
        ? 0
        : files.length - 1
      : (currentIndex + direction + files.length) % files.length;

  const nextFilename = files[nextIndex];
  const fullNewPath = `${relativeDirPath}${nextFilename}`;

  const newLineText = text.replace(match[0], `${quote}${fullNewPath}${quote}`);

  await editor.edit((editBuilder) => {
    editBuilder.replace(line.range, newLineText);
  });

  // Preserve the currently selected direction.
  writeDirection(direction);

  await document.save();
})();

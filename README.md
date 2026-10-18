# MedTracker

WORK IN PROGRESS.

A simple website/application that tracks medicine doses.

## Running Locally (Windows 10/11)

### Prerequisites

- Git
- PowerShell
- winget

### Setup

Install fnm (Fast Node Manager):

```powershell
winget install Schniz.fnm
```

Restart (Reopen) PowerShell, then install Node.js (LTS):

```powershell
fnm install --lts
fnm use --lts
fnm default lts-latest
```

Verify the installation:

```powershell
node -v
npm -v
```

Install pnpm:

```powershell
npm install -g pnpm
```

Verify the installation:

```powershell
pnpm -v
```

### Run the Project

Clone the repository:

```powershell
git clone https://github.com/ashrafnaeem1/MedTracker.git
cd MedTracker
```

Install dependencies:

```powershell
pnpm install
```

Start the development server:

```powershell
pnpm dev
```

Open the local URL displayed in the terminal (typically `http://localhost:5173`).

### Troubleshooting

If PowerShell cannot find `fnm` after installation then close and reopen PowerShell.

If the issue persists, verify that fnm was installed correctly:

```powershell
fnm --version
```

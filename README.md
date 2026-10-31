# ApplyReady

ApplyReady keeps your profile and application drafts in this browser. The Generate Answer feature sends profile facts, the job description, and the application question to the local Express server. The server asks Meta Model API to select supporting fact IDs, then builds the draft from the exact saved text and returns the selected facts as evidence. The model does not write personal claims. If information is missing, the app asks you for it first.

## Run locally

Requirements: Node.js 20 or newer and npm.

1. Install packages:

   ```powershell
   npm install
   ```

2. Create your local environment file only if it is missing, then open it:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   notepad .env
   ```

3. In `.env`, use these settings:

   ```dotenv
   AI_PROVIDER=meta
   AI_MODEL=muse-spark-1.3
   MODEL_API_KEY=your-meta-key-here
   ```

   Replace the placeholder locally. If `AI_PROVIDER` or `AI_MODEL` already appears in your file, change those lines instead of adding duplicates. Leave any previous `AI_API_KEY` line alone; ApplyReady does not use it for Meta. The Meta key stays in this local file, which is ignored by Git.

4. Start the Express API and Vite app together:

   ```powershell
   npm run dev
   ```

5. Open <http://127.0.0.1:5173/>. The API listens on <http://127.0.0.1:8787/>. If port 5173 is already in use, Vite prints the alternate preview URL in the terminal.

Until `MODEL_API_KEY` is configured, the rest of the app remains usable and Generate Answer shows a clear setup error. `AI_MODEL` is configurable in `.env`; the documented default is `muse-spark-1.3`.

## Verify

```powershell
npm test
npm run build
```

The generation tests use a mock selector and do not send profile data to an AI provider.

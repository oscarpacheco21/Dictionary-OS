# Vocab Vault

Simple client-side dictionary + flashcards app that uses:
- Dictionary API: https://api.dictionaryapi.dev
- Datamuse for synonyms: https://api.datamuse.com

## How to deploy on GitHub Pages

1. Create a new public repository.
2. Add these files (`index.html`, `style.css`, `script.js`, optional `manifest.json` and icons).
3. In Settings → Pages, set source to `main` branch, root `/`.
4. Wait a moment and open `https://<your-username>.github.io/<repo-name>/`.

## Notes
- Data (saved words & flashcards) is stored in your browser's localStorage.
- For offline use, convert saved words to flashcards (stored text) and optionally add icons + enable PWA features.

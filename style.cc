:root{
  --bg: #0f1724;
  --panel: #0b1220;
  --muted: #9aa4b2;
  --accent: #6ee7b7;
  --accent-2: #7dd3fc;
  --card: #0e1a2b;
  --glass: rgba(255,255,255,0.03);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
html,body{height:100%;margin:0;background:linear-gradient(180deg,var(--bg),#071226);color:#e6eef6}
.app {
  max-width:1100px;margin:28px auto;padding:20px;
  display:grid;gap:18px;
  grid-template-columns: 1fr 360px;
}

header{
  grid-column: 1 / -1; display:flex;align-items:center;justify-content:space-between;
  gap:12px;
}
h1{margin:0;font-size:20px;letter-spacing:0.2px}
.subtitle{color:var(--muted);font-size:13px}

.search {
  background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius:12px;padding:16px;box-shadow:0 6px 20px rgba(2,6,23,0.6);
}
.search-row{display:flex;gap:8px}
input.search-input{
  flex:1;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);
  background:transparent;color:inherit;font-size:15px;outline:none;
}
button.btn{
  background:linear-gradient(90deg,var(--accent),var(--accent-2));
  color:#012; border:none;padding:10px 14px;border-radius:10px;font-weight:600;cursor:pointer;
  box-shadow:0 6px 18px rgba(0,0,0,0.4);
}
button.ghost{background:transparent;border:1px solid rgba(255,255,255,0.04);color:var(--muted)}

.results{background:var(--panel);padding:16px;border-radius:12px;min-height:320px;overflow:auto}
.section{margin-bottom:14px}
.label{color:var(--muted);font-size:13px;margin-bottom:6px}
.definition{background:var(--card);padding:12px;border-radius:8px;margin-bottom:8px}
.example{font-style:italic;color:#c8e7d9}
.meta{color:var(--muted);font-size:13px;margin-top:6px}

.right-col {display:flex;flex-direction:column; gap:12px;}
.panel{background:var(--panel);padding:12px;border-radius:12px;min-height:120px}
.saved-list{display:flex;flex-direction:column;gap:8px;max-height:260px;overflow:auto}
.saved-item{display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:8px;background:var(--glass)}
.chip{background:rgba(255,255,255,0.03);padding:6px 10px;border-radius:999px;font-size:13px}

.flash-controls{display:flex;gap:8px;margin-bottom:8px}
.flashcard{
  height:220px;border-radius:12px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  display:flex;align-items:center;justify-content:center;flex-direction:column;padding:14px;user-select:none;
  box-shadow: 0 8px 30px rgba(0,0,0,0.5);
}
.word-large{font-size:34px;font-weight:700}
.card-side{font-size:16px;color:var(--muted);margin-top:8px;text-align:center;padding:0 8px}
.controls{display:flex;gap:8px;margin-top:12px}

.game-choices{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.choice{padding:10px;border-radius:10px;background:rgba(255,255,255,0.02);cursor:pointer;border:1px solid transparent}
.choice:hover{border-color:rgba(255,255,255,0.04)}
.correct{background:linear-gradient(90deg,#0ea5a4,#34d399)}
.wrong{background:linear-gradient(90deg,#ef4444,#f97316)}

.muted-line{color:var(--muted);font-size:13px}
.small{font-size:13px;color:var(--muted)}
@media(max-width:980px){
  .app{grid-template-columns:1fr; padding:12px}
  .right-col{order:3}
}

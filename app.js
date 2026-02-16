let songs = [];

const elSongList = document.getElementById("songList");
const elSearch = document.getElementById("search");

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}

function renderChords(song) {
  const chords = song.chords || {};
  const order = ["intro","verse","preChorus","chorus","bridge","outro"];

  return order
    .filter(k => Array.isArray(chords[k]) && chords[k].length)
    .map(k => {
      const label = k === "preChorus" ? "PRE-CHORUS" : k.toUpperCase();
      return `
        <div class="chord-section">
          <strong>${label}</strong><br>
          ${chords[k].map(esc).join(" - ")}
        </div>
      `;
    })
    .join("");
}

function renderSongs(list) {
  elSongList.innerHTML = list.map(song => {
    const id = esc(song.id);
    return `
      <div class="song">
        <h3>${esc(song.title)} - ${esc(song.artist)}</h3>
        <p>Key: ${esc(song.key)} | Capo: ${esc(song.capo)}</p>

        <button class="btn-chords" data-songid="${id}">
          📄 View Chords
        </button>

        <div class="chords" id="chords-${id}" style="display:none; margin-top:10px;">
          ${renderChords(song) || "<em>No chords found for this song.</em>"}
        </div>
      </div>
    `;
  }).join("");
}

// One click handler for the whole list (reliable on iOS)
elSongList.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-chords");
  if (!btn) return;

  const id = btn.getAttribute("data-songid");
  const panel = document.getElementById("chords-" + id);
  if (!panel) return;

  const isOpen = panel.style.display !== "none";
  panel.style.display = isOpen ? "none" : "block";
  btn.textContent = isOpen ? "📄 View Chords" : "📄 Hide Chords";
});

function applySearch() {
  const q = (elSearch.value || "").toLowerCase().trim();
  if (!q) return renderSongs(songs);

  const filtered = songs.filter(s =>
    (s.title || "").toLowerCase().includes(q) ||
    (s.artist || "").toLowerCase().includes(q)
  );
  renderSongs(filtered);
}

elSearch.addEventListener("input", applySearch);

// Fetch with a cache-buster so iPad doesn’t keep old JSON
fetch("songs.json?v=" + Date.now())
  .then(res => {
    if (!res.ok) throw new Error("Failed to load songs.json (" + res.status + ")");
    return res.json();
  })
  .then(data => {
    songs = Array.isArray(data) ? data : [];
    renderSongs(songs);
  })
  .catch(err => {
    elSongList.innerHTML = `
      <div class="song">
        <h3>Couldn’t load songs</h3>
        <p>${esc(err.message)}</p>
      </div>
    `;
  });

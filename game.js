const COLS = 8;
const ROWS = 6;

const PLAYERS = [
  { id: 0, name: "Красный игрок", color: "#d63a2f" },
  { id: 1, name: "Синий игрок", color: "#2f6fd6" },
  { id: 2, name: "Зелёный игрок", color: "#2fa84a" },
  { id: 3, name: "Жёлтый игрок", color: "#f2c21b" },
];

const SECTORS = [
  "Холодные воды Северного моря",
  "Северный тракт уходит в чащу",
  "Тёмный лес",
  "Сердце Тёмного леса",
  "Опушка у подножия гор",
  "Седые горы",
  "Снежные вершины",
  "Восточный хребет",

  "Торговая каравелла",
  "Береговая дорога",
  "Южная опушка Тёмного леса",
  "Охотничьи угодья",
  "Предгорья",
  "Горный перевал",
  "Горная крепость Вельмор",
  "Исток Серебряной реки",

  "Корабль у гавани",
  "Портовый причал",
  "Приморский замок Альмар",
  "Королевский замок Эльдгард",
  "Королевский тракт на восток",
  "Развилка у старого дуба",
  "Каменный мост",
  "Деревня Восточный Брод",

  "Парусник в глубоких водах",
  "Устье Серебряной реки",
  "Деревня Ивняки и поля",
  "Пшеничные поля у реки",
  "Королевский мост",
  "Излучина Серебряной реки",
  "Зеркальное озеро",
  "Хижина рыбака у озера",

  "Логово морского змея",
  "Скалистый берег",
  "Маяк",
  "Мельница",
  "Южный тракт",
  "Деревня Медовый Луг",
  "Опушка Восточного леса",
  "Восточный лес",

  "Роза ветров",
  "Лодка в Южном море",
  "Южное побережье",
  "Деревня Каменка",
  "Монастырь Святого Ансельма",
  "Тропа к Восточному лесу",
  "Чаща Восточного леса",
  "Руины древней башни",
];

const state = {
  activePlayer: 0,
  owners: new Array(COLS * ROWS).fill(null),
  pendingIndex: null,
  pendingPlayer: null,
};

const mainEl = document.querySelector("main");
const headerEl = document.querySelector("header");
const boardEl = document.getElementById("board");
const playersEl = document.getElementById("players");
const confirmEl = document.getElementById("confirm");
const confirmTitleEl = document.getElementById("confirm-title");
const confirmPlayerEl = document.getElementById("confirm-player");
const finishEl = document.getElementById("finish");
const finishStatsEl = document.getElementById("finish-stats");
const openedCountEl = document.getElementById("opened-count");
const restartTopEl = document.getElementById("restart-top");

document.getElementById("total-count").textContent = COLS * ROWS;
boardEl.style.setProperty("--cols", COLS);
boardEl.style.setProperty("--rows", ROWS);

function buildBoard() {
  boardEl.innerHTML = "";
  SECTORS.forEach((title, index) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.dataset.index = index;
    tile.title = title;

    const inner = document.createElement("div");
    inner.className = "tile-inner";

    const front = document.createElement("div");
    front.className = "tile-face tile-front";
    front.textContent = title;

    const back = document.createElement("div");
    back.className = "tile-face tile-back";
    back.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
    back.style.backgroundPosition = `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`;

    inner.append(front, back);
    tile.append(inner);
    tile.addEventListener("click", () => selectTile(index));
    boardEl.append(tile);
  });
}

function renderPlayers() {
  playersEl.innerHTML = "";
  PLAYERS.forEach((player) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "player" + (player.id === state.activePlayer ? " active" : "");
    btn.style.setProperty("--color", player.color);
    btn.innerHTML = `<span class="swatch"></span><span class="name"></span><span class="count"></span>`;
    btn.querySelector(".name").textContent = player.name;
    btn.querySelector(".count").textContent = countFor(player.id);
    btn.addEventListener("click", () => {
      state.activePlayer = player.id;
      renderPlayers();
    });
    playersEl.append(btn);
  });
  openedCountEl.textContent = state.owners.filter((o) => o !== null).length;
}

function countFor(playerId) {
  return state.owners.filter((o) => o === playerId).length;
}

function tileEl(index) {
  return boardEl.querySelector(`.tile[data-index="${index}"]`);
}

function selectTile(index) {
  if (state.owners[index] !== null) return;
  clearSelection();
  const player = PLAYERS[state.activePlayer];
  state.pendingIndex = index;
  state.pendingPlayer = player.id;

  const tile = tileEl(index);
  tile.classList.add("selected");
  tile.style.setProperty("--color", player.color);

  confirmPlayerEl.textContent = player.name;
  confirmPlayerEl.style.setProperty("--color", player.color);
  confirmTitleEl.textContent = SECTORS[index];
  setConfirmOpen(true);
}

function setConfirmOpen(open) {
  confirmEl.hidden = !open;
  mainEl.inert = open;
  headerEl.inert = open;
  if (open) document.getElementById("confirm-yes").focus();
}

function clearSelection() {
  if (state.pendingIndex === null) return;
  const tile = tileEl(state.pendingIndex);
  tile.classList.remove("selected");
  if (state.owners[state.pendingIndex] === null) tile.style.removeProperty("--color");
  state.pendingIndex = null;
  state.pendingPlayer = null;
}

function confirmSelection() {
  const index = state.pendingIndex;
  if (index === null) return;
  const player = PLAYERS[state.pendingPlayer];

  state.owners[index] = player.id;
  const tile = tileEl(index);
  tile.style.setProperty("--color", player.color);
  tile.classList.remove("selected");
  tile.classList.add("flipped");
  tile.disabled = true;
  state.pendingIndex = null;
  state.pendingPlayer = null;
  setConfirmOpen(false);

  renderPlayers();

  if (state.owners.every((o) => o !== null)) {
    setTimeout(showFinish, 900);
  }
}

function cancelSelection() {
  clearSelection();
  setConfirmOpen(false);
}

function showFinish() {
  finishStatsEl.innerHTML = "";
  PLAYERS.forEach((player) => {
    const li = document.createElement("li");
    li.style.setProperty("--color", player.color);
    li.innerHTML = `<span class="swatch"></span><span></span>`;
    li.lastChild.textContent = `${player.name}: ${countFor(player.id)}`;
    finishStatsEl.append(li);
  });
  finishEl.hidden = false;
  restartTopEl.hidden = false;
}

function restart() {
  state.owners.fill(null);
  state.pendingIndex = null;
  state.pendingPlayer = null;
  state.activePlayer = 0;
  finishEl.hidden = true;
  setConfirmOpen(false);
  restartTopEl.hidden = true;
  buildBoard();
  renderPlayers();
}

document.getElementById("confirm-yes").addEventListener("click", confirmSelection);
document.getElementById("confirm-no").addEventListener("click", cancelSelection);
document.getElementById("restart").addEventListener("click", restart);
restartTopEl.addEventListener("click", restart);
document.getElementById("finish-close").addEventListener("click", () => {
  finishEl.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !confirmEl.hidden) cancelSelection();
});

buildBoard();
renderPlayers();

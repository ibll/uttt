import server from '../events/outgoing.js';
import status from "./toast.js";
import { icons } from "../assets/icons.js";
import {
    addLeaveButton,
    adjustTitleText,
    how_to_play,
    removeLeaveButton,
    resetPieceMarker,
    resetStartButton,
    showBriefTutorial,
    statusBarSetMyLinks
} from "../client.js";
import status_bar from "./status_bar.js";
import Cookie from "../modules/js.cookie.mjs";

export let game_id;
export let board_depth;
export let board_state = {};
export let active_grids = {};
let cell_count = {};
let moves;
let start_time;
let end_time;
let endless;
let won = false;
let my_piece;

let time_interval;

let panzoom;

const main = document.querySelector('main')
let board;
window.getBoardState = () => board_state;

export function updateState(payload) {
    const url = new URL(window.location);

    document.removeEventListener('wheel', panzoom?.zoomWithWheel);
    document.removeEventListener('pointerdown', panzoom?.handleDown);
    main.style.touchAction = 'auto';
    main.style.overflow = 'visible';
    main.style.userSelect = 'auto';

    // Exit lobby
    if (!payload?.game_id || payload?.nonexistant) {
        game_id = undefined;

        if (url.searchParams.has('room')) {
            url.searchParams.delete('room');
            history.pushState({ path: url.href, game_id }, '', url);
            document.title = "Ultimate Tic-Tac-Toe";
        }

        // Delete board and re-add big tutorial
        main.innerHTML = '';
        main.appendChild(how_to_play);

        // Reset UI
        removeLeaveButton();
        resetPieceMarker();
        statusBarSetMyLinks();
        resetStartButton();
        toast.display();

        return;
    }

    // Show dialog if first time joining a game with this tab
    const tutorial_shown = Cookie.get("tutorial-shown");
    if (!tutorial_shown) showBriefTutorial()

    // Joining new room
    if (game_id !== payload.game_id) {
        game_id = payload.game_id;

        status.display(`Joined game ${game_id}`, null, 'arrow')

        if (url.searchParams.get('room') !== game_id) {
            url.searchParams.set('room', game_id);
            history.pushState({ path: url.href, game_id }, '', url);
            document.title = "Ultimate Tic-Tac-Toe | Room " + game_id;
        }
    }

    board_depth = payload.board_depth;
    board_state = payload.board_state;
    moves = payload.moves;
    start_time = payload.start_time;
    end_time = payload.end_time;
    endless = payload.endless;

    cell_count = {};

    addLeaveButton();
    statusBarSetGameInfo();
    setPiece(payload.client_piece)

    how_to_play.remove();
    main.innerHTML = '';

    createBoard(board_depth);

    panzoom = Panzoom(board, {
        maxScale: board_depth * 4 / 3,
        minScale: 1,
        exclude: Array.from(document.querySelectorAll(".button-panel, #tutorial-dialog")),
        excludeClass: 'active',
    })

    panzoom.zoom(1, { animate: true });

    document.addEventListener('wheel', panzoom.zoomWithWheel);
    document.addEventListener('pointerdown', panzoom.handleDown);
    document.addEventListener('pointerup', function () {
        if (!isElementPartiallyInView(board)) panzoom.reset();
    });
    document.addEventListener('resize', function () {
        if (!isElementPartiallyInView(board)) panzoom.reset();
    });

    for (const layer in board_state) {
        for (const cell_id in board_state[layer]) {
            const player_num = board_state[layer][cell_id];
            place(layer, cell_id, player_num);
        }
    }

    setActiveGrids(payload.active_layer, payload.active_grid_num, payload.next_player_id);
}

export function setPiece(piece) {
    my_piece = piece;
    if (!piece) return;
    document.getElementById('piece-marker').innerHTML = piece ? icons[piece] : '';
    adjustTitleText();
}

export function createBoard(depth) {
    board = document.createElement('div');
    board.id = 'board';
    board.classList.add('grid');
    main.appendChild(board);

    won = false;

    if (!board_depth) return;

    console.log(`Creating board of size ${depth}`);
    createBoardInCell(board, depth, depth);
}

function createBoardInCell(outerCell, layer, depth) {
    if (!board_state[layer]) board_state[layer] = {};

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            if (!cell_count[layer]) cell_count[layer] = 0;
            cell.id = `cell.${layer - 1}.${cell_count[layer]++}`;

            cell.classList.add('grid');
            if (layer === 1) {
                cell.classList.add('cell');
                cell.onclick = () => server.place(game_id, cell.id);
                cell.onkeydown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') server.place(game_id, cell.id);
                }
            }

            cell.style.borderWidth = layer / board_depth * 2 + 'px';
            cell.style.setProperty('--overlay-radius', `${layer / board_depth / 2}px`);
            cell.style.borderColor = `var(--c${layer})`

            if (i === 0) cell.classList.add('top');
            if (i === 2) cell.classList.add('bottom');
            if (j === 0) cell.classList.add('left');
            if (j === 2) cell.classList.add('right');

            if (layer > 1) createBoardInCell(cell, layer - 1, depth);

            outerCell.appendChild(cell);
        }
    }
}

export function place(cell_layer, cell_number, player, moves) {
    if (moves) status_bar.updateBlock('move', moves);
    if (!start_time) start_time = Date.now();

    if (!board_state[cell_layer]) board_state[cell_layer] = {};
    board_state[cell_layer][cell_number] = player;

    cell_layer = parseInt(cell_layer);
    cell_number = parseInt(cell_number);
    if (player !== null) player = parseInt(player);

    let cell;

    if (cell_layer >= board_depth) {
        cell = board;
    } else {
        cell = document.getElementById(`cell.${cell_layer}.${cell_number}`);
    }

    if (cell) {
        if ((board_depth === 1 && cell_layer < board_depth) || cell_layer < board_depth - 1) {
            let piece_marker = 'dash';
            if (player === 0) piece_marker = 'cross'
            if (player === 1) piece_marker = 'nought'
            cell.innerHTML = icons[piece_marker];
        } else if (cell_layer < board_depth) {
            let colour = '--text';
            if (player === 0) colour = '--red';
            if (player === 1) colour = '--blue';

            const overlay = document.createElement('div');
            overlay.classList.add('overlay');

            overlay.style.outline = `var(${colour}) solid ${cell_layer}px`;
            if (cell_layer !== board_depth) overlay.style.backgroundColor = `var(${colour}-trans)`;
            overlay.style.borderRadius = (cell_layer / board_depth * 16) + 'px';

            cell.prepend(overlay);
        }
        cell.classList.add('played');
    }

    // Check for win
    if (cell_layer >= board_depth) {
        won = true;

        if (!end_time) end_time = Date.now();

        if (endless) return;

        const piece = player === 0 ? 'cross' : 'nought';

        if (player == null) status.display('Draw!', Infinity, 'both');
        else if (my_piece === piece) status.display(`You win!`, Infinity, 'heart');
        else status.display(`${toTitleCase(piece)} wins!`, Infinity, piece);
    }

}

export function setMoves(new_moves) {
    moves = new_moves;
    status_bar.updateBlock('move', moves);
}

export function setActiveGrids(layer, grid_num, next_piece) {
    document.querySelectorAll('.grid.active').forEach(grid => {
        grid.querySelectorAll('.cell').forEach(cell => {
            cell.tabIndex = -1;
        })
        grid.classList.remove('active');
    })

    if (!active_grids) return;

    if (!won) {
        if (my_piece === next_piece && next_piece !== undefined)
            status.display("Your turn!", Infinity, null, true);
        else if (my_piece === 'both' || (my_piece == null && moves > 1))
            status.display(`${toTitleCase(next_piece)}'s turn!`, Infinity, next_piece, true);
        else if (next_piece !== null && moves > 1)
            status.display('', Infinity, null, true);
    }

    const target = document.getElementById("cell." + layer + "." + grid_num)

    if (!target) {
        // Base level zoom
        panzoom.reset()
    } else {
        if (!isElementFullyInView(target, 50)) panzoom.reset();
    }

    makeGridActive(parseInt(layer), parseInt(grid_num));
}

function makeGridActive(level, grid_num) {
    if (level === 1) {
        const grid = document.getElementById(`cell.${level}.${grid_num}`) || board;
        if (!grid) return;
        grid.querySelectorAll('.cell:not(.played)').forEach(cell => {
            cell.tabIndex = 0;
        });
        grid.classList.add('active');
        return;
    }

    if (level > 1) {
        const first_sub_cell = grid_num * 9;

        for (let cell = 0; cell < 9; cell++) {
            if (board_state[level - 1] && board_state[level - 1][first_sub_cell + cell] !== undefined) continue;
            makeGridActive(level - 1, first_sub_cell + cell);
        }
    }
}

export function statusBarSetGameInfo() {
    resetStartButton();

    status_bar.reset()
    status_bar.addBlock('move', 'move', moves);
    status_bar.addBlock('room', 'room', game_id);
    status_bar.addBlock('time', 'time', '00:00:00');

    updateTime();
    if (!end_time) time_interval = setInterval(updateTime, 1000)
}

function updateTime() {
    if (!start_time || !document.getElementById('time')) return;

    let elapsedTime;
    if (end_time) elapsedTime = end_time - start_time;
    else elapsedTime = Date.now() - start_time;

    status_bar.updateBlock('time', getTimeString(elapsedTime));
    if (end_time) return clearInterval(time_interval);
}

function getTimeString(interval) {
    const elapsedTime = interval
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / 60000) % 60;
    const hours = Math.floor(elapsedTime / 3600000);
    return `${getTimeSegment(hours)}:${getTimeSegment(minutes)}:${getTimeSegment(seconds)}`;
}

function getTimeSegment(number) {
    return number.toString().padStart(2, '0');
}

function isElementFullyInView(el, allowance = 20) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= -allowance &&
        rect.left >= -allowance &&
        rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) + allowance) &&
        rect.right <= ((window.innerWidth || document.documentElement.clientWidth) + allowance)
    );
}

function isElementPartiallyInView(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth &&
        rect.bottom > 0 &&
        rect.right > 0
    );
}

function toTitleCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

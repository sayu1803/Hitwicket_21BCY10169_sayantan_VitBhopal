const ws = new WebSocket('ws://localhost:8080');
let playerId = null; // Will be assigned by the server
let gameState = null; // Current game state

let moveHistory = [];

// Establish WebSocket connection
ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

// Handle incoming messages from the server
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
        case 'init':
            playerId = message.playerId;
            console.log(`You are ${playerId}`);
            break;
        case 'name':
            handleNameEntry(message.message);
            break;
        case 'setup':
            handleCharacterSetup(message.message);
            break;
        case 'update':
            gameState = message.gameState;
            console.log('Game state updated:', gameState);
            renderBoard();
            updateTurnIndicator();
            renderMoveHistory();
            showPlayerNames();
            break;
        case 'error':
            alert(message.message);
            break;
        case 'gameover':
            alert(`Game Over! ${message.winner} wins! Wow!`);
            break;
        default:
            console.error('Unknown message type:', message.type);
    }
};

function submitName() {
    const name = document.getElementById('playerNameInput').value;
    if (name) {
        ws.send(JSON.stringify({ type: 'name', playerId, name }));
        document.getElementById('nameForm').style.display = 'none';
    } else {
        alert('Please enter a name');
    }
}


function showPlayerNames() {
    const player1Name = gameState.playerNames.P1 || 'Player 1';
    const player2Name = gameState.playerNames.P2 || 'Player 2';
    
    document.getElementById('player1Name').innerText = player1Name;
    document.getElementById('player2Name').innerText = player2Name;
}

function handleCharacterSetup(message) {
    const characters = prompt(message);
    if (characters) {
        ws.send(JSON.stringify({ type: 'setup', playerId, characters: characters.split(',') }));
    }
}


// Send move command to the server

function sendMove(move) {
    if (!playerId) return;
    ws.send(JSON.stringify({ type: 'move', playerId, move }));
    moveHistory.push(move); 
}

function renderMoveHistory() {
    const historyElement = document.getElementById('moveHistory');
    historyElement.innerHTML = '';

    moveHistory.forEach((move, index) => {
        const moveDiv = document.createElement('div');
        moveDiv.innerText = `${index + 1}: ${move}`;
        historyElement.appendChild(moveDiv);
    });
}

// Handle player name entry
function handleNameEntry(message) {
    if (message.startsWith('Enter your name')) {
        const name = prompt(message);
        if (name) {
            ws.send(JSON.stringify({ type: 'name', playerId, name }));
        }
    } else {
        alert(message);
    }
}

// Render the 5x5 game board
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear previous board

    gameState.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.textContent = cell ? cell : '';
            if (cell) {
                cellDiv.classList.add(cell.split('-')[1].toLowerCase()); // Add class based on character type
            }
            cellDiv.onclick = () => {
                if (gameState.currentPlayer === playerId && cell && cell.startsWith(playerId)) {
                    handleCharacterClick(cell, colIndex, rowIndex);
                }
            };
            boardElement.appendChild(cellDiv);
        });
    });
}


// Handle character click to make a move
function handleCharacterClick(character, x, y) {
    let validDirections = [];

    const charType = character.split('-')[1];
    
    if (charType === 'P') { // Pawn
        validDirections = ['L', 'R', 'F', 'B'];
    } else if (charType === 'R') { // Hero1
        validDirections = ['L', 'R', 'F', 'B'];
    } else if (charType === 'B') { // Hero2
        validDirections = ['FL', 'FR', 'BL', 'BR'];
    }

    const moveOptions = document.getElementById('moveOptions');
    moveOptions.innerHTML = ''; // Clear previous options

    validDirections.forEach(direction => {
        const button = document.createElement('button');
        button.innerText = direction;
        button.onclick = () => {
            sendMove(`${character}:${direction}`);
            moveOptions.innerHTML = ''; // Clear options after making a move
        };
        moveOptions.appendChild(button);
    });
}



// Update the UI to indicate whose turn it is
function updateTurnIndicator() {
    const turnIndicator = document.getElementById('turnIndicator');
    turnIndicator.innerText = `Current Turn: ${gameState.currentPlayer}`;
}

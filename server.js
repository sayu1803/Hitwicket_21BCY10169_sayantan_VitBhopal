const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// Initial game state
let gameState = {
    board: Array(5).fill().map(() => Array(5).fill(null)), // 5x5 grid
    players: {}, // Store players' data
    currentPlayer: null, // Track whose turn it is
    gameStatus: 'waiting', // 'waiting', 'playing', 'finished'
    playerNames: {} // Store player names
};

// Function to initialize the game state
function initializeGame() {
    gameState.board = Array(5).fill().map(() => Array(5).fill(null)); // 5x5 grid with null values
    gameState.players = {};
    gameState.currentPlayer = 'P1'; // Start with Player 1
    gameState.gameStatus = 'waiting';
    gameState.playerNames = {};
    console.log('Game state initialized:', gameState);
}

function handleCharacterPlacement(playerId, characters) {
    const row = playerId === 'P1' ? 0 : 4;
    for (let i = 0; i < characters.length; i++) {
        gameState.board[row][i] = `${playerId}-${characters[i]}`;
    }
    gameState.players[playerId].characters = characters;

    // Check if both players have placed their characters
    if (Object.keys(gameState.players).every(id => gameState.players[id].characters.length === 5)) {
        gameState.gameStatus = 'playing';
        broadcastGameState();
        console.log('All players have placed their characters. Game starting...');
        startGame();
    }
}

// Function to start the game
function startGame() {
    if (Object.keys(gameState.players).length === 2) {
        gameState.currentPlayer = 'P1';
        gameState.gameStatus = 'playing';
        console.log('Game started! Player P1 begins.');
        broadcastGameState();
    } else {
        console.log('Waiting for all players to join and deploy characters.');
    }
}

// Function to broadcast the updated game state to all connected clients
function broadcastGameState() {
    const stateMessage = JSON.stringify({
        type: 'update',
        gameState
    });

    Object.values(gameState.players).forEach(({ ws }) => {
        ws.send(stateMessage);
    });
}

// Function to handle incoming player moves
function handlePlayerMove(playerId, move) {
    const player = gameState.players[playerId];
    if (!player) return false; // Invalid player

    const [character, direction] = move.split(':');
    const position = findCharacterPosition(character);

    if (!position || !isValidMove(character, position, direction)) {
        return false; // Invalid move
    }

    applyMove(character, position, direction);
    checkGameOver();

    if (gameState.gameStatus !== 'finished') {
        switchTurn();
        broadcastGameState();
    }
    return true;
}

// Function to find the current position of a character on the board
function findCharacterPosition(character) {
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (gameState.board[y][x] === character) {
                return { x, y };
            }
        }
    }
    return null;
}

// Function to validate a move
function isValidMove(character, position, direction) {
    const { x, y } = position;
    const playerId = character.split('-')[0];
    const charType = character.split('-')[1];

    let newX = x, newY = y;

    // Calculate new position based on character type and direction
    if (charType === 'P') { // Pawn moves one step in any direction
        if (direction === 'L') newX -= 1;
        if (direction === 'R') newX += 1;
        if (direction === 'F') newY += (playerId === 'P1' ? 1 : -1); // P1 moves down, P2 moves up
        if (direction === 'B') newY += (playerId === 'P1' ? -1 : 1);
    } else if (charType === 'R') { // Hero1 moves two steps straight in any direction
        if (direction === 'L') newX -= 2;
        if (direction === 'R') newX += 2;
        if (direction === 'F') newY += (playerId === 'P1' ? 2 : -2);
        if (direction === 'B') newY += (playerId === 'P1' ? -2 : 2);
    } else if (charType === 'B') { // Hero2 moves two steps diagonally
        if (direction === 'FL') { newX -= 2; newY += (playerId === 'P1' ? 2 : -2); }
        if (direction === 'FR') { newX += 2; newY += (playerId === 'P1' ? 2 : -2); }
        if (direction === 'BL') { newX -= 2; newY += (playerId === 'P1' ? -2 : 2); }
        if (direction === 'BR') { newX += 2; newY += (playerId === 'P1' ? -2 : 2); }
    }

    // Check if the new position is within bounds
    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5) return false; // Out of bounds

    // Check if the target cell is occupied by the player's own piece
    const targetCell = gameState.board[newY][newX];
    if (targetCell && targetCell.startsWith(playerId)) return false; // Cannot move onto own piece

    return true; // The move is valid
}



// Function to apply the move to the game state
function applyMove(character, position, direction) {
    const { x, y } = position;
    let newX = x, newY = y;

    const playerId = character.split('-')[0];
    const charType = character.split('-')[1];

    // Calculate new position based on character type and direction
    if (charType === 'P') { // Pawn
        if (direction === 'L') newX -= 1;
        if (direction === 'R') newX += 1;
        if (direction === 'F') newY += (playerId === 'P1' ? 1 : -1);
        if (direction === 'B') newY += (playerId === 'P1' ? -1 : 1);
    } else if (charType === 'R') { // Hero1
        if (direction === 'L') newX -= 2;
        if (direction === 'R') newX += 2;
        if (direction === 'F') newY += (playerId === 'P1' ? 2 : -2);
        if (direction === 'B') newY += (playerId === 'P1' ? -2 : 2);
    } else if (charType === 'B') { // Hero2
        if (direction === 'FL') { newX -= 2; newY += (playerId === 'P1' ? 2 : -2); }
        if (direction === 'FR') { newX += 2; newY += (playerId === 'P1' ? 2 : -2); }
        if (direction === 'BL') { newX -= 2; newY += (playerId === 'P1' ? -2 : 2); }
        if (direction === 'BR') { newX += 2; newY += (playerId === 'P1' ? -2 : 2); }
    }

    // Apply the move only if it's valid
    if (isValidMove(character, { x: newX, y: newY })) {
        gameState.board[y][x] = null; // Clear old position
        gameState.board[newY][newX] = character; // Set new position
    }
}



// Function to switch turns between players
function switchTurn() {
    gameState.currentPlayer = gameState.currentPlayer === 'P1' ? 'P2' : 'P1';
}

// Function to check if the game is over
function checkGameOver() {
    const remainingP1 = countRemainingCharacters('P1');
    const remainingP2 = countRemainingCharacters('P2');

    if (remainingP1 === 0 || remainingP2 === 0) {
        gameState.gameStatus = 'finished';
        const winner = remainingP1 > 0 ? 'P1' : 'P2';
        broadcastGameOver(winner);
    }
}

// Function to count remaining characters for a player
function countRemainingCharacters(playerId) {
    let count = 0;
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (gameState.board[y][x] && gameState.board[y][x].startsWith(playerId)) {
                count++;
            }
        }
    }
    return count;
}

// Function to broadcast the game over message
function broadcastGameOver(winner) {
    const gameOverMessage = JSON.stringify({
        type: 'gameover',
        winner
    });

    Object.values(gameState.players).forEach(({ ws }) => {
        ws.send(gameOverMessage);
    });
}

// Function to handle player name entry
function handlePlayerName(ws, playerId, name) {
    gameState.playerNames[playerId] = name;

    if (Object.keys(gameState.playerNames).length === 2) {
        // Notify both players to place their characters
        Object.values(gameState.players).forEach(({ ws }) => {
            ws.send(JSON.stringify({ type: 'setup', message: 'Place your characters (e.g., P,P,P,R,B)' }));
        });
        gameState.gameStatus = 'setup';
    } else {
        // Notify the other player to enter their name
        const nextPlayer = playerId === 'P1' ? 'P2' : 'P1';
        const nextPlayerName = gameState.playerNames[nextPlayer];
        if (!nextPlayerName) {
            ws.send(JSON.stringify({ type: 'name', message: `Waiting for ${nextPlayer} to enter their name.` }));
        }
    }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Add the new player
    const playerCount = Object.keys(gameState.players).length;
    const playerId = playerCount < 2 ? (playerCount === 0 ? 'P1' : 'P2') : null;

    if (playerId) {
        gameState.players[playerId] = { ws, id: playerId, characters: [] };
        ws.send(JSON.stringify({ type: 'init', playerId }));
        console.log(`${playerId} connected. Current players:`, Object.keys(gameState.players));
        
        // Notify the current player to enter their name
        ws.send(JSON.stringify({ type: 'name', message: `Enter your name (${playerId}):` }));
    } else {
        // Handle additional clients as new players
        const newPlayerId = playerCount === 0 ? 'P1' : 'P2';
        gameState.players[newPlayerId] = { ws, id: newPlayerId, characters: [] };
        ws.send(JSON.stringify({ type: 'init', playerId: newPlayerId }));
        console.log(`${newPlayerId} connected. Current players:`, Object.keys(gameState.players));
    }

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        if (parsedMessage.type === 'name') {
            const { playerId, name } = parsedMessage;
            handlePlayerName(ws, playerId, name);
        }
        else if (parsedMessage.type === 'setup') {
            const { playerId, characters } = parsedMessage;
            handleCharacterPlacement(playerId, characters);
        }
        else if (parsedMessage.type === 'move') {
            const { playerId, move } = parsedMessage;
            if (!handlePlayerMove(playerId, move)) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
            }
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        if (gameState.gameStatus === 'playing') {
            initializeGame();
            broadcastGameState(); // Notify remaining players
        }
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

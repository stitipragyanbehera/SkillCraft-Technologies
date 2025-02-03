let squares = Array(9).fill('');
let xIsNext = true;
let xPlayer = 'human';
let oPlayer = 'human';

const board = document.getElementById('board');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const playerXSelect = document.getElementById('player-x');
const playerOSelect = document.getElementById('player-o');

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

function evaluateBoard(squares, depth) {
    const winner = calculateWinner(squares);
    if (winner === 'X') return -100 + depth;
    if (winner === 'O') return 100 - depth;
    
    // Evaluate based on strategic positions
    let score = 0;
    const strategicPositions = [0, 2, 6, 8]; // Corners
    const centerPosition = 4;
    
    for (let pos of strategicPositions) {
        if (squares[pos] === 'O') score += 3;
        if (squares[pos] === 'X') score -= 3;
    }
    
    if (squares[centerPosition] === 'O') score += 5;
    if (squares[centerPosition] === 'X') score -= 5;
    
    return score;
}

function minimax(squares, depth, isMaximizing, alpha, beta) {
    const score = evaluateBoard(squares, depth);
    if (score !== 0 || squares.every(square => square)) return score;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < squares.length; i++) {
            if (!squares[i]) {
                squares[i] = 'O';
                const score = minimax(squares, depth + 1, false, alpha, beta);
                squares[i] = '';
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < squares.length; i++) {
            if (!squares[i]) {
                squares[i] = 'X';
                const score = minimax(squares, depth + 1, true, alpha, beta);
                squares[i] = '';
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    }
}

function getEmptySquares(squares) {
    return squares.reduce((acc, val, idx) => {
        if (val === '') acc.push(idx);
        return acc;
    }, []);
}

function isForking(squares, player) {
    const emptySquares = getEmptySquares(squares);
    let forkCount = 0;
    for (let i of emptySquares) {
        squares[i] = player;
        const winningMoves = getEmptySquares(squares).filter(j => {
            squares[j] = player;
            const isWin = calculateWinner(squares) === player;
            squares[j] = '';
            return isWin;
        });
        squares[i] = '';
        if (winningMoves.length >= 2) forkCount++;
    }
    return forkCount > 0;
}

function computerMove() {
    // Opening moves
    if (squares.filter(Boolean).length === 0) {
        const openingMoves = [0, 2, 6, 8, 4]; // Prefer corners and center
        return openingMoves[Math.floor(Math.random() * openingMoves.length)];
    }

    const currentPlayer = xIsNext ? 'X' : 'O';
    const opponent = xIsNext ? 'O' : 'X';
    
    // Check for immediate win
    for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
            squares[i] = currentPlayer;
            if (calculateWinner(squares) === currentPlayer) {
                squares[i] = '';
                return i;
            }
            squares[i] = '';
        }
    }
    
    // Block opponent's win
    for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
            squares[i] = opponent;
            if (calculateWinner(squares) === opponent) {
                squares[i] = '';
                return i;
            }
            squares[i] = '';
        }
    }
    
    // Check for forking move
    for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
            squares[i] = currentPlayer;
            if (isForking(squares, currentPlayer)) {
                squares[i] = '';
                return i;
            }
            squares[i] = '';
        }
    }
    
    // Block opponent's fork
    const opponentForks = getEmptySquares(squares).filter(i => {
        squares[i] = opponent;
        const forking = isForking(squares, opponent);
        squares[i] = '';
        return forking;
    });
    
    if (opponentForks.length === 1) {
        return opponentForks[0];
    } else if (opponentForks.length > 1) {
        // Force opponent to defend
        for (let i = 0; i < squares.length; i++) {
            if (!squares[i] && !opponentForks.includes(i)) {
                squares[i] = currentPlayer;
                let forcedDefense = true;
                for (let j = 0; j < squares.length; j++) {
                    if (!squares[j] && i !== j) {
                        squares[j] = opponent;
                        if (calculateWinner(squares) !== currentPlayer) {
                            forcedDefense = false;
                        }
                        squares[j] = '';
                    }
                }
                squares[i] = '';
                if (forcedDefense) return i;
            }
        }
    }

    // Use minimax for other moves
    let bestScore = xIsNext ? Infinity : -Infinity;
    let bestMoves = [];
    for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
            squares[i] = currentPlayer;
            const score = minimax(squares, 0, !xIsNext, -Infinity, Infinity);
            squares[i] = '';
            if ((xIsNext && score < bestScore) || (!xIsNext && score > bestScore)) {
                bestScore = score;
                bestMoves = [i];
            } else if (score === bestScore) {
                bestMoves.push(i);
            }
        }
    }
    
    // Add some randomness to equivalent moves
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
        return;
    }
    makeMove(i);
}

function makeMove(i) {
    squares[i] = xIsNext ? 'X' : 'O';
    xIsNext = !xIsNext;
    updateBoard();
    checkGameState();

    if (!calculateWinner(squares) && !squares.every(square => square)) {
        if ((xIsNext && xPlayer === 'computer') || (!xIsNext && oPlayer === 'computer')) {
            setTimeout(() => {
                const move = computerMove();
                makeMove(move);
            }, 500);
        }
    }
}

function updateBoard() {
    board.innerHTML = '';
    squares.forEach((square, i) => {
        const button = document.createElement('button');
        button.className = 'square';
        button.textContent = square;
        button.addEventListener('click', () => handleClick(i));
        board.appendChild(button);
        
        if (square) {
            gsap.from(button, {
                scale: 0,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        }
    });
}

function checkGameState() {
    const winner = calculateWinner(squares);
    const isDraw = !winner && squares.every(square => square);

    if (winner) {
        status.textContent = `Winner: ${winner}`;
    } else if (isDraw) {
        status.textContent = "It's a tie!";
    } else {
        status.textContent = `Next player: ${xIsNext ? 'X' : 'O'}`;
    }
}

function resetGame() {
    squares = Array(9).fill('');
    xIsNext = true;
    updateBoard();
    checkGameState();
    
    if (xPlayer === 'computer') {
        setTimeout(() => {
            const move = computerMove();
            makeMove(move);
        }, 500);
    }
}

playerXSelect.addEventListener('change', (e) => {
    xPlayer = e.target.value;
    resetGame();
});

playerOSelect.addEventListener('change', (e) => {
    oPlayer = e.target.value;
    resetGame();
});

resetButton.addEventListener('click', resetGame);

// Initial setup
updateBoard();
checkGameState();

if (xPlayer === 'computer') {
    setTimeout(() => {
        const move = computerMove();
        makeMove(move);
    }, 500);
}

// Animations
gsap.to('#game-container', { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
gsap.to('#status', { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
gsap.to('#board', { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" });
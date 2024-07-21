const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = '7393195633:AAFYYNeD5ozHPiHyvy6l3V16g87Vge-7Jx4';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let games = {};

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/move', async (req, res) => {
    const { index, chatId } = req.body;
    const game = games[chatId];

    if (!game || !game.gameActive) {
        res.json({ message: "No active game. Use /start to begin a new game." });
        return;
    }

    if (game.board[index] === '' && index >= 0 && index < 9) {
        game.board[index] = game.currentPlayer;

        if (checkWinner(game.board)) {
            game.gameActive = false;
            res.json({ message: `Player ${game.currentPlayer} wins!`, board: game.board });
        } else if (game.board.every(cell => cell !== '')) {
            game.gameActive = false;
            res.json({ message: "Game ended in a draw!", board: game.board });
        } else {
            game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
            if (game.currentPlayer === 'O' && game.mode === 'bot') {
                botMove(chatId);
            }
            res.json({ message: `Player ${game.currentPlayer}'s turn.`, board: game.board });
        }
    } else {
        res.json({ message: "Invalid move. Use /move <cell_number> (0-8).", board: game.board });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

function startGame(chatId) {
    games[chatId] = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameActive: true,
        mode: 'human'
    };
}

function setGameMode(chatId, mode) {
    if (mode !== 'human' && mode !== 'bot') {
        sendMessage(chatId, "Invalid

# [Ultimate Tic-Tac-Toe](https://uttt.ibll.dev)

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/assets/preview-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="client/assets/preview-light.png">
    <img alt="A screenshot of the game, depicting tic-tac-toe boards nested inside the cells of other tic-tac-toe cells. X's and O's are placed randomly at different levels of depth in the board." src="client/assets/preview-light.png">
</picture>

This is a node.js based server that serves an arbitrary-depth tic-tac-toe game to a browser client.

The most common Tic-Tac-Toe variant, a 2-layer "Ultimate Tic-Tac-Toe", is a game with simple rules that enable complex
gameplay — and gameplay closer to Chess than it does to normal Tic-Tac-Toe. Versions with more layers are playable in
the same fashion, but can get more tedious than they are fun. I created this because I hadn't seen a web version for
deeper than 2 layers, and it gets hard to keep track of where to play next
when [playing it on a whiteboard](client/assets/whiteboard.jpeg)!

# UI Showcase

<img alt="An image showing different screenshots of the game." src="client/assets/ui-showcase.png">

# Installation and Running

- Ensure you have [Node.js](https://nodejs.org/) installed on your machine!
- Clone the repo and navigate to its directory
- Run `npm install`
- To use a custom port, use `export PORT=3000`
- Run `npm start`
- Open `http://localhost:3000` in your browser
- To play with another device on the same network, find the local IP of the machine running the server and connect to
- it. (It should look something like `http://XXX.XXX.XXX.XXX:3000/` in your browser)

# How to Play

Ultimate Tic-Tac-Toe is relatively simple. You draw a Tic-Tac-Toe board, and draw another Tic-Tac-Toe board in each of
the cells! And, just like in normal Tic-Tac-Toe, your goal is to get a 3-in-a-row.

Each player can only directly place into the smallest level cells, and earn the higher-level boards by winning them!
Easy, right?

There is one catch! When you make a move, your opponent is sent to another board relatively to where you placed your
piece.

In the example below, X played her first move in the bottom-left of a mini-board. O's next turn is then restricted to
only being within the bottom-left board!

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/assets/tutorial-1-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="client/assets/tutorial-1-light.png">
    <img alt="A tic-tac-toe board with tic-tac-toe boards in each cell. One of the mini-boards has an X in the bottom-left corner, and the entire bottom-left mini board is highlighted green." src="client/assets/tutorial-1-light.png" width="400">
</picture>

This means that the most important aspect of your turn might not be where your piece goes, but where your opponent can
go next!

One last thing for Ultimate Tic-Tac-Toe: sending your opponent to a board that's already been claimed lets them go
anywhere! This makes games end much faster than they start, as it gets harder and harder to avoid giving your opponent
the opportunity to go anywhere they'd like!

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/assets/tutorial-2-dark.gif">
    <source media="(prefers-color-scheme: light)" srcset="client/assets/tutorial-2-light.gif">
    <img alt="A gif demonstrating that being sent to a claimed board lets you go anywhere." src="client/assets/tutorial-2-light.gif" width="400">
</picture>

## Ultimate ULTIMATE Tic-Tac-Toe

If you want to play Ultimate Ultimate Tic-Tac-Toe, there's one more thing to note! Winning a mini-board does exactly
what happens in UTTT: your opponent is sent to that board. But, because there's more than 2 layers here, they get sent
to the mini-board relative to the *cell* you played to get the win as well!

The gif below begins zoomed in on the top-centre board before X has her turn. When she wins the small **right-centre**
board by placing her piece in the **top-right** cell, we zoom out to the rest of the board.

Her opponent must then play in the **right-centre** UTTT board, in the **top-right** TTT board. Play would then continue
in the right-centre board until another board is won.

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/assets/tutorial-3-dark.gif">
    <source media="(prefers-color-scheme: light)" srcset="client/assets/tutorial-3-light.gif">
    <img alt="A gif demonstrating multi-level sending." src="client/assets/tutorial-3-light.gif" width="400">
</picture>

## Endless Mode

If you're feeling particularly masochistic, you can start an endless game! There are no winners, only losers. The game
begins with a classic 3x3 Tic-Tac-Toe game. When won, this board is shrunken down to one ninth of the next layer. This
happens until the game is unplayably small, your browser crashes, or somebody quits.

Notice that the previous board shrinks to the **last cell** that was won. In the example below, X plays in the **middle
right** cell. That board then becomes the **middle right** sub-board.

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/assets/tutorial-4-dark.gif">
    <source media="(prefers-color-scheme: light)" srcset="client/assets/tutorial-4-light.gif">
    <img alt="A gif demonstrating endless mode." src="client/assets/tutorial-4-light.gif" width="400">
</picture>

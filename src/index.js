import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { drawLegalMoves, calculateMove, calculateWinner, writeMove } from './moves.js';
import { calculateWeight } from './weight.js';

// The function square returns a square-shaped button with its particular value
function Square(props) {
    return (
        <button className={props.move1 ? "square move1" : (props.legalMoves ? "square legalMoves" : props.color ? "square" : "square black")}
            onClick={props.onClick} >
            <img width="60" height="60" alt="piece" src={props.src} />
        </button>
    );
}
function getURL(value) {
    let valueURL = "";
    switch (value) {
        case "P": valueURL = "PB.png"; break;
        case "p": valueURL = "PN.png"; break;
        case "T": valueURL = "TB.png"; break;
        case "t": valueURL = "TN.png"; break;
        case "C": valueURL = "CB.png"; break;
        case "c": valueURL = "CN.png"; break;
        case "A": valueURL = "AB.png"; break;
        case "a": valueURL = "AN.png"; break;
        case "D": valueURL = "QB.png"; break;
        case "d": valueURL = "QN.png"; break;
        case "R": valueURL = "KB.png"; break;
        case "r": valueURL = "KN.png"; break;
        default: valueURL = "blank.png"; break;
    }
    return valueURL
}
// The class board creates a board with all the squares
class Board extends React.Component {
    // To render a single square, board pass along the properties and functions of the game
    renderSquare(i, bool) {
        return (
            <Square
                // It's necesary to asign a unique key to elements generated iteratively <- Word of the day
                key={i}
                // The value and the function onClick are passed along
                color={(Math.floor(i / 8) + i % 8) % 2 === 0}
                src={getURL(this.props.values[i])}
                onClick={() => this.props.onClick(i)}
                move1={this.props.move1 === i}
                legalMoves={this.props.legalMoves.includes(i)}
            />
        );
    }
    render() {
        // Create empty array variables that will contain HTML
        let rows = [];
        let squares = [];
        const n = 8;
        // For each row
        for (let i = 0; i < n; i++) {
            // for each square in the row
            for (let j = i * n; j < (i + 1) * n; j++) {
                // add the specific square to the array of quares
                squares.push(this.renderSquare(j));
            }
            // add the array of squares as a row to the array of rows
            rows.push(<div className="board-row" key={i}>{squares}</div>);
            // Empty the array of squares for the next loop
            squares = [];
        }
        // Enclose the array of rows in a div and return the result
        return <div>{rows}</div>
    }
}

// The class game creates all the elements of the game including the board, game info, moves and more
class Game extends React.Component {
    // The constructor creates the initial state of the game
    constructor(props) {
        super(props);
        let values = ["t", "c", "a", "d", "r", "a", "c", "t"];
        values = values.concat(Array(8).fill("p"));
        values = values.concat(Array(32).fill(null));
        values = values.concat(Array(8).fill("P"));
        values = values.concat(["T", "C", "A", "D", "R", "A", "C", "T"]);
        values = values.concat([true, true, true, true]); // Castling (64-67)
        this.state = {
            size: 8, // Initial size
            history: [{
                values: values, // value of the squares ( O, S or null)
                move: "", // Notation of the move
            }],
            piece: "", // the piece that is moving this turn
            move1: null, // the number of the square the piece moved from this turn
            legalMoves: [],
            stepNumber: 0, // number of moves taken
            winner: "", // Winner ("", P1, P2 or Draw)
            toggle: false, // Change order of the moves list
            computerAI: true,
        };
    }
    // Fuction to go back to a previous move in the list of moves
    jumpTo(step) {
        this.setState({
            // The history after the move selected is deleted
            history: this.state.history.slice(0, step + 1),
            // The stepNumber is adjusted
            stepNumber: step,
            // If the winner was determined, it's deleted
            winner: "",
        });
    }
    // Function that determines what happens when a square is clicked
    handleClick(i) {
        // We consider the last set of values in the history of the game
        let currentVal = this.state.history[this.state.stepNumber].values.slice();
        const turnW = this.state.stepNumber % 2 === 0;
        if ((/[PTCADR]/.test(currentVal[i]) && turnW) || (/[ptcadr]/.test(currentVal[i]) && !turnW)) {
            const move1 = i;
            const piece = currentVal[i];
            const legalMoves = drawLegalMoves(move1, currentVal).slice();
            this.setState({
                piece: piece,
                move1: move1,
                legalMoves: legalMoves
            });
        } else if (this.state.legalMoves.includes(i)) {
            currentVal = calculateMove(this.state.piece, this.state.move1, i, currentVal);
            const winner = calculateWinner(currentVal, turnW, this.state.stepNumber)
            const prevMove2 = this.state.history[this.state.stepNumber].values[i];
            const move = writeMove(this.state.piece, this.state.move1, i, prevMove2, currentVal, turnW);
            this.setState({
                history: this.state.history.concat([{
                    values: currentVal,
                    move: move,
                }]),
                piece: "",
                move1: null,
                legalMoves: [],
                stepNumber: this.state.stepNumber + 1,
                winner: winner
            });
        } else {
            this.setState({
                piece: "",
                move1: null,
                legalMoves: [],
            });
        }
    }
    
    moveWithComputer(numMoves) {
        var t0 = performance.now();
        let history = this.state.history.slice();
        let stepNumber = this.state.stepNumber;
        let currentVal = history[stepNumber].values.slice();
        let winner;
        while ((stepNumber - this.state.stepNumber) < numMoves) {
            let m1 = [];
            let m2 = [];
            let w1 = [];
            const player1 = stepNumber % 2 === 0;
            let friendly;
            if (player1) {
                friendly = /[PTCADR]/;
            } else {
                friendly = /[ptcadr]/;
            }
            for (let i = 0; i < 64; i++) {
                if (friendly.test(currentVal[i])) {
                    const legalMoves = drawLegalMoves(i, currentVal);
                    for (let j = 0; j < legalMoves.length; j++) {
                        const piece = currentVal[i];
                        const currentVal1 = calculateMove(piece, i, legalMoves[j], currentVal);
                        const weight = calculateWeight(currentVal1, player1, 2);
                        m1 = m1.concat([i]);
                        m2 = m2.concat([legalMoves[j]]);
                        w1 = w1.concat([weight]);
                    }
                }
            }
            const moves = m1.length;
            const maxWeight = Math.max.apply(Math, w1);
            console.log(maxWeight);
            let bM = [];
            for(let i = 0; i < moves; i++) {
                if(w1[i] === maxWeight) {
                    bM = bM.concat([i]);
                }
            }
            const numBestMoves = bM.length;
            const chosenMove = bM[Math.floor(Math.random() * numBestMoves)];
            const move1 = m1[chosenMove];
            const move2 = m2[chosenMove];
            const piece = currentVal[move1];
            const prevMove2 = currentVal[move2];
            currentVal = calculateMove(piece, move1, move2, currentVal);
            const move = writeMove(piece, move1, move2, prevMove2, currentVal, player1);
            
            history = history.concat([{
                values: currentVal,
                move: move,
            }]);
            stepNumber++;
            winner = calculateWinner(currentVal, player1, stepNumber);

            if (winner) {
                break;
            }
        }
        this.setState({
            history: history,
            stepNumber: stepNumber,
            winner: winner
        });
        var t1 = performance.now();
        console.log("Call to MOVE took " + (t1 - t0) + " milliseconds.");
    }
    
    // Function that determines what happens when a different size of the board is selected
    handleChange = (event) => {
        // It calls th funtion resize with the value of the option selected
        this.resize(event.target.value);
    }
    // Function that renders a button to create a new game if the game is over
    renderReset(winner) {
        if (winner) {
            // When the button is clicked it calls the function resize to conserve the size selected
            return <button className="reset" onClick={() => this.setState(new Game().state)}>Nueva partida</button>
        }
    }
    // Function that displays the winner if there's one or the next turn player
    renderWinner(winner) {
        if (winner) {
            if (winner === "Tablas") {
                return <h2>Tablas</h2>
            }
            return <h2>Ganador: {winner}</h2>
        } else {
            return <h2>Turno: {this.state.stepNumber % 2 === 0 ? "Blancas" : "Negras"}</h2>
        }
    }
    // Function that renders a button that toggles the list of moves in case it's necessary number of moves > 1
    buttonToggle() {
        if (this.state.history.length > 2) {
            return (
                // When the button is clicked, it toggles the boolean state property toggle
                <div className="button-toggle">
                    <button onClick={() => this.setState({ toggle: !this.state.toggle })}>Invertir orden</button>
                </div>
            );
        }
    }
    // Function that generates two ordered lists, from the arrays "movesB" and "movesD"
    listToggle(toggle, movesB, movesD) {
        // If the parameter toggle is true, the lists are reversed
        if (toggle) {
            return (
                <div>
                    <ol>{movesB.slice(0, movesB.length - 1).reverse()}</ol>
                    <ol className="list-group">{movesD.slice(1, movesD.length).reverse()}</ol>
                </div>
            );
        } else {
            return (
                <div>
                    <ol>{movesB.slice(0, movesB.length - 1)}</ol>
                    <ol className="list-group">{movesD.slice(1, movesD.length)}</ol>
                </div>
            );
        }
    }
    render() {
        // Define the current state
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        // Create an array with a list elements containing buttons
        const movesB = history.map((step, move) => {
            // The first move is considered differently
            const back = move ?
                'Ir al movimiento número #' + move :
                'Ir al comienzo';
            return (
                // For each move, a button in a list is generated
                // when the button is clicked it calls the function jumpTo
                <li key={move} >
                    <button className="btn btn-secondary" onClick={() => this.jumpTo(move)}>{back}</button>
                </li>
            );
        });
        // Create an array with a list elements describing the moves
        const movesD = history.map((step, move) => {
            // There's a specific number that defines the move taken in each element of the history
            // It's the number of the square clicked to reach that state
            const i = history[move].move;
            // Description on the move taken based on the player who made the move and the square clicked
            const line = (move % 2 === 0 ? "Negras" : "Blancas") + " juegan " + i
            // Returns the description as a list item, the last one is remarked
            return (
                <li key={move} className={(move === history.length - 1) ? "list-group-item active" : "list-group-item"}>
                    {line}
                </li>
            );
        });
        return (
            <div className="game container-fluid">
                {/* Jumbotron */}
                <div className="jumbotron jumbotron-fluid">
                    <div className="container">
                        <h1 className="display-1">Ajedrez</h1>
                        <p className="lead">Juega al ajedrez contra otra persona o contra el ordenador</p>
                    </div>
                </div>
                {/* Game info */}
                <div className="row game-info">
                    <div className="col-4 status">
                        {this.renderWinner(this.state.winner)}
                    </div>
                    <div className="col-2">
                        <button className="btn btn-primary" disabled={!this.state.computerAI || this.state.winner}
                            onClick={() => this.moveWithComputer(1)}>Jugar (1)</button>
                    </div>
                    <div className="col-2">
                        <button className="btn btn-primary" disabled={!this.state.computerAI || this.state.winner}
                            onClick={() => this.moveWithComputer(20)}>Jugar (20)</button>
                    </div>
                    <div className="col-4">
                        <button className="btn btn-primary" onClick={() => this.setState({ computerAI: !this.state.computerAI })}>
                            {this.state.computerAI ? "Jugar contra otra persona" : "Jugar contra el ordenador"}</button>
                    </div>
                </div>
                <div className="row game">
                    {/* Board */}
                    <div className="game-board col-6">
                        <Board
                            values={current.values}
                            onClick={(i) => this.handleClick(i)}
                            move1={this.state.move1}
                            legalMoves={this.state.legalMoves}
                        />
                        <div className="button">
                            {this.renderReset(this.state.winner)}
                        </div>
                    </div>
                    {/* Lists of moves and buttons */}
                    <div className="game-moves col">
                        <h4>Lista de movimientos:</h4>
                        {this.buttonToggle()}
                        {this.listToggle(this.state.toggle, movesB, movesD)}
                    </div>
                </div>
            </div>
        );
    }
}

// ========================================

// Render the whole game with a particular size in the element with id root (index.html)
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
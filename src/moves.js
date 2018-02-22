export function drawMoves(move1, currentVal, castling) {
    const piece = currentVal[move1];
    let friendly;
    let enemy;
    if (/[PTCADR]/.test(piece)) {
        friendly = /[PTCADR]/;
        enemy = /[ptcadr]/;
    } else {
        friendly = /[ptcadr]/;
        enemy = /[PTCADR]/;
    }
    let validMoves = [];
    if (piece === "P") {
        validMoves = movesP(move1, currentVal, enemy);
    } else if (piece === "p") {
        validMoves = movesp(move1, currentVal, enemy);
    } else if (/[Tt]/.test(piece)) {
        validMoves = movesT(move1, currentVal, friendly, enemy);
    } else if (/[Cc]/.test(piece)) {
        validMoves = movesC(move1, currentVal, friendly);
    } else if (/[Aa]/.test(piece)) {
        validMoves = movesA(move1, currentVal, friendly, enemy);
    } else if (/[Dd]/.test(piece)) {
        validMoves = movesD(move1, currentVal, friendly, enemy);
    } else if (/[Rr]/.test(piece)) {
        validMoves = movesR(move1, currentVal, friendly, castling);
    }
    return validMoves;
}
export function drawLegalMoves(move1, currentVal) {
    const validMoves = drawMoves(move1, currentVal, true);
    const piece = currentVal[move1];
    let enemy;
    let king;
    if (/[PTCADR]/.test(currentVal[move1])) {
        king = "R";
        enemy = /[ptcadr]/;
    } else {
        king = "r";
        enemy = /[PTCADR]/;
    }
    let legalMoves = validMoves;
    let posK;
    for (let i = 0; i < legalMoves.length; i++) {
        let currentVal1 = currentVal.slice();
        currentVal1[move1] = null;
        currentVal1[legalMoves[i]] = piece;
        for (let j = 0; j < 64; j++) {
            if (currentVal1[j] === king) {
                posK = j;
            }
        }
        for (let j = 0; j < 64; j++) {
            if (enemy.test(currentVal1[j])) {
                const moves = drawMoves(j, currentVal1, true);
                if (moves.includes(posK)) {
                    legalMoves.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    }
    return legalMoves;
}
export function calculateMove(piece, move1, move2, currentVal) {
    let currentVal1 = currentVal.slice();
    currentVal1[move1] = null;
    currentVal1[move2] = piece;
    currentVal1 = castling(piece, move1, move2, currentVal1);
    currentVal1 = promotePawns(piece, move2, currentVal1);
    return currentVal1;
}
function castling(piece, move1, move2, currentVal) {
    let currentVal1 = currentVal.slice();
    if (currentVal[64] && piece === "R" && move2 === 58) {
        currentVal1[56] = null;
        currentVal1[59] = "T";
    } else if (currentVal[65] && piece === "R" && move2 === 62) {
        currentVal1[63] = null;
        currentVal1[61] = "T";
    } else if (currentVal[66] && piece === "r" && move2 === 2) {
        currentVal1[0] = null;
        currentVal1[3] = "t";
    } else if (currentVal[67] && piece === "r" && move2 === 6) {
        currentVal1[7] = null;
        currentVal1[5] = "t";
    }
    switch (move1) {
        case 60: currentVal1[64] = false; currentVal1[65] = false; break;
        case 4: currentVal1[66] = false; currentVal1[67] = false; break;
        case 56: currentVal1[64] = false; break;
        case 63: currentVal1[65] = false; break;
        case 0: currentVal1[66] = false; break;
        case 7: currentVal1[67] = false; break;
        default: break;
    }
    return currentVal1
}
function promotePawns(piece, move2, currentVal) {
    let currentVal1 = currentVal.slice();
    if (piece === "P" && Math.floor(move2 / 8) === 0) {
        currentVal1[move2] = "D";
    } else if (piece === "p" && Math.floor(move2 / 8) === 7) {
        currentVal1[move2] = "d";
    }
    return currentVal1;
}
export function writeMove(piece, move1, move2, prevMove2, currentVal, player) {
    const abc = "abcdefgh";
    let move = "";
    const capture = prevMove2 !== null;
    if (/[Pp]/.test(piece)) {
        if (capture) {
            move = abc.charAt(move1 % 8) + "x";
        }
    } else {
        move = piece.toUpperCase();
        if (capture) {
            move += "x";
        }
    }
    move += abc.charAt(move2 % 8) + (8 - Math.floor(move2 / 8));
    if (isCheck(currentVal, player)) {
        move += "+";
        if (!hasMoves(currentVal, player)) {
            move += "+";
        }
    }
    if ((move1 === 60 && move2 === 58) || (move1 === 4 && move2 === 2)) {
        move = "0-0-0";
    } else if ((move1 === 60 && move2 === 62) || (move1 === 4 && move2 === 6)) {
        move = "0-0";
    }
    return move;
}

function isCheck(currentVal, player) {
    const king = player ? "r" : "R";
    const friendly = player ? /[PTCADR]/ : /[ptcadr]/;
    let posK;
    for (let i = 0; i < 64; i++) {
        if (currentVal[i] === king) {
            posK = i;
            break;
        }
    }
    let moves;
    for (let i = 0; i < 64; i++) {
        if (friendly.test(currentVal[i])) {
            moves = drawMoves(i, currentVal, true);
            if (moves.includes(posK)) {
                return true;
            }
        }
    }
    return false;
}
function hasMoves(currentVal, player) {
    let enemy = player ? /[ptcadr]/ : /[PTCADR]/;
    for (let i = 0; i < 64; i++) {
        if (enemy.test(currentVal[i]) && drawLegalMoves(i, currentVal).length > 0) {
            return true;
        }
    }
    return false;
}

export function calculateWinner(currentVal, player1, stepNumber) {
    let winner = "";
    const moves = hasMoves(currentVal, player1);
    if (!moves) {
        const check = isCheck(currentVal, player1);
        if (check) {
            if (player1) {
                winner = "Blancas";
            }
            else {
                winner = "Negras";
            }
        } else {
            winner = "Tablas";
        }
    }
    for (let i = 0; i < 64; i++) {
        if (/[ptcadPTCAD]/.test(currentVal[i])) {
            break;
        }
        if (i === 63) {
            winner = "Tablas";
        }
    }
    if (stepNumber > 1000) {
        winner = "Tablas";
    }
    return winner;
}

function movesP(move1, currentVal, enemy) {
    let validMoves = [];
    if ((move1 - 8) >= 0) {
        if (currentVal[move1 - 8] === null) {
            validMoves = validMoves.concat([move1 - 8]);
            if (Math.floor(move1 / 8) === 6 && currentVal[move1 - 16] === null) {
                validMoves = validMoves.concat([move1 - 16]);
            }
        }
        if (move1 % 8 !== 7 && enemy.test(currentVal[move1 - 7])) {
            validMoves = validMoves.concat([move1 - 7]);
        }
        if (move1 % 8 !== 0 && enemy.test(currentVal[move1 - 9])) {
            validMoves = validMoves.concat([move1 - 9]);
        }
    }
    return validMoves;
}

function movesp(move1, currentVal, enemy) {
    let validMoves = [];
    if ((move1 + 8) < 64) {
        if (currentVal[move1 + 8] === null) {
            validMoves = validMoves.concat([move1 + 8]);

            if (Math.floor(move1 / 8) === 1 && currentVal[move1 + 16] === null) {
                validMoves = validMoves.concat([move1 + 16]);
            }
        }
        if (move1 % 8 !== 0 && enemy.test(currentVal[move1 + 7])) {
            validMoves = validMoves.concat([move1 + 7]);
        }
        if (move1 % 8 !== 7 && enemy.test(currentVal[move1 + 9])) {
            validMoves = validMoves.concat([move1 + 9]);
        }
    }
    // Captura al paso
    return validMoves;
}

function movesT(move1, currentVal, friendly, enemy) {
    let validMoves = [];
    const v = [-8, -1, 1, 8];
    const v2 = [0, -1, 1, 0];
    for (let i = 0; i < v.length; i++) {
        let move = move1;
        while ((move + v[i]) >= 0 && (move + v[i]) < 64 && Math.floor(move / 8) === Math.floor((move + v2[i]) / 8) && !friendly.test(currentVal[move + v[i]])) {
            move += v[i];
            validMoves = validMoves.concat([move]);
            if (enemy.test(currentVal[move])) {
                break;
            }
        }
    }
    return validMoves;
}

function movesC(move1, currentVal, friendly) {
    let validMoves = [];
    const v = [-17, -15, -10, -6, 6, 10, 15, 17];
    const v2 = [-1, 1, -2, 2, -2, 2, -1, 1];
    for (let i = 0; i < v.length; i++) {
        let move = move1 + v[i];
        if (move >= 0 && move < 64 && Math.floor(move1 / 8) === Math.floor((move1 + v2[i]) / 8) && !friendly.test(currentVal[move])) {
            validMoves = validMoves.concat([move]);
        }
    }
    return validMoves;
}

function movesA(move1, currentVal, friendly, enemy) {
    let validMoves = [];
    const v = [-9, -7, 7, 9];
    const v2 = [-1, 1, -1, 1];
    for (let i = 0; i < v.length; i++) {
        let move = move1;
        while ((move + v[i]) >= 0 && (move + v[i]) < 64 && Math.floor(move / 8) === Math.floor((move + v2[i]) / 8) && !friendly.test(currentVal[move + v[i]])) {
            move += v[i];
            validMoves = validMoves.concat([move]);
            if (enemy.test(currentVal[move])) {
                break;
            }
        }
    }
    return validMoves;
}

function movesD(move1, currentVal, friendly, enemy) {
    let validMoves = [];
    const v = [-9, -8, -7, -1, 1, 7, 8, 9];
    const v2 = [-1, 0, 1, -1, 1, -1, 0, 1];
    for (let i = 0; i < v.length; i++) {
        let move = move1;
        while ((move + v[i]) >= 0 && (move + v[i]) < 64 && Math.floor(move / 8) === Math.floor((move + v2[i]) / 8) && !friendly.test(currentVal[move + v[i]])) {
            move += v[i];
            validMoves = validMoves.concat([move]);
            if (enemy.test(currentVal[move])) {
                break;
            }
        }
    }
    return validMoves;
}
function movesR(move1, currentVal, friendly, castling) {
    let validMoves = [];
    const v = [-9, -8, -7, -1, 1, 7, 8, 9];
    const v2 = [-1, 0, 1, -1, 1, -1, 0, 1];
    for (let i = 0; i < v.length; i++) {
        const move = move1 + v[i];
        if (move >= 0 && move < 64 && Math.floor(move1 / 8) === Math.floor((move1 + v2[i]) / 8) && !friendly.test(currentVal[move])) {
            validMoves = validMoves.concat([move]);
        }
    }
    if (castling) {
        // O-O-O Whites
        if (currentVal[move1] === "R" && currentVal[64] && currentVal[56] === "T" && currentVal[57] === null && currentVal[58] === null && currentVal[59] === null) {
            for (let i = 0; i < 64; i++) {
                if (/[ptcadr]/.test(currentVal[i])) {
                    const moves = drawMoves(i, currentVal, false);
                    if (!moves.includes(57) && !moves.includes(58) && !moves.includes(59) && !moves.includes(60)) {
                        validMoves = validMoves.concat([58]);
                    }
                }
            }
        }
        // O-O Whites
        if (currentVal[move1] === "R" && currentVal[65] && currentVal[61] === null && currentVal[62] === null && currentVal[63] === "T") {
            for (let i = 0; i < 64; i++) {
                if (/[ptcadr]/.test(currentVal[i])) {
                    const moves = drawMoves(i, currentVal, false);
                    if (!moves.includes(60) && !moves.includes(61) && !moves.includes(62)) {
                        validMoves = validMoves.concat([62]);
                    }
                }
            }
        }
        // O-O-O Blacks
        if (currentVal[move1] === "r" && currentVal[66] && currentVal[0] === "T" && currentVal[1] === null && currentVal[2] === null && currentVal[3] === null) {
            for (let i = 0; i < 64; i++) {
                if (/[PTCADR]/.test(currentVal[i])) {
                    const moves = drawMoves(i, currentVal, false);
                    if (!moves.includes(1) && !moves.includes(2) && !moves.includes(3) && !moves.includes(4)) {
                        validMoves = validMoves.concat([2]);
                    }
                }
            }
        }
        // O-O Blacks
        if (currentVal[move1] === "r" && currentVal[67] && currentVal[5] === null && currentVal[6] === null  && currentVal[7] === "T") {
            for (let i = 0; i < 64; i++) {
                if (/[PTCADR]/.test(currentVal[i])) {
                    const moves = drawMoves(i, currentVal, false);
                    if (!moves.includes(4) && !moves.includes(5) && !moves.includes(6)) {
                        validMoves = validMoves.concat([6]);
                    }
                }
            }
        }
    }

    return validMoves;
}
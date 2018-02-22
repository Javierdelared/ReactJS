import { drawLegalMoves, calculateMove, calculateWinner } from './moves.js';

export function calculateWeight(currentVal, player, depth) {
    const w1 = 100; // Pieces
    const w2 = 10; // Moves
    const w3 = 1000000; // checkmate
    const w4 = 5; // attack
    const w5 = 20; // pawns
    return w1 * calculateWeight1(currentVal, player, depth) +
        w2 * calculateWeight2(currentVal, player) +
        w3 * calculateWeight3(currentVal, player) +
        w4 * calculateWeight4(currentVal, player) +
        w5 * calculateWeight5(currentVal, player);
}

function calculateWeight1(currentVal, player, depth) {
    let weight = 0;
    let friendly;
    let enemy;
    if (player) {
        friendly = /[PTCADR]/;
        enemy = /[ptcadr]/;
    } else {
        friendly = /[ptcadr]/;
        enemy = /[PTCADR]/;
    }
    if (depth === 0) {
        for (let i = 0; i < 64; i++) {
            if (friendly.test(currentVal[i])) {
                weight += pointPiece(currentVal[i]);
            } else if (enemy.test(currentVal[i])) {
                weight -= pointPiece(currentVal[i]);
            }
        }
    } else if (depth === 1) {
        let m1 = [];
        let m2 = [];
        let w1 = [];
        for (let i = 0; i < 64; i++) {
            if (enemy.test(currentVal[i])) {
                const legalMoves = drawLegalMoves(i, currentVal);
                for (let j = 0; j < legalMoves.length; j++) {
                    const piece = currentVal[i];
                    const currentVal1 = calculateMove(piece, i, legalMoves[j], currentVal);
                    const weight = calculateWeight1(currentVal1, !player, 0);
                    m1 = m1.concat([i]);
                    m2 = m2.concat([legalMoves[j]]);
                    w1 = w1.concat([weight]);
                }
            }
        }
        const moves = m1.length;
        const maxWeight = Math.max.apply(Math, w1);
        let bM = [];
        for (let i = 0; i < moves; i++) {
            if (w1[i] === maxWeight) {
                bM = bM.concat([i]);
            }
        }
        const numBestMoves = bM.length;
        const chosenMove = bM[Math.floor(Math.random() * numBestMoves)];
        const move1 = m1[chosenMove];
        const move2 = m2[chosenMove];
        const piece = currentVal[move1];
        const currentVal1 = calculateMove(piece, move1, move2, currentVal);
        weight = calculateWeight1(currentVal1, player, 0);

    }  else if (depth === 2) {
        let m1 = [];
        let m2 = [];
        let w1 = [];
        for (let i = 0; i < 64; i++) {
            if (enemy.test(currentVal[i])) {
                const legalMoves = drawLegalMoves(i, currentVal);
                for (let j = 0; j < legalMoves.length; j++) {
                    const piece = currentVal[i];
                    const currentVal1 = calculateMove(piece, i, legalMoves[j], currentVal);
                    const weight = calculateWeight1(currentVal1, !player, 1);
                    m1 = m1.concat([i]);
                    m2 = m2.concat([legalMoves[j]]);
                    w1 = w1.concat([weight]);
                }
            }
        }
        let moves = m1.length;
        let maxWeight = Math.max.apply(Math, w1);
        let bM = [];
        for (let i = 0; i < moves; i++) {
            if (w1[i] === maxWeight) {
                bM = bM.concat([i]);
            }
        }
        const numBestMoves = bM.length;
        const chosenMove = bM[Math.floor(Math.random() * numBestMoves)];
        const move1 = m1[chosenMove];
        const move2 = m2[chosenMove];
        const piece = currentVal[move1];
        const currentVal1 = calculateMove(piece, move1, move2, currentVal);
        m1 = [];
        m2 = [];
        w1 = [];
        for (let i = 0; i < 64; i++) {
            if (enemy.test(currentVal1[i])) {
                const legalMoves = drawLegalMoves(i, currentVal1);
                for (let j = 0; j < legalMoves.length; j++) {
                    const piece = currentVal1[i];
                    const currentVal2 = calculateMove(piece, i, legalMoves[j], currentVal1);
                    const weight = calculateWeight1(currentVal2, player, 1);
                    m1 = m1.concat([i]);
                    m2 = m2.concat([legalMoves[j]]);
                    w1 = w1.concat([weight]);
                }
            }
        }
        moves = m1.length;
        maxWeight = Math.max.apply(Math, w1);
        weight = maxWeight;
    }
    return weight;
}
function pointPiece(piece) {
    if (/[Pp]/.test(piece)) {
        return 1;
    } else if (/[Tt]/.test(piece)) {
        return 5;
    } else if (/[Cc]/.test(piece)) {
        return 3;
    } else if (/[Aa]/.test(piece)) {
        return 3;
    } else if (/[Dd]/.test(piece)) {
        return 10;
    } else if (/[Rr]/.test(piece)) {
        return 1;
    }
}
function calculateWeight2(currentVal, player) {
    let weight = 0;
    let friendly;
    if (player) {
        friendly = /[TCAD]/;
    } else {
        friendly = /[tcad]/;
    }
    for (let i = 0; i < 64; i++) {
        if (friendly.test(currentVal[i])) {
            weight += pointPiece(currentVal[i]) * drawLegalMoves(i, currentVal).length;
        }
    }
    return weight/100;
}

function calculateWeight3(currentVal, player) {
    let winner;
    if (player) {
        winner = "Blancas";
    } else {
        winner = "Negras";
    }
    const winner1 = calculateWinner(currentVal, player);
    const weight = calculateWeight1(currentVal, player, 0);
    if ( winner1 === winner || (winner1 === "Tablas" && weight < 0)) {
        return 1;
    } else if (winner1 === "Tablas" && weight > 0) {
        return -1;
    }
    return 0;
}

function calculateWeight4(currentVal, player) {
    let weight = 0;
    let friendly;
    let enemy;
    if (player) {
        friendly = /[PTCADR]/;
        enemy = /[ptcadR]/;
    } else {
        friendly = /[ptcadr]/;
        enemy = /[PTCADR]/;
    }
    for (let i = 0; i < 64; i++) {
        if (friendly.test(currentVal[i])) {
            const legalMoves = drawLegalMoves(i, currentVal);
            for (let j = 0; j < 64; j++) {
                if (enemy.test(currentVal[j]) && legalMoves.includes(j)) {
                    weight += pointPiece(currentVal[j]);
                }
            }
        }
    }
    return weight/10;
}
function calculateWeight5(currentVal, player) {
    let weight = 0;
    const pawn = /[Pp]/;
    for (let i = 0; i < 64; i++) {
        if (pawn.test(currentVal[i])) {
            if(player) {
                weight += (7 - Math.floor(i/8));
            } else {
                weight += Math.floor(i/8);
            }
        }
    }
    return weight/100;
}

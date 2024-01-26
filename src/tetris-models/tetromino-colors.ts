import { TetrominoType } from "./tetromino-type";

/*
 A board is represented by a 20x10 grid of cells. A cell can be empty or be filled with one of two color types.
 We can efficiently encode this in 400 bits (20 rows * 10 columns * 2 bits per cell).
*/
export enum ColorType {
    EMPTY = 0,
    PRIMARY = 1,
    SECONDARY = 2,
    WHITE = 3
}

export function getColorTypeForTetromino(tetrominoType: TetrominoType): ColorType {
    switch (tetrominoType) {
        case TetrominoType.I_TYPE:
        case TetrominoType.O_TYPE:
        case TetrominoType.T_TYPE:
            return ColorType.WHITE;
        case TetrominoType.J_TYPE:
        case TetrominoType.S_TYPE:
            return ColorType.PRIMARY;
        default:
            return ColorType.SECONDARY;
    }
}
let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* A rank on the chess board.
*/
export const Rank = Object.freeze({ _1:0,"0":"_1",_2:1,"1":"_2",_3:2,"2":"_3",_4:3,"3":"_4",_5:4,"4":"_5",_6:5,"5":"_6",_7:6,"6":"_7",_8:7,"7":"_8", });
/**
* A file on the chess board.
*/
export const File = Object.freeze({ _A:0,"0":"_A",_B:1,"1":"_B",_C:2,"2":"_C",_D:3,"3":"_D",_E:4,"4":"_E",_F:5,"5":"_F",_G:6,"6":"_G",_H:7,"7":"_H", });
/**
*/
export const CastlingState = Object.freeze({ None:0,"0":"None",All:15,"15":"All",White_OO:1,"1":"White_OO",White_OOO:2,"2":"White_OOO",Black_OO:4,"4":"Black_OO",Black_OOO:8,"8":"Black_OOO",White:3,"3":"White",Black:12,"12":"Black",Kingside:5,"5":"Kingside",Queenside:10,"10":"Queenside",White_OO__Black_OOO:9,"9":"White_OO__Black_OOO",White_OO__Black:13,"13":"White_OO__Black",White_OOO__Black_OO:6,"6":"White_OOO__Black_OO",White_OOO__Black:14,"14":"White_OOO__Black",White__Black_OO:7,"7":"White__Black_OO",White__Black_OOO:11,"11":"White__Black_OOO", });
/**
* Color of a square or piece.
*/
export const Color = Object.freeze({ White:0,"0":"White",Black:1,"1":"Black", });
/**
* A square on the chess board.
*/
export const Square = Object.freeze({ A1:0,"0":"A1",A2:1,"1":"A2",A3:2,"2":"A3",A4:3,"3":"A4",A5:4,"4":"A5",A6:5,"5":"A6",A7:6,"6":"A7",A8:7,"7":"A8",B1:8,"8":"B1",B2:9,"9":"B2",B3:10,"10":"B3",B4:11,"11":"B4",B5:12,"12":"B5",B6:13,"13":"B6",B7:14,"14":"B7",B8:15,"15":"B8",C1:16,"16":"C1",C2:17,"17":"C2",C3:18,"18":"C3",C4:19,"19":"C4",C5:20,"20":"C5",C6:21,"21":"C6",C7:22,"22":"C7",C8:23,"23":"C8",D1:24,"24":"D1",D2:25,"25":"D2",D3:26,"26":"D3",D4:27,"27":"D4",D5:28,"28":"D5",D6:29,"29":"D6",D7:30,"30":"D7",D8:31,"31":"D8",E1:32,"32":"E1",E2:33,"33":"E2",E3:34,"34":"E3",E4:35,"35":"E4",E5:36,"36":"E5",E6:37,"37":"E6",E7:38,"38":"E7",E8:39,"39":"E8",F1:40,"40":"F1",F2:41,"41":"F2",F3:42,"42":"F3",F4:43,"43":"F4",F5:44,"44":"F5",F6:45,"45":"F6",F7:46,"46":"F7",F8:47,"47":"F8",G1:48,"48":"G1",G2:49,"49":"G2",G3:50,"50":"G3",G4:51,"51":"G4",G5:52,"52":"G5",G6:53,"53":"G6",G7:54,"54":"G7",G8:55,"55":"G8",H1:56,"56":"H1",H2:57,"57":"H2",H3:58,"58":"H3",H4:59,"59":"H4",H5:60,"60":"H5",H6:61,"61":"H6",H7:62,"62":"H7",H8:63,"63":"H8", });
/**
* Type of piece. Real pieces have values 1..6.
*/
export const PieceType = Object.freeze({ Null:0,"0":"Null",Pawn:1,"1":"Pawn",Knight:2,"2":"Knight",Bishop:3,"3":"Bishop",Rook:4,"4":"Rook",Queen:5,"5":"Queen",King:6,"6":"King",
/**
* Represents a piece than has the movement of every other piece.
*/
Super:7,"7":"Super", });
/**
*/
export class ManagedKey {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_managedkey_free(ptr);
    }
    /**
    * @returns {bigint}
    */
    get key() {
        const ret = wasm.__wbg_get_managedkey_key(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} seed
    */
    constructor(seed) {
        const ret = wasm.managedkey_new(seed);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    */
    pushKey() {
        wasm.managedkey_pushKey(this.__wbg_ptr);
    }
    /**
    */
    popKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.managedkey_popKey(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    updateTurn() {
        wasm.managedkey_updateTurn(this.__wbg_ptr);
    }
    /**
    * @param {File} file
    */
    updateEnPassantFile(file) {
        wasm.managedkey_updateEnPassantFile(this.__wbg_ptr, file);
    }
    /**
    * @param {CastlingState} castling_state
    */
    updateCastlingState(castling_state) {
        wasm.managedkey_updateCastlingState(this.__wbg_ptr, castling_state);
    }
    /**
    * @param {Color} color
    * @param {PieceType} piece_type
    * @param {Square} square
    */
    updateSquareOccupancy(color, piece_type, square) {
        wasm.managedkey_updateSquareOccupancy(this.__wbg_ptr, color, piece_type, square);
    }
}
/**
*/
export class Stats {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Stats.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stats_free(ptr);
    }
    /**
    * @returns {number}
    */
    get hits() {
        const ret = wasm.__wbg_get_stats_hits(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get miss() {
        const ret = wasm.__wbg_get_stats_miss(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get type1() {
        const ret = wasm.__wbg_get_stats_type1(this.__wbg_ptr);
        return ret >>> 0;
    }
}
/**
*/
export class TTable {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TTable.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ttable_free(ptr);
    }
    /**
    * @param {bigint} seed
    */
    constructor(seed) {
        const ret = wasm.ttable_new(seed);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @returns {TTable}
    */
    get currentKey() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.ttable_currentKey(ptr);
        return TTable.__wrap(ret);
    }
    /**
    * @returns {Stats}
    */
    stats() {
        const ret = wasm.ttable_stats(this.__wbg_ptr);
        return Stats.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    get() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ttable_get(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {number}
    */
    getPtr() {
        const ret = wasm.ttable_getPtr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {bigint}
    */
    getAsU64() {
        const ret = wasm.ttable_getAsU64(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {Uint8Array} entry
    */
    set(entry) {
        const ptr0 = passArray8ToWasm0(entry, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.ttable_set(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {bigint}
    */
    get key() {
        const ret = wasm.ttable_key(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    */
    pushKey() {
        wasm.ttable_pushKey(this.__wbg_ptr);
    }
    /**
    */
    popKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ttable_popKey(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    updateTurn() {
        wasm.ttable_updateTurn(this.__wbg_ptr);
    }
    /**
    * @param {File} file
    */
    updateEnPassantFile(file) {
        wasm.ttable_updateEnPassantFile(this.__wbg_ptr, file);
    }
    /**
    * @param {CastlingState} castling_state
    */
    updateCastlingState(castling_state) {
        wasm.ttable_updateCastlingState(this.__wbg_ptr, castling_state);
    }
    /**
    * @param {Color} color
    * @param {PieceType} piece_type
    * @param {Square} square
    */
    updateSquareOccupancy(color, piece_type, square) {
        wasm.ttable_updateSquareOccupancy(this.__wbg_ptr, color, piece_type, square);
    }
}

export function __wbg_log_149115384f14aabc(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};


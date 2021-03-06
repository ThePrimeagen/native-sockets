import {
    FrameType,
    Flag,
} from './types';

/* FRAME HEADER
   +-----------------------------------------------+
   |                 Length (24)                   |
   +---------------+---------------+---------------+
   |   Type (8)    |   Flags (8)   |
   +-+-------------+---------------+-------------------------------+
   |R|                 Stream Identifier (31)                      |
   +=+=============================================================+
   |                   Frame Payload (0...)                      ...
   +---------------------------------------------------------------+
*/

const maxStreamIdentifier = 2147483647;
const tmpBuffer = new Uint8Array(4);
const tmpView = new DataView(tmpBuffer.buffer);

export const FRAME_HEADER_SIZE = 9;
export const FRAME_HEADER_FLAGS_OFFSET = 4;
export const FRAME_HEADER_TYPE_OFFSET = 3;

export function getLength(buffer: Uint8Array, offset: number = 0) {
    tmpBuffer[0] = 0;
    tmpBuffer[1] = buffer[offset];
    tmpBuffer[2] = buffer[offset + 1];
    tmpBuffer[3] = buffer[offset + 2];

    return tmpView.getUint32(0);
}

export function getType(buffer: Uint8Array, offset: number = 0) {
    return buffer[offset + FRAME_HEADER_TYPE_OFFSET];
}

// The length, of course, is a 24bit number.  Because... Numbers...
// TODO: SETTINGS_MAX_FRAME_SIZE this should be tested in the http2 class.
// (https://tools.ietf.org/html/rfc7540#section-4.1)
export function setLength(buffer: Uint8Array, length: number) {
    tmpView.setUint32(0, length);

    if (tmpBuffer[0] > 0) {
        throw new Error(`You cannot take me down, also your length is to much. ${length}`);
    }

    buffer[0] = tmpBuffer[1];
    buffer[1] = tmpBuffer[2];
    buffer[2] = tmpBuffer[3];
}

export function setType(buffer: Uint8Array, type: FrameType) {
    buffer[3] = type;
};

export function zeroFlags(buffer: Uint8Array) {
    buffer[FRAME_HEADER_FLAGS_OFFSET] = 0;
};

export function setFlags(buffer: Uint8Array, flags: Flag) {
    buffer[FRAME_HEADER_FLAGS_OFFSET] |= flags;
};

export function isAckFrame(buffer: Uint8Array, offset: number = 0) {
    return buffer[offset + FRAME_HEADER_FLAGS_OFFSET] & Flag.ACK;
}

export function setStreamIdentifier(buffer: Uint8Array, streamIdentifier: number) {
    if (streamIdentifier > maxStreamIdentifier) {
        throw new Error(`setStreamIdentifier received a streamIdentifier that is too large: ${streamIdentifier}`);
    }

    tmpView.setUint32(0, streamIdentifier);
    buffer[5] = tmpBuffer[0];
    buffer[6] = tmpBuffer[1];
    buffer[7] = tmpBuffer[2];
    buffer[8] = tmpBuffer[3];
};



function writeByte(byte, buffer, offset, mask = 0xFF, or = false) {
  // console.log(`writeByte: byte=${byte.toString(2)}, offset=${offset}, mask=${mask.toString(2)}, or=${or}`);
  if (buffer && offset < buffer.length) {
    if (or) {
      buffer[offset] |= (byte & mask);
    } else {
      buffer[offset] = byte & mask;
    }
  }
}

function writeCharacter(charCode, buffer, offset) {
  if (charCode < 0x80) {
    // 1 byte
    writeByte(charCode, buffer, offset++);
  } else if (charCode >= 0x80 && charCode < 0x8_00) {
    // 2 bytes
    writeByte(0xC0 | ((charCode >> 6) & 0x1F), buffer, offset++);
    writeByte(0x80 | (charCode & 0x3F), buffer, offset++);
  } else if (charCode >= 0x8_00 && charCode < 0x1_00_00) {
    // 3 bytes
    writeByte(0xE0 | ((charCode >> 12) & 0x0F), buffer, offset++);
    writeByte(0x80 | ((charCode >> 6) & 0x3F), buffer, offset++);
    writeByte(0x80 | (charCode & 0x3F), buffer, offset++);
  } else if (charCode >= 0x1_00_00 && charCode < 0x20_00_00) {
    // 4 bytes
    writeByte(0xF0 | ((charCode >> 18) & 0x07), buffer, offset++);
    writeByte(0x80 | ((charCode >> 12) & 0x3F), buffer, offset++);
    writeByte(0x80 | ((charCode >> 6) & 0x3F), buffer, offset++);
    writeByte(0x80 | (charCode & 0x3F), buffer, offset++);
  } else if (charCode >= 0x20_00_00 && charCode < 0x4_00_00_00) {
    // 5 bytes
    writeByte(0xF8 | ((charCode >> 24) & 0x03), buffer, offset++);
    writeByte(0x80 | ((charCode >> 18) & 0x3F), buffer, offset++);
    writeByte(0x80 | ((charCode >> 12) & 0x3F), buffer, offset++);
    writeByte(0x80 | ((charCode >> 6) & 0x3F), buffer, offset++);
    writeByte(0x80 | (charCode & 0x3F), buffer, offset++);
  } else if (charCode >= 0x4_00_00_00 && charCode < 0x80_00_00_00) {
    // 6 bytes
    writeByte(0xFC | ((charCode >> 30) & 0x01), buffer, offset++);
    writeByte(0x80 | ((charCode >> 24) & 0x3F), buffer, offset++);
    writeByte(0x80 | ((charCode >> 18) & 0x3F), buffer, offset++);
    writeByte(0x80 | ((charCode >> 12) & 0x3F), buffer, offset++);
    writeByte(0x80 | ((charCode >> 6) & 0x3F), buffer, offset++);
    writeByte(0x80 | (charCode & 0x3F), buffer, offset++);
  } else {
    console.error('Writer.writeCharacter: Invalid char code - ' + charCode);
  }
  return offset;
}

function writeString(str, buffer, offset, length) {
  const lowerLimit = offset + (length || 0);
  const upperLimit = offset + (length || (buffer ? buffer.length : Number.POSITIVE_INFINITY));

  for (let i = 0; i < str.length; i++) {
    offset = writeCharacter(str.codePointAt(i), buffer, offset);
    if (offset > upperLimit) {
      offset = upperLimit;
      break;
    }
  }

  // padding
  while (offset < lowerLimit) {
    writeByte(0, buffer, offset++);
  }
  return offset;
}

function writeNumber(num, buffer, offset, length = 4) {
  const left = num / 4_294_967_296;
  const right = num % 4_294_967_296;

  let byte, i;

  if (num >= 0 && length > 4) {
    for (i = length - 4 - 1; i >= 0; i--) {
      byte = (left >> (8 * i)) & 0xFF;
      writeByte(byte, buffer, offset++);
    }
    length = 4;
  }

  for (i = length - 1; i >= 0; i--) {
    byte = (right >> (8 * i)) & 0xFF;
    writeByte(byte, buffer, offset++);
  }

  return offset;
}

function makeBitMask(start, end) {
  let mask = 0;

  for (let i = start; i < end; i++) {
    mask |= (1 << (8 - i - 1));
  }
  return mask;
}

function writeBits(value, buffer, bitOffset, totalBitsToWrite) {
  // console.log(`writeBits: Enter. value=${value}, buffer.length=${buffer.length}, bitOffset=${bitOffset}, totalBitsToWrite=${totalBitsToWrite}`);
  let offset = Math.floor(bitOffset / 8);
  let start = bitOffset % 8;
  let remainingBits = totalBitsToWrite;
  let len, mask, byte, oddBitsNum = 0;

  while (remainingBits > 0) {
    len = Math.min(remainingBits, 8 - start);
    byte = (value >>> Math.max(remainingBits - 8, 0)) & 0xFF; // Extracting leading 8 bits
    mask = makeBitMask(start, start + len);
    writeByte((byte << (8 - start - len)) & 0xFF, buffer, offset, mask, Boolean(start));
    remainingBits -= len;
    bitOffset += len;
    oddBitsNum = Math.max(8 - start - len, 0);
    if (oddBitsNum) {
      break;
    }
    offset++;
    start = 0;
  }
  // console.log(`writeBits: Exit. bitOffset=${bitOffset}`);
  return bitOffset;
}

function writeFixedNumber(num, buffer, offset, length = 4) {
  const left = num > 0 ? Math.floor(num) : Math.ceil(num);
  const halfBitsNum = Math.min(length, 8) * 8 / 2;

  let right = Number.parseFloat('0.' + String(num).split('.')[1]);
  let bitOffset = 0;

  // console.log(`writeFixedNumber(${num} ${offset} ${length})`);

  bitOffset = writeBits(left, buffer, offset * 8 + bitOffset, halfBitsNum);

  if (halfBitsNum === 28 && right >= 0.999_999_9) { // ugly
    right = 0xFF_FF_FF_FF;
  } else if (halfBitsNum === 32 && right >= 0.999_999) { // ugly
    right = 0xFF_FF_FF_FF;
  } else {
    right = Math.round(right * (2 ** halfBitsNum));
  }

  bitOffset = writeBits(right, buffer, bitOffset, halfBitsNum);
  offset = Math.floor(bitOffset / 8);

  // console.log(`<<<< return ${offset};`);
  return offset;
}

function copyBuffer(src, srcOffset, dst, dstOffset, length = src.length - srcOffset) {
  if (!dst) {
    return dstOffset + length;
  }
  /* eslint n/prefer-global/buffer: [error] */
  if (global && global.Buffer) {
    src.copy(dst, dstOffset, srcOffset, srcOffset + length);
  } else {
    // src = new Uint8Array(src.buffer.slice(srcOffset, srcOffset + length));
    // dst.set(newSrc, dstOffset);
    for (let i = srcOffset, j = dstOffset; i < srcOffset + length; i++, j++) {
      dst[j] = src[i];
    }
  }
  return dstOffset + length;
}

const writer = {
  writeString,
  writeNumber,
  writeBits,
  writeFixedNumber,
  copyBuffer,
};

export default writer;

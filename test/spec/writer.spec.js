const test = require('ava');
const writer = require('../../writer');

const DEC4 = 15 / 16,
    DEC8 = 255 / 256,
    DEC12 = 4095 / 4096,
    DEC16 = 65535 / 65536,
    DEC20 = 1048575 / 1048576,
    DEC24 = 16777215 / 16777216,
    DEC28 = 268435455 / 268435456,
    DEC32 = 4294967295 / 4294967296,
    testData = {
      int8Zero: {
        buf: [0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int16Zero: {
        buf: [0, 0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int24Zero: {
        buf: [0, 0, 0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int32Zero: {
        buf: [0, 0, 0, 0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int40Zero: {
        buf: [0, 0, 0, 0, 0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int48Zero: {
        buf: [0, 0, 0, 0, 0, 0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int56Zero: {
        buf: [0, 0, 0, 0, 0, 0, 0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int64Zero: {
        buf: [0, 0, 0, 0, 0, 0, 0, 0],
        val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0}
      },
      int8X: {
        buf: [255],
        val: {signedInt: -1, unsignedInt: 255, signedDecimal: -1 - DEC4, unsignedDecimal: 15 + DEC4}
      },
      int16X: {
        buf: [255, 255],
        val: {signedInt: -1, unsignedInt: 65535, signedDecimal: -1 - DEC8, unsignedDecimal: 255 + DEC8}
      },
      int24X: {
        buf: [255, 255, 255],
        val: {signedInt: -1, unsignedInt: 16777215, signedDecimal: -1 - DEC12, unsignedDecimal: 4095 + DEC12}
      },
      int32X: {
        buf: [255, 255, 255, 255],
        val: {signedInt: -1, unsignedInt: 4294967295, signedDecimal: -1 - DEC16, unsignedDecimal: 65535 + DEC16}
      },
      int40X: {
        buf: [255, 255, 255, 255, 255],
        val: {signedInt: -1, unsignedInt: 1099511627775, signedDecimal: -1 - DEC20, unsignedDecimal: 1048575 + DEC20}
      },
      int48X: {
        buf: [255, 255, 255, 255, 255, 255],
        val: {signedInt: -1, unsignedInt: 281474976710655, signedDecimal: -1 - DEC24, unsignedDecimal: 16777215 + DEC24}
      },
      int56X: {
        buf: [31, 255, 255, 255, 255, 255, 255],
        val: {signedInt: -1, unsignedInt: Number.MAX_SAFE_INTEGER, signedDecimal: -1 - DEC28, unsignedDecimal: 268435455.9999999}
      },
      int64X: {
        buf: [0, 31, 255, 255, 255, 255, 255, 255],
        val: {signedInt: -1, unsignedInt: Number.MAX_SAFE_INTEGER, signedDecimal: -1 - DEC32, unsignedDecimal: 4294967295.999999}
      },
      int32One: {
        buf: [0, 1, 0, 0],
        val: {signedInt: 65536, unsignedInt: 65536, signedDecimal: 1, unsignedDecimal: 1}
      }
    };

test('writer', t => {
  for (const [key, {buf, val}] of Object.entries(testData)) {
    let buffer = null, offset = 0;

    // console.log(`[${key}]----`);

    if (global && global.Buffer) {
      buffer = Buffer.alloc(buf.length);
    } else {
      buffer = new Uint8Array(buf.length);
    }
    offset = writer.writeNumber(val.unsignedInt, buffer, 0, buf.length);
    t.is(offset, buf.length);
    for (let i = 0, il = buffer.length; i < il; i++) {
      t.is(buffer[i], buf[i]);
      // console.log(`\tUINT: expected=${buf[i]} actual=${buffer[i]}`);
    }

    if (key === 'int56X') {
      buf[0] = 255;
    }

    if (key === 'int64X') {
      buf[0] = 255;
      buf[1] = 255;
    }

    offset = writer.writeFixedNumber(val.unsignedDecimal, buffer, 0, buf.length);
    t.is(offset, buf.length);
    for (let i = 0, il = buffer.length; i < il; i++) {
      t.is(buffer[i], buf[i]);
      // console.log(`\tUDEC: expected=${buf[i]} actual=${buffer[i]}`);
    }

    offset = writer.writeNumber(val.signedInt, buffer, 0, buf.length);
    t.is(offset, buf.length);
    for (let i = 0, il = buffer.length; i < il; i++) {
      t.is(buffer[i], buf[i]);
      // console.log(`\tINT: expected=${buf[i]} actual=${buffer[i]}`);
    }

    offset = writer.writeFixedNumber(val.signedDecimal, buffer, 0, buf.length);
    t.is(offset, buf.length);
    for (let i = 0, il = buffer.length; i < il; i++) {
      t.is(buffer[i], buf[i]);
      // console.log(`\tDEC: expected=${buf[i]} actual=${buffer[i]}`);
    }
  }
});

function testString(t, val) {
  let offset = 0;
  offset = writer.writeString(val, null, offset);
  const buffer = Buffer.alloc(offset);
  offset = 0;
  offset = writer.writeString(val, buffer, offset);
  const buf = Buffer.from(val);
  t.is(offset, buf.length);
  t.true(buffer.equals(buf));
}

test('writeString', t => {
  testString(t, 'abc');
  testString(t, '\u30d0\u30a4\u30ca\u30ea\u30c7\u30fc\u30bf\u306e\u914d\u5217');

  let buffer, buf, offset;
  buf = Buffer.from([0x61, 0x62, 0x63, 0x00, 0x00]);
  buffer = Buffer.alloc(buf.length);
  offset = writer.writeString('abc', buffer, 0, buffer.length);
  t.is(offset, buf.length);
  t.true(buffer.equals(buf));

  buf = Buffer.from([0x61, 0x62, 0x63]);
  buffer = Buffer.alloc(buf.length);
  offset = writer.writeString('abcdef', buffer, 0);
  t.is(offset, buf.length);
  t.true(buffer.equals(buf));

  buf = Buffer.from([0x61, 0x62, 0x63]);
  buffer = Buffer.alloc(buf.length);
  offset = writer.writeString('abcdef', buffer, buffer.length);
  t.is(offset, 6);
  t.false(buffer.equals(buf));
});

test('writeBits', t => {
  const arr = [
    0b10011100, 0b00111110, 0b00000111, 0b11110000, 0b00001111,
    0b11111000, 0b00000001, 0b11111111, 0b11000000, 0b00000011,
    0b11111111, 0b11100000, 0b00000000, 0b01111111, 0b11111111
  ];
  const values = [
    0b1,
    0b00,
    0b111,
    0b0000,
    0b11111,
    0b000000,
    0b1111111,
    0b00000000,
    0b111111111,
    0b0000000000,
    0b11111111111,
    0b000000000000,
    0b1111111111111,
    0b00000000000000,
    0b111111111111111
  ];
  const expected = Buffer.from(arr);
  const buf = Buffer.alloc(arr.length);
  let bitOffset = 0, sum = 0;
  for (let i = 1; i <= 15; i++) {
    bitOffset = writer.writeBits(values[i - 1], buf, bitOffset, i);
    t.is(bitOffset, sum += i);
  }
  for (let i = 0; i < buf.length; i++) {
    t.is(buf[i], expected[i]);
  }
});

test('copy', t => {
  const src = Buffer.from([
    0xFF, 0x00, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0xFF
  ]);
  const dst = Buffer.alloc(10);
  let srcOffset = 0, dstOffset = 0;
  dstOffset = writer.copyBuffer(src, srcOffset, dst, dstOffset, 1);
  t.is(dstOffset, 1);
  srcOffset = 2;
  dstOffset = writer.copyBuffer(src, srcOffset, dst, dstOffset, 2);
  t.is(dstOffset, 3);
  srcOffset = 5;
  dstOffset = writer.copyBuffer(src, srcOffset, dst, dstOffset, 3);
  t.is(dstOffset, 6);
  srcOffset = 9;
  dstOffset = writer.copyBuffer(src, srcOffset, dst, dstOffset);
  t.is(dstOffset, 10);
  for (const b of dst) {
    t.is(b, 0xFF);
  }
});

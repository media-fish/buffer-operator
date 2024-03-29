import {Buffer} from 'node:buffer';
import test from 'ava';
import reader from '../../reader.js';

const DEC4 = 15 / 16,
  DEC8 = 255 / 256,
  DEC12 = 4095 / 4096,
  DEC16 = 65_535 / 65_536,
  DEC20 = 1_048_575 / 1_048_576,
  DEC24 = 16_777_215 / 16_777_216,
  DEC28 = 268_435_455 / 268_435_456,
  DEC32 = 4_294_967_295 / 4_294_967_296,
  testData = {
    int8Zero: {
      buf: [0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int16Zero: {
      buf: [0, 0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int24Zero: {
      buf: [0, 0, 0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int32Zero: {
      buf: [0, 0, 0, 0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int40Zero: {
      buf: [0, 0, 0, 0, 0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int48Zero: {
      buf: [0, 0, 0, 0, 0, 0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int56Zero: {
      buf: [0, 0, 0, 0, 0, 0, 0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int64Zero: {
      buf: [0, 0, 0, 0, 0, 0, 0, 0],
      val: {signedInt: 0, unsignedInt: 0, signedDecimal: 0, unsignedDecimal: 0},
    },
    int8X: {
      buf: [255],
      val: {signedInt: -1, unsignedInt: 255, signedDecimal: -1 - DEC4, unsignedDecimal: 15 + DEC4},
    },
    int16X: {
      buf: [255, 255],
      val: {signedInt: -1, unsignedInt: 65_535, signedDecimal: -1 - DEC8, unsignedDecimal: 255 + DEC8},
    },
    int24X: {
      buf: [255, 255, 255],
      val: {signedInt: -1, unsignedInt: 16_777_215, signedDecimal: -1 - DEC12, unsignedDecimal: 4095 + DEC12},
    },
    int32X: {
      buf: [255, 255, 255, 255],
      val: {signedInt: -1, unsignedInt: 4_294_967_295, signedDecimal: -1 - DEC16, unsignedDecimal: 65_535 + DEC16},
    },
    int40X: {
      buf: [255, 255, 255, 255, 255],
      val: {signedInt: -1, unsignedInt: 1_099_511_627_775, signedDecimal: -1 - DEC20, unsignedDecimal: 1_048_575 + DEC20},
    },
    int48X: {
      buf: [255, 255, 255, 255, 255, 255],
      val: {signedInt: -1, unsignedInt: 281_474_976_710_655, signedDecimal: -1 - DEC24, unsignedDecimal: 16_777_215 + DEC24},
    },
    int56X: {
      buf: [255, 255, 255, 255, 255, 255, 255],
      val: {signedInt: -1, unsignedInt: Number.MAX_SAFE_INTEGER, signedDecimal: -1 - DEC28, unsignedDecimal: 268_435_455 + DEC28},
    },
    int64X: {
      buf: [255, 255, 255, 255, 255, 255, 255, 255],
      val: {signedInt: -1, unsignedInt: Number.MAX_SAFE_INTEGER, signedDecimal: -1 - DEC32, unsignedDecimal: 4_294_967_295 + DEC32},
    },
    int32One: {
      buf: [0, 1, 0, 0],
      val: {signedInt: 65_536, unsignedInt: 65_536, signedDecimal: 1, unsignedDecimal: 1},
    },
  };

test('readNumber', t => {
  for (const {buf, val} of Object.values(testData)) {
    let offset = 0, readValue = 0;

    // console.log(`[${key}]----`);

    [offset, readValue] = reader.readNumber(buf, 0, buf.length);
    t.is(offset, buf.length);
    t.is(readValue, val.unsignedInt);

    // console.log(`\tUINT: expected=${expected} actual=${readValue}`);

    [offset, readValue] = reader.readNumber(buf, 0, buf.length, true);
    t.is(offset, buf.length);
    t.is(readValue, val.signedInt);

    // console.log(`\tINT: expected=${expected} actual=${readValue}`);

    [offset, readValue] = reader.readFixedNumber(buf, 0, buf.length);
    t.is(offset, buf.length);
    t.is(readValue, val.unsignedDecimal);

    // console.log(`\tUDEC: expected=${expected} actual=${readValue}`);

    [offset, readValue] = reader.readFixedNumber(buf, 0, buf.length, true);
    t.is(offset, buf.length);
    t.is(readValue, val.signedDecimal);

    // console.log(`\tDEC: expected=${expected} actual=${readValue}`);
  }
});

function testString(t, val) {
  const buf = Buffer.from(val);
  const [offset, readValue] = reader.readString(buf, 0);
  t.is(offset, buf.length);
  t.is(readValue, val);
}

test('readString', t => {
  testString(t, 'abc');
  testString(t, '\u30d0\u30a4\u30ca\u30ea\u30c7\u30fc\u30bf\u306e\u914d\u5217');
});

test('readBits', t => {
  const arr = [
    0b1001_1100, 0b0011_1110, 0b0000_0111, 0b1111_0000, 0b0000_1111,
    0b1111_1000, 0b0000_0001, 0b1111_1111, 0b1100_0000, 0b0000_0011,
    0b1111_1111, 0b1110_0000, 0b0000_0000, 0b0111_1111, 0b1111_1111,
  ];
  const expected = [
    0b1,
    0b00,
    0b111,
    0b0000,
    0b1_1111,
    0b00_0000,
    0b111_1111,
    0b0000_0000,
    0b1_1111_1111,
    0b00_0000_0000,
    0b111_1111_1111,
    0b0000_0000_0000,
    0b1_1111_1111_1111,
    0b00_0000_0000_0000,
    0b111_1111_1111_1111,
  ];
  const buf = Buffer.from(arr);
  let bitOffset = 0, value = 0, sum = 0;
  for (let i = 1; i <= 15; i++) {
    [bitOffset, value] = reader.readBits(buf, bitOffset, i);
    t.is(bitOffset, sum += i);
    t.is(value, expected[i - 1]);
  }
});

function testSubBuffer(t, buf, offset, length) {
  const sub = reader.subBuffer(buf, offset, length);
  t.is(sub.length, length);
  for (const b of sub) {
    t.is(b, 0xFF);
  }
}

test('subBuffer', t => {
  const buf = Buffer.from([
    0xFF, 0x00, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0xFF,
  ]);
  testSubBuffer(t, buf, 0, 1);
  testSubBuffer(t, buf, 2, 2);
  testSubBuffer(t, buf, 5, 3);
  testSubBuffer(t, buf, 9, 4);
});

test('strictMode', t => {
  const buf = Buffer.from([0xFF, 0xFF]);
  let opt;

  try {
    let offset, value;
    [offset, value] = reader.readString(buf, 0, 3);
    t.is(offset, 2);
    t.is(value, '');
    [offset, value] = reader.readNumber(buf, 1, 2);
    t.is(offset, 2);
    t.true(Number.isNaN(value));
  } catch {
    t.fail('strictMode should be disabled by default');
  }

  reader.setOptions({strictMode: true});
  opt = reader.getOptions();
  t.true(opt.strictMode);

  try {
    reader.readString(buf, 2, 1);
    t.fail('An error should be thrown when strictMode is enabled');
  } catch (e) {
    t.truthy(e);
  }

  reader.setOptions({strictMode: false});
  opt = reader.getOptions();
  t.false(opt.strictMode);

  try {
    let offset, value;
    [offset, value] = reader.readString(buf, 2, 1);
    t.is(offset, 2);
    t.is(value, '');
    [offset, value] = reader.readNumber(buf, 3, 1);
    t.is(offset, 2);
    t.true(Number.isNaN(value));
  } catch {
    t.fail('An error should not be thrown when strictMode is disabled');
  }

  t.pass();
});

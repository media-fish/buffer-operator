import test from 'ava';
import {reader, writer} from '../../index.js';

test('symbols', t => {
  t.is(typeof reader, 'object');
  t.truthy(reader);
  t.is(typeof writer, 'object');
  t.truthy(writer);
  const {
    readString,
    readNumber,
    readBits,
    readFixedNumber,
    subBuffer,
    setOptions,
    getOptions,
  } = reader;
  t.is(typeof readString, 'function');
  t.is(typeof readNumber, 'function');
  t.is(typeof readBits, 'function');
  t.is(typeof readFixedNumber, 'function');
  t.is(typeof subBuffer, 'function');
  t.is(typeof setOptions, 'function');
  t.is(typeof getOptions, 'function');
  const {
    writeString,
    writeNumber,
    writeBits,
    writeFixedNumber,
    copyBuffer,
  } = writer;
  t.is(typeof writeString, 'function');
  t.is(typeof writeNumber, 'function');
  t.is(typeof writeBits, 'function');
  t.is(typeof writeFixedNumber, 'function');
  t.is(typeof copyBuffer, 'function');
});


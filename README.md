[![Build Status](https://travis-ci.org/media-fish/buffer-operator.svg?branch=master)](https://travis-ci.org/media-fish/buffer-operator)
[![Coverage Status](https://coveralls.io/repos/github/media-fish/buffer-operator/badge.svg?branch=master)](https://coveralls.io/github/media-fish/buffer-operator?branch=master)
[![Dependency Status](https://david-dm.org/media-fish/buffer-operator.svg)](https://david-dm.org/media-fish/buffer-operator)
[![Development Dependency Status](https://david-dm.org/media-fish/buffer-operator/dev-status.svg)](https://david-dm.org/media-fish/buffer-operator#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/media-fish/buffer-operator/badge.svg)](https://snyk.io/test/github/media-fish/buffer-operator)
[![npm Downloads](https://img.shields.io/npm/dw/@mediafish/buffer-operator.svg?style=flat-square)](https://npmjs.com/@mediafish/buffer-operator)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)


# buffer-operator

Provides JS functions to read/write a byte buffer (both node's Buffer and Uint8Array)

## Install
[![NPM](https://nodei.co/npm/@mediafish/buffer-operator.png?mini=true)](https://nodei.co/npm/@mediafish/buffer-operator/)

## Usage

```js
const {reader, writer} = require('@mediafish/buffer-operator');

const buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0x61, 0x62, 0x63]);
// Or use Uint8Array
const buffer = Uint8Array.from([0xFF, 0xFF, 0xFF, 0x61, 0x62, 0x63]);

let offset, value;
[offset, value] = reader.readNumber(buffer, 0, 1); // Specify offset and length
// offset => 1
// value => 255
[offset, value] = reader.readNumber(buffer, offset, 2, true); // signed = true
// offset => 3
// value => -1
[offset, value] = reader.readString(buffer, offset, 3);
// offset => 6
// value => 'abc'

const dest = Buffer.alloc(6);
// Or use Uint8Array
const dest = new Uint8Array(6);

offset = writer.writeNumber(255, dest, 0, 1);
// offset => 1
offset = writer.writeNumber(-1, dest, offset, 2);
// offset => 3
offset = writer.writeString('abc', dest, offset, 3);
// offset => 6
dest.equals(buffer); // => true

```

## API

### `reader.readNumber(buffer, offset[, length, signed])`
Read an integer from the buffer

#### params
| Name     | Type    | Required | Default | Description   |
| -------- | ------- | -------- | ------- | ------------- |
| `buffer` | `Buffer` or `Uint8Array` | Yes | N/A | The buffer from which the data is read |
| `offset` | number  | Yes      | N/A     | An integer to specify the position within the buffer |
| `length` | number  | No       | 4       | An integer to specify how many bytes to read |
| `signed` | boolean | No       | false   | Set `true` to read a negative number |

#### return value
An array containing the following pair of values
| Index | Type   | Description  |
| ----- | ------ | ------------ |
| [0]   | number | An integer to indicate the position from which the next data should be read |
| [1]   | number | The read value |

### `reader.readString(buffer, offset[, length, nullTerminated])`
Read a string from the buffer

#### params
| Name     | Type    | Required | Default | Description   |
| -------- | ------- | -------- | ------- | ------------- |
| `buffer` | `Buffer` or `Uint8Array` | Yes | N/A | The buffer from which the data is read |
| `offset` | number  | Yes      | N/A     | An integer to specify the position within the buffer |
| `length` | number  | No       | `buffer.length - offset` | An integer to specify how many bytes to read |
| `nullTerminated` | boolean | No       | false   | Set `true` to stop reading when encountering zero |

#### return value
An array containing the following pair of values
| Index | Type   | Description  |
| ----- | ------ | ------------ |
| [0]   | number | An integer to indicate the position from which the next data should be read |
| [1]   | string | The read value |

### `reader.subBuffer(buffer, offset[, length])`
Create a sub buffer from the original one.

#### params
| Name     | Type    | Required | Default | Description   |
| -------- | ------- | -------- | ------- | ------------- |
| `buffer` | `Buffer` or `Uint8Array` | Yes | N/A | The buffer from which the sub buffer is extracted |
| `offset` | number  | Yes      | N/A     | An integer to specify the position within the original buffer |
| `length` | number  | No       | `buffer.length - offset` | An integer to specify how many bytes to extract |

#### return value
The created sub buffer

### `reader.setOptions(obj)`
Updates the option values

#### params
| Name    | Type   | Required | Default | Description   |
| ------- | ------ | -------- | ------- | ------------- |
| obj     | Object | Yes      | {}     | An object holding option values which will be used to overwrite the internal option values.  |

##### supported options
| Name       | Type    | Default | Description   |
| ---------- | ------- | ------- | ------------- |
| `strictMode` | boolean | false   | If true, the function throws an error when the method invocations failed. If false, the function just logs the error and continues to run.|

### `reader.getOptions()`
Retrieves the current option values

#### return value
A cloned object containing the current option values

### `writer.writeNumber(value, buffer, offset[, length])`
Write an integer to the buffer

#### params
| Name     | Type    | Required | Default | Description   |
| -------- | ------- | -------- | ------- | ------------- |
| `value`  | number  | Yes      | N/A     | The value to be written to the buffer |
| `buffer` | `Buffer` or `Uint8Array` | Yes | N/A | The buffer to which the data is written |
| `offset` | number  | Yes      | N/A     | An integer to specify the position within the buffer |
| `length` | number  | No       | 4       | An integer to specify how many bytes to write |

#### return value
An integer to indicate the position to which the next data should be written

### `writer.writeString(value, buffer, offset[, length])`
Write a string to the buffer

#### params
| Name     | Type    | Required | Default | Description   |
| -------- | ------- | -------- | ------- | ------------- |
| `value`  | string  | Yes      | N/A     | The value to be written to the buffer |
| `buffer` | `Buffer` or `Uint8Array` | Yes | N/A | The buffer to which the data is written |
| `offset` | number  | Yes      | N/A     | An integer to specify the position within the buffer |
| `length` | number  | No       | undefined | An integer to specify how many bytes to write. If not specified, the data is written until the end of the buffer |

#### return value
An integer to indicate the position to which the next data should be written

### `writer.copyBuffer(src, srcOffset, dst, dstOffset[, length])`
Copy data from the `src` buffer to `dst` buffer

#### params
| Name        | Type    | Required | Default | Description   |
| ----------- | ------- | -------- | ------- | ------------- |
| `src`       | `Buffer` or `Uint8Array` | Yes | N/A | The source buffer from which the data is copied |
| `srcOffset` | number  | Yes      | N/A     | An integer to specify the position within the source buffer |
| `dst`       | `Buffer` or `Uint8Array` | Yes | N/A | The destination buffer to which the data is copied |
| `dstOffset` | number  | Yes      | N/A     | An integer to specify the position within the destination buffer |
| `length`    | number  | No       | `src.length - srcOffset` | An integer to specify how many bytes to copy. |

#### return value
An integer to indicate the position within the `dst` buffer to which the next data should be written

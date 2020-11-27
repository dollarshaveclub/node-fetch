// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)
import { TextDecoder } from 'util'

export const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');
const decoder = new TextDecoder('utf-8')

export default class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size () {
		return this[BUFFER].length;
	}
	get type () {
		return this[TYPE];
	}
	arrayBuffer (start = 0, end) {
		const size = this.size;

		start = start < 0 ? Math.max(size + start, 0) : (start !== 0 ? Math.min(start, size) : start)
		end = !end ? size : (size < 0 ? Math.max(size + end, 0) : Math.min(end, size))

		const span = Math.max(end - start)
		const buffer = this[BUFFER]
		return buffer.slice(start, start + span)
	}
	slice () {
		const slicedBuffer = this.arrayBuffer(...arguments)
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
	text () {
		return decoder.decode(this[BUFFER]).toString()
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

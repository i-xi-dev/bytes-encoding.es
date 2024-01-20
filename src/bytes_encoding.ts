import { _TransformStream } from "../deps.ts";

// The byte encoding

export namespace BytesEncoding {
  /**
   * The decoder that converts a string into a byte sequence.
   */
  export interface Decoder {
    /**
     * Converts a string into a byte sequence.
     *
     * @param encoded An encoded string to decode.
     * @returns A decoded byte sequence.
     */
    decode(encoded: string): Uint8Array;
  }

  /**
   * The encoder that converts a byte sequence into a string.
   */
  export interface Encoder {
    /**
     * Converts a byte sequence into a string.
     *
     * @param toEncode A byte sequence to encode.
     * @returns An encoded string.
     */
    encode(toEncode: Uint8Array): string;
  }

  export interface DecoderStreamRegulator {
    regulate(chunk: string): string;
    flush(): string;
  }

  /**
   * The `BytesEncoding.DecoderStream` converts a stream of string into byte sequence.
   */
  export abstract class DecoderStream
    implements TransformStream<string, Uint8Array> {
    readonly #stream: TransformStream<string, Uint8Array>;

    constructor(decoder: Decoder, regulator: DecoderStreamRegulator) {
      this.#stream = new _TransformStream<string, Uint8Array>(
        DecoderStream._createTransformer(decoder, regulator),
      );
    }

    protected static _createTransformer(
      decoder: Decoder,
      regulator: DecoderStreamRegulator,
    ): Transformer<string, Uint8Array> {
      return {
        transform(
          chunk: string,
          controller: TransformStreamDefaultController<Uint8Array>,
        ): void {
          try {
            const toDecode = regulator.regulate(chunk);
            const decoded = decoder.decode(toDecode);
            controller.enqueue(decoded);
          } catch (exception) {
            controller.error(exception);
          }
        },
        flush(controller: TransformStreamDefaultController<Uint8Array>): void {
          try {
            const toDecode = regulator.flush();
            if (toDecode.length > 0) {
              const decoded = decoder.decode(toDecode);
              controller.enqueue(decoded);
            }
          } catch (exception) {
            controller.error(exception);
          }
        },
      };
    }

    /**
     * @see [TransformStream.writable](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream/writable)
     */
    get writable(): WritableStream<string> {
      return this.#stream.writable;
    }

    /**
     * @see [TransformStream.readable](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream/readable)
     */
    get readable(): ReadableStream<Uint8Array> {
      return this.#stream.readable;
    }
  }
  Object.freeze(DecoderStream);

  export interface EncoderStreamRegulator {
    regulate(chunk: Uint8Array): Uint8Array;
    flush(): Uint8Array;
  }

  /**
   * The `BytesEncoding.EncoderStream` converts a stream of byte sequence into string.
   */
  export abstract class EncoderStream
    implements TransformStream<Uint8Array, string> {
    readonly #stream: TransformStream<Uint8Array, string>;

    constructor(encoder: Encoder, regulator: EncoderStreamRegulator) {
      this.#stream = new _TransformStream<Uint8Array, string>(
        EncoderStream._createTransformer(encoder, regulator),
      );
    }

    protected static _createTransformer(
      encoder: Encoder,
      regulator: EncoderStreamRegulator,
    ): Transformer<Uint8Array, string> {
      return {
        transform(
          chunk: Uint8Array,
          controller: TransformStreamDefaultController<string>,
        ): void {
          const toEncode = regulator.regulate(chunk);
          const encoded = encoder.encode(toEncode);
          controller.enqueue(encoded);
        },
        flush(controller: TransformStreamDefaultController<string>): void {
          const toEncode = regulator.flush();
          if (toEncode.length > 0) {
            const encoded = encoder.encode(toEncode);
            controller.enqueue(encoded);
          }
        },
      };
    }

    /**
     * @see [TransformStream.writable](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream/writable)
     */
    get writable(): WritableStream<Uint8Array> {
      return this.#stream.writable;
    }

    /**
     * @see [TransformStream.readable](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream/readable)
     */
    get readable(): ReadableStream<string> {
      return this.#stream.readable;
    }
  }
  Object.freeze(EncoderStream);
}

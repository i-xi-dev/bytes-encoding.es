import { assertStrictEquals } from "std/testing/asserts";
import { BytesEncoding } from "../src/bytes_encoding.ts";

Deno.test("BytesEncoding.Decoder", () => {
  class TestDecoder implements BytesEncoding.Decoder {
    decode(encoded: string): Uint8Array {
      void encoded;
      return new Uint8Array(0);
    }
  }
  const t0 = new TestDecoder();

  assertStrictEquals(t0.decode("").join(","), "");
  assertStrictEquals(t0.decode("12345").join(","), "");
});

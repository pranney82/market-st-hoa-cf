import { describe, it, expect } from "vitest";
import { sanitize, toJsonArray, fromJsonArray, getClientIp } from "../src/lib/sanitize";

describe("sanitize", () => {
  it("escapes HTML angle brackets", () => {
    expect(sanitize("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands", () => {
    expect(sanitize("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("escapes double quotes", () => {
    expect(sanitize('He said "hello"')).toBe("He said &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(sanitize("It's fine")).toBe("It&#x27;s fine");
  });

  it("passes clean text through unchanged", () => {
    expect(sanitize("Hello world")).toBe("Hello world");
  });

  it("handles empty string", () => {
    expect(sanitize("")).toBe("");
  });

  it("handles multiple special characters", () => {
    expect(sanitize('<div class="test">&</div>')).toBe(
      "&lt;div class=&quot;test&quot;&gt;&amp;&lt;/div&gt;"
    );
  });
});

describe("toJsonArray", () => {
  it("converts string array to JSON", () => {
    expect(toJsonArray(["a", "b"])).toBe('["a","b"]');
  });

  it("returns null for empty array", () => {
    expect(toJsonArray([])).toBe(null);
  });

  it("returns null for undefined", () => {
    expect(toJsonArray(undefined)).toBe(null);
  });

  it("returns null for null", () => {
    expect(toJsonArray(null)).toBe(null);
  });
});

describe("fromJsonArray", () => {
  it("parses valid JSON array", () => {
    expect(fromJsonArray('["a","b"]')).toEqual(["a", "b"]);
  });

  it("returns empty array for null", () => {
    expect(fromJsonArray(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(fromJsonArray(undefined)).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(fromJsonArray("not json")).toEqual([]);
  });

  it("returns empty array for non-array JSON", () => {
    expect(fromJsonArray('{"key":"value"}')).toEqual([]);
  });
});

describe("getClientIp", () => {
  it("extracts CF-Connecting-IP header", () => {
    const req = new Request("https://example.com", {
      headers: { "CF-Connecting-IP": "1.2.3.4" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to X-Forwarded-For", () => {
    const req = new Request("https://example.com", {
      headers: { "X-Forwarded-For": "5.6.7.8, 9.10.11.12" },
    });
    expect(getClientIp(req)).toBe("5.6.7.8");
  });

  it("returns unknown when no IP headers", () => {
    const req = new Request("https://example.com");
    expect(getClientIp(req)).toBe("unknown");
  });
});

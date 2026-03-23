import { describe, it, expect } from "vitest";
import { parsePagination, paginateResult, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../src/lib/pagination";

describe("parsePagination", () => {
  it("returns defaults for no params", () => {
    const url = new URL("https://example.com/api/items");
    const result = parsePagination(url);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it("parses page and pageSize", () => {
    const url = new URL("https://example.com/api/items?page=3&pageSize=10");
    const result = parsePagination(url);
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
  });

  it("clamps page to minimum 1", () => {
    const url = new URL("https://example.com/api/items?page=-5");
    const result = parsePagination(url);
    expect(result.page).toBe(1);
  });

  it("clamps page to minimum 1 for zero", () => {
    const url = new URL("https://example.com/api/items?page=0");
    const result = parsePagination(url);
    expect(result.page).toBe(1);
  });

  it("clamps pageSize to max", () => {
    const url = new URL("https://example.com/api/items?pageSize=500");
    const result = parsePagination(url);
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
  });

  it("defaults pageSize for zero", () => {
    const url = new URL("https://example.com/api/items?pageSize=0");
    const result = parsePagination(url);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it("handles non-numeric values", () => {
    const url = new URL("https://example.com/api/items?page=abc&pageSize=xyz");
    const result = parsePagination(url);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe("paginateResult", () => {
  it("returns correct pagination metadata", () => {
    const data = [1, 2, 3, 4, 5];
    const result = paginateResult(data, 23, { page: 2, pageSize: 5 });
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 5,
      totalItems: 23,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("hasNext is false on last page", () => {
    const result = paginateResult([1, 2, 3], 13, { page: 3, pageSize: 5 });
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(true);
  });

  it("hasPrev is false on first page", () => {
    const result = paginateResult([1, 2, 3, 4, 5], 23, { page: 1, pageSize: 5 });
    expect(result.pagination.hasPrev).toBe(false);
    expect(result.pagination.hasNext).toBe(true);
  });

  it("handles single page", () => {
    const result = paginateResult([1, 2], 2, { page: 1, pageSize: 20 });
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("handles empty results", () => {
    const result = paginateResult([], 0, { page: 1, pageSize: 20 });
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });
});

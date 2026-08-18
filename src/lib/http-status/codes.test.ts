import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HTTP_STATUS_CODES, filterHttpStatusCodes, statusCopyText } from "./codes";

describe("HTTP status catalog", () => {
  it("covers 1xx–5xx with the WorkUtilities set", () => {
    assert.equal(HTTP_STATUS_CODES.length, 29);
    assert.deepEqual(
      HTTP_STATUS_CODES.map((item) => item.code),
      [
        100, 101, 200, 201, 204, 206, 301, 302, 304, 307, 308, 400, 401, 403, 404, 405, 408, 409, 410, 413, 414, 415, 422,
        429, 500, 502, 503, 504, 507,
      ],
    );
    assert.equal(HTTP_STATUS_CODES.filter((item) => item.snippet).length, 5);
  });

  it("filters by class and keyword", () => {
    const notFound = filterHttpStatusCodes("404", "all");
    assert.ok(notFound.some((item) => item.code === 404));
    assert.equal(notFound.find((item) => item.code === 404)?.name, "Not Found");

    const rate = filterHttpStatusCodes("rate limit", "4xx");
    assert.equal(rate.length, 1);
    assert.equal(rate[0].code, 429);

    const redirects = filterHttpStatusCodes("", "3xx");
    assert.equal(redirects.length, 5);
    assert.equal(filterHttpStatusCodes("teapot", "all").length, 0);
    assert.equal(filterHttpStatusCodes("redirectToLogin", "all")[0]?.code, 401);
  });

  it("formats a copy line", () => {
    const forbidden = HTTP_STATUS_CODES.find((item) => item.code === 403);
    assert.ok(forbidden);
    assert.equal(statusCopyText(forbidden), "403 Forbidden");
  });
});

export type HttpStatusClass = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

export type HttpStatusCode = {
  code: number;
  name: string;
  classId: HttpStatusClass;
  category: string;
  meaning: string;
  when: string;
  causes: string[];
  action: string;
  snippet?: string;
};

export const HTTP_STATUS_CLASSES: Array<{ id: "all" | HttpStatusClass; label: string }> = [
  { id: "all", label: "All" },
  { id: "1xx", label: "1xx Info" },
  { id: "2xx", label: "2xx Success" },
  { id: "3xx", label: "3xx Redirect" },
  { id: "4xx", label: "4xx Client" },
  { id: "5xx", label: "5xx Server" },
];

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  {
    code: 100,
    name: "Continue",
    classId: "1xx",
    category: "Informational",
    meaning: "The server has received the request headers and the client should proceed to send the body.",
    when: "Large file uploads or when the client wants to check if the server will accept a request before sending a large payload.",
    causes: ["Client sent Expect: 100-continue header", "Upload pre-check before POST body"],
    action: "Send the request body if you receive 100 Continue. Most browsers handle this automatically.",
  },
  {
    code: 101,
    name: "Switching Protocols",
    classId: "1xx",
    category: "Informational",
    meaning: "The server is switching protocols as requested by the client.",
    when: "WebSocket handshake upgrades from HTTP to WebSocket protocol.",
    causes: ["WebSocket connection upgrade", "Protocol negotiation"],
    action: "Expected during WebSocket setup — no action needed if upgrade succeeds.",
  },
  {
    code: 200,
    name: "OK",
    classId: "2xx",
    category: "Success",
    meaning: "The request succeeded.",
    when: "Successful GET, PUT, PATCH, or POST that returns data. The most common success response.",
    causes: ["Resource fetched successfully", "Update applied", "Action completed"],
    action: "Parse the response body. Check response.status === 200 before using data.",
    snippet: `const res = await fetch('/api/users');\nif (res.status === 200) { const data = await res.json(); }`,
  },
  {
    code: 201,
    name: "Created",
    classId: "2xx",
    category: "Success",
    meaning: "A new resource was successfully created.",
    when: "POST requests that create a new record — REST APIs return 201 with a Location header pointing to the new resource.",
    causes: ["New user registered", "New record inserted", "Resource created via POST"],
    action: "Read the Location header for the new resource URL. Parse response body for the created object ID.",
  },
  {
    code: 204,
    name: "No Content",
    classId: "2xx",
    category: "Success",
    meaning: "The request succeeded but there is no response body.",
    when: "Successful DELETE requests or PUT/PATCH updates where no data needs to be returned.",
    causes: ["DELETE succeeded", "Update with no return payload", "Action completed silently"],
    action: "Do not call response.json() — there is no body. Treat as success if status is 204.",
  },
  {
    code: 206,
    name: "Partial Content",
    classId: "2xx",
    category: "Success",
    meaning: "The server is delivering only part of the resource due to a range request.",
    when: "Video streaming, resumable downloads, or byte-range requests on large files.",
    causes: ["Range header in request", "Video player seeking", "Chunked file download"],
    action: "Check Content-Range header. Combine chunks if building a full file client-side.",
  },
  {
    code: 301,
    name: "Moved Permanently",
    classId: "3xx",
    category: "Redirect",
    meaning: "The resource has permanently moved to a new URL.",
    when: "Old URLs redirected to new ones. Search engines transfer SEO authority to the new URL.",
    causes: ["Domain migration", "URL structure change", "HTTP to HTTPS redirect"],
    action: "Update your links to the new URL. Browsers cache 301 redirects — clear cache if testing.",
  },
  {
    code: 302,
    name: "Found",
    classId: "3xx",
    category: "Redirect",
    meaning: "The resource is temporarily at a different URL.",
    when: "Temporary redirects, login flows, or post-form redirects.",
    causes: ["Temporary maintenance redirect", "Login redirect", "Legacy redirect behavior"],
    action: "Follow the Location header. Do not cache — the redirect is temporary.",
  },
  {
    code: 304,
    name: "Not Modified",
    classId: "3xx",
    category: "Redirect",
    meaning: "The cached version is still valid — no body is sent.",
    when: "Conditional GET requests with If-None-Match or If-Modified-Since headers.",
    causes: ["Browser cache validation", "ETag match", "CDN cache hit"],
    action: "Use your cached copy. No network body to parse.",
  },
  {
    code: 307,
    name: "Temporary Redirect",
    classId: "3xx",
    category: "Redirect",
    meaning: "Temporary redirect that preserves the original HTTP method.",
    when: "API redirects where POST must stay POST (unlike 302 which may change to GET).",
    causes: ["Temporary URL change", "Load balancer redirect", "OAuth callback redirect"],
    action: "Re-send the request to the Location URL with the same HTTP method.",
  },
  {
    code: 308,
    name: "Permanent Redirect",
    classId: "3xx",
    category: "Redirect",
    meaning: "Permanent redirect that preserves the original HTTP method.",
    when: "Permanent API endpoint moves where method must be preserved (POST stays POST).",
    causes: ["API version migration", "Permanent endpoint rename"],
    action: "Update client code to use the new URL permanently. Method is preserved.",
  },
  {
    code: 400,
    name: "Bad Request",
    classId: "4xx",
    category: "Client Error",
    meaning: "The server cannot process the request due to a client error.",
    when: "Malformed JSON, missing required headers, invalid query parameters, or syntax errors in the request.",
    causes: ["Invalid JSON body", "Missing Content-Type", "Malformed query string"],
    action: "Validate request format before sending. Read the error response body for specific field errors.",
  },
  {
    code: 401,
    name: "Unauthorized",
    classId: "4xx",
    category: "Client Error",
    meaning: "Authentication is required and has failed or not been provided.",
    when: "Missing or expired JWT/API token, not logged in, or invalid credentials.",
    causes: ["No Authorization header", "Expired access token", "Invalid API key"],
    action: "Check your auth token. Refresh the token or redirect to login. 401 = not authenticated.",
    snippet: `// 401 = no valid token\nif (res.status === 401) { redirectToLogin(); }`,
  },
  {
    code: 403,
    name: "Forbidden",
    classId: "4xx",
    category: "Client Error",
    meaning: "The server understood the request but refuses to authorize it.",
    when: "Logged in but lacking permission — wrong role, insufficient privileges, or resource access denied.",
    causes: ["Wrong user role", "Insufficient permissions", "IP blocked or geo-restricted"],
    action: "Check user roles and permissions. 403 = authenticated but not authorized. Different from 401!",
    snippet: `// 403 = authenticated but no permission\nif (res.status === 403) { showAccessDenied(); }`,
  },
  {
    code: 404,
    name: "Not Found",
    classId: "4xx",
    category: "Client Error",
    meaning: "The requested resource does not exist.",
    when: "Wrong URL, deleted resource, typo in API path, or route not registered on the server.",
    causes: ["Typo in URL", "Resource deleted", "Route not defined", "Wrong API version"],
    action: "Verify the URL path and resource ID. Check if the resource was deleted or moved.",
    snippet: `if (res.status === 404) { showNotFound(); }`,
  },
  {
    code: 405,
    name: "Method Not Allowed",
    classId: "4xx",
    category: "Client Error",
    meaning: "The HTTP method is not supported for this endpoint.",
    when: "Sending POST to a GET-only endpoint, or using DELETE where only PATCH is allowed.",
    causes: ["Wrong HTTP method", "API only supports GET", "CORS preflight mismatch"],
    action: "Check the Allow header for supported methods. Use the correct HTTP verb.",
  },
  {
    code: 408,
    name: "Request Timeout",
    classId: "4xx",
    category: "Client Error",
    meaning: "The server timed out waiting for the request.",
    when: "Slow client sending a large body, or server closed idle connection.",
    causes: ["Slow upload", "Idle connection timeout", "Network interruption"],
    action: "Retry the request. For large uploads, use chunked transfer or resumable upload.",
  },
  {
    code: 409,
    name: "Conflict",
    classId: "4xx",
    category: "Client Error",
    meaning: "The request conflicts with the current state of the resource.",
    when: "Duplicate email on signup, version conflict on concurrent updates, or resource already exists.",
    causes: ["Duplicate unique field", "Optimistic locking conflict", "Concurrent edit"],
    action: "Read the conflict details. Refresh data and retry, or resolve the duplicate.",
  },
  {
    code: 410,
    name: "Gone",
    classId: "4xx",
    category: "Client Error",
    meaning: "The resource existed but has been permanently removed.",
    when: "Deliberately deleted content that should not return — stronger signal than 404 for SEO.",
    causes: ["Permanently deleted resource", "Deprecated endpoint removed"],
    action: "Remove links to this resource. Unlike 404, 410 tells search engines to de-index.",
  },
  {
    code: 413,
    name: "Payload Too Large",
    classId: "4xx",
    category: "Client Error",
    meaning: "The request body exceeds the server's size limit.",
    when: "File uploads exceeding server limit, or POST body too large for API gateway.",
    causes: ["File too large", "Request body exceeds nginx/client limit", "API payload cap"],
    action: "Reduce payload size, compress data, or use chunked/multipart upload.",
  },
  {
    code: 414,
    name: "URI Too Long",
    classId: "4xx",
    category: "Client Error",
    meaning: "The request URL exceeds the server's length limit.",
    when: "Too many query parameters, or excessively long GET URLs.",
    causes: ["Long query string", "Too many filter params", "Encoded data in URL"],
    action: "Move data from query string to POST body. Shorten or paginate parameters.",
  },
  {
    code: 415,
    name: "Unsupported Media Type",
    classId: "4xx",
    category: "Client Error",
    meaning: "The request Content-Type is not supported by the server.",
    when: "Sending XML to a JSON-only API, or wrong Content-Type header on upload.",
    causes: ["Wrong Content-Type header", "Server expects application/json", "Unsupported file format"],
    action: "Set Content-Type to what the API expects (usually application/json).",
  },
  {
    code: 422,
    name: "Unprocessable Entity",
    classId: "4xx",
    category: "Client Error",
    meaning: "The request is well-formed but contains semantic errors.",
    when: "Validation errors — valid JSON but business rules fail (negative age, invalid email format accepted by syntax but rejected by rules).",
    causes: ["Field validation failed", "Business rule violation", "Invalid enum value"],
    action: "Read validation errors in response body. Fix field values and resubmit.",
  },
  {
    code: 429,
    name: "Too Many Requests",
    classId: "4xx",
    category: "Client Error",
    meaning: "The client has sent too many requests in a given time period.",
    when: "API rate limiting, brute-force protection, or quota exceeded on third-party APIs.",
    causes: ["Rate limit exceeded", "Too many login attempts", "API quota hit"],
    action: "Check Retry-After header. Implement exponential backoff: wait 1s, 2s, 4s, 8s before retrying.",
    snippet: `if (res.status === 429) {\n  const retryAfter = res.headers.get('Retry-After');\n  await sleep(retryAfter ? Number(retryAfter) * 1000 : 1000);\n}`,
  },
  {
    code: 500,
    name: "Internal Server Error",
    classId: "5xx",
    category: "Server Error",
    meaning: "The server encountered an unexpected error.",
    when: "Unhandled exception in server code, database crash, or misconfiguration on the server side.",
    causes: ["Unhandled exception", "Database connection failure", "Null reference in API code"],
    action: "Retry once. If persistent, check server logs. This is a server bug — not your fault as a client.",
  },
  {
    code: 502,
    name: "Bad Gateway",
    classId: "5xx",
    category: "Server Error",
    meaning: "The server acting as a gateway received an invalid response from upstream.",
    when: "Reverse proxy (nginx, Cloudflare) cannot reach the backend, or backend crashed mid-request.",
    causes: ["Backend server down", "Proxy misconfiguration", "Upstream timeout"],
    action: "Retry after a delay. Check if the API service is up. Often transient during deployments.",
  },
  {
    code: 503,
    name: "Service Unavailable",
    classId: "5xx",
    category: "Server Error",
    meaning: "The server is temporarily unable to handle the request.",
    when: "Server overloaded, maintenance mode, or deliberate traffic shedding.",
    causes: ["Server maintenance", "Overload / traffic spike", "Health check failing"],
    action: "Check Retry-After header. Implement retry with backoff. Show maintenance message to users.",
  },
  {
    code: 504,
    name: "Gateway Timeout",
    classId: "5xx",
    category: "Server Error",
    meaning: "The gateway did not receive a timely response from the upstream server.",
    when: "Backend took too long to respond — slow database query, long-running job, or network issue between proxy and app.",
    causes: ["Slow database query", "Long API processing", "Proxy timeout too short"],
    action: "Retry with backoff. Optimize slow endpoints. Consider async processing for long operations.",
  },
  {
    code: 507,
    name: "Insufficient Storage",
    classId: "5xx",
    category: "Server Error",
    meaning: "The server cannot store the representation needed to complete the request.",
    when: "WebDAV operations when disk is full, or storage quota exceeded on server.",
    causes: ["Disk full on server", "Storage quota exceeded", "WebDAV write failure"],
    action: "Contact server admin. Free up storage or increase quota.",
  },
];

export function statusCopyText(item: HttpStatusCode) {
  return `${item.code} ${item.name}`;
}

export function filterHttpStatusCodes(
  query: string,
  classId: "all" | HttpStatusClass,
  catalog = HTTP_STATUS_CODES,
) {
  const needle = query.trim().toLowerCase();
  return catalog.filter((item) => {
    if (classId !== "all" && item.classId !== classId) return false;
    if (!needle) return true;
    const haystack = [
      String(item.code),
      item.name,
      item.category,
      item.meaning,
      item.when,
      item.action,
      item.snippet ?? "",
      ...item.causes,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export const HTTP_STATUS_FAQS = [
  {
    question: "What is the difference between HTTP 401 and 403?",
    answer:
      "401 Unauthorized means the client is not authenticated — missing, expired, or invalid credentials. 403 Forbidden means the client is authenticated but not allowed to access that resource. Fix 401 by logging in or refreshing a token; fix 403 by changing roles or permissions.",
  },
  {
    question: "What is the difference between 301 and 302 redirects?",
    answer:
      "301 Moved Permanently tells clients and search engines the new URL is the lasting home — browsers may cache it and SEO signals transfer. 302 Found is temporary; follow Location now, but keep using the original URL later. Use 307/308 when the HTTP method must stay the same.",
  },
  {
    question: "What does HTTP 429 Too Many Requests mean?",
    answer:
      "The client hit a rate limit or quota. Read the Retry-After header if present, then retry with exponential backoff (1s, 2s, 4s, 8s). Slow down loops, cache responses, and avoid hammering login endpoints.",
  },
  {
    question: "When should an API return 422 vs 400?",
    answer:
      "400 Bad Request is for a malformed request — invalid JSON, missing Content-Type, broken query string. 422 Unprocessable Entity is for a well-formed request that fails business rules, such as an invalid email or a negative age. Many APIs still use 400 for both; 422 is clearer for field validation.",
  },
  {
    question: "Is this reference free?",
    answer: "Yes. It runs in your browser with no signup. Nothing is sent to a server.",
  },
];

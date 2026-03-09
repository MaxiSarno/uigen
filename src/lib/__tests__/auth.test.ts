import { test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockSign = vi.fn().mockResolvedValue("mock.jwt.token");
const mockSetIssuedAt = vi.fn().mockReturnThis();
const mockSetExpirationTime = vi.fn().mockReturnThis();
const mockSetProtectedHeader = vi.fn().mockReturnThis();
const MockSignJWT = vi.fn().mockImplementation(() => ({
  setProtectedHeader: mockSetProtectedHeader,
  setExpirationTime: mockSetExpirationTime,
  setIssuedAt: mockSetIssuedAt,
  sign: mockSign,
}));

vi.mock("jose", () => ({ SignJWT: MockSignJWT }));

const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockSet })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSign.mockResolvedValue("mock.jwt.token");
});

async function getCreateSession() {
  vi.resetModules();
  const { createSession } = await import("@/lib/auth");
  return createSession;
}

test("sets a cookie named auth-token with the signed token", async () => {
  const createSession = await getCreateSession();
  await createSession("user-1", "user@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  const [name, token] = mockSet.mock.calls[0];
  expect(name).toBe("auth-token");
  expect(token).toBe("mock.jwt.token");
});

test("signs JWT with userId and email in payload", async () => {
  const createSession = await getCreateSession();
  await createSession("user-42", "test@example.com");

  expect(MockSignJWT).toHaveBeenCalledOnce();
  const payload = MockSignJWT.mock.calls[0][0];
  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("test@example.com");
});

test("cookie expires approximately 7 days from now", async () => {
  const before = Date.now();
  const createSession = await getCreateSession();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, , options] = mockSet.mock.calls[0];
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("cookie is httpOnly with sameSite lax and path /", async () => {
  const createSession = await getCreateSession();
  await createSession("user-1", "user@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("cookie is not secure outside production", async () => {
  const createSession = await getCreateSession();
  await createSession("user-1", "user@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.secure).toBe(false);
});

test("cookie is secure in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  const createSession = await getCreateSession();
  await createSession("user-1", "user@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.secure).toBe(true);

  vi.unstubAllEnvs();
});

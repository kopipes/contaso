// lib/repliz.ts — all Repliz API calls isolated here
// Docs: https://docs.repliz.com
// Auth: HTTP Basic (Access Key : Secret Key)

const BASE_URL = "https://api.repliz.com/public";

function getAuthHeader(): string {
  const accessKey = process.env.REPLIZ_ACCESS_KEY ?? "";
  const secretKey = process.env.REPLIZ_SECRET_KEY ?? "";
  const token = Buffer.from(`${accessKey}:${secretKey}`).toString("base64");
  return `Basic ${token}`;
}

type FetchOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | string[]>;
};

async function replizFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  let url = `${BASE_URL}${path}`;

  if (opts.params) {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(opts.params)) {
      if (Array.isArray(val)) {
        val.forEach((v) => qs.append(`${key}[]`, v));
      } else {
        qs.set(key, String(val));
      }
    }
    const queryString = qs.toString();
    if (queryString) url += `?${queryString}`;
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 429) {
    throw new ReplizRateLimitError("Repliz rate limit reached. Try again shortly.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ReplizApiError(`Repliz API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export class ReplizApiError extends Error {}
export class ReplizRateLimitError extends ReplizApiError {}

// ── Types ────────────────────────────────────────────────────────────────────

export type ReplizAccount = {
  _id: string;
  id: string;
  generatedId: string;
  name: string;
  username: string;
  picture: string;
  isConnected: boolean;
  type: string; // "facebook" | "instagram" | "threads" | "tiktok" | ...
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type PaginatedResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

export type ReplizComment = {
  _id: string;
  id: string;
  status: string; // "pending" | "replied" | "hidden"
  comment: {
    id: string;
    type: string;
    text: string;
    owner: { id: string; name: string; picture: string };
    createdAt: string;
  };
  content: {
    id: string;
    title: string;
    description: string; // caption post
    topic: string;
    type: string;        // "video" | "image" | "carousel" | "story" | "reel"
    url?: string;
    owner: { id: string; name: string; picture: string };
    medias?: Array<{
      type: string;
      thumbnail?: string;
      url?: string;
    }>;
    createdAt?: string;
  };
  accountId: string;
  account: ReplizAccount;
  createdAt: string;
  updatedAt: string;
};

export type ReplizChat = {
  _id: string;
  id: string;
  accountId: string;
  senderId: string;
  senderName: string;
  senderPicture: string;
  unreadCount: number;
  lastMessage: {
    isFromMe: boolean;
    messageId: string;
    type: string;
    status: string;
    text: string;
    sendAt: string;
    fromSenderAt: string;
  };
  account: ReplizAccount;
  createdAt: string;
  updatedAt: string;
};

export type ReplizMessage = {
  _id: string;
  chatId: string;
  messageId: string;
  senderId: string;
  type: string;
  status: string;
  isFromMe: boolean;
  text?: string;
  createdAt: string;
  image?: {
    url: string;
    thumbnail: string;
    mimetype: string;
  };
  video?: {
    url: string;
    thumbnail: string;
    duration: number;
    mimetype: string;
  };
  ig_post?: {
    url?: string;
    thumbnail?: string;
  };
};

export type ReplizContent = {
  id: string;
  title: string;
  description: string;
  topic: string;
  type: string; // "album" | "video" | "image" | "reel" | "story"
  url?: string;
  owner: { id: string; name: string; picture: string };
  medias: Array<{
    type: string;
    thumbnail?: string;
    url?: string;
  }>;
  createdAt: string;
};

export type ReplizAccountStats = {
  // Facebook / Instagram common fields
  followersCount?: number;
  comments?: number;
  likes?: number;
  reach?: number;
  totalInteractions?: number;
  views?: number;
  // Allow extra platform-specific fields
  [key: string]: unknown;
};

// ── Account endpoints ────────────────────────────────────────────────────────

/** List all accounts connected to this Repliz workspace */
export async function listAccounts(
  page = 1,
  limit = 100
): Promise<PaginatedResponse<ReplizAccount>> {
  return replizFetch<PaginatedResponse<ReplizAccount>>("/account", {
    params: { page, limit },
  });
}

/** Get summary stats for one account */
export async function getAccountStats(accountId: string): Promise<ReplizAccountStats> {
  return replizFetch<ReplizAccountStats>(`/account/${accountId}/statistic`);
}

// ── Comments endpoints ───────────────────────────────────────────────────────

/** Get comments for an account, optionally filtered by status */
export async function getComments(
  accountId: string,
  status = "pending",
  page = 1,
  limit = 50
): Promise<PaginatedResponse<ReplizComment>> {
  return replizFetch<PaginatedResponse<ReplizComment>>("/comment", {
    params: { "accountIds[]": [accountId], status, page, limit },
  });
}

/** Reply to a comment — marks it as replied in Repliz */
export async function replyToComment(commentId: string, text: string): Promise<void> {
  await replizFetch(`/comment/${commentId}`, {
    method: "POST",
    body: { text },
  });
}

// ── Chat endpoints ───────────────────────────────────────────────────────────

/** List conversations for an account */
export async function listChats(
  accountId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<ReplizChat>> {
  return replizFetch<PaginatedResponse<ReplizChat>>("/chat", {
    params: { "accountIds[]": [accountId], page, limit },
  });
}

/** Get messages in a conversation */
export async function getMessages(
  chatId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<ReplizMessage>> {
  return replizFetch<PaginatedResponse<ReplizMessage>>(`/chat/${chatId}/message`, {
    params: { page, limit },
  });
}

/** Send a message in a conversation */
export async function sendMessage(chatId: string, text: string): Promise<void> {
  await replizFetch(`/chat/${chatId}/message`, {
    method: "POST",
    body: { type: "text", text },
  });
}

// ── Content endpoints ─────────────────────────────────────────────────────────

/** Get content/posts for an account */
export async function getContent(
  accountId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<ReplizContent>> {
  return replizFetch<PaginatedResponse<ReplizContent>>("/content", {
    params: { accountId, page, limit },
  });
}

// ── Pagination helper ─────────────────────────────────────────────────────────

/** Fetch all pages of a paginated endpoint, up to maxItems total */
export async function fetchAllPages<T>(
  fetcher: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  limit = 100,
  maxItems = 500
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && all.length < maxItems) {
    const result = await fetcher(page, limit);
    all.push(...result.docs);
    hasMore = result.hasNextPage;
    page++;
  }

  return all;
}

export interface PanXPostUpdate {
  hasLiked?: boolean;
  likesCount?: number;
  hasReposted?: boolean;
  repostsCount?: number;
  repliesCount?: number;
  sharesCount?: number;
}

const STORAGE_KEY = 'panx-post-updates';
const EVENT_NAME = 'panx-post-updated';
const RECONCILIATION_WINDOW_MS = 15_000;
type StoredPostUpdate = PanXPostUpdate & { _syncedAt: number };

const readUpdates = (): Record<string, StoredPostUpdate> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export const publishPanXPostUpdate = (postId: string, update: PanXPostUpdate) => {
  const updates = readUpdates();
  updates[postId] = { ...updates[postId], ...update, _syncedAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { postId, update } }));
};

export const applyPanXPostUpdates = <T extends { id: string }>(posts: T[]): T[] => {
  const updates = readUpdates();
  return posts.map(post => {
    const stored = updates[post.id];
    if (!stored || Date.now() - stored._syncedAt > RECONCILIATION_WINDOW_MS) return post;

    const merged: T & PanXPostUpdate = { ...post };
    const current = post as T & PanXPostUpdate;

    // Matching viewer state means the server has observed our mutation; retain its newer aggregate.
    if (stored.hasLiked !== undefined && current.hasLiked !== stored.hasLiked) {
      merged.hasLiked = stored.hasLiked;
      merged.likesCount = stored.likesCount;
    }
    if (stored.hasReposted !== undefined && current.hasReposted !== stored.hasReposted) {
      merged.hasReposted = stored.hasReposted;
      merged.repostsCount = stored.repostsCount;
    }
    if (stored.repliesCount !== undefined) {
      merged.repliesCount = Math.max(current.repliesCount || 0, stored.repliesCount);
    }
    if (stored.sharesCount !== undefined) {
      merged.sharesCount = Math.max(current.sharesCount || 0, stored.sharesCount);
    }

    return merged;
  });
};

export const subscribeToPanXPostUpdates = (listener: (postId: string, update: PanXPostUpdate) => void) => {
  const handleUpdate = (event: Event) => {
    const { postId, update } = (event as CustomEvent<{ postId: string; update: PanXPostUpdate }>).detail;
    listener(postId, update);
  };

  window.addEventListener(EVENT_NAME, handleUpdate);
  return () => window.removeEventListener(EVENT_NAME, handleUpdate);
};

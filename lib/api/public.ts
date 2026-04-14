/**
 * Public API Services for Abharana Kakal
 * These do NOT require authentication and are used for public data fetching.
 */

export const publicService = {
  upcomingSessions: {
    list: async () => {
      const res = await fetch('/api/sound-healing/upcoming');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch upcoming sessions');
      return data;
    },
    get: async (id: string) => {
      const res = await fetch(`/api/sound-healing/upcoming/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch session details');
      return data;
    }
  },
  retreats: {
    get: async (id: string) => {
      // id can be a UUID or a title-based slug
      const res = await fetch(`/api/retreats/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch retreat details');
      return data;
    }
  }
};

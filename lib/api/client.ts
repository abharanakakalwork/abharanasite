import axios from 'axios';

/**
 * Axios instance configured for the Admin Panel APIs.
 * Automatically attaches the JWT token from localStorage.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Unauthorized/Expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('admin_token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Modular API Services for the Admin Panel
 */

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  sessions: {
    list: () => api.get('/auth/sessions'),
    revoke: (id?: string) => api.delete('/auth/sessions', { params: { id } }),
  }
};

export const enquiryService = {
  list: (status?: string) => api.get('/enquiries', { params: { status } }),
  create: (data: any) => api.post('/enquiries', data),
  update: (id: string, data: any) => api.patch(`/enquiries/${id}`, data),
  delete: (id: string) => api.delete(`/enquiries/${id}`),
};

export const soundService = {
  list: () => api.get('/sound-healing'),
  create: (data: FormData | any) => api.post('/sound-healing', data),
  update: (id: string, data: FormData | any) => api.patch(`/sound-healing/${id}`, data),
  delete: (id: string) => api.delete(`/sound-healing/${id}`),
  upcoming: {
    list: () => api.get('/sound-healing/upcoming'),
    create: (data: FormData | any) => api.post('/sound-healing/upcoming', data),
    update: (id: string, data: FormData | any) => api.patch(`/sound-healing/upcoming/${id}`, data),
    delete: (id: string) => api.delete(`/sound-healing/upcoming/${id}`),
  }
};

export const retreatService = {
  list: () => api.get('/retreats'),
  create: (data: FormData | any) => api.post('/retreats', data),
  update: (id: string, data: FormData | any) => api.patch(`/retreats/${id}`, data),
  delete: (id: string) => api.delete(`/retreats/${id}`),
};

export const blogService = {
  posts: {
    list: (category_id?: string) => api.get('/within/posts', { params: { category_id } }),
    create: (data: FormData | any) => api.post('/within/posts', data),
    update: (id: string, data: FormData | any) => api.patch(`/within/posts/${id}`, data),
    delete: (id: string) => api.delete(`/within/posts/${id}`),
  },
  categories: {
    list: () => api.get('/within/categories'),
    create: (name: string) => api.post('/within/categories', { name }),
  },
};

export const dashboardService = {
  stats: () => api.get('/dashboard/stats'),
};

export const mediaService = {
  upload: async (file: File, folder: string = 'images', onProgress?: (pct: number) => void) => {
    try {
      // 1. Fetch secure credentials from our API
      const credsRes = await api.get('/media/credentials');
      if (!credsRes.data.success) throw new Error('Could not fetch upload credentials');
      
      const { storageZone, accessKey, pullZone } = credsRes.data.credentials;
      
      // 2. Prepare the direct upload URL
      const fileName = file.name.replace(/\s+/g, '-');
      const uploadUrl = `https://storage.bunnycdn.com/${storageZone}/${folder}/${fileName}`;
      
      // 3. Perform direct binary upload to Bunny Storage (Bypassing Vercel)
      await axios.put(uploadUrl, file, {
        headers: { 
          'AccessKey': accessKey,
          'Content-Type': file.type || 'application/octet-stream' 
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });

      // 4. Return the public CDN URL
      return { data: { success: true, url: `https://${pullZone}/${folder}/${fileName}` } };
    } catch (err: any) {
      console.error('[DIRECT_UPLOAD_ERROR]:', err);
      throw err;
    }
  },
  purge: (url: string) => api.delete('/media/purge', { data: { url } }),
};

export const bookingService = {
  list: (params?: { type?: string; status?: string; page?: number; limit?: number; search?: string }) => api.get('/bookings', { params }),
  history: (email: string) => api.get('/bookings/history', { params: { email } }),
  update: (id: string, data: any) => api.patch(`/bookings/${id}`, data),
  delete: (id: string) => api.delete(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data), // Unified creation entry
};

export const pagesService = {
  get: (slug: string) => api.get(`/pages/${slug}`),
  update: (slug: string, data: any) => api.patch(`/pages/${slug}`, data),
};

export const downloadService = {
  list: () => api.get('/downloads'),
  create: (data: any) => api.post('/downloads', data),
  delete: (id: string) => api.delete(`/downloads/${id}`),
};

export const adminService = {
  paymentSettings: {
    get: () => api.get('/admin/payment-settings'),
    update: (data: any) => api.patch('/admin/payment-settings', data),
  },
  mail: {
    send: (data: { to: string; toName?: string; subject: string; message: string }) => api.post('/admin/send-mail', data),
  }
};

export const yogaService = {
  offerings: {
    list: () => api.get('/yoga/offerings'),
    create: (data: any) => api.post('/yoga/offerings', data),
    update: (id: string, data: any) => api.patch(`/yoga/offerings/${id}`, data),
    delete: (id: string) => api.delete(`/yoga/offerings/${id}`),
  },
  sessions: {
    list: (offering_id?: string) => api.get('/yoga/sessions', { params: { offering_id } }),
    create: (data: any) => api.post('/yoga/sessions', data),
    update: (id: string, data: any) => api.patch(`/yoga/sessions/${id}`, data),
    delete: (id: string) => api.delete(`/yoga/sessions/${id}`),
  },
  availability: {
    list: () => api.get('/yoga/availability-exceptions'),
    create: (data: any) => api.post('/yoga/availability-exceptions', data),
    delete: (date: string) => api.delete(`/yoga/availability-exceptions/${date}`),
  },
  bookings: {
    list: () => api.get('/yoga/bookings'),
    create: (data: any) => api.post('/bookings', data), // Unified endpoint
    update: (id: string, data: any) => api.patch(`/bookings/${id}`, data),
    delete: (id: string) => api.delete(`/bookings/${id}`),
  },
  paymentSettings: {
    get: () => api.get('/yoga/payment-settings'),
    update: (data: any) => api.patch('/yoga/payment-settings', data),
  }
};

export const courseService = {
  list: () => api.get('/admin/courses'),
  get: (id: string) => api.get(`/admin/courses/${id}`),
  create: (data: any) => api.post('/admin/courses', data),
  update: (id: string, data: any) => api.put(`/admin/courses/${id}`, data),
  delete: (id: string) => api.delete(`/admin/courses/${id}`),
  sections: {
    create: (data: any) => api.post('/admin/courses/sections', data),
    update: (id: string, data: any) => api.put(`/admin/courses/sections/${id}`, data),
    delete: (id: string) => api.delete(`/admin/courses/sections/${id}`),
  },
  lessons: {
    create: (data: any) => api.post('/admin/courses/lessons', data),
    update: (id: string, data: any) => api.put(`/admin/courses/lessons/${id}`, data),
    delete: (id: string) => api.delete(`/admin/courses/lessons/${id}`),
  }
};

export const videoService = {
  /**
   * 1. Get a secure upload session (placeholder + signature)
   */
  createSession: (title: string) => api.post('/admin/videos/upload-session', { title }),

  /**
   * 2. Perform direct upload to Bunny Stream via TUS
   * Bypasses Vercel's 4.5MB limit.
   */
  uploadFile: async (file: File, sessionData: any, onProgress?: (pct: number) => void) => {
    // Import TUS dynamically to avoid SSR issues
    const tus = (await import('tus-js-client')).Upload;

    return new Promise((resolve, reject) => {
      const upload = new tus(file, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: sessionData.signature,
          AuthorizationExpire: sessionData.expiration.toString(),
          VideoId: sessionData.videoId,
          LibraryId: sessionData.libraryId.toString(),
        },
        metadata: {
          filetype: file.type,
          title: sessionData.title,
        },
        onError: (error) => {
          console.error('[TUS_UPLOAD_ERROR]:', error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          if (onProgress) onProgress(percentage);
        },
        onSuccess: () => {
          resolve({ success: true, videoId: sessionData.videoId });
        },
      });

      upload.start();
    });
  }
};

import axios from 'axios'

/**
 * Shared axios instance for all API calls.
 * withCredentials is required so the browser sends and stores the session cookie
 * on cross-origin requests (e.g. localhost frontend → local emulator, or any
 * environment where the API origin differs from the page origin).
 */
const api = axios.create({
  withCredentials: true,
})

export default api

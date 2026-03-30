import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api'

/*
WHY a custom axios instance?
Instead of writing the base URL in every single API call,
we create one instance with it pre-configured.
Every request automatically goes to our Django backend.
This is the DRY principle — Don't Repeat Yourself.
BEGINNER MISTAKE: hardcoding the full URL in every component.
If you change the backend URL, you'd have to update 50 files.
*/
// const api = axios.create({
//     baseURL: BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// })
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    /*
    WHY import.meta.env?
    Vite uses import.meta.env to read environment variables.
    In development: reads .env.development → localhost
    In production build: reads .env.production → Render URL
    This means ONE codebase works in both environments
    without any manual URL changes.
    BEGINNER MISTAKE: hardcoding the backend URL —
    you'd have to change it every time you deploy.
    */
    headers: {
        'Content-Type': 'application/json',
    },
})

/*
WHY request interceptor?
The PDF says: "Send token as Authorization: Bearer <token>"
Instead of manually adding the token in every API call,
the interceptor automatically attaches it to EVERY request.
It runs silently before every request is sent.
BEGINNER MISTAKE: manually adding headers in every component —
you'll forget it somewhere and get 401 errors.
*/
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

/*
WHY response interceptor?
When access token expires (after 60 mins), every API call
returns 401 Unauthorized. Instead of logging the user out,
we silently use the refresh token to get a new access token
and retry the original request — user never notices.
This is called "silent token refresh" — the PDF requires it.
BEGINNER MISTAKE: not handling token expiry, forcing users
to re-login every 60 minutes — terrible user experience.
*/
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            /*
            WHY _retry flag?
            Prevents infinite loops. If the refresh also fails,
            we don't keep retrying forever — we logout the user.
            */

            try {
                const refresh = localStorage.getItem('refresh_token')
                const response = await axios.post(
                    `${BASE_URL}/users/login/refresh/`,
                    { refresh }
                )

                const newAccess = response.data.access
                localStorage.setItem('access_token', newAccess)
                originalRequest.headers.Authorization = `Bearer ${newAccess}`

                return api(originalRequest)
            } catch (refreshError) {
                // Refresh failed — clear tokens and redirect to login
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)


export default api
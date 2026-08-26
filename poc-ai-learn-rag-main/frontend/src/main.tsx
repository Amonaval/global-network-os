import '../../public/css/app.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Apply saved theme before React mounts to prevent flash
if (localStorage.getItem('kh_theme') === 'dark') document.documentElement.classList.add('dark')
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

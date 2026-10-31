import { useEffect } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { AppShell } from './components/AppShell'
import { Toaster } from './components/Toaster'
import { useGame } from './state/store'
import { setSoundEnabled } from './lib/sound'
import { setHapticsEnabled } from './lib/haptics'
import Onboarding from './screens/onboarding/Onboarding'
import LearnScreen from './screens/learn/LearnScreen'
import GuidebookScreen from './screens/learn/GuidebookScreen'
import LessonScreen from './screens/lesson/LessonScreen'
import ToolsScreen from './screens/tools/ToolsScreen'
import ToolPage from './screens/tools/ToolPage'
import LeagueScreen from './screens/league/LeagueScreen'
import ShopScreen from './screens/shop/ShopScreen'
import ProfileScreen from './screens/profile/ProfileScreen'
import SettingsScreen from './screens/profile/SettingsScreen'
import BadgesScreen from './screens/profile/BadgesScreen'

/*
  Routes (HashRouter, so URLs look like  .../#/learn  and work on any host):

  /welcome              first-run onboarding (full screen)
  /learn                the lesson path (home)
  /unit/:unitId         a unit's guidebook (key ideas + fun facts)
  /lesson/:lessonId     play a lesson (full screen)
  /quiz/:unitId         play a unit quiz (full screen)
  /practice             review past mistakes (full screen)
  /tools                tool list;  /tools/:toolId  one tool
  /league               weekly leaderboard
  /shop                 shop + coin vault
  /profile              stats;  /profile/badges  /profile/settings
*/
export default function App() {
  return (
    <HashRouter>
      <Effects />
      <Toaster />
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route element={<RequireOnboarding />}>
          <Route path="/lesson/:lessonId" element={<LessonScreen mode="lesson" />} />
          <Route path="/quiz/:unitId" element={<LessonScreen mode="quiz" />} />
          <Route path="/practice" element={<LessonScreen mode="practice" />} />
          <Route element={<AppShell />}>
            <Route path="/learn" element={<LearnScreen />} />
            <Route path="/unit/:unitId" element={<GuidebookScreen />} />
            <Route path="/tools" element={<ToolsScreen />} />
            <Route path="/tools/:toolId" element={<ToolPage />} />
            <Route path="/league" element={<LeagueScreen />} />
            <Route path="/shop" element={<ShopScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/profile/badges" element={<BadgesScreen />} />
            <Route path="/profile/settings" element={<SettingsScreen />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </HashRouter>
  )
}

function RequireOnboarding() {
  const onboarded = useGame((s) => s.onboarded)
  const location = useLocation()
  if (!onboarded) return <Navigate to="/welcome" replace state={{ from: location.pathname }} />
  return <Outlet />
}


/** App-wide side effects: theme, sound settings, and keeping timers in sync. */
function Effects() {
  const theme = useGame((s) => s.settings.theme)
  const sound = useGame((s) => s.settings.sound)
  const haptics = useGame((s) => s.settings.haptics)
  const syncTime = useGame((s) => s.syncTime)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#131a20' : '#ffffff')
  }, [theme])

  useEffect(() => setSoundEnabled(sound), [sound])
  useEffect(() => setHapticsEnabled(haptics), [haptics])

  useEffect(() => {
    syncTime()
    const onVis = () => document.visibilityState === 'visible' && syncTime()
    document.addEventListener('visibilitychange', onVis)
    const t = setInterval(() => syncTime(), 60_000)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      clearInterval(t)
    }
  }, [syncTime])

  return null
}

import { CssBaseline } from '@mui/material'
import './App.css'
import ResponsiveAppBar from './components/ResponsiveAppBar'
import { ControlsPanel } from './components/controls/ControlsPanel'

function App() {

  return (
    <CssBaseline>
      <ResponsiveAppBar />
      <ControlsPanel />
    </CssBaseline>
  )
}

export default App

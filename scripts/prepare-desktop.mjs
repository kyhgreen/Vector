// Puts the single-file build inside the desktop app folder (run by the desktop scripts).
import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('desktop/app', { recursive: true })
copyFileSync('dist-single/index.html', 'desktop/app/index.html')
console.log('Desktop app files ready.')

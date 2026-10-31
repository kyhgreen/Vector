// Copies the single-file build to submission/Vector.html (run by `npm run build:file`).
import { copyFileSync, mkdirSync, statSync } from 'node:fs'

mkdirSync('submission', { recursive: true })
copyFileSync('dist-single/index.html', 'submission/Vector.html')
const kb = Math.round(statSync('submission/Vector.html').size / 1024)
console.log(`\nDone: submission/Vector.html (${kb} KB). Double-click it to open the app.`)

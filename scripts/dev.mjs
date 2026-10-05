import { spawn } from 'node:child_process'

const children = [
  spawn(process.execPath, [
    '--env-file-if-exists=.env', '--import', 'tsx', '--watch', 'server/src/index.ts',
  ], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { stdio: 'inherit' }),
]

let stopping = false

function stopAll(signal = 'SIGTERM') {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null) child.kill(signal)
  }
}

for (const child of children) {
  child.on('error', () => {
    process.exitCode = 1
    stopAll()
  })
  child.on('exit', (code) => {
    if (!stopping) {
      process.exitCode = code && code > 0 ? code : 1
      stopAll()
    }
  })
}

process.on('SIGINT', () => stopAll('SIGINT'))
process.on('SIGTERM', () => stopAll('SIGTERM'))

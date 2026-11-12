import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const commands = {
  typecheck: [['tsc', '--noEmit', '-p', 'tsconfig.json']],
  bundle: [['tsc', '--noEmit', '-p', 'tsconfig.json'], ['tsdown']],
}
const mode = process.argv[2] ?? 'bundle'
if (!(mode in commands)) throw new Error(`Unknown task: ${mode}`)
for (const [tool, ...args] of commands[mode]) {
  const result = spawnSync(resolve(here, 'node_modules/.bin', tool), args, { cwd: here, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
if (mode === 'bundle') {
  mkdirSync(resolve(here, 'lib'), { recursive: true })
  for (const file of ['index.js', 'driver.js', 'projection.js', 'tools.js', 'access.js', 'setup.js', 'hud.js']) copyFileSync(resolve(here, 'src', file), resolve(here, 'lib', file))
  const { name } = JSON.parse(readFileSync(resolve(here, 'package.json'), 'utf8'))
  const registrations = []
  runInNewContext(readFileSync(resolve(here, 'lib/client.js'), 'utf8'), {
    window: { __ModuleLoader__: { load: (entry) => registrations.push(entry.id) } },
  })
  if (registrations.length !== 1 || registrations[0] !== name) {
    throw new Error(`Client module registration mismatch: expected ${name}, got ${JSON.stringify(registrations)}`)
  }
  console.log(`Verified client module registration: ${name}`)
}

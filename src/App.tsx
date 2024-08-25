import { createSignal } from 'solid-js'
import { test } from './gpu'
import './App.css'

function App() {
  const [output, setOutput] = createSignal('')

  const run = () => {
    let output
    try {
      output = test()
      output = JSON.stringify(output)
    } catch (e: unknown) {
      output = (e as any).message ?? e
    }
    setOutput(output)
  }

  run()

  return (
    <div class="card">
      <h1>Browser GPU</h1>
      <div>
        <button onClick={run}>
          Run
        </button>
      </div>
      <pre class="output">{output().slice(0, 150)}</pre>
    </div>
  )
}

export default App

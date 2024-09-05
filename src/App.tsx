import { createEffect, createSignal } from 'solid-js'
import { setup } from './gpu'
import './App.css'

function App() {
  let canvasRef!: HTMLCanvasElement 
  const [output, setOutput] = createSignal('')

  let gpu

  const run = () => {
    gpu ??= setup(canvasRef)

    let output

    try {
      const start = performance.now()

      gpu.setDimensions(100, 100)
      gpu.setData()
      output = gpu.compute()

      const end = performance.now()

      console.log(end - start)

      output = JSON.stringify(Array.from(output))
    } catch (e: unknown) {
      output = (e as any).message ?? e
    }
    setOutput(output)
  }

  createEffect(() => {
    run()
  })

  return (
    <div class='card'>
      <h1>Browser GPU</h1>
      <div>
        <button onClick={run}>
          Run
        </button>
      </div>
      <br />
      <canvas ref={canvasRef} class='canvas' />
      <br />
      <pre class='output'>{output().slice(0, 2500)}</pre>
    </div>
  )
}

export default App


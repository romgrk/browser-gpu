import { createEffect, createSignal } from 'solid-js'
import { setup } from './gpu'
import './App.css'

const inputs = [
    "display:inline-flex;align-items:center;justify-content:center;position:relative;box-sizing:border-box;-webkit-tap-highlight-color:transparent;background-color:transparent;outline:0;border:0;margin:0;border-radius:0;padding:0;cursor:pointer;user-select:none;vertical-align:middle;-moz-appearance:none;-webkit-appearance:none;text-decoration:none;color:inherit;&::-moz-focus-inner{border-style:none;}&.Mui-disabled{pointer-events:none;cursor:default;}@media print{color-adjust:exact;};box-sizing:border-box;transition:all 100ms ease-in;&:focus-visible{outline:3px solid hsla(210, 98%, 48%, 0.5);outline-offset:2px;}font-family:\"Inter\", \"sans-serif\";font-weight:500;font-size:0.875rem;line-height:1.75;text-transform:uppercase;min-width:64px;padding:6px 16px;border:0;border-radius:8px;transition:background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;&:hover{text-decoration:none;}&.Mui-disabled{color:rgba(0, 0, 0, 0.26);};;color:var(--variant-containedColor);background-color:var(--variant-containedBg);box-shadow:s;&:hover{box-shadow:a;@media (hover: none){box-shadow:s;}}&:active{box-shadow:0;}&.Mui-focusVisible{box-shadow:2;}&.Mui-disabled{color:rgba(0, 0, 0, 0.26);box-shadow:none;background-color:rgba(0, 0, 0, 0.12);};;--variant-textColor:hsl(210, 98%, 48%);--variant-outlinedColor:hsl(210, 98%, 48%);--variant-outlinedBorder:#027af280;--variant-containedColor:hsl(210, 100%, 95%);--variant-containedBg:hsl(210, 98%, 48%);@media (hover: hover){&:hover{--variant-containedBg:hsl(210, 100%, 35%);--variant-textBg:#027af20a;--variant-outlinedBorder:hsl(210, 98%, 48%);--variant-outlinedBg:#027af20a;}};;padding:4px 10px;font-size:0.8125rem;;;width:100%;;;box-shadow:none;border-radius:8px;text-transform:none;variants{props{size:small;}style{height:2.25rem;padding:8px 12px;};props{size:medium;}style{height:2.5rem;};props{color:primary;variant:contained;}style{color:white;background-color:hsl(220, 35%, 3%);background-image:linear-gradient(to bottom, hsl(220, 20%, 25%), hsl(220, 30%, 6%));box-shadow:inset 0 1px 0 hsl(220, 20%, 35%), inset 0 -1px 0 1px hsl(220, 0%, 0%);border:1px solid hsl(220, 20%, 25%);&:hover{background-image:none;background-color:hsl(220, 20%, 25%);box-shadow:none;}&:active{background-color:hsl(220, 30%, 6%);}};props{color:secondary;variant:contained;}style{color:white;background-color:hsl(210, 100%, 65%);background-image:linear-gradient(to bottom, hsla(210, 98%, 48%, 0.8), hsl(210, 98%, 42%));box-shadow:inset 0 2px 0 hsla(210, 100%, 80%, 0.2), inset 0 -2px 0 hsla(210, 100%, 35%, 0.4);border:1px solid hsl(210, 98%, 42%);&:hover{background-color:hsl(210, 100%, 35%);box-shadow:none;}&:active{background-color:hsl(210, 100%, 35%);background-image:none;}};props{variant:outlined;}style{color:hsl(220, 30%, 6%);border:1px solid;border-color:hsl(220, 20%, 88%);background-color:hsla(220, 35%, 97%, 0.3);&:hover{background-color:hsl(220, 30%, 94%);border-color:hsl(220, 20%, 80%);}&:active{background-color:hsl(220, 20%, 88%);}};props{color:secondary;variant:outlined;}style{color:hsl(210, 100%, 35%);border:1px solid;border-color:hsl(210, 100%, 80%);background-color:hsl(210, 100%, 95%);&:hover{background-color:hsl(210, 100%, 92%);border-color:hsl(210, 98%, 48%);}&:active{background-color:hsla(210, 100%, 80%, 0.7);}};props{variant:text;}style{color:hsl(220, 20%, 35%);&:hover{background-color:hsl(220, 30%, 94%);}&:active{background-color:hsl(220, 20%, 88%);}};props{color:secondary;variant:text;}style{color:hsl(210, 100%, 35%);&:hover{background-color:hsla(210, 100%, 92%, 0.5);}&:active{background-color:hsla(210, 100%, 80%, 0.7);}};};height:2.25rem;padding:8px 12px;;color:white;background-color:hsl(220, 35%, 3%);background-image:linear-gradient(to bottom, hsl(220, 20%, 25%), hsl(220, 30%, 6%));box-shadow:inset 0 1px 0 hsl(220, 20%, 35%), inset 0 -1px 0 1px hsl(220, 0%, 0%);border:1px solid hsl(220, 20%, 25%);&:hover{background-image:none;background-color:hsl(220, 20%, 25%);box-shadow:none;}&:active{background-color:hsl(220, 30%, 6%);};;;;;;;;;;",
]
inputs[0] = inputs[0].repeat(100)

function App() {
  let canvasRef!: HTMLCanvasElement 
  const [output, setOutput] = createSignal('')

  let compute = setup

  const run = () => {
    let output
    try {
      output = compute(canvasRef)
      output = JSON.stringify(output)
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


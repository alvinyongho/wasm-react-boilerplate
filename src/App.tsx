import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

type Wasm = typeof import("wasm");

interface CanvasProps {
  wasm: Wasm;
}


function startRenderer(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, wasm: Wasm) {
  // Support semi-transparent objects (Performance cost)
  gl.enable(gl.BLEND);
  // Blend function (how transparent it is)
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  const FPS_THROTTLE = 1000.0 / 30.0; // milliseconds / frames
  let lastDrawTime = -1;
  const initialTime = Date.now();

  const game = new wasm.Game(1, 1);

  // When to render.
  function render() {
    // Render on the next animation frame.
    window.requestAnimationFrame(render);
    const currTime = Date.now();

    if (currTime >=lastDrawTime+FPS_THROTTLE) {
      lastDrawTime = currTime;
      if (window.innerHeight != canvas.height || window.innerWidth != canvas.width) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        gl.viewport(0,0,window.innerWidth, window.innerHeight);
      }
      
      let elapsedTime = currTime-initialTime;
      game.update(elapsedTime, window.innerHeight, window.innerWidth);
      game.render();
      // Rust Update call. ie. collisions
      // Rust Render call. creating an image
    }
  }
  render();
}

const Canvas = (props: CanvasProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<WebGLRenderingContext | null>(
    null
  );

  React.useEffect(() => {
    if (canvasRef.current) {
      const gl = canvasRef.current.getContext('webgl', {antialias: true});

      if (gl) {
        startRenderer(gl, canvasRef.current, props.wasm);
        setContext(gl);
      }
    }
  }, [context]);

  return (
    <canvas ref={canvasRef} {...props}></canvas>
  );
}


function App() {
  const [wasmImport, setWasmImport] = React.useState<typeof import("wasm") | null>(null);

  useEffect( () => {
    (async()=>{
      const module  = await import("wasm");
      setWasmImport(module);
    })();
  }, []);

  if(!wasmImport) {
    return (<div>Loading...</div>);
  } 
  
  return (
    <div className="App">
      <Canvas wasm={wasmImport}></Canvas>
    </div>
  );
}

export default App;

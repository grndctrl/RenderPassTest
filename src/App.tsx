import "./index.css";
import {
  Canvas,
  useThree,
  extend,
  ReactThreeFiber,
  useFrame
} from "@react-three/fiber";
import { OrbitControls, Detailed } from "@react-three/drei";
import { useMemo, useCallback, useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three-stdlib";
// @ts-ignore
import { RenderPixelatedPass } from "./RenderPixelatedPass";

/**
 * DESCRIPTION:
 *
 * Scene contains 50 normal boxes and 50 LevelOfDetail boxes
 * when user clicks on box its object adds to selected objects of outline pass
 * Expected: only one box is outlined at a time
 * Actual: alongside with selected box all LOD boxes are outlined
 *
 * Click on any box to reproduce
 * (Click again on box to clear outline)
 */

extend({ EffectComposer, RenderPixelatedPass });

declare global {
  // eslint-disable-next-line
  namespace JSX {
    interface IntrinsicElements {
      renderPixelatedPass: ReactThreeFiber.Node<
        RenderPixelatedPass,
        typeof RenderPixelatedPass
      >;
    }
  }
}

const Scene = () => {
  // const gl = useThree(({ gl }) => gl);
  // const size = useThree(({ size }) => size);
  // const scene = useThree(({ scene }) => scene);
  // const camera = useThree(({ camera }) => camera);

  const { gl, size, scene, camera } = useThree();
  const composer = useRef<EffectComposer>();

  useEffect(() => {
    composer.current?.setSize(size.width, size.height);
    composer.current?.setPixelRatio(gl.getPixelRatio());
  }, [gl, size]);

  useFrame(() => {
    composer.current?.render();
  }, 1);

  const positions: THREE.Vector3[] = useMemo(
    () =>
      [...Array(10)].flatMap((_, row, rows) =>
        [...Array(10)].map(
          (_, col, cols) =>
            new THREE.Vector3(
              (row - rows.length / 2) * 10,
              0,
              (col - cols.length / 2) * 10
            )
        )
      ),
    []
  );

  const onClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  return (
    <>
      <color attach="background" args={[0x000000]} />

      <OrbitControls enableDamping={false} />

      <ambientLight intensity={0.4} />

      {positions.map((pos, i) =>
        i < positions.length / 2 ? (
          <mesh onClick={onClick} position={pos} key={`${pos.x}-${pos.z}`}>
            <boxBufferGeometry args={[5, 5, 5]} />
            <meshBasicMaterial color="hotpink" />
          </mesh>
        ) : (
          <Detailed
            distances={[20, 40, 60]}
            onClick={onClick}
            position={pos}
            key={`${pos.x}-${pos.z}`}
          >
            <mesh>
              <boxBufferGeometry args={[5, 5, 5]} />
              <meshBasicMaterial color="red" />
            </mesh>
            <mesh>
              <boxBufferGeometry args={[5, 5, 5]} />
              <meshBasicMaterial color="green" />
            </mesh>
            <mesh>
              <boxBufferGeometry args={[5, 5, 5]} />
              <meshBasicMaterial color="blue" />
            </mesh>
          </Detailed>
        )
      )}

      <effectComposer ref={composer} args={[gl]}>
        {/* <renderPass attachArray="passes" args={[scene, camera]} /> */}
        <renderPixelatedPass
          attachArray="passes"
          args={[new THREE.Vector2(size.width, size.height), 2, scene, camera]}
        />
      </effectComposer>
    </>
  );
};

export default function App() {
  return (
    <Canvas
      style={{ height: "100%", width: "100%" }}
      camera={{ position: [-10, 4, 20], fov: 70 }}
    >
      <Scene />
    </Canvas>
  );
}

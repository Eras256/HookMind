// @ts-nocheck
"use client";
import { Canvas, useFrame, useThree, ThreeElements } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// ── Vertex Shader — GPU Particle Physics ─────────────────────────────────
const VERTEX_SHADER = /* glsl */`
  uniform float  uTime;
  uniform vec2   uMouse;
  uniform float  uDeltaTime;
  attribute vec3 aPosition;
  attribute float aSpeed;
  attribute float aSize;
  varying float vDistance;
  void main() {
    vec3 pos = aPosition;
    // Cursor gravity attractor: F = k / r^2
    float k = 0.012;
    vec2  toMouse  = uMouse - pos.xy;
    float dist     = length(toMouse) + 0.001;
    float force    = k / (dist * dist);
    pos.xy        += normalize(toMouse) * force * uDeltaTime * aSpeed;
    // Curl noise for organic turbulence
    float curl = sin(pos.x * 2.3 + uTime * 0.4)
               * cos(pos.y * 1.7 + uTime * 0.3) * 0.003;
    pos.xy += vec2(-curl, curl);
    // Bounds wrapping — infinite field
    pos.x = mod(pos.x + 3.0, 6.0) - 3.0;
    pos.y = mod(pos.y + 3.0, 6.0) - 3.0;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDistance = length(mvPosition.xyz);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position  = projectionMatrix * mvPosition;
  }
`;
// ── Fragment Shader — Particle Glow ──────────────────────────────────────
const FRAGMENT_SHADER = /* glsl */`
  uniform vec3 uColor;
  varying float vDistance;
  void main() {
    vec2  c    = gl_PointCoord - 0.5;
    float dist = length(c);
    if (dist > 0.5) discard;
    float alpha  = 1.0 - smoothstep(0.2, 0.5, dist);
    float glow   = exp(-dist * 8.0) * 0.6;
    float fade   = 1.0 - smoothstep(3.0, 6.0, vDistance);
    gl_FragColor = vec4(uColor, (alpha + glow) * fade * 0.7);
  }
`;
// ── Particles Component ───────────────────────────────────────────────────
function Particles({ count = 50000 }: { count?: number }) {
    const meshRef = useRef<THREE.Points>(null!);
    const mouseRef = useRef(new THREE.Vector2(0, 0));
    const prevTime = useRef(0);
    const { size } = useThree();
    // Track mouse for attractor
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / size.width) * 2 - 1;
            mouseRef.current.y = -(e.clientY / size.height) * 2 + 1;
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [size]);
    // Generate particle attributes
    const { positions, speeds, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        const sizes_ = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
            speeds[i] = Math.random() * 0.5 + 0.5;
            sizes_[i] = Math.random() * 2.0 + 0.5;
        }
        return { positions, speeds, sizes: sizes_ };
    }, [count]);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uDeltaTime: { value: 0.016 },
        uColor: { value: new THREE.Color(0x06B6D4) },
    }), []);
    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        const dt = t - prevTime.current;
        prevTime.current = t;
        uniforms.uTime.value = t;
        uniforms.uDeltaTime.value = dt;
        uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
    });
    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aPosition" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={VERTEX_SHADER}
                fragmentShader={FRAGMENT_SHADER}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
// ── Export ────────────────────────────────────────────────────────────────
export function NeuralCanvas() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 3], fov: 75 }}
                gl={{ antialias: false, alpha: true }}
                dpr={[1, 1.5]}
            >
                <Particles count={50000} />
            </Canvas>
        </div>
    );
}

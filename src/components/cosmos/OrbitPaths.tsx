"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { SPECIALISTS } from "@/lib/specialists";

export function OrbitPaths() {
  const lineLoops = useMemo(() => {
    return Object.values(SPECIALISTS)
      .filter((s) => s.orbitRadius > 0 && !s.parentPlanetId)
      .map((spec) => {
        const segments = 128;
        const points = [];
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(theta) * spec.orbitRadius,
              0,
              Math.sin(theta) * spec.orbitRadius
            )
          );
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: "#94a3b8",
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const loop = new THREE.LineLoop(geometry, material);
        return {
          id: spec.id,
          loop,
        };
      });
  }, []);

  return (
    <group>
      {lineLoops.map((item) => (
        <primitive key={item.id} object={item.loop} />
      ))}
    </group>
  );
}

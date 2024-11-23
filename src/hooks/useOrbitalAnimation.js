import { useState } from 'react';

export const useOrbitalAnimation = (initialScale = 1) => {
  const [scale, setScale] = useState(initialScale);

  const calculateNodePosition = (node, allNodes, center) => {
    if (node.type === 'sun') {
      return center;
    }

    // Only handle planets orbiting around the sun
    if (node.type === 'planet') {
      const planets = allNodes.filter(n => n.type === 'planet');
      const index = planets.findIndex(n => n.id === node.id);
      const totalPlanets = planets.length;
      const angle = (2 * Math.PI * index) / Math.max(totalPlanets, 1);
      const radius = 200 * scale;

      return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      };
    }

    return center;
  };

  return {
    scale,
    setScale,
    calculateNodePosition
  };
};
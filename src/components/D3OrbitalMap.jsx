import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../hooks/useResizeObserver';

const D3OrbitalMap = ({ nodes, onNodeSelect }) => {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const dimensions = useResizeObserver(wrapperRef);
  
  useEffect(() => {
    if (!dimensions) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Define glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "5")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    svg.selectAll("*:not(defs)").remove();

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    const g = svg.append("g");

    // Define orbital rings configuration
    const orbitalRings = [
      { radius: 150, slots: 6 },   // Inner ring
      { radius: 250, slots: 8 },   // Middle ring
      { radius: 350, slots: 12 }   // Outer ring
    ];

    // Draw orbital rings with hover effect
    const rings = g.selectAll(".orbital-ring")
      .data(orbitalRings)
      .join("g")
      .attr("class", "orbital-ring");

    // Background ring for better hover area
    rings.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", d => d.radius)
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 30)
      .attr("class", "ring-hover-area")
      .style("cursor", "pointer");

    // Visible ring
    rings.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", d => d.radius)
      .attr("fill", "none")
      .attr("stroke", "#4B5563")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.3)
      .attr("class", "ring-path");

    // Calculate grid positions for each ring
    const gridPositions = orbitalRings.flatMap(ring => {
      return Array.from({ length: ring.slots }, (_, i) => {
        const angle = (i * 2 * Math.PI) / ring.slots;
        return {
          x: centerX + ring.radius * Math.cos(angle),
          y: centerY + ring.radius * Math.sin(angle),
          radius: ring.radius
        };
      });
    });

    // Draw grid points with hover effect
    const gridPoints = g.selectAll(".grid-point")
      .data(gridPositions)
      .join("circle")
      .attr("class", "grid-point")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 4)
      .attr("fill", "#4B5563")
      .attr("opacity", 0)
      .style("pointer-events", "none");

    // Initialize node positions
    nodes.forEach(node => {
      if (!node.x || !node.y) {
        if (node.type === 'sun') {
          node.x = centerX;
          node.y = centerY;
        } else {
          const availablePositions = gridPositions.filter(pos => {
            return !nodes.some(n => 
              n !== node && 
              n.x === pos.x && 
              n.y === pos.y
            );
          });

          if (availablePositions.length > 0) {
            const position = availablePositions[0];
            node.x = position.x;
            node.y = position.y;
          }
        }
      }
      node.fx = node.x;
      node.fy = node.y;
    });

    // Create node groups
    const nodeGroups = g.selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded))
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeSelect(d);
      });

    // Glow circle (initially hidden)
    nodeGroups.append("circle")
      .attr("class", "glow")
      .attr("r", d => (d.type === 'sun' ? 30 : d.type === 'planet' ? 20 : 12) * 1.5)
      .attr("fill", d => {
        if (d.type === 'sun') return '#FFB900';
        const categories = {
          strategy: '#36B37E',
          operations: '#6554C0',
          technology: '#FF8B00',
          hr: '#FF5630'
        };
        return categories[d.category] || '#36B37E';
      })
      .attr("opacity", 0)
      .attr("filter", "url(#glow)");

    // Node circles
    nodeGroups.append("circle")
      .attr("class", "node-circle")
      .attr("r", d => d.type === 'sun' ? 30 : d.type === 'planet' ? 20 : 12)
      .attr("fill", d => {
        if (d.type === 'sun') return '#FFB900';
        const categories = {
          strategy: '#36B37E',
          operations: '#6554C0',
          technology: '#FF8B00',
          hr: '#FF5630'
        };
        return categories[d.category] || '#36B37E';
      })
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Progress rings
    nodeGroups.append("circle")
      .attr("r", d => d.type === 'sun' ? 30 : d.type === 'planet' ? 20 : 12)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", d => {
        const radius = d.type === 'sun' ? 30 : d.type === 'planet' ? 20 : 12;
        const circumference = 2 * Math.PI * radius;
        return `${circumference * (d.progress / 100)} ${circumference}`;
      })
      .attr("transform", "rotate(-90)");

    // Labels
    nodeGroups.append("text")
      .attr("dy", d => d.type === 'sun' ? 45 : d.type === 'planet' ? 35 : 25)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", d => d.type === 'sun' ? 14 : 12)
      .text(d => d.name);

    // Status indicators
    nodeGroups.append("circle")
      .attr("cx", d => {
        const radius = d.type === 'sun' ? 30 : d.type === 'planet' ? 20 : 12;
        return radius * 0.7;
      })
      .attr("cy", d => {
        const radius = d.type === 'sun' ? 30 : d.type === 'planet' ? 20 : 12;
        return -radius * 0.7;
      })
      .attr("r", 4)
      .attr("fill", d => {
        switch (d.status) {
          case 'on-track': return '#10B981';
          case 'at-risk': return '#F59E0B';
          case 'delayed': return '#EF4444';
          default: return '#9CA3AF';
        }
      });

    // Update node positions
    nodeGroups.attr("transform", d => `translate(${d.x},${d.y})`);

    // Add hover effects
    nodeGroups
      .on("mouseenter", function() {
        d3.select(this).select(".glow")
          .transition()
          .duration(200)
          .attr("opacity", 0.3);
        
        d3.select(this).select(".node-circle")
          .transition()
          .duration(200)
          .attr("filter", "url(#glow)");

        // Show nearby grid points
        const node = d3.select(this).datum();
        gridPoints
          .filter(pos => {
            const distance = Math.hypot(pos.x - node.x, pos.y - node.y);
            return distance < 200; // Show points within range
          })
          .transition()
          .duration(200)
          .attr("opacity", 0.5);
      })
      .on("mouseleave", function() {
        d3.select(this).select(".glow")
          .transition()
          .duration(200)
          .attr("opacity", 0);
        
        d3.select(this).select(".node-circle")
          .transition()
          .duration(200)
          .attr("filter", null);

        // Hide grid points
        gridPoints
          .transition()
          .duration(200)
          .attr("opacity", 0);
      });

    // Highlight rings on hover
    rings.selectAll(".ring-hover-area")
      .on("mouseenter", function() {
        const ring = d3.select(this.parentNode).select(".ring-path");
        ring.transition()
          .duration(200)
          .attr("opacity", 0.6)
          .attr("stroke-width", 2);
      })
      .on("mouseleave", function() {
        const ring = d3.select(this.parentNode).select(".ring-path");
        ring.transition()
          .duration(200)
          .attr("opacity", 0.3)
          .attr("stroke-width", 1);
      });

    function dragStarted(event) {
      const node = d3.select(this);
      node.raise(); // Bring to front
      
      // Show all grid points during drag
      gridPoints
        .transition()
        .duration(200)
        .attr("opacity", 0.5);

      // Highlight rings
      rings.selectAll(".ring-path")
        .transition()
        .duration(200)
        .attr("opacity", 0.6)
        .attr("stroke-width", 2);
    }

    function dragged(event) {
      const node = d3.select(this);
      node.attr("transform", `translate(${event.x},${event.y})`);
      
      // Find nearest grid point
      const nearestPoint = gridPositions.reduce((nearest, pos) => {
        const distance = Math.hypot(event.x - pos.x, event.y - pos.y);
        if (distance < nearest.distance) {
          return { position: pos, distance };
        }
        return nearest;
      }, { position: null, distance: Infinity });

      // Highlight nearest point
      gridPoints
        .attr("opacity", pos => {
          if (pos === nearestPoint.position) return 1;
          return 0.5;
        })
        .attr("r", pos => {
          if (pos === nearestPoint.position) return 6;
          return 4;
        });
    }

    function dragEnded(event) {
      const nearestPosition = gridPositions.reduce((nearest, pos) => {
        const distance = Math.hypot(event.x - pos.x, event.y - pos.y);
        if (distance < nearest.distance) {
          return { position: pos, distance };
        }
        return nearest;
      }, { position: null, distance: Infinity });

      const isOccupied = nodes.some(n => 
        n !== event.subject && 
        n.x === nearestPosition.position.x && 
        n.y === nearestPosition.position.y
      );

      const node = d3.select(this);
      
      if (!isOccupied) {
        event.subject.x = nearestPosition.position.x;
        event.subject.y = nearestPosition.position.y;
        node.transition()
          .duration(200)
          .attr("transform", `translate(${event.subject.x},${event.subject.y})`);
      } else {
        node.transition()
          .duration(200)
          .attr("transform", `translate(${event.subject.fx},${event.subject.fy})`);
      }

      // Hide grid points
      gridPoints
        .transition()
        .duration(200)
        .attr("opacity", 0)
        .attr("r", 4);

      // Reset ring highlighting
      rings.selectAll(".ring-path")
        .transition()
        .duration(200)
        .attr("opacity", 0.3)
        .attr("stroke-width", 1);
    }

    return () => {
      svg.selectAll("*").remove();
    };
  }, [nodes, dimensions]);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default D3OrbitalMap;
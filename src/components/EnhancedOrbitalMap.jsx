import React, { useState } from 'react';
import { Map, Layout, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import NodeDetailsPanel from './NodeDetailsPanel';
import DashboardView from './DashboardView';
import D3OrbitalMap from './D3OrbitalMap';
import { initialNodes } from '../data/initialNodes';

const EnhancedOrbitalMap = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDashboardView, setIsDashboardView] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleNodeUpdate = (updatedNode) => {
    setNodes(nodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ));
    setSelectedNode(updatedNode);
  };

  // Process nodes to add source/target for D3
  const processedNodes = nodes.map(node => ({
    ...node,
    source: node,
    target: nodes.find(n => n.id === node.parentId)
  }));

  return (
    <div className={`w-full h-screen bg-background relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 space-y-2 z-10">
        <button 
          className="p-2 bg-card rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground shadow-lg"
          onClick={() => setIsDashboardView(!isDashboardView)}
          title={isDashboardView ? "Switch to Map View" : "Switch to Dashboard View"}
        >
          {isDashboardView ? <Map size={20} /> : <Layout size={20} />}
        </button>
        <button 
          className="p-2 bg-card rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground shadow-lg"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {isDashboardView ? (
        <DashboardView nodes={nodes} onUpdate={handleNodeUpdate} />
      ) : (
        <div className="relative w-full h-full">
          <D3OrbitalMap 
            nodes={processedNodes} 
            onNodeSelect={setSelectedNode}
          />

          {/* Node Details Panel */}
          {selectedNode && (
            <div className="absolute left-4 top-4 w-96 bg-card/90 backdrop-blur-sm p-6 text-card-foreground rounded-lg shadow-xl">
              <NodeDetailsPanel 
                node={selectedNode}
                onUpdate={handleNodeUpdate}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedOrbitalMap;
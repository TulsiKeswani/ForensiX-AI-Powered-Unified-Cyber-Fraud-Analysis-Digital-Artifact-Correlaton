import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { GraphNode, GraphEdge } from '../services/graphService';

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  activeFilter?: string;
}

// Crisp inline SVG vector icons
const createSvgIcon = (svgPath: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`
  );

const SVG_ICONS = {
  PERSON: createSvgIcon('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  PHONE: createSvgIcon('<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>'),
  BANK: createSvgIcon('<rect width="20" height="4" x="2" y="6" rx="1"/><path d="m3 10 9-7 9 7"/><path d="M4 10v10"/><path d="M9 10v10"/><path d="M15 10v10"/><path d="M20 10v10"/><rect width="20" height="2" x="2" y="20"/>'),
  UPI: createSvgIcon('<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v5"/>'),
  DEVICE: createSvgIcon('<rect width="18" height="12" x="3" y="4" rx="2"/><path d="M2 20h20"/>'),
  IP: createSvgIcon('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  APK: createSvgIcon('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
  EMAIL: createSvgIcon('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  URL: createSvgIcon('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  EVIDENCE: createSvgIcon('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a1 1 0 0 0 1 1h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'),
};

const PALETTE: Record<string, { bg: string; halo: string; labelType: string; icon: string }> = {
  PERSON:        { bg: '#8b5cf6', halo: '#c4b5fd', labelType: 'Person', icon: SVG_ICONS.PERSON },
  PHONE:         { bg: '#3b82f6', halo: '#93c5fd', labelType: 'Phone', icon: SVG_ICONS.PHONE },
  BANK_ACCOUNT:  { bg: '#f59e0b', halo: '#fde68a', labelType: 'Bank Account', icon: SVG_ICONS.BANK },
  UPI_ID:        { bg: '#10b981', halo: '#a7f3d0', labelType: 'UPI ID', icon: SVG_ICONS.UPI },
  IMEI:          { bg: '#06b6d4', halo: '#a5f3fc', labelType: 'IMEI', icon: SVG_ICONS.DEVICE },
  IMSI:          { bg: '#06b6d4', halo: '#a5f3fc', labelType: 'IMSI', icon: SVG_ICONS.DEVICE },
  IP_ADDRESS:    { bg: '#1d4ed8', halo: '#93c5fd', labelType: 'IP Address', icon: SVG_ICONS.IP },
  IP:            { bg: '#1d4ed8', halo: '#93c5fd', labelType: 'IP Address', icon: SVG_ICONS.IP },
  APK:           { bg: '#ef4444', halo: '#fca5a5', labelType: 'Scam APK', icon: SVG_ICONS.APK },
  EMAIL:         { bg: '#0284c7', halo: '#7dd3fc', labelType: 'Email', icon: SVG_ICONS.EMAIL },
  URL:           { bg: '#a855f7', halo: '#e9d5ff', labelType: 'URL', icon: SVG_ICONS.URL },
  EVIDENCE:      { bg: '#0d9488', halo: '#99f6e4', labelType: 'Evidence File', icon: SVG_ICONS.EVIDENCE },
  DEFAULT:       { bg: '#64748b', halo: '#cbd5e1', labelType: 'Entity', icon: SVG_ICONS.PERSON },
};

type LayoutMode = 'starburst' | 'flow' | 'organic' | 'circle';

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  activeFilter = 'All'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('starburst');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<{ title: string; type: string; risk: number; connections: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    // Filter nodes based on selected tab
    const filteredNodes = nodes.filter(n => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Financial') return n.type === 'BANK_ACCOUNT' || n.type === 'UPI_ID';
      if (activeFilter === 'Communication') return n.type === 'PHONE' || n.type === 'EMAIL';
      if (activeFilter === 'Device') return n.type === 'IMEI' || n.type === 'IMSI';
      if (activeFilter === 'Network') return n.type === 'IP_ADDRESS' || n.type === 'IP';
      if (activeFilter === 'Malware') return n.type === 'APK';
      if (activeFilter === 'Suspect') return (n.priority === 'high') || (n.id.includes('MULE') || n.id.includes('C2'));
      return true;
    });

    if (filteredNodes.length === 0) return;

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Calculate explicit uncluttered coordinates for Starburst layout mode
    const totalCount = filteredNodes.length;
    const centerNode = filteredNodes.find(n => n.id === 'ACC_BEED_MULE01' || n.id === 'ACC003') || filteredNodes[0];

    const innerRingNodes: GraphNode[] = [];
    const outerRingNodes: GraphNode[] = [];

    filteredNodes.forEach(n => {
      if (n.id === centerNode.id) return;
      if (n.priority === 'high' || n.type === 'BANK_ACCOUNT' || n.type === 'PHONE') {
        innerRingNodes.push(n);
      } else {
        outerRingNodes.push(n);
      }
    });

    const positions: Record<string, { x: number; y: number }> = {};
    positions[centerNode.id] = { x: 0, y: 0 };

    // Inner ring (Radius 240px)
    innerRingNodes.forEach((n, idx) => {
      const angle = (2 * Math.PI * idx) / Math.max(1, innerRingNodes.length);
      positions[n.id] = {
        x: Math.round(240 * Math.cos(angle)),
        y: Math.round(240 * Math.sin(angle)),
      };
    });

    // Outer ring (Radius 460px)
    outerRingNodes.forEach((n, idx) => {
      const angle = (2 * Math.PI * idx) / Math.max(1, outerRingNodes.length) + Math.PI / 8;
      positions[n.id] = {
        x: Math.round(460 * Math.cos(angle)),
        y: Math.round(460 * Math.sin(angle)),
      };
    });

    // Construct Cytoscape elements
    const elements: cytoscape.ElementDefinition[] = [
      ...filteredNodes.map(n => {
        const isVictim = n.group === 'victim' || n.id.includes('VIC') || n.label?.toLowerCase().includes('victim');
        const isKingpin = n.id === 'ACC_BEED_MULE01' || n.id === 'ACC003' || n.label?.includes('Kingpin') || n.label?.includes('Primary Mule');
        const isHighRisk = isKingpin || n.priority === 'high';

        let palette = isVictim 
          ? { bg: '#059669', halo: '#6ee7b7', labelType: 'Victim', icon: SVG_ICONS.PERSON } 
          : isKingpin 
          ? { bg: '#ef4444', halo: '#fca5a5', labelType: 'Main Suspect', icon: SVG_ICONS.BANK } 
          : (PALETTE[n.type] || PALETTE.DEFAULT);

        const nodeSize = isKingpin ? 60 : isHighRisk ? 54 : isVictim ? 46 : 48;

        const rawTitle = n.label || n.value || n.id;
        const typeSubtitle = palette.labelType;
        const formattedLabel = isHighRisk ? `${rawTitle}\n${typeSubtitle}\nHigh Risk` : `${rawTitle}\n${typeSubtitle}`;

        return {
          data: {
            id: n.id,
            label: formattedLabel,
            title: rawTitle,
            type: n.type,
            group: n.group || (isVictim ? 'victim' : 'suspect'),
            priority: n.priority || (isKingpin ? 'high' : 'normal'),
            riskScore: n.riskScore || (isKingpin ? 98 : isVictim ? 15 : 60),
            bgColor: palette.bg,
            haloColor: palette.halo,
            bgIcon: palette.icon,
            nodeSize,
            isKingpin,
            isHighRisk,
            isVictim,
          },
          position: positions[n.id] || { x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600 }
        };
      }),
      ...filteredEdges.map(e => {
        const edgeLabel = (e.label || e.type || '').replace(/_/g, ' ').toLowerCase();
        return {
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            label: edgeLabel,
          }
        };
      })
    ];

    const getLayoutConfig = (mode: LayoutMode): cytoscape.LayoutOptions => {
      switch (mode) {
        case 'starburst':
          return {
            name: 'preset',
            fit: true,
            padding: 90,
            animate: true,
            animationDuration: 500,
          };
        case 'flow':
          return {
            name: 'breadthfirst',
            animate: true,
            animationDuration: 600,
            directed: true,
            padding: 90,
            spacingFactor: 1.6,
          };
        case 'circle':
          return {
            name: 'circle',
            animate: true,
            animationDuration: 600,
            padding: 90,
          };
        case 'organic':
        default:
          return {
            name: 'cose',
            animate: true,
            animationDuration: 700,
            padding: 100,
            componentSpacing: 180,
            nodeOverlap: 60,
            nodeRepulsion: () => 40000,
            idealEdgeLength: () => 180,
            edgeElasticity: () => 12,
            gravity: 15,
            numIter: 1000,
          };
      }
    };

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#1e293b',
            'font-size': '10px',
            'font-weight': '600',
            'text-valign': 'bottom' as const,
            'text-halign': 'center' as const,
            'text-margin-y': 10,
            'text-wrap': 'wrap' as const,
            'text-max-width': '140px',
            'background-color': 'data(bgColor)',
            'background-image': 'data(bgIcon)',
            'background-fit': 'contain' as const,
            'background-clip': 'node' as const,
            'background-width': '55%',
            'background-height': '55%',
            'shape': 'ellipse' as const,
            'border-width': 3,
            'border-color': '#ffffff',
            'width': 'data(nodeSize)',
            'height': 'data(nodeSize)',
            'underlay-color': 'data(haloColor)',
            'underlay-padding': '12px',
            'underlay-opacity': 0.35,
            'underlay-shape': 'ellipse' as const,
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.95,
            'text-background-padding': '5px 8px',
            'text-background-shape': 'roundrectangle' as const,
            'text-border-width': 1,
            'text-border-color': '#cbd5e1',
            'text-border-opacity': 0.8,
            'transition-property': 'background-color, border-color, width, height, opacity',
            'transition-duration': 250,
          }
        },
        {
          selector: 'node[isHighRisk]',
          style: {
            'border-width': 3.5,
            'border-color': '#ffffff',
            'underlay-color': '#ef4444',
            'underlay-padding': '16px',
            'underlay-opacity': 0.45,
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#3b82f6',
            'underlay-color': '#3b82f6',
            'underlay-padding': '18px',
            'underlay-opacity': 0.6,
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle' as const,
            'arrow-scale': 0.9,
            'curve-style': 'bezier' as const,
            'label': 'data(label)',
            'font-size': '9px',
            'font-weight': '500',
            'color': '#475569',
            'text-rotation': 'autorotate' as const,
            'text-background-color': '#f1f5f9',
            'text-background-opacity': 0.95,
            'text-background-padding': '3px 7px',
            'text-background-shape': 'roundrectangle' as const,
            'text-border-width': 1,
            'text-border-color': '#cbd5e1',
            'opacity': 0.85,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': 250,
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 3.5,
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6',
            'opacity': 1,
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'underlay-padding': '16px',
            'underlay-opacity': 0.6,
            'opacity': 1,
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': 3.5,
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6',
            'opacity': 1,
          }
        },
        {
          selector: '.faded',
          style: {
            'opacity': 0.15,
          }
        }
      ],
      layout: getLayoutConfig(layoutMode)
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      onSelectNode(node.id());
    });

    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const pos = evt.renderedPosition;
      
      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass('faded');
      neighborhood.removeClass('faded').addClass('highlighted');

      setHoveredNode({
        title: node.data('title') || node.id(),
        type: node.data('type') || 'Entity',
        risk: node.data('riskScore') || 50,
        connections: node.degree(),
      });
      setTooltipPos({ x: pos.x + 15, y: pos.y - 15 });
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('faded').removeClass('highlighted');
      setHoveredNode(null);
      setTooltipPos(null);
    });

    cy.on('pan zoom', () => {
      setHoveredNode(null);
      setTooltipPos(null);
    });

    if (selectedNodeId) {
      const sel = cy.getElementById(selectedNodeId);
      if (sel && sel.length > 0) sel.select();
    }

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [nodes, edges, activeFilter, layoutMode]);

  useEffect(() => {
    if (!cyRef.current || !selectedNodeId) return;
    cyRef.current.nodes().unselect();
    const sel = cyRef.current.getElementById(selectedNodeId);
    if (sel && sel.length > 0) {
      sel.select();
      cyRef.current.animate({
        center: { eles: sel },
        zoom: 1.05,
        duration: 400,
      });
    }
  }, [selectedNodeId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!cyRef.current) return;
    cyRef.current.elements().removeClass('faded').removeClass('highlighted');

    if (!query.trim()) return;

    const matches = cyRef.current.nodes().filter(n => {
      const title = (n.data('title') || '').toLowerCase();
      const id = (n.id() || '').toLowerCase();
      return title.includes(query.toLowerCase()) || id.includes(query.toLowerCase());
    });

    if (matches.length > 0) {
      cyRef.current.elements().addClass('faded');
      matches.removeClass('faded').addClass('highlighted');
      matches.neighborhood().removeClass('faded').addClass('highlighted');
      
      cyRef.current.animate({
        fit: { eles: matches, padding: 80 },
        duration: 400,
      });
    }
  };

  const handleZoomIn = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current && cyRef.current.animate({ fit: { padding: 60 }, duration: 400 });
  const handleRearrange = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('faded').removeClass('highlighted');
      const layout = cyRef.current.layout({ name: layoutMode, animate: true, animationDuration: 600 } as any);
      layout.run();
    }
  };

  const legendItems = [
    { color: '#8b5cf6', label: 'Person' },
    { color: '#3b82f6', label: 'Phone' },
    { color: '#f59e0b', label: 'Bank Account' },
    { color: '#ef4444', label: 'High Risk / Mule' },
    { color: '#10b981', label: 'UPI ID' },
    { color: '#06b6d4', label: 'Device / IMEI' },
    { color: '#1d4ed8', label: 'IP Address' },
    { color: '#0284c7', label: 'Email' },
    { color: '#a855f7', label: 'URL' },
    { color: '#0d9488', label: 'Evidence File' },
  ];

  return (
    <div className="relative w-full h-[650px] bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col font-sans">
      {/* Soft Off-White Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* TOP CONTROLS TOOLBAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/90 border-b border-slate-200/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search entity (e.g. Rohit, Mule, 98765)..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="h-8 w-56 sm:w-64 rounded-lg bg-slate-100 border border-slate-300 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
          {nodes.length > 0 && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700">
              <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
              {nodes.length} Entities • {edges.length} Links
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            {[
              { mode: 'starburst', label: 'Clear Starburst' },
              { mode: 'organic', label: 'Organic' },
              { mode: 'flow', label: 'Flow' },
              { mode: 'circle', label: 'Circle' },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode as LayoutMode)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  layoutMode === mode
                    ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="h-8 w-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center justify-center text-sm transition-colors shadow-sm"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="h-8 w-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center justify-center text-sm transition-colors shadow-sm"
            >
              −
            </button>
            <button
              onClick={handleFit}
              title="Fit to Canvas"
              className="h-8 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors shadow-sm"
            >
              Fit
            </button>
            <button
              onClick={handleRearrange}
              title="Re-layout Graph"
              className="h-8 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
            >
              🔄 Rearrange
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CANVAS */}
      <div className="relative flex-1 w-full h-full">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="text-4xl opacity-50">🕸️</div>
            <p className="text-xs font-semibold">Generating Entity Graph...</p>
          </div>
        )}

        {/* Hover Tooltip Card */}
        {hoveredNode && tooltipPos && (
          <div
            className="pointer-events-none fixed z-50 rounded-xl bg-slate-900/90 text-white p-3 shadow-2xl backdrop-blur-md max-w-xs font-sans animate-in fade-in zoom-in-95 duration-150 border border-slate-700"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="text-xs font-bold text-sky-400 truncate">{hoveredNode.title}</span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 uppercase">
                {hoveredNode.type}
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Score:</span>
                <span className={`font-bold ${hoveredNode.risk > 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {hoveredNode.risk} / 100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Connected Links:</span>
                <span className="font-semibold text-slate-200">{hoveredNode.connections} relationships</span>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING LEGEND BOX */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 border border-slate-200/90 p-3 rounded-xl shadow-lg backdrop-blur-md max-w-xs text-xs">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {legendItems.map(item => (
              <div key={item.label} className="flex items-center gap-2 text-[10px] font-medium text-slate-700">
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CytoscapeGraph;

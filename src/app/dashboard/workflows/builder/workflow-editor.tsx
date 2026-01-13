'use client'

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Play, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ActionNode } from './nodes/action-node';
import { TriggerNode } from './nodes/trigger-node';

// Register Custom Nodes
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export default function WorkflowEditor({ workflowId }: { workflowId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Workflow Data
  React.useEffect(() => {
    async function load() {
        const { data, error } = await supabase.from('workflows').select('*').eq('id', workflowId).single();
        if (data) {
            // Ensure data is array
            const loadedNodes = Array.isArray(data.nodes) ? data.nodes : [];
            const loadedEdges = Array.isArray(data.edges) ? data.edges : [];
            
            // Cast to any to avoid strict type checks on generic JSONB
            setNodes(loadedNodes.map((n: any) => ({ ...n, type: n.type || 'default' })));
            setEdges(loadedEdges);
        }
        if (error) console.error("Error loading workflow:", error);
        setIsLoading(false);
    }
    load();
  }, [workflowId, setNodes, setEdges]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - 200, // Offset for sidebar
        y: event.clientY - 100, // Offset for header
      };
      
      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const { error } = await supabase
            .from('workflows')
            .update({
                nodes: nodes,
                edges: edges,
                updated_at: new Date().toISOString()
            })
            .eq('id', workflowId);

        if (error) throw error;
        alert('Workflow saved!');
    } catch (e) {
        console.error(e);
        alert('Failed to save');
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
      )
  }

  return (
    <div className="h-screen w-full flex flex-col bg-neutral-950">
       {/* Header */}
       <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/workflows" className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-sm font-semibold text-white">Workflow Editor</h1>
                    <p className="text-xs text-muted-foreground font-mono">{workflowId}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors border border-white/5"
                >
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                </button>
                <button 
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Play className="h-3 w-3" />
                    Run
                </button>
            </div>
       </div>

       {/* Editor Body */}
       <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#0d1117] p-4 flex flex-col gap-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Components</h3>
                
                <div 
                    className="p-3 bg-neutral-800 rounded-lg border border-white/5 cursor-grab hover:border-emerald-500/50 transition-colors"
                    onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'trigger')} 
                    draggable
                >
                    <div className="text-sm font-medium text-white mb-1">Trigger</div>
                    <div className="text-xs text-muted-foreground">Starts the flow</div>
                </div>

                <div 
                    className="p-3 bg-neutral-800 rounded-lg border border-white/5 cursor-grab hover:border-indigo-500/50 transition-colors"
                    onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'action')} 
                    draggable
                >
                    <div className="text-sm font-medium text-white mb-1">Action</div>
                    <div className="text-xs text-muted-foreground">Performs a task</div>
                </div>
            </aside>

            {/* Canvas */}
            <div className="flex-1 h-full bg-neutral-950 relative">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        defaultViewport={defaultViewport}
                        fitView
                        className="bg-neutral-950"
                    >
                        <Background color="#333" gap={20} size={1} variant={BackgroundVariant.Dots} />
                        <Controls className="bg-neutral-800 border border-white/10 fill-white text-white" />
                        <Panel position="top-center" className="bg-neutral-900/50 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-xs text-white/50">
                            Drag nodes from sidebar to canvas
                        </Panel>
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
       </div>
    </div>
  );
}

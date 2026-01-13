import { Handle, Position } from '@xyflow/react';
import { Bot, Settings2 } from 'lucide-react';

export function ActionNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 shadow-xl rounded-xl bg-neutral-900 border border-white/10 min-w-[200px]">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500 border-2 border-neutral-900" />
        
      <div className="flex items-center mb-2">
        <div className="p-1.5 rounded bg-indigo-500/10 mr-2 text-indigo-500">
            <Bot className="h-4 w-4" />
        </div>
        <div className="flex-1">
            <div className="text-sm font-bold text-white">AI Analysis</div>
            <div className="text-[10px] text-muted-foreground">Reviews PR diff</div>
        </div>
        <Settings2 className="h-4 w-4 text-white/20" />
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white/50 border-2 border-neutral-900" />
    </div>
  );
}

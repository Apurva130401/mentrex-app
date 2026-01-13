import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function TriggerNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 shadow-xl rounded-xl bg-neutral-900 border-2 border-emerald-500/50 min-w-[200px]">
      <div className="flex items-center mb-2">
        <div className="p-1.5 rounded bg-emerald-500/10 mr-2 text-emerald-500">
            <Zap className="h-4 w-4" />
        </div>
        <div>
            <div className="text-sm font-bold text-white">Trigger</div>
            <div className="text-[10px] text-muted-foreground">On GitHub Push</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500 border-2 border-neutral-900" />
    </div>
  );
}

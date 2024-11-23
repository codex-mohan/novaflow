import NodeLayout from "@/components/NodeLayout";
import QueueBar from "../ui/queuebar";
export default function NodeEditor() {
  return (
    <div className="w-full h-full">
      <NodeLayout />
      <QueueBar />
    </div>
  );
}

import NodeLayout from "@/components/NodeLayout";
import QueueBar from "../ui/queuebar";
export default function NodeEditor() {
  return (
    <div className="w-full h-full absolute">
      <NodeLayout />
      <QueueBar />
    </div>
  );
}

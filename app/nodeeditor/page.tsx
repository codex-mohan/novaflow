import dynamic from "next/dynamic";
import QueueBar from "@/components/ui/queuebar";

const NodeLayout = dynamic(() => import("@/components/NodeLayout"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function NodeEditor() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-1 border-2 border-node/70 mx-2 mb-12 overflow-hidden">
        <NodeLayout />
        <QueueBar />
      </div>
    </div>
  );
}

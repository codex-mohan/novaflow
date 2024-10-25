import React from "react";
import Nodelayout from "@/components/pages/nodeLayout";
import QueueBar from "@/components/ui/queuebar";

type Props = {};

const NodeEditor = (props: Props) => {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex-1 border-2 border-slate-400 mx-2 mb-12 overflow-hidden">
        <Nodelayout />
        <QueueBar />
      </div>
    </div>
  );
};

export default NodeEditor;

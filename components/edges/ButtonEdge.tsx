import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";

type ButtonEdgeData = {};

export type ButtonEdge = Edge<ButtonEdgeData>;

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps<ButtonEdge>) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className={`
            absolute text-xs nodrag nopan
            transform -translate-x-1/2 -translate-y-1/2
          `}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            // We need to keep this style prop for dynamic positioning
          }}
        >
          <button
            onClick={onEdgeClick}
            className={`
              w-5 h-5 
              bg-gray-200 
              border border-white 
              rounded-full 
              cursor-pointer 
              text-xs 
              leading-none
              hover:bg-gray-300
              transition-colors
            `}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

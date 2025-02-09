"use client";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { ChatGroq } from "@langchain/groq";
import {
  HumanMessage,
  AIMessage,
  BaseMessageLike,
} from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  StateGraph,
  MessagesAnnotation,
  // MemorySaver,
  START,
  END,
} from "@langchain/langgraph";

type ChatProviderKey = "openai" | "ollama" | "groq";

type Node = {
  name: string; // Name of the node
  action: any; // Function to be executed for this node
};

type Edge = {
  from: any; // Source node
  to: any; // Destination node
  condition?: any; // Optional condition for conditional edges
};

type GraphConfig = {
  nodes: Node[]; // Array of nodes
  edges: Edge[]; // Array of edges
  startNode: any; // Name of the starting node
};

const ChatProvider: Record<ChatProviderKey, any> = {
  openai: ChatOpenAI,
  ollama: ChatOllama,
  groq: ChatGroq,
};

export class Agent {
  public agent: any;
  private tools: any[];
  private toolNode: any;
  // private memory: MemorySaver;
  public model: any;
  public StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessageLike[]>({
      reducer: (x, y) => x.concat(y),
    }),
  });

  constructor(private provider: { model: ChatProviderKey; settings: any }) {
    this.tools = [];
    // this.memory = new MemorySaver();

    // Ensure that the provider key is valid and map it to the corresponding provider
    const modelKey = this.provider.model; // This is of type ProviderKey
    if (modelKey in ChatProvider) {
      this.model = new ChatProvider[modelKey as ChatProviderKey](
        provider.settings
      ); // No error now
    } else {
      throw new Error(`Invalid provider model: ${modelKey}`);
    }

    this.toolNode = new ToolNode(this.tools);

    // Bind tools to the model
    this.model = this.model.bindTools(this.tools);
  }

  callModel = async (state: typeof this.StateAnnotation.State) => {
    // For versions of @langchain/core < 0.2.3, you must call `.stream()`
    // and aggregate the message from chunks instead of calling `.invoke()`.
    const { messages } = state;
    const responseMessage = await this.model.invoke(messages);
    return { messages: [responseMessage] };
  };

  routeMessage(state: typeof this.StateAnnotation.State) {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    // If no tools are called, we can finish (respond to the user)
    if (!lastMessage?.tool_calls?.length) {
      return END;
    }
    // Otherwise if there is, we continue and call the tools
    return "tools";
  }

  // buildWorkflow(config: GraphConfig) {
  //   const { nodes, edges, startNode } = config;

  //   // Initialize the StateGraph
  //   const workflow = new StateGraph(this.StateAnnotation);

  //   // Add nodes to the graph
  //   nodes.forEach((node) => {
  //     workflow.addNode(node.name, node.action);
  //   });

  //   // Add edges to the graph
  //   edges.forEach((edge) => {
  //     if (edge.condition) {
  //       // Add conditional edge
  //       workflow.addConditionalEdges(edge.from, edge.condition);
  //     } else {
  //       // Add regular edge
  //       workflow.addEdge(edge.from, edge.to);
  //     }
  //   });

  //   // Set the starting node
  //   workflow.addEdge(START, startNode);

  //   this.agent = workflow.compile();
  // }

  buildWorkflow() {
    const workflow = new StateGraph(this.StateAnnotation)
      .addNode("agent", this.callModel)
      .addNode("tools", this.toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", this.routeMessage)
      .addEdge("tools", "agent");

    this.agent = workflow.compile();
  }
}

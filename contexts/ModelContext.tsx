import { createContext, ReactNode, useContext, useMemo } from "react";
import { useExecutorchModule } from "react-native-executorch";

const ModelContext = createContext<any>(null);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  let module: any = null;

  try {
    module = useExecutorchModule({
      modelSource: require("@/assets/models/model.pte"),
    });
  } catch (error) {
    console.error("Failed to init Executorch:", error);
    module = null;
  }

  const modelApi = useMemo(() => {
    if (!module) {
      return null;
    }

    return {
      ...module,
      forward: async (...args: any[]) => {
        const start = performance.now();
        try {
          return await module.forward(...args);
        } finally {
          const elapsed = performance.now() - start;
          console.log("Model inference time:", elapsed, "ms");
        }
      },
    };
  }, [module]);

  return (
    <ModelContext.Provider value={modelApi}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  return (
    context || {
      isReady: false,
      isGenerating: false,
      forward: async () => {
        throw new Error("Model unavailable");
      },
    }
  );
};

import { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import { useExecutorchModule } from "react-native-executorch";

const ModelContext = createContext<any>(null);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const moduleRef = useRef<any>(null);
  const timeRef = useRef(0);

  try {
    moduleRef.current = useExecutorchModule({
      modelSource: require("@/assets/models/model.pte"),
    });
  } catch (error) {
    console.error("Failed to init Executorch:", error);
    moduleRef.current = null;
  }

  useEffect(() => {
    if (!moduleRef.current) return;
    if (moduleRef.current.isGenerating) {
      timeRef.current = performance.now();
    } else if (timeRef.current > 0) {
      const elapsed = performance.now() - timeRef.current;
      console.log("Model inference time:", elapsed, "ms");
    }
  }, [moduleRef.current?.isGenerating]);

  return (
    <ModelContext.Provider value={moduleRef.current}>
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

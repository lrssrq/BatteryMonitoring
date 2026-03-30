import { createContext, ReactNode, useContext, useEffect, useRef } from "react";

let useExecutorchModule: any = null;
let ScalarType: any = null;
let executorchAvailable = false;

try {
  const exec = require("react-native-executorch");
  useExecutorchModule = exec.useExecutorchModule;
  ScalarType = exec.ScalarType;
  executorchAvailable = true;
  console.log("✓ Executorch module loaded");
} catch (error) {
  console.warn("⚠ Executorch not available:", (error as Error).message);
  executorchAvailable = false;
}

const ModelContext = createContext<any>(null);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const moduleRef = useRef<any>(null);
  const timeRef = useRef(0);

  if (executorchAvailable && useExecutorchModule) {
    try {
      moduleRef.current = useExecutorchModule({
        modelSource: require("@/assets/models/model.pte"),
      });
    } catch (error) {
      console.error("Failed to init Executorch:", error);
      moduleRef.current = null;
    }
  }

  const executorchModule = moduleRef.current;

  useEffect(() => {
    if (!executorchModule) return;
    if (executorchModule.isGenerating) {
      timeRef.current = new Date().getTime();
    } else if (timeRef.current > 0) {
      const elapsed = new Date().getTime() - timeRef.current;
      console.log("Model inference time:", elapsed, "ms");
    }
  }, [executorchModule?.isGenerating]);

  useEffect(() => {
    if (!executorchAvailable || !executorchModule?.isReady) return;
    console.log("Model loaded successfully");
    const testInference = async () => {
      if (!ScalarType) return;
      try {
        const inputTensor = {
          dataPtr: new Float32Array(1 * 20 * 2),
          sizes: [1, 20, 2],
          scalarType: ScalarType.FLOAT,
        };
        const output = await executorchModule.forward([inputTensor]);
        const result = new Float32Array(output[0].dataPtr as ArrayBuffer);
        console.log("Test inference ok:", result.length);
      } catch (error) {
        console.error("Error during test inference:", error);
      }
    };
    // testInference();
  }, [executorchModule?.isReady]);

  return (
    <ModelContext.Provider value={executorchModule}>
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

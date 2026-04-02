import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type OrtWeb = {
  env: {
    wasm: {
      wasmPaths: string;
    };
  };
  InferenceSession: {
    create: (model: unknown) => Promise<any>;
  };
};

/** ort is loaded via <script> in +html.tsx; poll briefly in case React hydrates before the script fires */
const getOrt = (): OrtWeb | null => (window as any).ort ?? null;

const waitForOrt = (timeout = 10_000): Promise<OrtWeb> =>
  new Promise((resolve, reject) => {
    const ort = getOrt();
    if (ort) return resolve(ort);

    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      const ort = getOrt();
      if (ort) {
        clearInterval(timer);
        return resolve(ort);
      }
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(timer);
        reject(new Error("ONNX Runtime script failed to load"));
      }
    }, interval);
  });

const ModelContext = createContext<any>(null);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [ortApi, setOrtApi] = useState<OrtWeb | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastInferenceMs, setLastInferenceMs] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initModel = async () => {
      try {
        const ort = await waitForOrt();
        const createdSession = await ort.InferenceSession.create(
          require("@/assets/models/model.onnx"),
        );
        if (!isMounted) {
          return;
        }
        setOrtApi(ort);
        setSession(createdSession);
        setIsReady(true);
      } catch (error) {
        console.error("Failed to init ONNX Runtime:", error);
        if (!isMounted) {
          return;
        }
        setOrtApi(null);
        setSession(null);
        setIsReady(false);
      }
    };

    initModel();

    return () => {
      isMounted = false;
    };
  }, []);

  const forward = async (feeds: Record<string, any>) => {
    if (!session) {
      throw new Error("Model not initialized");
    }

    setIsGenerating(true);
    const start = performance.now();
    try {
      const outputs = await session.run(feeds);
      return outputs;
    } finally {
      const elapsed = performance.now() - start;
      setLastInferenceMs(elapsed);
      setIsGenerating(false);
      console.log("Model inference time:", `${elapsed.toFixed(2)} ms`);
    }
  };

  const modelApi = useMemo(
    () => ({
      ort: ortApi,
      session,
      isReady,
      isGenerating,
      lastInferenceMs,
      forward,
    }),
    [ortApi, session, isReady, isGenerating, lastInferenceMs],
  );

  return (
    <ModelContext.Provider value={modelApi}>{children}</ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  return (
    context || {
      ort: null,
      isReady: false,
      isGenerating: false,
      lastInferenceMs: null,
      forward: async () => {
        throw new Error("Model unavailable");
      },
    }
  );
};

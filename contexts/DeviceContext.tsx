import {
  clearCachedDevices,
  Device,
  getDevices,
  loadCachedDevices,
  saveDevicesToCache,
} from "@/lib/device/api";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "./SessionContext";

interface DeviceContextType {
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  fetchDevices: (refresh?: boolean) => Promise<void>;
}
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending } = useSession();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  const fetchDevices = useCallback(
    async (refresh = false) => {
      if (!session || !session.user) {
        setDevices([]);
        setSelectedDevice(null);
        lastFetchedUserIdRef.current = null;
        clearCachedDevices();
        return;
      }
      let devices = await loadCachedDevices();
      if (devices.length === 0 || refresh) {
        console.log("get devices from server");
        devices = await getDevices();
        if (devices.length > 0) {
          await saveDevicesToCache(devices);
        }
      }
      setDevices(devices);
      setSelectedDevice(devices.length > 0 ? devices[0] : null);
      // console.log("devices loaded:", devices);
    },
    [session],
  );

  useEffect(() => {
    if (isPending) return;

    const currentUserId = session?.user?.id ?? null;

    if (currentUserId === lastFetchedUserIdRef.current) {
      return;
    }

    lastFetchedUserIdRef.current = currentUserId;
    fetchDevices();
  }, [session, isPending, fetchDevices]);

  return (
    <DeviceContext.Provider
      value={{
        devices,
        selectedDevice,
        setSelectedDevice,
        fetchDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
};

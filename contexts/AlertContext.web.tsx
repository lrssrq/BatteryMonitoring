import { ALERT_MESSAGE_CACHE_KEY } from "@/constants/AsyncStorageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useBatteryDataPipeline } from "./BatteryDataPipelineContext";
import { useDevice } from "./DeviceContext";
import { useSession } from "./SessionContext";
import { useSettings } from "./SettingsContext";

export type Message = {
  when: Date;
  message: string;
  unread: boolean;
  type: "high" | "low" | "info";
  device?: string;
};

const getMessageTemplate = (i18n: any) => ({
  TooHigh: {
    when: new Date(0),
    message: i18n.t("alertcontext_message_too_high"),
    type: "high" as const,
    unread: true,
  },
  TooLow: {
    when: new Date(0),
    message: i18n.t("alertcontext_message_too_low"),
    type: "low" as const,
    unread: true,
  },
});

interface AlertContextType {
  messages: Message[];
  unreadCount: number;
  handleDelete: (itemToDelete: Message) => void;
  handleMarkAsRead: (itemToMark: Message) => void;
  handleMarkALLAsRead: () => void;
  handleClearData: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const sendBrowserNotification = async (
  title: string,
  options?: NotificationOptions,
) => {
  if (!("Notification" in window)) {
    console.warn("Notification API not supported in this browser");
    return;
  }

  if (Notification.permission === "granted") {
    try {
      new Notification(title, options);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  } else if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, options);
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    }
  }
};

const restoreMessage = (i18n: any, type: "high" | "low" | "info") => {
  switch (type) {
    case "high":
      return i18n.t("alertcontext_message_too_high");
    case "low":
      return i18n.t("alertcontext_message_too_low");
    default:
      return "";
  }
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => ({
        ...msg,
        message: restoreMessage(i18n, msg.type),
      })),
    );
  }, [i18n.language]);

  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    data: session,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useSession();
  const { remainingPower } = useBatteryDataPipeline();
  const { alertThreshold, notificationEnabled } = useSettings();
  const { selectedDevice } = useDevice();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
        .then((permission) => {
          console.log("Notification permission:", permission);
        })
        .catch((error) => {
          console.error("Failed to request notification permission:", error);
        });
    }
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem(
          ALERT_MESSAGE_CACHE_KEY,
        );
        let loadedMessages: Message[] = [];
        if (storedMessages) {
          let parsed = JSON.parse(storedMessages);

          if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
            parsed = parsed[0];
          }

          loadedMessages = parsed
            .filter((m: any) => m && m.type && m.when)
            .map((m: any) => ({
              ...m,
              when: new Date(m.when),
              message: restoreMessage(i18n, m.type),
            }));
          setMessages(loadedMessages);
          const unread = loadedMessages.filter((m: Message) => m.unread).length;
          setUnreadCount(unread);
        }
        setIsMessagesLoaded(true);
      } catch (e) {
        console.error("Failed to load messages:", e);
        setIsMessagesLoaded(true);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    if (isPending || isRefetching) return;
    if (isMessagesLoaded && !session?.user) {
      setMessages([]);
      setUnreadCount(0);
      AsyncStorage.removeItem(ALERT_MESSAGE_CACHE_KEY).catch((e) =>
        console.error("Failed to clear messages on session end:", e),
      );
    }
  }, [session, isMessagesLoaded]);

  useEffect(() => {
    if (isMessagesLoaded && session?.user) {
      let updatedMessages =
        messages.map((item) => {
          const { message, ...itemWithoutMessage } = item;
          return itemWithoutMessage;
        }) || [];

      if (updatedMessages.length > 100) {
        updatedMessages = updatedMessages.slice(-100);
      }
      AsyncStorage.setItem(
        ALERT_MESSAGE_CACHE_KEY,
        JSON.stringify(updatedMessages),
      ).catch((e) => console.error("Failed to save messages:", e));
    }
  }, [messages, isMessagesLoaded, session]);

  useEffect(() => {
    if (!isMessagesLoaded || !session?.user) return;
    if (remainingPower === null || remainingPower < 0) return;

    const TEMPLATE = getMessageTemplate(i18n);

    if (remainingPower >= 45) {
      const prevMessages = messages || [];
      const lastAlertTime = prevMessages.findLast(
        (msg) =>
          msg.device === selectedDevice?.deviceSN &&
          msg.type === TEMPLATE.TooHigh.type,
      )?.when;
      const now = new Date();
      if (
        !lastAlertTime ||
        now.getTime() - new Date(lastAlertTime).getTime() > 5 * 60 * 1000
      ) {
        if (notificationEnabled) {
          sendBrowserNotification(i18n.t("alertcontext_notification_title"), {
            body: TEMPLATE.TooHigh.message,
            icon: require("@/assets/images/icon.png"),
            tag: "battery-alert",
          });
        }
        setMessages((prev) => {
          const updated = [
            ...(prev || []),
            {
              ...TEMPLATE.TooHigh,
              when: new Date(),
              device: selectedDevice?.deviceSN || "",
            },
          ];
          return updated;
        });
        setUnreadCount((prev) => prev + 1);
      }
    } else if (remainingPower <= alertThreshold) {
      const prevMessages = messages || [];
      const lastAlertTime = prevMessages.findLast(
        (msg) =>
          msg.device === selectedDevice?.deviceSN &&
          msg.type === TEMPLATE.TooLow.type,
      )?.when;
      const now = new Date();
      if (
        !lastAlertTime ||
        now.getTime() - new Date(lastAlertTime).getTime() > 5 * 60 * 1000
      ) {
        if (notificationEnabled) {
          sendBrowserNotification(i18n.t("alertcontext_notification_title"), {
            body: TEMPLATE.TooLow.message,
            icon: require("@/assets/images/icon.png"),
            tag: "battery-alert",
          });
        }
        setMessages((prev) => {
          const updated = [
            ...(prev || []),
            {
              ...TEMPLATE.TooLow,
              when: new Date(),
              device: selectedDevice?.deviceSN || "",
            },
          ];
          return updated;
        });
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [remainingPower, session?.user, alertThreshold, selectedDevice]);

  const handleDelete = (itemToDelete: Message) => {
    setMessages((prevMessages) =>
      prevMessages?.filter((msg) => msg !== itemToDelete),
    );
    if (itemToDelete.unread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAsRead = (itemToMark: Message) => {
    setMessages((prevMessages) =>
      prevMessages?.map((msg) =>
        msg === itemToMark ? { ...msg, unread: false } : msg,
      ),
    );
    if (itemToMark.unread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkALLAsRead = () => {
    setMessages((prevMessages) =>
      prevMessages?.map((msg) => ({ ...msg, unread: false })),
    );
    setUnreadCount(0);
  };

  const handleClearData = () => {
    setMessages([]);
    setUnreadCount(0);
  };

  return (
    <AlertContext.Provider
      value={{
        messages,
        unreadCount,
        handleDelete,
        handleMarkAsRead,
        handleMarkALLAsRead,
        handleClearData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};

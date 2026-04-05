import PaperDialog, { PaperDialogRef } from "@/components/PaperDialog";
import { Message, useAlert } from "@/contexts/AlertContext";
import { FlashList } from "@shopify/flash-list";
import { memo, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, View } from "react-native";
import {
  GestureHandlerRootView,
  Pressable,
  RectButton,
  RefreshControl
} from "react-native-gesture-handler";
import { Badge, Divider, Icon, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export default function Alert() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  const dialogRef1 = useRef<PaperDialogRef>(null);
  const dialogRef2 = useRef<PaperDialogRef>(null);

  const {
    messages,
    unreadCount,
    handleDelete,
    handleMarkAsRead,
    handleMarkALLAsRead,
    handleClearData,
  } = useAlert();

  const onRowDelete = useCallback((itemToDelete: Message) => {
    handleDelete(itemToDelete);
  }, [handleDelete]);

  const clearData = () => {
    handleClearData();
    dialogRef1.current?.hide();
  };

  const markAllAsRead = () => {
    handleMarkALLAsRead();
    dialogRef2.current?.hide();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshTimestamp(Date.now()); // update timestamp to trigger re-render
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <AlertRow
      item={item}
      onDelete={onRowDelete}
      onMarkAsRead={handleMarkAsRead}
      i18n={i18n}
      colors={colors}
    />
  ), [onRowDelete, handleMarkAsRead, i18n, colors]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <PaperDialog
        ref={dialogRef1}
        title={i18n.t("common_dialog_title")}
        content={i18n.t("alert_dialog_clear_all")}
        confirmText={i18n.t("common_button_confirm")}
        cancelText={i18n.t("common_button_cancel")}
        onConfirm={clearData}
        onCancel={() => dialogRef1.current?.hide()}
        mode="double"
      />
      <PaperDialog
        ref={dialogRef2}
        title={i18n.t("common_dialog_title")}
        content={i18n.t("alert_dialog_mark_read")}
        confirmText={i18n.t("common_button_confirm")}
        cancelText={i18n.t("common_button_cancel")}
        onConfirm={markAllAsRead}
        onCancel={() => dialogRef2.current?.hide()}
        mode="double"
      />
      <View
        style={{
          width: "100%",
          height: 50,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <IconButton
          icon="broom"
          size={24}
          animated={true}
          onPress={() => {
            if (messages && messages.length > 0) dialogRef1.current?.show();
          }}
        />
        <IconButton
          icon="check-all"
          size={24}
          animated={true}
          onPress={() => {
            if (messages && messages.length > 0) dialogRef2.current?.show();
          }}
        />
        {unreadCount > 0 && (
          <Badge
            size={12}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            {unreadCount}
          </Badge>
        )}
      </View>
      <View style={{ flex: 1 }}>
        {messages?.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>
              {i18n.t("alert_list_empty")}
            </Text>
          </View>
        ) : (
          <FlashList
            data={messages}
            extraData={refreshTimestamp}
            ItemSeparatorComponent={Divider}
            keyExtractor={(item, index) => item.message + index}
            contentContainerStyle={[
              styles.container,
              { backgroundColor: colors.background },
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={true}
            bounces={true}
            alwaysBounceVertical={true}
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 5,
  },
  row: {
    height: 80,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  messageText: {
    top: 30,
    // width: 120,
  },
  dateText: {
    position: "absolute",
    top: "1%",
    right: "2%",
  },
  modalOverlay: {
    flex: 1,
  },
  popupMenu: {
    position: "absolute",
    width: 160,
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

const AlertRow = memo(function AlertRow({
  item,
  onDelete,
  onMarkAsRead,
  i18n,
  colors,
}: {
  item: Message;
  onDelete: (item: Message) => void;
  onMarkAsRead: (item: Message) => void;
  i18n: any;
  colors: any;
}) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const rowRef = useRef<View>(null);

  const handleLongPress = useCallback(() => {
    rowRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPos({ x: x + width / 2 - 80, y: y + height });
      setMenuVisible(true);
    });
  }, []);

  const handleMarkAsRead = useCallback(() => {
    onMarkAsRead(item);
    setMenuVisible(false);
    Toast.show({
      type: "success",
      text1: "Message",
      visibilityTime: 2000,
    });
  }, [onMarkAsRead, item]);

  const handleDelete = useCallback(() => {
    setMenuVisible(false);
    onDelete(item);
  }, [onDelete, item]);

  if (!item) return null;

  return (
    <>
      <RectButton
        onLongPress={handleLongPress}
        style={[
          styles.row,
          {
            backgroundColor: item.unread
              ? colors.tertiaryContainer
              : "transparent",
          },
        ]}
      >
        <View ref={rowRef} collapsable={false} style={StyleSheet.absoluteFill} />
        <Text
          style={{
            position: "absolute",
            top: "1%",
            left: "2%",
            fontWeight: "bold",
          }}
        >
          {item.device}
        </Text>
        <Text
          numberOfLines={2}
          style={styles.messageText}
        >
          {item.message}
        </Text>
        <Text style={[styles.dateText]}>
          {formatTime(i18n, item.when.toISOString())}
        </Text>
      </RectButton>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.popupMenu,
              {
                top: menuPos.y,
                left: menuPos.x,
                backgroundColor: colors.elevation?.level1 ?? colors.background,
              },
            ]}
          >
            <RectButton style={styles.menuItem} onPress={handleMarkAsRead}>
              <Icon source="check" size={20} />
              <Text style={{ marginLeft: 8 }}>
                {i18n.t("common_button_mark_read", { defaultValue: "Mark as read" })}
              </Text>
            </RectButton>
            <Divider />
            <RectButton style={styles.menuItem} onPress={handleDelete}>
              <Icon source="close" size={20} />
              <Text style={{ marginLeft: 8 }}>
                {i18n.t("common_button_delete", { defaultValue: "Delete" })}
              </Text>
            </RectButton>
          </View>
        </Pressable>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
});

const formatTime = (i18n: any, isoString: string) => {
  const date = new Date(isoString);
  if (new Date().getTime() - date.getTime() < 60 * 1000) {
    return i18n.t("alert_time_just_now");
  } else if (new Date().getTime() - date.getTime() < 60 * 60 * 1000) {
    const minutes = Math.floor(
      (new Date().getTime() - date.getTime()) / (60 * 1000),
    );
    return `${minutes} ${i18n.t("alert_time_minutes_ago")}`;
  } else if (new Date().getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(
      (new Date().getTime() - date.getTime()) / (60 * 60 * 1000),
    );
    return `${hours} ${i18n.t("alert_time_hours_ago")}`;
  } else if (new Date().getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(
      (new Date().getTime() - date.getTime()) / (24 * 60 * 60 * 1000),
    );
    return `${days} ${i18n.t("alert_time_days_ago")}`;
  } else if (new Date().getTime() - date.getTime() < 30 * 24 * 60 * 60 * 1000) {
    const weeks = Math.floor(
      (new Date().getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
    return `${weeks} ${i18n.t("alert_time_weeks_ago")}`;
  } else if (
    new Date().getTime() - date.getTime() <
    365 * 24 * 60 * 60 * 1000
  ) {
    const months = Math.floor(
      (new Date().getTime() - date.getTime()) / (30 * 24 * 60 * 60 * 1000),
    );
    return `${months} ${i18n.t("alert_time_months_ago")}`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  }
};

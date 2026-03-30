import PaperDialog, { PaperDialogRef } from "@/components/PaperDialog";
import Colors from "@/constants/Colors";
import { Message, useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/hooks/useTheme";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { RectButton, RefreshControl } from "react-native-gesture-handler";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Badge, Divider, Icon, IconButton } from "react-native-paper";
import Reanimated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export default function Alert() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());
  const openSwipeableRef = useRef<SwipeableMethods>(null);
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
  // console.log(messages);
  // useEffect(() => {
  //   handleClearData();
  // }, []);
  const handleRowOpen = (ref: SwipeableMethods) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = ref;
  };

  const onRowDelete = (itemToDelete: Message) => {
    openSwipeableRef.current = null;
    handleDelete(itemToDelete);
  };

  const handleScroll = () => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
  };

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
          iconColor={colors.icon}
          animated={true}
          onPress={() => {
            if (messages && messages.length > 0) dialogRef1.current?.show();
          }}
        />
        <IconButton
          icon="check-all"
          size={24}
          iconColor={colors.icon}
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
            <Text style={{ color: colors.text }}>
              {i18n.t("alert_list_empty")}
            </Text>
          </View>
        ) : (
          <FlashList
            data={messages}
            extraData={refreshTimestamp}
            ItemSeparatorComponent={Divider}
            keyExtractor={(item, index) => item.message + index}
            onScrollBeginDrag={handleScroll}
            // style={{ flex: 1 }}
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
            renderItem={({ item }) => (
              <SwipeableRow
                item={item}
                onDelete={() => onRowDelete(item)}
                onMarkAsRead={() => handleMarkAsRead(item)}
                onWillOpen={handleRowOpen}
                i18n={i18n}
                colors={colors}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.light.background,
    padding: 5,
  },
  rightAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  separator: {
    width: "100%",
    borderTopWidth: 1,
  },
  swipeable: {
    flex: 1,
    // height: 80,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: "transparent",
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
  // separator: {
  //   backgroundColor: "rgb(200, 199, 204)",
  //   height: StyleSheet.hairlineWidth,
  // },
});

function RightAction({
  prog,
  drag,
  onDelete,
  onMarkAsRead,
  colors,
}: {
  prog: SharedValue<number>;
  drag: SharedValue<number>;
  onMarkAsRead: () => void;
  onDelete: () => void;
  colors: any;
}) {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 100 }],
    };
  });
  const leftStyleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(drag.value, [0, -100], [50, 0]) }],
    };
  });
  const rightStyleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(drag.value, [0, -100], [50, 0]) }],
    };
  });

  return (
    <View
      style={{
        flexDirection: "row",
        width: 100,
        backgroundColor: "transparent",
      }}
    >
      <Reanimated.View style={[styleAnimation, { width: 50 }]}>
        <RectButton
          style={styles.rightAction}
          onPress={() => {
            onMarkAsRead();
            Toast.show({
              type: "success",
              text1: "Message",
              visibilityTime: 2000,
            });
          }}
        >
          <Icon source="check" color={colors.icon} size={24} />
        </RectButton>
      </Reanimated.View>
      <Reanimated.View style={[styleAnimation, { width: 50 }]}>
        <RectButton style={styles.rightAction} onPress={onDelete}>
          <Icon source="close" color={colors.icon} size={24} />
        </RectButton>
      </Reanimated.View>
    </View>
  );
}

const SwipeableRow = ({
  item,
  onDelete,
  onMarkAsRead,
  onWillOpen,
  i18n,
  colors,
}: {
  item: Message;
  onDelete: () => void;
  onMarkAsRead: () => void;
  onWillOpen: (ref: SwipeableMethods) => void;
  i18n: any;
  colors: any;
}) => {
  const swipeableRef = useRef<SwipeableMethods>(null);

  const close = () => {
    swipeableRef.current?.reset();
    onDelete();
  };

  const markAsRead = () => {
    onMarkAsRead();
    swipeableRef.current?.reset();
    console.log("Marked as read:", item.message);
  };
  const backgroundColorStyle = {
    backgroundColor: item.unread ? colors.alertBackground : "transparent",
  };

  if (!item) {
    return null;
  }
  return (
    <Swipeable
      ref={swipeableRef}
      containerStyle={[
        styles.swipeable,
        { height: 80, backgroundColor: backgroundColorStyle.backgroundColor },
      ]}
      childrenContainerStyle={{ flex: 1, height: 50, width: "100%" }}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      overshootRight={false}
      dragOffsetFromLeftEdge={Number.MAX_SAFE_INTEGER}
      dragOffsetFromRightEdge={20}
      // activeOffsetX={[-100, 100]}
      // shouldCancelWhenOutside={true}
      // activateAfterLongPress={1000}
      // failOffsetY={[-5, 5]}
      onSwipeableWillOpen={() =>
        swipeableRef.current && onWillOpen(swipeableRef.current)
      }
      renderRightActions={(prog, drag) => (
        <RightAction
          prog={prog}
          drag={drag}
          onDelete={close}
          onMarkAsRead={markAsRead}
          colors={colors}
        />
      )}
    >
      <Text
        style={{
          position: "absolute",
          top: "1%",
          left: -5,
          fontWeight: "bold",
          color: colors.text,
        }}
      >
        {item.device}
      </Text>
      <Text
        numberOfLines={2}
        style={[styles.messageText, { color: colors.text }]}
      >
        {item.message}
      </Text>
      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
        {formatTime(i18n, item.when.toISOString())}
      </Text>
    </Swipeable>
  );
};

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

import WebAuthGuard from "@/components/web/WebAuthGuard";
import WebPageShell from "@/components/web/WebPageShell";
import { Message, useAlert } from "@/contexts/AlertContext";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  ScrollArea,
  Text
} from "@radix-ui/themes";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function messageKey(item: Message, index: number) {
  return `${item.message}-${index}`;
}

export default function AlertWeb() {
  const { i18n } = useTranslation();
  const [clearOpen, setClearOpen] = useState(false);
  const [markAllOpen, setMarkAllOpen] = useState(false);
  const {
    messages,
    unreadCount,
    handleDelete,
    handleMarkAsRead,
    handleMarkALLAsRead,
    handleClearData,
  } = useAlert();

  const clearData = () => {
    handleClearData();
    setClearOpen(false);
  };

  const markAllAsRead = () => {
    handleMarkALLAsRead();
    setMarkAllOpen(false);
  };

  return (
    <WebAuthGuard>
    <WebPageShell>
      <Dialog.Root open={clearOpen} onOpenChange={setClearOpen}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>{i18n.t("common_dialog_title")}</Dialog.Title>
          <Dialog.Description>
            {i18n.t("alert_dialog_clear_all")}
          </Dialog.Description>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="outline">{i18n.t("common_button_cancel")}</Button>
            </Dialog.Close>
            <Button color="red" onClick={clearData}>
              {i18n.t("common_button_confirm")}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={markAllOpen} onOpenChange={setMarkAllOpen}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>{i18n.t("common_dialog_title")}</Dialog.Title>
          <Dialog.Description>
            {i18n.t("alert_dialog_mark_read")}
          </Dialog.Description>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="outline">{i18n.t("common_button_cancel")}</Button>
            </Dialog.Close>
            <Button onClick={markAllAsRead}>{i18n.t("common_button_confirm")}</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Flex direction="column" gap="4">
        {/* Header Card */}
        <Card variant="surface">
          <Flex justify="between" align="center" gap="3" wrap="wrap">
            <Flex align="center" gap="2">
              <Heading size="5">{i18n.t("alert_header_title")}</Heading>
              {unreadCount > 0 && (
                <Badge color="indigo" variant="solid">
                  {unreadCount}
                </Badge>
              )}
            </Flex>

            <Flex gap="2">
              <Button
                variant="surface"
                disabled={unreadCount === 0}
                onClick={() => {
                  if (messages.length > 0) {
                    setMarkAllOpen(true);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {i18n.t("alert_mark_all_read")}
              </Button>
              <Button
                variant="surface"
                disabled={messages.length === 0}
                onClick={() => {
                  if (messages.length > 0) {
                    setClearOpen(true);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {i18n.t("common_button_clear")}
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Messages List */}
        {messages.length === 0 ? (
          <Card variant="surface">
            <Text color="gray">{i18n.t("alert_list_empty")}</Text>
          </Card>
        ) : (
          <ScrollArea>
            <Flex direction="column" gap="3">
              {messages.map((item, index) => (
                <Card
                  key={messageKey(item, index)}
                  variant="surface"
                  style={{
                    borderLeft: item.unread ? "3px solid var(--indigo-9)" : "3px solid transparent",
                  }}
                >
                  <Flex justify="between" align="center" gap="4" wrap="wrap">
                    <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                      <Text weight="bold" size="3">
                        {item.message}
                      </Text>
                      <Flex gap="2" align="center">
                        <Badge
                          variant="outline"
                          color={item.unread ? "amber" : "gray"}
                        >
                          {item.unread
                            ? i18n.t("alert_status_unread")
                            : i18n.t("alert_status_read")}
                        </Badge>
                        <Text size="1" color="gray">
                          {new Date(item.when).toLocaleString()}
                        </Text>
                      </Flex>
                    </Flex>

                    <Flex gap="2" style={{ flexShrink: 0 }}>
                      <Button
                        size="1"
                        variant="surface"
                        disabled={!item.unread}
                        onClick={() => handleMarkAsRead(item)}
                        style={{ cursor: "pointer" }}
                      >
                        {i18n.t("alert_mark_read")}
                      </Button>
                      <Button
                        size="1"
                        color="red"
                        variant="surface"
                        onClick={() => handleDelete(item)}
                        style={{ cursor: "pointer" }}
                      >
                        {i18n.t("alert_delete")}
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </ScrollArea>
        )}
      </Flex>
    </WebPageShell>
    </WebAuthGuard>
  );
}

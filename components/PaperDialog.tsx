import React, { useImperativeHandle, useState } from "react";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";

export interface PaperDialogRef {
  show: () => void;
  hide: () => void;
  getValue: () => string;
}

interface PaperDialogProps {
  ref?: React.Ref<PaperDialogRef>;
  title?: string;
  content?: string;
  onConfirm?: (inputValue?: string) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  mode?: "single" | "double";
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  maxLength?: number;
  dismissable?: boolean;
}

export default function PaperDialog({
  ref,
  title = "Alert",
  content = "This is simple dialog",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  mode = "double",
  showInput = false,
  inputLabel = "Input",
  inputPlaceholder = "",
  inputValue = "",
  maxLength = 100,
  dismissable = false,
}: PaperDialogProps) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState(inputValue);

  useImperativeHandle(ref, () => ({
    show: () => {
      setText(inputValue);
      setVisible(true);
    },
    hide: () => setVisible(false),
    getValue: () => text,
  }));

  const handleConfirm = () => {
    setVisible(false);
    onConfirm?.(showInput ? text : undefined);
  };

  const handleCancel = () => {
    setVisible(false);
    onCancel?.();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        // onDismiss={dismissable ? handleCancel : undefined}
        dismissable={dismissable}
      >
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{content}</Text>
          {showInput && (
            <TextInput
              label={inputLabel}
              placeholder={inputPlaceholder}
              value={text}
              onChangeText={setText}
              maxLength={maxLength}
              style={{ marginTop: 10 }}
            />
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {mode === "double" && onCancel && (
            <Button onPress={handleCancel}>{cancelText}</Button>
          )}
          <Button onPress={handleConfirm}>{confirmText}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

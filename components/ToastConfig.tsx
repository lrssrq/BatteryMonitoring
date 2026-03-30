import { Text, View } from "react-native";
import {
  BaseToast,
  ErrorToast,
  InfoToast,
  SuccessToast,
  ToastConfig,
} from "react-native-toast-message";

/*
  1. Create the config
*/
const toastConfig: ToastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  base: (props) => <BaseToast {...props} />,
  success: (props) => (
    <SuccessToast
      {...props}
      text1NumberOfLines={5}
      // style={{ borderLeftColor: "pink" }}
      // contentContainerStyle={{ paddingHorizontal: 15 }}
      // text1Style={{
      //   fontSize: 15,
      //   fontWeight: "400",
      // }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <ErrorToast
      {...props}
      //   text1Style={{
      //     fontSize: 17
      //   }}
      //   text2Style={{
      //     fontSize: 15
      //   }}
    />
  ),
  info: (props) => <InfoToast {...props} text1NumberOfLines={5} />,
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
  tomatoToast: ({ text1, props }) => (
    <View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
      <Text>{text1}</Text>
      <Text>{props.uuid}</Text>
    </View>
  ),
};

export default toastConfig;

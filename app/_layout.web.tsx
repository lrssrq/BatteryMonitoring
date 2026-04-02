import toastConfig from "@/components/ToastConfig";
import { Slot } from "expo-router";
// import { KeyboardProvider } from "react-native-keyboard-controller";
import { AlertProvider } from "@/contexts/AlertContext";
import { BatteryDataPipelineProvider } from "@/contexts/BatteryDataPipelineContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { ModelProvider } from "@/contexts/ModelContext";
import { MqttProvider } from "@/contexts/MqttContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary
} from "expo-router";

export default function RootLayout() {

	return (
		<SafeAreaProvider>
			<SettingsProvider>
				<SessionProvider>
					<DeviceProvider>
						<ModelProvider>
							<MqttProvider>
								<BatteryDataPipelineProvider>
									<AlertProvider>
										<RootLayoutNav />
									</AlertProvider>
								</BatteryDataPipelineProvider>
							</MqttProvider>
						</ModelProvider>
					</DeviceProvider>
				</SessionProvider>
			</SettingsProvider>
			<Toast config={toastConfig} />
		</SafeAreaProvider>
	);
}

function RootLayoutNav() {
	const { isLoaded } = useSettings();

	if (!isLoaded) {
		return null;
	}

	return (
		<Slot />
	);
}

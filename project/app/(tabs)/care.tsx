import { Text, View } from "react-native";
import { appStyles } from '../../styles/styles'

export default function Index() {
  const styles = appStyles;

  return (
    <View style={styles.backgroundContainer}>
      <Text>CARE PAGE</Text>
    </View>
  );
}

import { Alert, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestNotificationPermissions } from '../utils/notifications';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function SettingsModal({ visible, settings, onClose, onChange }) {
  const handleToggleEnabled = async (value) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('通知が許可されていません', '端末の設定からTodoの通知を許可してください。');
        return;
      }
    }
    onChange({ ...settings, enabled: value });
  };

  const handleToggleAppNotOpened = (value) => {
    onChange({ ...settings, appNotOpenedEnabled: value });
  };

  const changeHour = (delta) => {
    const next = (settings.achievementHour + delta + 24) % 24;
    onChange({ ...settings, achievementHour: next });
  };

  const changeMinute = (delta) => {
    const next = (settings.achievementMinute + delta + 60) % 60;
    onChange({ ...settings, achievementMinute: next });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>設定</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>通知</Text>
            <Switch value={settings.enabled} onValueChange={handleToggleEnabled} />
          </View>

          <View style={[styles.row, !settings.enabled && styles.rowDisabled]}>
            <Text style={styles.rowLabel}>昨日の達成数通知の時刻</Text>
            <View style={styles.timeStepper}>
              <View style={styles.stepperColumn}>
                <Pressable
                  disabled={!settings.enabled}
                  onPress={() => changeHour(1)}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-up" size={16} color={settings.enabled ? '#4A90D9' : '#CCC'} />
                </Pressable>
                <Pressable
                  disabled={!settings.enabled}
                  onPress={() => changeHour(-1)}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-down" size={16} color={settings.enabled ? '#4A90D9' : '#CCC'} />
                </Pressable>
              </View>
              <Text style={styles.timeText}>
                {pad(settings.achievementHour)}:{pad(settings.achievementMinute)}
              </Text>
              <View style={styles.stepperColumn}>
                <Pressable
                  disabled={!settings.enabled}
                  onPress={() => changeMinute(5)}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-up" size={16} color={settings.enabled ? '#4A90D9' : '#CCC'} />
                </Pressable>
                <Pressable
                  disabled={!settings.enabled}
                  onPress={() => changeMinute(-5)}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-down" size={16} color={settings.enabled ? '#4A90D9' : '#CCC'} />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={[styles.row, !settings.enabled && styles.rowDisabled]}>
            <Text style={styles.rowLabel}>アプリ未起動通知</Text>
            <Switch
              value={settings.appNotOpenedEnabled}
              onValueChange={handleToggleAppNotOpened}
              disabled={!settings.enabled}
            />
          </View>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>閉じる</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF1',
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLabel: {
    fontSize: 14,
    color: '#222',
    flex: 1,
    paddingRight: 12,
  },
  timeStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperColumn: {
    gap: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    minWidth: 52,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

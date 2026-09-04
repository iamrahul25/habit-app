import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTodos } from '@/context/todos-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { todos, exportData, importData, clearAllData } = useTodos();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isViewJsonOpen, setIsViewJsonOpen] = useState(false);
  const [isPasteJsonOpen, setIsPasteJsonOpen] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');

  // Import Confirmation state
  const [pendingImportJson, setPendingImportJson] = useState<string | null>(null);
  const [importSummaryCount, setImportSummaryCount] = useState<number>(0);
  const [isConfirmImportOpen, setIsConfirmImportOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate statistics
  const totalHabits = todos.length;
  const totalCompletions = todos.reduce((acc, t) => {
    const doneKeys = Object.keys(t.completions || {}).filter((k) => t.completions![k]);
    return acc + doneKeys.length;
  }, 0);

  const rawJsonString = exportData();
  const dataSizeKb = (new Blob([rawJsonString]).size / 1024).toFixed(1);

  // EXPORT HANDLERS
  const handleExportFile = async () => {
    try {
      const jsonStr = exportData();
      const filename = `habit_backup_${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📁 JSON backup file downloaded!');
      } else {
        const file = new File(Paths.cache, filename);
        if (!file.exists) {
          file.create();
        }
        file.write(jsonStr);
        const fileUri = file.uri;

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Habit Tracker Backup',
            UTI: 'public.json',
          });
          showToast('✅ Backup file exported!');
        } else {
          await Clipboard.setStringAsync(jsonStr);
          Alert.alert(
            'Copied to Clipboard',
            'Sharing is not available on this device. The JSON backup has been copied to your clipboard!'
          );
        }
      }
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to export data.');
    }
  };

  const handleCopyClipboard = async () => {
    try {
      const jsonStr = exportData();
      await Clipboard.setStringAsync(jsonStr);
      showToast('📋 JSON copied to clipboard!');
    } catch (err: any) {
      Alert.alert('Copy Error', err?.message || 'Failed to copy to clipboard.');
    }
  };

  // IMPORT PREPARATION
  const prepareImport = (jsonText: string) => {
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        Alert.alert('Invalid JSON', 'The provided data is not a valid JSON string.');
        return;
      }

      let candidateList: any[] = [];
      if (Array.isArray(parsed)) {
        candidateList = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.todos)) {
        candidateList = parsed.todos;
      }

      if (candidateList.length === 0) {
        Alert.alert('Empty Backup', 'No valid habit records found in the JSON file.');
        return;
      }

      setPendingImportJson(jsonText);
      setImportSummaryCount(candidateList.length);
      setIsConfirmImportOpen(true);
    } catch (err: any) {
      Alert.alert('Parse Error', err?.message || 'Unable to parse JSON file.');
    }
  };

  const handlePickFile = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = async (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const text = event.target?.result as string;
              if (text) prepareImport(text);
            };
            reader.readAsText(file);
          }
        };
        input.click();
      } else {
        const res = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (!res.canceled && res.assets && res.assets.length > 0) {
          const pickedFile = new File(res.assets[0].uri);
          const text = await pickedFile.text();
          prepareImport(text);
        }
      }
    } catch (err: any) {
      Alert.alert('Import Error', err?.message || 'Failed to pick or read file.');
    }
  };

  const handleConfirmImport = (mode: 'merge' | 'replace') => {
    if (!pendingImportJson) return;

    const res = importData(pendingImportJson, mode);
    setIsConfirmImportOpen(false);
    setPendingImportJson(null);
    setIsPasteJsonOpen(false);

    if (res.success) {
      showToast(`🎉 Successfully imported ${res.count} habits (${mode === 'merge' ? 'Merged' : 'Replaced'})!`);
    } else {
      Alert.alert('Import Failed', res.error || 'Could not import JSON data.');
    }
  };

  // CLEAR ALL HANDLER
  const handleClearAll = () => {
    Alert.alert(
      '⚠️ Reset All Data?',
      'Are you sure you want to delete all habits and history? This action cannot be undone unless you have an exported JSON backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            showToast('🗑️ All habit data cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setting</Text>
        <Text style={styles.headerSub}>Export, Import & Manage your Habit Data</Text>
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionHeading}>📊 Data Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalHabits}</Text>
              <Text style={styles.statLabel}>Active Habits</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalCompletions}</Text>
              <Text style={styles.statLabel}>Logs Recorded</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{dataSizeKb} KB</Text>
              <Text style={styles.statLabel}>Backup Size</Text>
            </View>
          </View>
        </View>

        {/* Export Data Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📤</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Export Data (JSON)</Text>
              <Text style={styles.cardSub}>
                Export a full JSON backup of all your habits and completion records.
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleExportFile}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>📁 Save JSON File</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={handleCopyClipboard}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>📋 Copy JSON</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.inlineLinkBtn}
            onPress={() => setIsViewJsonOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.inlineLinkText}>👁️ View / Inspect Raw JSON</Text>
          </TouchableOpacity>
        </View>

        {/* Import Data Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Import Data (JSON)</Text>
              <Text style={styles.cardSub}>
                Restore or merge habits from an exported JSON file or text string.
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { backgroundColor: '#0284c7' }]}
              onPress={handlePickFile}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>📂 Select JSON File</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => {
                setPastedJsonText('');
                setIsPasteJsonOpen(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>📝 Paste Text</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset / Danger Zone */}
        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: '#dc2626' }]}>Danger Zone</Text>
              <Text style={styles.cardSub}>
                Clear all habits and reset the app back to initial state.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={handleClearAll}
            activeOpacity={0.8}
          >
            <Text style={styles.dangerBtnText}>🗑️ Clear All Habit Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL 1: View Raw JSON */}
      <Modal visible={isViewJsonOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Raw JSON Data</Text>
              <TouchableOpacity onPress={() => setIsViewJsonOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.jsonScrollView}>
              <Text style={styles.jsonText}>{rawJsonString}</Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleCopyClipboard}>
                <Text style={styles.modalBtnText}>📋 Copy to Clipboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#e2e8f0' }]}
                onPress={() => setIsViewJsonOpen(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#334155' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Paste JSON */}
      <Modal visible={isPasteJsonOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paste JSON Data</Text>
              <TouchableOpacity onPress={() => setIsPasteJsonOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Paste your exported JSON string below to import habits:
            </Text>

            <TextInput
              style={styles.jsonInput}
              multiline
              placeholder='{"todos": [...]}'
              placeholderTextColor="#94a3b8"
              value={pastedJsonText}
              onChangeText={setPastedJsonText}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, !pastedJsonText.trim() && { opacity: 0.5 }]}
                disabled={!pastedJsonText.trim()}
                onPress={() => prepareImport(pastedJsonText.trim())}
              >
                <Text style={styles.modalBtnText}>Validate & Import</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#e2e8f0' }]}
                onPress={() => setIsPasteJsonOpen(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#334155' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Import Confirmation (Merge vs Replace) */}
      <Modal visible={isConfirmImportOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 420 }]}>
            <Text style={styles.confirmIcon}>📥</Text>
            <Text style={styles.confirmTitle}>Confirm JSON Import</Text>
            <Text style={styles.confirmSub}>
              Found <Text style={{ fontWeight: '700', color: PURPLE }}>{importSummaryCount}</Text>{' '}
              habits in the JSON data. How would you like to apply this backup?
            </Text>

            <View style={styles.confirmChoiceGroup}>
              <TouchableOpacity
                style={styles.choiceBtn}
                onPress={() => handleConfirmImport('merge')}
                activeOpacity={0.8}
              >
                <Text style={styles.choiceBtnIcon}>🔀</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.choiceBtnTitle}>Merge Data (Recommended)</Text>
                  <Text style={styles.choiceBtnSub}>
                    Combines imported habits with your existing habits without deleting anything.
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choiceBtn, { borderColor: '#fca5a5' }]}
                onPress={() => handleConfirmImport('replace')}
                activeOpacity={0.8}
              >
                <Text style={styles.choiceBtnIcon}>🔄</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.choiceBtnTitle, { color: '#dc2626' }]}>
                    Replace All Data
                  </Text>
                  <Text style={styles.choiceBtnSub}>
                    Replaces all current habits with the habits in this JSON file.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelChoiceBtn}
              onPress={() => setIsConfirmImportOpen(false)}
            >
              <Text style={styles.cancelChoiceText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PURPLE = '#6366f1';
const BG = '#f8f7ff';
const CARD = '#ffffff';
const TEXT = '#1e1b4b';
const SUBTEXT = '#6b7280';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: PURPLE,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  toast: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: PURPLE,
  },
  statLabel: {
    fontSize: 12,
    color: SUBTEXT,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
  },
  cardSub: {
    fontSize: 13,
    color: SUBTEXT,
    marginTop: 2,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: PURPLE,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
  },
  btnSecondaryText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 14,
  },
  inlineLinkBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  inlineLinkText: {
    fontSize: 13,
    color: PURPLE,
    fontWeight: '600',
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff5f5',
  },
  dangerBtn: {
    backgroundColor: '#ef4444',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  modalSub: {
    fontSize: 13,
    color: SUBTEXT,
    marginBottom: 12,
  },
  modalClose: {
    fontSize: 20,
    color: SUBTEXT,
    fontWeight: '600',
  },
  jsonScrollView: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    maxHeight: 280,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#38bdf8',
  },
  jsonInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: TEXT,
    height: 150,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    backgroundColor: PURPLE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Confirm Modal specific
  confirmIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
  },
  confirmSub: {
    fontSize: 13,
    color: SUBTEXT,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  confirmChoiceGroup: {
    gap: 10,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  choiceBtnIcon: {
    fontSize: 24,
  },
  choiceBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
  },
  choiceBtnSub: {
    fontSize: 11,
    color: SUBTEXT,
    marginTop: 2,
  },
  cancelChoiceBtn: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  cancelChoiceText: {
    fontSize: 14,
    color: SUBTEXT,
    fontWeight: '600',
  },
});

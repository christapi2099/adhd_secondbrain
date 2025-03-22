import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  useColorScheme,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarEvent, EventCategory, CategoryColors } from './types';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate?: Date;
  editEvent?: CalendarEvent;
}

export default function AddEventModal({
  visible,
  onClose,
  onSave,
  initialDate = new Date(),
  editEvent,
}: AddEventModalProps) {
  const [title, setTitle] = useState(editEvent?.title || '');
  const [description, setDescription] = useState(editEvent?.description || '');
  const [location, setLocation] = useState(editEvent?.location || '');
  const [startDate, setStartDate] = useState(editEvent?.start || initialDate);
  const [endDate, setEndDate] = useState(
    editEvent?.end || new Date(initialDate.getTime() + 60 * 60 * 1000) // Default to 1 hour later
  );
  const [allDay, setAllDay] = useState(editEvent?.allDay || false);
  const [category, setCategory] = useState<EventCategory>(editEvent?.category || 'work');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Theme colors
  const themeColors = {
    background: isDark ? Colors.dark.background : Colors.light.background,
    text: isDark ? Colors.dark.text : Colors.light.text,
    subText: isDark ? '#9BA1A6' : '#687076',
    inputBackground: isDark ? '#1C1C1E' : '#FFFFFF',
    inputBorder: isDark ? '#38383A' : '#E1E1E1',
    buttonPrimary: Colors.light.tint,
    buttonText: '#FFFFFF',
    buttonSecondary: isDark ? '#38383A' : '#E1E1E1',
    buttonSecondaryText: isDark ? Colors.dark.text : Colors.light.text,
    modalBackground: isDark ? '#1C1C1E' : '#FFFFFF',
  };

  const handleSave = () => {
    if (!title.trim()) {
      // Show error - title is required
      return;
    }

    const newEvent: Omit<CalendarEvent, 'id'> = {
      title,
      description,
      start: startDate,
      end: endDate,
      allDay,
      location,
      category,
      color: CategoryColors[category],
    };

    onSave(newEvent);
    onClose();
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }

    if (selectedDate) {
      const newStartDate = new Date(selectedDate);
      
      // If in date mode, preserve the time from the previous startDate
      if (datePickerMode === 'date') {
        newStartDate.setHours(startDate.getHours(), startDate.getMinutes());
      }
      
      setStartDate(newStartDate);
      
      // If start date is after end date, update end date
      if (newStartDate > endDate) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setHours(newStartDate.getHours() + 1);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }

    if (selectedDate) {
      const newEndDate = new Date(selectedDate);
      
      // If in date mode, preserve the time from the previous endDate
      if (datePickerMode === 'date') {
        newEndDate.setHours(endDate.getHours(), endDate.getMinutes());
      }
      
      // Ensure end date is not before start date
      if (newEndDate < startDate) {
        newEndDate.setTime(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
      }
      
      setEndDate(newEndDate);
    }
  };

  const showDatePicker = (type: 'start' | 'end', mode: 'date' | 'time') => {
    setDatePickerMode(mode);
    if (type === 'start') {
      setShowStartDatePicker(true);
    } else {
      setShowEndDatePicker(true);
    }
  };

  const categories: EventCategory[] = ['work', 'personal', 'health', 'education', 'social', 'other'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: themeColors.modalBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {editEvent ? 'Edit Event' : 'Add New Event'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: themeColors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Title *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Event title"
                placeholderTextColor={themeColors.subText}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Event description"
                placeholderTextColor={themeColors.subText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Location</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text,
                  },
                ]}
                value={location}
                onChangeText={setLocation}
                placeholder="Event location"
                placeholderTextColor={themeColors.subText}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={[styles.label, { color: themeColors.text }]}>All Day</Text>
                <Switch
                  value={allDay}
                  onValueChange={setAllDay}
                  trackColor={{ false: themeColors.buttonSecondary, true: themeColors.buttonPrimary }}
                  thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>

            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeColumn}>
                <Text style={[styles.label, { color: themeColors.text }]}>Start</Text>
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder },
                  ]}
                  onPress={() => showDatePicker('start', 'date')}
                >
                  <Text style={[styles.dateTimeText, { color: themeColors.text }]}>
                    {format(startDate, 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
                {!allDay && (
                  <TouchableOpacity
                    style={[
                      styles.dateTimeButton,
                      { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder },
                    ]}
                    onPress={() => showDatePicker('start', 'time')}
                  >
                    <Text style={[styles.dateTimeText, { color: themeColors.text }]}>
                      {format(startDate, 'h:mm a')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.dateTimeColumn}>
                <Text style={[styles.label, { color: themeColors.text }]}>End</Text>
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder },
                  ]}
                  onPress={() => showDatePicker('end', 'date')}
                >
                  <Text style={[styles.dateTimeText, { color: themeColors.text }]}>
                    {format(endDate, 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
                {!allDay && (
                  <TouchableOpacity
                    style={[
                      styles.dateTimeButton,
                      { backgroundColor: themeColors.inputBackground, borderColor: themeColors.inputBorder },
                    ]}
                    onPress={() => showDatePicker('end', 'time')}
                  >
                    <Text style={[styles.dateTimeText, { color: themeColors.text }]}>
                      {format(endDate, 'h:mm a')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: category === cat ? CategoryColors[cat] : 'transparent',
                        borderColor: CategoryColors[cat],
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: category === cat ? '#FFFFFF' : CategoryColors[cat] },
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: themeColors.buttonSecondary }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: themeColors.buttonSecondaryText }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: themeColors.buttonPrimary }]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode={datePickerMode}
              is24Hour={false}
              display="default"
              onChange={handleStartDateChange}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode={datePickerMode}
              is24Hour={false}
              display="default"
              onChange={handleEndDateChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 16,
    minHeight: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeColumn: {
    flex: 1,
    marginRight: 8,
  },
  dateTimeButton: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeText: {
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#E1E1E1',
  },
  saveButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
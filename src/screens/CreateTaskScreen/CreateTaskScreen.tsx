import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addTask as addTaskAction } from '../../Store/tasksSlice';
import { addTask as addTaskToFirestore } from '../../service/taskService';
import { auth } from '../../config/firebase';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function CreateTaskScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Study' | 'Health' | 'Finance'>('Work');
  const [setReminder, setSetReminder] = useState(true);
  
  const getLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const dateOptions = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: 'Next Monday', date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
        return d;
      })()
    }
  ];
  const [taskDate, setTaskDate] = useState<Date>(dateOptions[0].date);
  const [taskTime, setTaskTime] = useState('10:00 AM');

  // Modals Visibility
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isTimeVisible, setIsTimeVisible] = useState(false);

  // Calendar Modal States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(taskDate));

  // Time Modal States
  const [selectedHour, setSelectedHour] = useState('10');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  const handleDatePress = () => {
    setCurrentMonth(new Date(taskDate));
    setIsCalendarVisible(true);
  };

  const handleTimePress = () => {
    try {
      const parts = taskTime.split(' ');
      const timeParts = parts[0].split(':');
      setSelectedHour(timeParts[0]);
      setSelectedMinute(timeParts[1]);
      setSelectedPeriod(parts[1] as 'AM' | 'PM');
    } catch (e) {
      console.log(e);
    }
    setIsTimeVisible(true);
  };

  const handleSaveTime = () => {
    setTaskTime(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
    setIsTimeVisible(false);
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Monthly grid calculations for Calendar Modal
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Create monthly grid items
  const gridItems = [];
  // Previous month padding days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    gridItems.push({
      num: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateObj: new Date(year, month - 1, prevMonthTotalDays - i)
    });
  }
  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    gridItems.push({
      num: i,
      isCurrentMonth: true,
      dateObj: new Date(year, month, i)
    });
  }
  // Next month padding days
  const remainingCells = 42 - gridItems.length;
  for (let i = 1; i <= remainingCells; i++) {
    gridItems.push({
      num: i,
      isCurrentMonth: false,
      dateObj: new Date(year, month + 1, i)
    });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSave = async () => {
    if (!title.trim()) return;
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("You must be logged in to save tasks.");
      return;
    }

    const taskData = {
      title,
      description,
      priority,
      category,
      completed: false,
      date: getLocalDateKey(taskDate),
      time: taskTime,
      setReminder,
    };

    try {
      const newId = await addTaskToFirestore(taskData, userId);
      dispatch(
        addTaskAction({
          ...taskData,
          id: newId,
        } as any)
      );
      navigation.goBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save task to Firestore.");
    }
  };

  const categories: Array<'Work' | 'Personal' | 'Study' | 'Health' | 'Finance'> = [
    'Work',
    'Personal',
    'Study',
    'Health',
    'Finance',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5m0 0l7-7m-7 7l7 7"
              stroke="#111827"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Task Title */}
          <Text style={styles.label}>Task Title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={Colors.secondaryText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputContainer, styles.multilineContainer]}>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Add more details about this task..."
              placeholderTextColor={Colors.secondaryText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Date & Time Row */}
          <View style={styles.dateTimeRow}>
            {/* Date Field */}
            <View style={styles.dateTimeField}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dateTimeButton} activeOpacity={0.7} onPress={handleDatePress}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.dateTimeIcon}>
                  <Rect x={3} y={4} width={18} height={18} rx={2} stroke={Colors.primary} strokeWidth={2} />
                  <Path d="M16 2v4M8 2v4M3 10h18" stroke={Colors.primary} strokeWidth={2} />
                </Svg>
                <Text style={styles.dateTimeText}>
                  {taskDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Field */}
            <View style={styles.dateTimeField}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity style={styles.dateTimeButton} activeOpacity={0.7} onPress={handleTimePress}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.dateTimeIcon}>
                  <Path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke={Colors.primary}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.dateTimeText}>{taskTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Priority */}
          <Text style={styles.label}>Priority</Text>
          <View style={styles.prioritySelector}>
            {(['Low', 'Medium', 'High'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityTab,
                  priority === p && styles.priorityTabActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryOuter}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryPill,
                    category === cat && styles.categoryPillActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Set Reminder Card */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderLeft}>
              <View style={styles.bellCircle}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    stroke={Colors.primary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View>
                <Text style={styles.reminderTitle}>Set Reminder</Text>
                <Text style={styles.reminderSub}>Notify me 15m before</Text>
              </View>
            </View>
            <Switch
              value={setReminder}
              onValueChange={setSetReminder}
              trackColor={{ false: '#E2E8F0', true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button Container */}
      <View style={styles.saveContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.saveIcon}>
            <Path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.saveText}>Save Task</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsCalendarVisible(false)}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)} style={styles.modalCloseButton}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={Colors.text} strokeWidth={2.5} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M15 19l-7-7 7-7" stroke={Colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthNames[month]} {year}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 5l7 7-7 7" stroke={Colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Weekdays Header */}
            <View style={styles.weekdaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {gridItems.map((item, idx) => {
                const isSelected = getLocalDateKey(item.dateObj) === getLocalDateKey(taskDate);
                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={!item.isCurrentMonth}
                    onPress={() => {
                      setTaskDate(item.dateObj);
                      setIsCalendarVisible(false);
                    }}
                    style={[
                      styles.dayButton,
                      !item.isCurrentMonth && styles.dayButtonInactive,
                      isSelected && styles.dayButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !item.isCurrentMonth && styles.dayTextInactive,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {item.num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={isTimeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTimeVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsTimeVisible(false)}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setIsTimeVisible(false)} style={styles.modalCloseButton}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={Colors.text} strokeWidth={2.5} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Time Picker Layout */}
            <View style={styles.timePickerContainer}>
              {/* Hours */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.timeScrollView} contentContainerStyle={styles.timeScrollContent}>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setSelectedHour(h)}
                      style={[styles.timeSelectBtn, selectedHour === h && styles.timeSelectBtnActive]}
                    >
                      <Text style={[styles.timeSelectText, selectedHour === h && styles.timeSelectTextActive]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.timeDivider}>:</Text>

              {/* Minutes */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Min</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.timeScrollView} contentContainerStyle={styles.timeScrollContent}>
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setSelectedMinute(m)}
                      style={[styles.timeSelectBtn, selectedMinute === m && styles.timeSelectBtnActive]}
                    >
                      <Text style={[styles.timeSelectText, selectedMinute === m && styles.timeSelectTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View style={styles.periodColumn}>
                {(['AM', 'PM'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    style={[styles.periodBtn, selectedPeriod === period && styles.periodBtnActive]}
                  >
                    <Text style={[styles.periodBtnText, selectedPeriod === period && styles.periodBtnTextActive]}>{period}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity onPress={handleSaveTime} style={styles.modalDoneButton} activeOpacity={0.8}>
              <Text style={styles.modalDoneButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#312E81',
  },
  headerPlaceholder: {
    width: 36,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  multilineContainer: {
    height: 120,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  multilineInput: {
    height: '100%',
  },
  // Date & Time
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  dateTimeField: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  dateTimeIcon: {
    marginRight: 10,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  // Priority selector
  prioritySelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    gap: 6,
  },
  priorityTab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  priorityTabActive: {
    backgroundColor: '#EEF2FF',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  priorityTextActive: {
    color: Colors.primary,
  },
  // Category Selector
  categoryOuter: {
    marginBottom: 24,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#EEF2FF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  categoryTextActive: {
    color: Colors.primary,
  },
  // Reminder Card
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  reminderSub: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  // Save button container
  saveContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  // Calendar specific styles
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 8,
  },
  navButton: {
    padding: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: (width - 48) / 7,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  dayButton: {
    width: (width - 64) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayButtonInactive: {
    opacity: 0,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dayTextInactive: {
    color: Colors.secondaryText,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Time Picker specific styles
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    gap: 16,
    marginBottom: 24,
  },
  timeColumn: {
    width: 80,
    height: '100%',
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  timeScrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeScrollContent: {
    paddingVertical: 10,
  },
  timeSelectBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timeSelectBtnActive: {
    backgroundColor: '#EEF2FF',
  },
  timeSelectText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  timeSelectTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  timeDivider: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.secondaryText,
    paddingTop: 16,
  },
  periodColumn: {
    justifyContent: 'center',
    gap: 12,
    height: '100%',
    paddingTop: 20,
  },
  periodBtn: {
    width: 60,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  periodBtnTextActive: {
    color: '#FFFFFF',
  },
  modalDoneButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

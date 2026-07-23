import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { deleteTask as deleteTaskAction, editTask as editTaskAction } from '../../Store/tasksSlice';
import Colors from '../../constants/colors';
import { deleteTask as deleteTaskFromFirestore, updateTask as updateTaskInFirestore } from '../../service/taskService';

const { width } = Dimensions.get('window');

export default function EditTaskScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();

  const { taskId } = route.params || {};
  const task = useSelector((state: RootState) =>
    state.tasks.tasks.find((t) => t.id === taskId)
  );

  const { avatarKey } = useSelector((state: RootState) => state.user);

  const avatar = avatarKey.startsWith('http') || avatarKey.startsWith('file') || avatarKey.startsWith('content')
    ? { uri: avatarKey }
    : avatarKey === 'profile_avatar'
      ? require('../../../assets/images/profile_avatar.png')
      : require('../../../assets/images/avatar.png');

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5m0 0l7-7m-7 7l7 7" stroke="#111827" strokeWidth={2} />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.secondaryText, fontSize: 16, fontWeight: '600' }}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(task.priority);
  const [category, setCategory] = useState(task.category);
  const [setReminder, setSetReminder] = useState(task.setReminder);

  const getLocalDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseTaskDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    } catch (e) { }
    return new Date();
  };

  const initialDate = parseTaskDate(task.date);
  const [taskDate, setTaskDate] = useState<Date>(initialDate);
  const [taskTime, setTaskTime] = useState(task.time);

  // Modals Visibility
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isTimeVisible, setIsTimeVisible] = useState(false);
  const [isCategoryVisible, setIsCategoryVisible] = useState(false);

  // Calendar Modal States
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(initialDate));

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

  const handleUpdate = async () => {
    if (!title.trim()) return;
    const taskData = {
      title,
      description,
      priority,
      category,
      completed: task.completed,
      date: getLocalDateKey(taskDate),
      time: taskTime,
      setReminder,
    };

    try {
      await updateTaskInFirestore(task.id, taskData);
      dispatch(
        editTaskAction({
          id: task.id,
          ...taskData,
        })
      );
      navigation.goBack();
    } catch (e) {
      console.error(e);
      alert("Failed to update task in Firestore.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskFromFirestore(task.id);
      dispatch(deleteTaskAction(task.id));
      navigation.navigate('Main');
    } catch (e) {
      console.error(e);
      alert("Failed to delete task from Firestore.");
    }
  };

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
        <Text style={styles.headerTitle}>Edit Task</Text>
        <View style={styles.headerRight}>

          <Image source={avatar} style={styles.headerAvatar} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Card 1: Title & Description */}
          <View style={styles.detailsCard}>
            <Text style={styles.inputLabelPurple}>TASK TITLE</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Task Title"
              placeholderTextColor={Colors.secondaryText}
            />
            <View style={styles.divider} />
            <Text style={styles.inputLabelGray}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details..."
              placeholderTextColor={Colors.secondaryText}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Date Picker Button */}
          <TouchableOpacity style={styles.pickerButton} activeOpacity={0.8} onPress={handleDatePress}>
            <View style={styles.pickerLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect x={3} y={4} width={18} height={18} rx={2} stroke={Colors.primary} strokeWidth={2} />
                  <Path d="M16 2v4M8 2v4M3 10h18" stroke={Colors.primary} strokeWidth={2} />
                </Svg>
              </View>
              <View>
                <Text style={styles.pickerLabel}>Date</Text>
                <Text style={styles.pickerVal}>
                  {taskDate.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#374151" strokeWidth={2} />
              <Path d="M16 2v4M8 2v4M3 10h18" stroke="#374151" strokeWidth={2} />
            </Svg>
          </TouchableOpacity>

          {/* Time Picker Button */}
          <TouchableOpacity style={styles.pickerButton} activeOpacity={0.8} onPress={handleTimePress}>
            <View style={styles.pickerLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke={Colors.primary}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View>
                <Text style={styles.pickerLabel}>Time</Text>
                <Text style={styles.pickerVal}>{taskTime}</Text>
              </View>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#374151"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Priority & Category Container */}
          <View style={styles.priorityCategoryContainer}>
            {/* Priority */}
            <Text style={styles.blockLabel}>PRIORITY</Text>

            {/* High Option */}
            <TouchableOpacity
              style={styles.priorityOption}
              onPress={() => setPriority('High')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.optionText}>High</Text>
              </View>
              {priority === 'High' ? (
                <View style={styles.radioSelected}>
                  <View style={styles.radioSelectedDot} />
                </View>
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </TouchableOpacity>

            {/* Medium Option */}
            <TouchableOpacity
              style={styles.priorityOption}
              onPress={() => setPriority('Medium')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.optionText}>Medium</Text>
              </View>
              {priority === 'Medium' ? (
                <View style={styles.radioSelected}>
                  <View style={styles.radioSelectedDot} />
                </View>
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </TouchableOpacity>

            {/* Low Option */}
            <TouchableOpacity
              style={styles.priorityOption}
              onPress={() => setPriority('Low')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.optionText}>Low</Text>
              </View>
              {priority === 'Low' ? (
                <View style={styles.radioSelected}>
                  <View style={styles.radioSelectedDot} />
                </View>
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </TouchableOpacity>

            {/* Category */}
            <Text style={[styles.blockLabel, { marginTop: 20 }]}>CATEGORY</Text>
            <TouchableOpacity
              style={styles.dropdownBox}
              activeOpacity={0.8}
              onPress={() => setIsCategoryVisible(true)}
            >
              <Text style={styles.dropdownVal}>{category}</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 9l-7 7-7-7"
                  stroke="#374151"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Task Progress */}
          <View style={styles.detailsCard}>
            <Text style={styles.progressTitle}>Task Progress</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: task.completed ? '100%' : '0%', backgroundColor: task.completed ? Colors.success : Colors.primary }]} />
            </View>
            <Text style={styles.progressSub}>
              {task.completed ? '100% complete — No subtasks remaining' : '0% complete — Subtasks remaining'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.85}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.updateIcon}>
            <Path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.updateText}>Update Task</Text>
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

      {/* Category Picker Modal */}
      <Modal
        visible={isCategoryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsCategoryVisible(false)}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setIsCategoryVisible(false)} style={styles.modalCloseButton}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={Colors.text} strokeWidth={2.5} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Category Options */}
            <View style={{ gap: 12, marginBottom: 20 }}>
              {(['Work', 'Personal', 'Study', 'Health', 'Finance'] as const).map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setIsCategoryVisible(false);
                    }}
                    style={[
                      styles.categoryOptionBtn,
                      isSelected && styles.categoryOptionBtnActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      isSelected && styles.categoryOptionTextActive
                    ]}>{cat}</Text>
                    {isSelected && (
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M5 13l4 4L19 7" stroke={Colors.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trashButton: {
    padding: 6,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputLabelPurple: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputLabelGray: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondaryText,
    marginBottom: 10,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  descriptionInput: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '500',
    height: 80,
  },
  // Picker Buttons
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondaryText,
    marginBottom: 2,
  },
  pickerVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  // Collaborators
  collaboratorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  collaboratorsIcon: {
    marginRight: 8,
  },
  collaboratorsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  collabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  collabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  collabAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  collabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  collabDismiss: {
    padding: 2,
  },
  addButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Priority & Category Block
  priorityCategoryContainer: {
    backgroundColor: '#ECECF8',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  blockLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondaryText,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  priorityOption: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  // Task Progress
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06B6D4',
    borderRadius: 3,
  },
  progressSub: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  updateButton: {
    flex: 1,
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
  updateIcon: {
    marginRight: 6,
  },
  updateText: {
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
  categoryOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryOptionBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryOptionTextActive: {
    color: Colors.primary,
  },
});

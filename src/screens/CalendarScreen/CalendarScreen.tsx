import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { toggleTask as toggleTaskAction } from '../../Store/tasksSlice';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

interface CalendarDay {
  dayName: string;
  dayNum: number;
  isActive?: boolean;
  dateObj: Date;
}

interface MonthDay {
  num: number;
  isCurrentMonth: boolean;
  hasTask?: boolean;
  isSelected?: boolean;
}

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { avatarKey } = useSelector((state: RootState) => state.user);
  const avatar = avatarKey.startsWith('http') || avatarKey.startsWith('file') || avatarKey.startsWith('content')
    ? { uri: avatarKey }
    : avatarKey === 'profile_avatar'
      ? require('../../../assets/images/profile_avatar.png')
      : require('../../../assets/images/avatar.png');

  // Date states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Helper: Format Date as YYYY-MM-DD in local time
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayKey = formatDateKey(new Date());

  const toggleTask = (id: string) => {
    dispatch(toggleTaskAction(id));
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Weekly strip days calculation (centered around or starting with the week of selectedDate)
  // Monday of the week
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(selectedDate);
  const weeklyDays: CalendarDay[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Generate 14 days starting from the start of the week of selectedDate
  for (let i = 0; i < 14; i++) {
    const dateObj = new Date(startOfWeek);
    dateObj.setDate(startOfWeek.getDate() + i);
    const isCurrentActive = formatDateKey(dateObj) === formatDateKey(selectedDate);
    weeklyDays.push({
      dayName: dayNames[dateObj.getDay()],
      dayNum: dateObj.getDate(),
      isActive: isCurrentActive,
      dateObj: dateObj,
    });
  }

  // Monthly grid calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
  // Adjust firstDayIndex so Monday is 0 and Sunday is 6
  const firstDayIndex = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const numDaysCurrentMonth = new Date(year, month + 1, 0).getDate();
  const numDaysPrevMonth = new Date(year, month, 0).getDate();

  const monthDays: MonthDay[] = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = numDaysPrevMonth - i;
    monthDays.push({
      num: dayNum,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= numDaysCurrentMonth; i++) {
    const dateObj = new Date(year, month, i);
    const dateStr = formatDateKey(dateObj);
    const isSelected = formatDateKey(selectedDate) === dateStr;
    const hasTask = tasks.some((t) => t.date === dateStr);

    monthDays.push({
      num: i,
      isCurrentMonth: true,
      isSelected,
      hasTask,
    });
  }

  // Next month padding days to round up to 42 cells (6 rows)
  const remainingCells = 42 - monthDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    monthDays.push({
      num: i,
      isCurrentMonth: false,
    });
  }

  const handleSelectMonthDay = (day: MonthDay) => {
    if (day.isCurrentMonth) {
      const newSelected = new Date(year, month, day.num);
      setSelectedDate(newSelected);
    } else {
      // Auto-navigate to prev/next month if grayed-out day is tapped
      if (day.num > 20) {
        const prevMonthDate = new Date(year, month - 1, day.num);
        setCurrentMonth(prevMonthDate);
        setSelectedDate(prevMonthDate);
      } else {
        const nextMonthDate = new Date(year, month + 1, day.num);
        setCurrentMonth(nextMonthDate);
        setSelectedDate(nextMonthDate);
      }
    }
  };

  const handleSelectWeeklyDay = (day: CalendarDay) => {
    setSelectedDate(day.dateObj);
    // Keep viewed month in sync with the selected week day
    setCurrentMonth(new Date(day.dateObj.getFullYear(), day.dateObj.getMonth(), 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthLabel = `${monthNames[month]} ${year}`;

  const selectedDateKey = formatDateKey(selectedDate);
  const filteredTasks = tasks.filter((task) => task.date === selectedDateKey);
  const pendingCount = filteredTasks.filter((task) => !task.completed).length;

  const isToday = selectedDateKey === todayKey;
  const formattedTasksHeader = isToday
    ? 'Tasks for Today'
    : `Tasks for ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>TaskFlow</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Text style={styles.monthText}>{currentMonthLabel}</Text>
          <View style={styles.arrowContainer}>
            <TouchableOpacity style={styles.arrowButton} activeOpacity={0.6} onPress={handlePrevMonth}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M15 19l-7-7 7-7" stroke="#111827" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowButton} activeOpacity={0.6} onPress={handleNextMonth}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M9 5l7 7-7 7" stroke="#111827" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Grid Card */}
        <View style={styles.monthlyCard}>
          {/* Weekday Labels */}
          <View style={styles.weekdayLabelsRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => (
              <Text key={index} style={styles.weekdayLabel}>{label}</Text>
            ))}
          </View>

          {/* Month Days Grid */}
          <View style={styles.daysGrid}>
            {monthDays.map((day, index) => (
              <View key={index} style={styles.gridDayWrapper}>
                <TouchableOpacity
                  style={[
                    styles.gridDayButton,
                    day.isSelected && styles.gridDayButtonSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectMonthDay(day)}
                >
                  <Text
                    style={[
                      styles.gridDayText,
                      !day.isCurrentMonth && styles.gridDayTextInactive,
                      day.isSelected && styles.gridDayTextSelected,
                    ]}
                  >
                    {day.num}
                  </Text>
                </TouchableOpacity>
                {day.hasTask && !day.isSelected && <View style={styles.taskDot} />}
              </View>
            ))}
          </View>
        </View>

        {/* Tasks Section Header */}
        <View style={styles.tasksSectionHeader}>
          <Text style={styles.tasksTitle}>{formattedTasksHeader}</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} Pending</Text>
          </View>
        </View>

        {/* Task Checklist items */}
        <View style={styles.tasksList}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyTasksContainer}>
              <Text style={styles.emptyTasksText}>No tasks scheduled for this day</Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              >
                <TouchableOpacity
                  onPress={() => toggleTask(task.id)}
                  style={[styles.checkbox, task.completed && styles.checkboxActive]}
                  activeOpacity={0.8}
                >
                  {task.completed && (
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 13l4 4L19 7"
                        stroke="#FFFFFF"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text style={[styles.taskCardTitle, task.completed && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  <View style={styles.taskMetaRow}>
                    <View style={styles.timeRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke={Colors.secondaryText}
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text style={styles.timeText}>{task.time}</Text>
                    </View>
                    <View style={[
                      styles.categoryBadge,
                      task.category === 'Personal' && styles.categoryBadgePersonal
                    ]}>
                      <Text style={[
                        styles.categoryBadgeText,
                        task.category === 'Personal' && styles.categoryBadgeTextPersonal
                      ]}>
                        {task.category}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5v14M5 12h14"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#312E81',
  },
  searchButton: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 110, // leave space for FAB and Bottom Tab bar
  },
  // Month selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  monthText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  arrowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  // Weekly strip
  weeklyStripScroll: {
    flexDirection: 'row',
    paddingRight: 24,
    gap: 8,
    marginBottom: 24,
  },
  weeklyDayCard: {
    width: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  weeklyDayCardActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  weeklyDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
    marginBottom: 6,
  },
  weeklyDayNameActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weeklyDayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  weeklyDayNumActive: {
    color: '#FFFFFF',
  },
  // Monthly Calendar Card
  monthlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
  },
  weekdayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  weekdayLabel: {
    width: (width - 88) / 7,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  gridDayWrapper: {
    width: (width - 88) / 7,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 40,
  },
  gridDayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridDayButtonSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  gridDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  gridDayTextInactive: {
    color: '#CBD5E1',
  },
  gridDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: 0,
  },
  // Tasks Section
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
  },
  pendingBadge: {
    backgroundColor: '#F1F1FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  taskInfo: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.secondaryText,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoryBadgePersonal: {
    backgroundColor: '#FAF5FF',
  },
  categoryBadgeTextPersonal: {
    color: Colors.secondary,
  },
  emptyTasksContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyTasksText: {
    fontSize: 14,
    color: Colors.secondaryText,
    fontWeight: '600',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
});

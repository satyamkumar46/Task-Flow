import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { toggleTask as toggleTaskAction } from '../../Store/tasksSlice';
import Colors from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const { name, avatarKey } = useSelector((state: RootState) => state.user);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const avatar = avatarKey.startsWith('http') || avatarKey.startsWith('file') || avatarKey.startsWith('content')
    ? { uri: avatarKey }
    : avatarKey === 'profile_avatar'
      ? require('../../../assets/images/profile_avatar.png')
      : require('../../../assets/images/avatar.png');

  const [searchQuery, setSearchQuery] = useState('');

  const getLocalDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getLocalDateKey(new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 22) return 'Good evening';
    return 'Good night';
  };

  const toggleTask = (id: string) => {
    dispatch(toggleTaskAction(id));
  };

  // Dynamically calculate progress based on today's tasks
  const todayTasks = tasks
    .filter((t) => t.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));
  const totalToday = todayTasks.length;
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const pendingTodayCount = totalToday - completedToday;

  // Upcoming tasks sorted chronologically (earliest to latest)
  const upcomingTasks = tasks
    .filter((t) => t.date > todayStr)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });

  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Stats
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  // Circular Progress Circle Calculations
  const radius = 32;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.userInfoRow}>
          <Image
            source={avatar}
            style={styles.avatar}
          />
          <Text style={styles.greetingText}>{getGreeting()}, {name} 👋</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
            <Path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              stroke={Colors.secondaryText}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your tasks, projects..."
            placeholderTextColor={Colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardLeft}>
            <Text style={styles.progressCardTitle}>Today's Progress</Text>
            <Text style={styles.progressCardDesc}>
              {pendingTodayCount === 0
                ? "Excellent job! You have completed all tasks scheduled for today."
                : `You're almost there! Complete ${pendingTodayCount} more task${pendingTodayCount > 1 ? 's' : ''} to reach your daily goal.`}
            </Text>
            <Text style={styles.progressCardScore}>Task Score: {completedToday}/{totalToday}</Text>
          </View>

          {/* Svg Circular Indicator */}
          <View style={styles.progressCardRight}>
            <Svg width={80} height={80} viewBox="0 0 80 80">
              <G transform="rotate(-90 40 40)">
                {/* Background Ring */}
                <Circle
                  cx={40}
                  cy={40}
                  r={radius}
                  fill="none"
                  stroke="#EEF2F6"
                  strokeWidth={strokeWidth}
                />
                {/* Foreground Progress */}
                <Circle
                  cx={40}
                  cy={40}
                  r={radius}
                  fill="none"
                  stroke={Colors.primary}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </G>
              {/* Center Text */}
              <View style={styles.progressPercentTextContainer}>
                <Text style={styles.progressPercentText}>{progressPercent}%</Text>
              </View>
            </Svg>
          </View>
        </View>

        {/* Stats Row Cards */}
        <View style={styles.statsContainer}>
          {/* Total Tasks */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6-4h6"
                  stroke={Colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.statTexts}>
              <Text style={styles.statCardLabel}>Total Tasks</Text>
              <Text style={styles.statCardValue}>{totalTasksCount}</Text>
            </View>
          </View>

          {/* Completed */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke={Colors.success}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.statTexts}>
              <Text style={styles.statCardLabel}>Completed</Text>
              <Text style={styles.statCardValue}>{completedTasksCount}</Text>
            </View>
          </View>

          {/* Pending */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FAF5FF' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke={Colors.secondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.statTexts}>
              <Text style={styles.statCardLabel}>Pending</Text>
              <Text style={styles.statCardValue}>{pendingTasksCount}</Text>
            </View>
          </View>
        </View>

        {/* Today Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today</Text>
          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {todayTasks.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16 }}>
            <Text style={{ color: Colors.secondaryText, fontWeight: '600' }}>No tasks for today</Text>
          </View>
        ) : (
          todayTasks.map((task) => (
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
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>

                <View style={styles.taskMetaRow}>
                  {/* Due Time */}
                  <View style={styles.dueRow}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke={Colors.secondaryText}
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.dueText}>{task.time}</Text>
                  </View>

                  {/* Badges */}
                  <View style={styles.badgesRow}>
                    {task.priority && (
                      <View style={[styles.badge, styles.priorityBadge]}>
                        <Text style={styles.priorityBadgeText}>{task.priority} Priority</Text>
                      </View>
                    )}
                    {task.category && (
                      <View style={[styles.badge, styles.categoryBadge]}>
                        <Text style={styles.categoryBadgeText}>{task.category}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Upcoming Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {upcomingTasks.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16 }}>
            <Text style={{ color: Colors.secondaryText, fontWeight: '600' }}>No upcoming tasks</Text>
          </View>
        ) : (
          upcomingTasks
            .map((task) => (
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
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>

                  <View style={styles.taskMetaRow}>
                    {/* Calendar Time */}
                    <View style={styles.dueRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Rect x={3} y={4} width={18} height={18} rx={2} stroke={Colors.secondaryText} strokeWidth={2} />
                        <Path d="M16 2v4M8 2v4M3 10h18" stroke={Colors.secondaryText} strokeWidth={2} />
                      </Svg>
                      <Text style={styles.dueText}>{task.time}</Text>
                    </View>

                    {/* Badges */}
                    <View style={styles.badgesRow}>
                      {task.category && (
                        <View style={[styles.badge, styles.categoryBadge]}>
                          <Text style={styles.categoryBadgeText}>{task.category}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
        )}
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
    </View>
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
    paddingTop: 20,
    paddingBottom: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#312E81',
  },
  settingsButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // leave space for FAB and Bottom Bar
  },
  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  // Progress Card
  progressCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
  },
  progressCardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  progressCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.secondaryText,
    marginBottom: 14,
  },
  progressCardScore: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  // Stats row
  statsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
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
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statTexts: {
    flex: 1,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Task Card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  taskTitle: {
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
    flexWrap: 'wrap',
    gap: 8,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadge: {
    backgroundColor: '#FFE4E6',
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Floating Action Button (FAB)
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

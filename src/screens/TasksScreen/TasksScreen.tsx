import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

interface Task {
  id: string;
  title: string;
  time: string;
  category: string;
  completed: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  completedText?: string;
}

export default function TasksScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { avatarKey } = useSelector((state: RootState) => state.user);
  const avatar = avatarKey.startsWith('http') || avatarKey.startsWith('file') || avatarKey.startsWith('content')
    ? { uri: avatarKey }
    : avatarKey === 'profile_avatar'
      ? require('../../../assets/images/profile_avatar.png')
      : require('../../../assets/images/avatar.png');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Work' | 'Personal' | 'Study'>('All');

  const toggleTask = (id: string) => {
    dispatch(toggleTaskAction(id));
  };

  // Filter tasks based on active category and search query
  const filteredTasks = tasks
    .filter((task) => {
      const matchesCategory = activeTab === 'All' || task.category === activeTab;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const categories: Array<'All' | 'Work' | 'Personal' | 'Study'> = ['All', 'Work', 'Personal', 'Study'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>TaskFlow</Text>

      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Input */}
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
            placeholder="Search tasks..."
            placeholderTextColor={Colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Strip */}
        <View style={styles.categoriesOuter}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveTab(cat)}
                style={[
                  styles.categoryPill,
                  activeTab === cat && styles.categoryPillActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeTab === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pending Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{pendingTasks.length} Tasks</Text>
          </View>
        </View>

        {/* Pending List */}
        <View style={styles.taskList}>
          {pendingTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            >
              {/* Circular Unchecked Checkbox */}
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={styles.checkboxCircle}
                activeOpacity={0.8}
              />

              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.title}</Text>
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
                </View>
              </View>

              {/* Priority Badge */}
              {task.priority && (
                <View
                  style={[
                    styles.priorityBadge,
                    task.priority.toUpperCase() === 'HIGH' && styles.badgeHigh,
                    task.priority.toUpperCase() === 'MEDIUM' && styles.badgeMedium,
                    task.priority.toUpperCase() === 'LOW' && styles.badgeLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      task.priority.toUpperCase() === 'HIGH' && styles.textHigh,
                      task.priority.toUpperCase() === 'MEDIUM' && styles.textMedium,
                      task.priority.toUpperCase() === 'LOW' && styles.textLow,
                    ]}
                  >
                    {task.priority.toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Completed Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, styles.completedTitle]}>Completed</Text>
          <View style={[styles.badgeContainer, styles.completedBadgeContainer]}>
            <Text style={[styles.badgeText, styles.completedBadgeText]}>
              {completedTasks.length} Tasks
            </Text>
          </View>
        </View>

        {/* Completed List */}
        <View style={styles.taskList}>
          {completedTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, styles.completedCard]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            >
              {/* Circular Checked Checkbox */}
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={styles.checkboxCircleActive}
                activeOpacity={0.8}
              >
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 13l4 4L19 7"
                    stroke="#FFFFFF"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
                <View style={styles.taskMetaRow}>
                  <View style={styles.timeRow}>
                    {/* Double Check Icon */}
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M17 9l-7 7-4-4M21 9l-7 7-1.5-1.5"
                        stroke={Colors.secondaryText}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.completedTimeText}>{task.completedText}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1FE',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
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
  // Category tabs strip
  categoriesOuter: {
    marginBottom: 24,
  },
  categoriesScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondaryText,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
  },
  completedTitle: {
    color: '#94A3B8',
  },
  badgeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeContainer: {
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  completedBadgeText: {
    color: '#94A3B8',
  },
  taskList: {
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
  completedCard: {
    backgroundColor: '#F5F5FC',
  },
  // Circular Unchecked Checkbox
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.2,
    borderColor: Colors.primary,
    marginRight: 16,
  },
  // Circular Checked Checkbox
  checkboxCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  taskInfo: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  completedTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  // Priority Badges
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeHigh: {
    backgroundColor: '#FFE4E6',
  },
  badgeMedium: {
    backgroundColor: '#F3E8FF',
  },
  badgeLow: {
    backgroundColor: '#F1F5F9',
  },
  priorityText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  textHigh: {
    color: Colors.danger,
  },
  textMedium: {
    color: Colors.secondary,
  },
  textLow: {
    color: Colors.secondaryText,
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

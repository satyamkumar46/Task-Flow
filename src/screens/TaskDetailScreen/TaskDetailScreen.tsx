import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { deleteTask as deleteTaskAction, toggleTask as toggleTaskAction } from '../../Store/tasksSlice';
import { deleteTask as deleteTaskFromFirestore, updateTask as updateTaskInFirestore } from '../../service/taskService';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function TaskDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();

  const { taskId } = route.params || {};
  const task = useSelector((state: RootState) =>
    state.tasks.tasks.find((t) => t.id === taskId)
  );

  const { name, avatarKey } = useSelector((state: RootState) => state.user);

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
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.secondaryText, fontSize: 16, fontWeight: '600' }}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  const handleDelete = async () => {
    try {
      await deleteTaskFromFirestore(task.id);
      dispatch(deleteTaskAction(task.id));
      navigation.goBack();
    } catch (e) {
      console.error(e);
      alert("Failed to delete task from Firestore.");
    }
  };

  const handleToggle = async () => {
    try {
      const nextCompleted = !task.completed;
      await updateTaskInFirestore(task.id, { completed: nextCompleted });
      dispatch(toggleTaskAction(task.id));
    } catch (e) {
      console.error(e);
      alert("Failed to update task in Firestore.");
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
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerRight}>

          <Image source={avatar} style={styles.headerAvatar} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Badges Row */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, styles.priorityBadge]}>
            <Text style={styles.priorityBadgeText}>! {task.priority} Priority</Text>
          </View>
          <View style={[styles.badge, styles.categoryBadge]}>
            <Text style={styles.categoryBadgeText}>{task.category}</Text>
          </View>
        </View>

        {/* Task Title */}
        <Text style={styles.taskTitle}>{task.title}</Text>

        {/* Indicators Info Row */}
        <View style={styles.indicatorsRow}>
          <View style={styles.indicatorItem}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={styles.indicatorIcon}>
              <Rect x={3} y={4} width={18} height={18} rx={2} stroke={Colors.secondaryText} strokeWidth={2} />
              <Path d="M16 2v4M8 2v4M3 10h18" stroke={Colors.secondaryText} strokeWidth={2} />
            </Svg>
            <Text style={styles.indicatorText}>Due {task.date}, {task.time}</Text>
          </View>

          <View style={styles.indicatorItem}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={styles.indicatorIcon}>
              <Path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke="#0284C7"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.indicatorText, styles.reminderText]}>
              Reminder {task.setReminder ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>

        {/* Card 1: Description & Assets */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Description</Text>
          <Text style={styles.descriptionText}>
            {task.description || "No description provided for this task."}
          </Text>

          <View style={styles.divider} />


        </View>

        {/* Card 2: Status & Progress */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Status</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, task.completed && { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>{task.completed ? 'Completed' : 'Pending'}</Text>
            </View>
            <Text style={styles.progressPercentText}>{task.completed ? '100%' : '0%'} Complete</Text>
          </View>

          {/* Custom Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: task.completed ? '100%' : '0%', backgroundColor: task.completed ? Colors.success : Colors.primary }]} />
          </View>
        </View>


      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {/* Delete button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              stroke={Colors.danger}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Edit button */}
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              stroke={Colors.primary}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Mark Complete */}
        <TouchableOpacity style={styles.completeButton} onPress={handleToggle} activeOpacity={0.85}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.completeIcon}>
            <Path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.completeText}>{task.completed ? 'Mark Pending' : 'Mark Complete'}</Text>
        </TouchableOpacity>
      </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    padding: 6,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 110, // leave space for footer
  },
  // Badges Row
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityBadge: {
    backgroundColor: '#FFE4E6',
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  // Indicators Row
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorIcon: {
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  reminderText: {
    color: '#0284C7',
    fontWeight: '700',
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
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  // Assets list
  assetsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  assetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  assetIcon: {
    marginRight: 6,
  },
  assetText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  // Status & Progress Card
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D9488',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#312E81',
    borderRadius: 4,
  },
  // Visual Context Card
  visualContextCard: {
    height: 180,
    marginBottom: 20,
  },
  visualMask: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'flex-end',
  },
  visualTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  visualSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  deleteButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  completeIcon: {
    marginRight: 6,
  },
  completeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

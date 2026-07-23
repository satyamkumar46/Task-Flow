import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store';
import Colors from '../../constants/colors';
import { updateAvatar } from '../../Store/userSlice';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { name, avatarKey } = useSelector((state: RootState) => state.user);
  
  const avatar = avatarKey.startsWith('http') || avatarKey.startsWith('file') || avatarKey.startsWith('content')
    ? { uri: avatarKey }
    : avatarKey === 'profile_avatar'
      ? require('../../../assets/images/profile_avatar.png')
      : require('../../../assets/images/avatar.png');

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    // Navigate back to the Auth screen (which restarts the auth flow)
    navigation.replace('Auth');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      dispatch(updateAvatar(result.assets[0].uri));
    }
  };

  // 1. Tasks Done
  const tasksDone = tasks.filter(t => t.completed).length;

  // 2. Active Streak
  const calculateStreak = (tasksList: typeof tasks) => {
    const completedDates = Array.from(new Set(
      tasksList
        .filter(t => t.completed && t.date)
        .map(t => t.date)
    )).sort((a, b) => b.localeCompare(a)); // Descending: newest first

    if (completedDates.length === 0) return 0;

    const getLocalDateString = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayStr = getLocalDateString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (completedDates[0] !== todayStr && completedDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date(completedDates[0]);

    for (let i = 0; i < completedDates.length; i++) {
      const dateStr = completedDates[i];
      const expectedStr = getLocalDateString(currentDate);

      if (dateStr === expectedStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };
  const activeStreak = calculateStreak(tasks);

  // 3. Efficiency
  const efficiency = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;

  // 4. Top Category
  const getTopCategory = (tasksList: typeof tasks) => {
    const counts: { [key: string]: number } = {};
    tasksList.forEach(t => {
      if (t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    let topCat = 'None';
    let maxCount = 0;
    for (const cat in counts) {
      if (counts[cat] > maxCount) {
        maxCount = counts[cat];
        topCat = cat;
      }
    }
    return topCat;
  };
  const topCategory = getTopCategory(tasks);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>TaskFlow</Text>

      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity activeOpacity={0.9} onPress={pickImage}>
              <Image
                source={avatar}
                style={styles.largeAvatar}
              />
            </TouchableOpacity>
            {/* Floating edit button */}
            <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={pickImage}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <Text style={styles.nameText}>{name}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Card 1 */}
          <View style={styles.gridCard}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke={Colors.primary}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.cardValue}>{tasksDone}</Text>
            <Text style={styles.cardLabel}>TASKS DONE</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.gridCard}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M13 10V3L4 14h7v7l9-11h-7z"
                stroke={Colors.secondary}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.cardValue}>{activeStreak} {activeStreak === 1 ? 'day' : 'days'}</Text>
            <Text style={styles.cardLabel}>ACTIVE STREAK</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.gridCard}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                stroke="#0D9488"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.cardValue}>{efficiency}%</Text>
            <Text style={styles.cardLabel}>EFFICIENCY</Text>
          </View>

          {/* Card 4 */}
          <View style={styles.gridCard}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                stroke={Colors.primary}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.cardValue}>{topCategory}</Text>
            <Text style={styles.cardLabel}>TOP CATEGORY</Text>
          </View>
        </View>

        {/* Settings Card */}
        <Text style={styles.sectionHeader}>Settings</Text>
        <View style={styles.settingsCard}>


          <View style={styles.rowDivider} />

          {/* Help & Support */}
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.6}>
            <View style={styles.rowLeft}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke={Colors.text}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.rowText}>Help & Support</Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 5l7 7-7 7"
                stroke="#94A3B8"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Logout */}
          <TouchableOpacity style={styles.settingsRow} onPress={handleLogout} activeOpacity={0.6}>
            <View style={styles.rowLeft}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  stroke={Colors.danger}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.rowText, { color: Colors.danger }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  settingsButton: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 110, // leave space for Bottom Tab bar
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  gridCard: {
    width: (width - 64) / 2, // 2-column layout accounting for padding and gap
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.secondaryText,
    letterSpacing: 0.5,
  },
  // Settings Section
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});

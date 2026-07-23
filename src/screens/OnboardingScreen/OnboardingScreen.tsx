import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: number;
  title: string;
  description: string;
  image: any;
  isCircular?: boolean;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Organize your tasks',
    description: 'Bring order to your day with a simple and intuitive task manager.',
    image: require('../../../assets/images/onboarding_tasks.png'),
  },
  {
    id: 2,
    title: 'Track your progress',
    description: 'Monitor your daily achievements and watch your productivity grow.',
    image: require('../../../assets/images/onboarding_tasks.png'),
  },
  {
    id: 3,
    title: 'Stay productive',
    description: 'Achieve more every day with smart reminders and progress tracking. Your journey to peak performance starts here.',
    image: require('../../../assets/images/onboarding_success.png'),
    isCircular: true,
  },
];

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    } else {
      scrollViewRef.current?.scrollTo({
        x: (slides.length - 1) * width,
        animated: true,
      });
      setActiveIndex(slides.length - 1);
    }
  };

  const isLastPage = activeIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Slides ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            {/* Image Container */}
            <View style={[
              styles.imageContainer,
              slide.isCircular && styles.circularImageContainer
            ]}>
              <Image source={slide.image} style={styles.image} resizeMode="cover" />
            </View>

            {/* Text details */}
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>

      {/* Bottom control flow */}
      {isLastPage ? (
        <View style={styles.lastPageBottomContainer}>
          {/* Big Get Started Button */}
          <TouchableOpacity
            onPress={handleNext}
            style={styles.getStartedButton}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Terms text */}
          <Text style={styles.termsText}>
            By clicking Get Started, you agree to our Terms of Service.
          </Text>

          {/* Step Count Text */}
          <Text style={styles.stepText}>Step 3 of 3</Text>
        </View>
      ) : (
        <View style={styles.bottomBar}>
          {/* Skip button */}
          <TouchableOpacity 
            onPress={handleSkip} 
            style={styles.skipButton}
            activeOpacity={0.6}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Next button */}
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            activeOpacity={0.8}
          >
            <Text style={styles.nextText}>Next</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
  },
  imageContainer: {
    width: width - 48,
    height: width - 48,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 40,
  },
  circularImageContainer: {
    borderRadius: (width - 48) / 2,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 6,
  },
  arrowIcon: {
    marginTop: 1,
  },
  // Last page specific layout styles
  lastPageBottomContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  getStartedButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
    marginBottom: 16,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  termsText: {
    fontSize: 12,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
    opacity: 0.8,
  },
});

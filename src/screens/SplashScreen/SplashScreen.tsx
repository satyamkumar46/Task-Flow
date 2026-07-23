import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  
  // Floating animations for bokeh circles
  const bokeh1Anim = useRef(new Animated.Value(0)).current;
  const bokeh2Anim = useRef(new Animated.Value(0)).current;
  const bokeh3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Initial fade-in of content and scale up of logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Loading progress bar animation (0% to 100%)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    // 3. Looping floating animations for background bokeh circles
    const startFloatingAnimation = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloatingAnimation(bokeh1Anim, 6000);
    startFloatingAnimation(bokeh2Anim, 8000);
    startFloatingAnimation(bokeh3Anim, 7000);
  }, [fadeAnim, logoScale, progressAnim, bokeh1Anim, bokeh2Anim, bokeh3Anim]);

  // Interpolations for floating bokeh circles
  const bokeh1TranslateY = bokeh1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });
  const bokeh1Scale = bokeh1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const bokeh2TranslateX = bokeh2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const bokeh2Scale = bokeh2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const bokeh3TranslateY = bokeh3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  // Loading bar width interpolation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#5540ed', '#6c46f5', '#7a4ffa']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Bokeh Circles */}
      <Animated.View
        style={[
          styles.bokeh,
          styles.bokehTopRight,
          {
            transform: [{ translateY: bokeh1TranslateY }, { scale: bokeh1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bokeh,
          styles.bokehMiddleRight,
          {
            transform: [{ translateX: bokeh2TranslateX }, { scale: bokeh2Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bokeh,
          styles.bokehCenterLeft,
          {
            transform: [{ translateY: bokeh3TranslateY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bokeh,
          styles.bokehBottomLeft,
          {
            transform: [{ translateY: bokeh1TranslateY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bokeh,
          styles.bokehBottomRight,
          {
            transform: [{ translateX: bokeh2TranslateX }],
          },
        ]}
      />

      {/* Main Content Area */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo Card with Glassmorphism */}
        <Animated.View style={[styles.logoCard, { transform: [{ scale: logoScale }] }]}>
          {/* Inner Circular Checkmark */}
          <View style={styles.logoCircle}>
            <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12.5l4.5 4.5 9.5-9.5"
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </Animated.View>

        {/* Text Details */}
        <Text style={styles.title}>TaskFlow</Text>
        <Text style={styles.subtitle}>Effortless productivity, simplified.</Text>
      </Animated.View>

      {/* Bottom Loading Section */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        {/* Progress Bar Container */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
        
        {/* Loading Text */}
        <Text style={styles.loadingText}>INITIALISING WORKSPACE</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  // Bokeh styling
  bokeh: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    zIndex: 1,
  },
  bokehTopRight: {
    width: width * 1.3,
    height: width * 1.3,
    top: -width * 0.2,
    right: -width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  bokehMiddleRight: {
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.25,
    right: -width * 0.3,
  },
  bokehCenterLeft: {
    width: width * 0.7,
    height: width * 0.7,
    top: height * 0.4,
    left: -width * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bokehBottomLeft: {
    width: width * 0.9,
    height: width * 0.9,
    bottom: -width * 0.1,
    left: -width * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
  },
  bokehBottomRight: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: -width * 0.2,
    right: -width * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  // Logo Card Glassmorphism
  logoCard: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.surface,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 28,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 10,
    textAlign: 'center',
  },
  // Bottom section with loading indicator
  bottomSection: {
    position: 'absolute',
    bottom: height * 0.08,
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  progressContainer: {
    width: 140,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 2,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 2.5,
    marginTop: 16,
  },
});

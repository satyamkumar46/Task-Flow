import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useDispatch } from 'react-redux';
import { updateName } from '../../Store/userSlice';
import Colors from '../../constants/colors';
import { useAuth } from '../../service/authContext';

const { width, height } = Dimensions.get('window');

export default function AuthenticationScreen() {
  const [isLogin, setIsLogin] = useState(true);

  // Form fields state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const userCredential = await loginWithGoogle();
      const user = userCredential.user;
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
      dispatch(updateName(displayName.charAt(0).toUpperCase() + displayName.slice(1)));
      navigation.replace('Main');
    } catch (error: any) {
      console.error(error);
      // Google Sign-In cancellation code is often 12501
      if (error.code === '12501' || error.message?.includes('cancel') || error.message?.includes('CANCELLED')) {
        return;
      }
      setErrorMessage(error.message || 'Google Sign-In failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset form states when switching
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSecurePassword(true);
    setSecureConfirm(true);
    setAgreeToTerms(false);
    setErrorMessage('');
  };

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const handleAuthAction = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (!isLogin && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!isLogin && !agreeToTerms) {
      setErrorMessage('You must agree to the Terms & Conditions.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const userCredential = await login(email.trim(), password);
        const user = userCredential.user;
        const displayName = user.displayName || email.split('@')[0];
        dispatch(updateName(displayName.charAt(0).toUpperCase() + displayName.slice(1)));
      } else {
        const userCredential = await register(email.trim(), password);
        if (fullName.trim()) {
          dispatch(updateName(fullName.trim()));
        }
      }
      navigation.replace('Main');
    } catch (error: any) {
      console.error(error);
      let msg = 'Authentication failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'That email is already registered.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Faint Background Bubbles */}
        <View style={[styles.bgBubble, styles.bubbleTopLeft]} />
        <View style={[styles.bgBubble, styles.bubbleBottomRight]} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLogin ? (
            /* ==================== LOGIN MODE ==================== */
            <View style={styles.cardContainer}>
              {/* Centered App Logo Badge */}
              <View style={styles.logoBadgeContainer}>
                <View style={styles.logoCircle}>
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12.5l4.5 4.5 9.5-9.5"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to manage your workflow.</Text>

              {/* Input Fields */}
              <View style={styles.formContainer}>
                {/* Email Field */}
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                    <Path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      stroke={Colors.secondaryText}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="name@company.com"
                    placeholderTextColor={Colors.secondaryText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Field */}
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                    <Path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      stroke={Colors.secondaryText}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.secondaryText}
                    secureTextEntry={securePassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setSecurePassword(!securePassword)}
                    style={styles.eyeButton}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d={
                          securePassword
                            ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.25M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18"
                        }
                        stroke={Colors.secondaryText}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleAuthAction}
                  style={[styles.actionButton, isSubmitting && { opacity: 0.7 }]}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <Text style={styles.actionButtonText}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>

                {/* Social Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign in with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign In Button */}
                <TouchableOpacity
                  style={[styles.googleButton, isSubmitting && { opacity: 0.7 }]}
                  activeOpacity={0.7}
                  onPress={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  {/* Google Custom G Icon */}
                  <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.googleIcon}>
                    <Path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <Path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <Path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <Path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </Svg>
                  <Text style={styles.googleButtonText}>
                    {isSubmitting ? 'Connecting...' : 'Continue with Google'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer Switcher */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.footerLinkText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ==================== SIGNUP MODE ==================== */
            <View style={styles.cardContainer}>
              {/* Title & Subtitle */}
              <Text style={styles.signupTitle}>Create Account</Text>
              <Text style={styles.subtitle}>Join TaskFlow to stay organized.</Text>

              {/* Input Fields */}
              <View style={styles.formContainer}>
                {/* Full Name */}
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                    <Path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      stroke={Colors.secondaryText}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={Colors.secondaryText}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                {/* Email Address */}
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                    <Path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      stroke={Colors.secondaryText}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={Colors.secondaryText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                    <Path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      stroke={Colors.secondaryText}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.secondaryText}
                    secureTextEntry={securePassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setSecurePassword(!securePassword)}
                    style={styles.eyeButton}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d={
                          securePassword
                            ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.25M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18"
                        }
                        stroke={Colors.secondaryText}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <Text style={styles.label}>Confirm</Text>
                <View style={styles.inputWrapper}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                    <Path
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      stroke={Colors.secondaryText}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.secondaryText}
                    secureTextEntry={secureConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureConfirm(!secureConfirm)}
                    style={styles.eyeButton}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d={
                          secureConfirm
                            ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.25M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18"
                        }
                        stroke={Colors.secondaryText}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                {/* Terms of Service Checkbox */}
                <TouchableOpacity
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  style={styles.checkboxContainer}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, agreeToTerms && styles.checkboxActive]}>
                    {agreeToTerms && (
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
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
                  </Text>
                </TouchableOpacity>

                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                {/* Create Account Button */}
                <TouchableOpacity
                  onPress={handleAuthAction}
                  style={[styles.actionButton, isSubmitting && { opacity: 0.7 }]}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <Text style={styles.actionButtonText}>
                    {isSubmitting ? 'Registering...' : 'Create Account'}
                  </Text>
                  {!isSubmitting && (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
                      <Path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="#FFFFFF"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>

                {/* Footer Switcher */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={toggleMode}>
                    <Text style={styles.footerLinkText}>Log In</Text>
                  </TouchableOpacity>
                </View>

                {/* Social Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR REGISTER WITH</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Icons (Google, Apple) */}
                <View style={styles.socialButtonsRow}>
                  {/* Google */}
                  <TouchableOpacity
                    style={styles.socialCircle}
                    activeOpacity={0.7}
                    onPress={handleGoogleLogin}
                    disabled={isSubmitting}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <Path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <Path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <Path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </Svg>
                  </TouchableOpacity>

                  {/* Apple */}
                  <TouchableOpacity style={styles.socialCircle} activeOpacity={0.7}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08 1.13.16 2.81-1.33z"
                        fill="#000000"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Centered App Brand Title at very bottom of screen */}
          <Text style={styles.brandTitle}>TaskFlow</Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.04,
  },
  // Faint background bubbles
  bgBubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
  },
  bubbleTopLeft: {
    width: width * 0.7,
    height: width * 0.7,
    top: -width * 0.1,
    left: -width * 0.2,
  },
  bubbleBottomRight: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: -width * 0.2,
    right: -width * 0.2,
  },
  // Card styling
  cardContainer: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 28,
  },
  // Logo
  logoBadgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  signupTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 27,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 6,
  },
  arrowIcon: {
    marginTop: 1,
  },
  // Social Logins
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  googleIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  // Checkbox (Signup only)
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 18,
    color: Colors.text,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Footer
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 15,
    color: Colors.secondaryText,
  },
  footerLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    opacity: 0.35,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  errorText: {
    color: Colors.danger || '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../service/authContext';
import Colors from '../../constants/colors';
import { auth as firebaseAuth } from '../../config/firebase';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { resetPassword, updateUserPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user is logged in
      if (firebaseAuth.currentUser && firebaseAuth.currentUser.email === email.trim()) {
        // Direct password update
        await updateUserPassword(newPassword);
        setSuccessMessage('Password has been updated successfully.');
        setIsSent(true);
      } else {
        // Since Firebase requires authentication to modify passwords directly,
        // we send a password reset link to verify their email and apply the update.
        await resetPassword(email.trim());
        setSuccessMessage('For security, a password reset link has been sent to your email to verify and update your password.');
        setIsSent(true);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="#0F172A"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {!isSent ? (
          <View style={styles.cardContainer}>
            {/* Lock Icon */}
            <View style={styles.iconContainer}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V11C20 9.89543 19.1046 9 18 9H6C4.89543 9 4 9.89543 4 11V19C4 20.1046 4.89543 21 6 21ZM16 9V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V9H16Z"
                  stroke={Colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and your new desired password below to update it.
            </Text>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Email Input */}
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
                  editable={!isSubmitting}
                />
              </View>

              {/* New Password Input */}
              <Text style={styles.label}>New Password</Text>
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
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                  editable={!isSubmitting}
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

              {/* Confirm Password Input */}
              <Text style={styles.label}>Confirm Password</Text>
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
                  editable={!isSubmitting}
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

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleReset}
                style={[styles.actionButton, isSubmitting && { opacity: 0.7 }]}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={styles.actionButtonText}>
                  {isSubmitting ? 'Updating...' : 'Update Password'}
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
            </View>
          </View>
        ) : (
          /* Success Screen */
          <View style={styles.cardContainer}>
            <View style={[styles.iconContainer, styles.successIconContainer]}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <Text style={styles.title}>Update Pending / Successful</Text>
            <Text style={styles.subtitle}>{successMessage}</Text>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.actionButton, { marginTop: 24, width: '100%' }]}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 24,
    top: 54,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    marginTop: 80,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    backgroundColor: '#ECFDF5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  actionButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
});

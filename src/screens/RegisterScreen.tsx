import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AnimatedLogo from '../components/AnimatedLogo';

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      await register({ email, password });
      navigation.replace('Blender');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <AnimatedLogo size={120} style={styles.logo} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Join Movie Picker today</Text>
        
        <View style={styles.form}>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} 
            placeholder="Email *" 
            placeholderTextColor={theme.colors.textTertiary} 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />
          <TextInput 
            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]} 
            placeholder="Password *" 
            placeholderTextColor={theme.colors.textTertiary} 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }, isLoading && styles.buttonDisabled]} 
            onPress={handleRegister} 
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  logo: { alignSelf: 'center', marginBottom: 20 },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  form: { width: '100%' },
  input: { 
    borderRadius: 8, 
    padding: 15, 
    marginBottom: 15, 
    fontSize: 16,
    borderWidth: 1,
  },
  button: { 
    borderRadius: 8, 
    padding: 15, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  buttonDisabled: { 
    opacity: 0.6
  },
  buttonText: { 
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: { alignItems: 'center' },
  linkText: { fontSize: 14 },
});
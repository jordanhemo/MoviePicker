import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { 
  Circle, 
  Ellipse, 
  Rect, 
  Path, 
  Defs, 
  LinearGradient, 
  Stop 
} from 'react-native-svg';

interface AnimatedLogoProps {
  size?: number;
  style?: any;
}

export default function AnimatedLogo({ size = 100, style }: AnimatedLogoProps) {
  // Animation values
  const floatAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Floating animation - subtle up and down movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnimation, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnimation, rotateAnimation]);

  // Interpolate values for animations
  const floatY = floatAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3], // Subtle floating movement
  });
  const rotateZ = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'], // Subtle rotation
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          transform: [
            { translateY: floatY },
            { rotateZ },
          ]
        }, 
        style
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* 3D Shadow Gradient */}
          <LinearGradient id="shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </LinearGradient>
          
          {/* 3D Highlight Gradient */}
          <LinearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
          
          {/* Glasses Frame Gradient */}
          <LinearGradient id="glassesFrame" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#333333" />
            <Stop offset="50%" stopColor="#000000" />
            <Stop offset="100%" stopColor="#666666" />
          </LinearGradient>
        </Defs>

        {/* 3D Shadow */}
        <Circle cx={102} cy={102} r={82} fill="url(#shadow)" />
        
        {/* Dog Head with 3D effect */}
        <Circle cx={100} cy={100} r={80} fill="#8B4513" /> {/* Brown face */}
        <Circle cx={100} cy={100} r={70} fill="#D2B48C" /> {/* Lighter brown inner face */}
        
        {/* 3D Highlight */}
        <Circle cx={85} cy={85} r={25} fill="url(#highlight)" />
        
        {/* Enhanced Ears with 3D effect */}
        <Ellipse 
          cx={50} 
          cy={60} 
          rx={30} 
          ry={50} 
          fill="#8B4513" 
          transform={`rotate(-30 50 60)`} 
        />
        <Ellipse 
          cx={150} 
          cy={60} 
          rx={30} 
          ry={50} 
          fill="#8B4513" 
          transform={`rotate(30 150 60)`} 
        />
        
        {/* Ear highlights */}
        <Ellipse 
          cx={52} 
          cy={58} 
          rx={20} 
          ry={35} 
          fill="#A0522D" 
          transform={`rotate(-30 52 58)`} 
        />
        <Ellipse 
          cx={148} 
          cy={58} 
          rx={20} 
          ry={35} 
          fill="#A0522D" 
          transform={`rotate(30 148 58)`} 
        />
        
        {/* Static Eyes - blinking will be handled by the entire logo opacity */}
        <Circle cx={80} cy={90} r={10} fill="#000" />
        <Circle cx={120} cy={90} r={10} fill="#000" />
        
        {/* Eye highlights */}
        <Circle cx={83} cy={87} r={3} fill="#FFF" />
        <Circle cx={123} cy={87} r={3} fill="#FFF" />
        
        {/* Enhanced 3D Glasses */}
        <Rect 
          x={65} 
          y={80} 
          width={70} 
          height={20} 
          rx={5} 
          fill="url(#glassesFrame)" 
          stroke="#000" 
          strokeWidth={2} 
        />
        
        {/* Glasses lenses with enhanced 3D effect */}
        <Rect 
          x={67} 
          y={82} 
          width={31} 
          height={16} 
          rx={3} 
          fill="#FF0000" 
          fillOpacity={0.6} 
        />
        <Rect 
          x={102} 
          y={82} 
          width={31} 
          height={16} 
          rx={3} 
          fill="#0000FF" 
          fillOpacity={0.6} 
        />
        
        {/* Glasses highlights */}
        <Rect 
          x={67} 
          y={82} 
          width={31} 
          height={8} 
          rx={3} 
          fill="#FFFFFF" 
          fillOpacity={0.3} 
        />
        <Rect 
          x={102} 
          y={82} 
          width={31} 
          height={8} 
          rx={3} 
          fill="#FFFFFF" 
          fillOpacity={0.3} 
        />
        
        {/* Enhanced Nose with 3D effect */}
        <Circle cx={100} cy={120} r={10} fill="#000" />
        <Circle cx={98} cy={118} r={3} fill="#333" />
        
        {/* Animated Enhanced Smile */}
        <Animated.View>
          <Path 
            d="M85 135 Q100 150 115 135"
            fill="none" 
            stroke="#000" 
            strokeWidth={4} 
            strokeLinecap="round"
          />
        </Animated.View>
        
        {/* Additional smile lines for more expression */}
        <Path 
          d="M90 140 Q100 145 110 140"
          fill="none" 
          stroke="#000" 
          strokeWidth={2} 
          strokeLinecap="round"
          opacity={0.6}
        />
        
        {/* Cheek highlights */}
        <Circle cx={70} cy={125} r={8} fill="#FFB6C1" fillOpacity={0.3} />
        <Circle cx={130} cy={125} r={8} fill="#FFB6C1" fillOpacity={0.3} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

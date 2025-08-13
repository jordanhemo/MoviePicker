import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { 
  Circle, 
  Ellipse, 
  Rect, 
  Path, 
  Defs, 
  LinearGradient, 
  Stop 
} from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  size?: number;
  style?: any;
}

export default function Logo({ size = 100, style }: LogoProps) {
  const { theme } = useTheme();
  const scale = size / 200; // Original SVG is 200x200
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Dog Head */}
        <Circle cx={100} cy={100} r={80} fill={theme.colors.logo.dogFace} /> {/* Brown face */}
        <Circle cx={100} cy={100} r={70} fill={theme.colors.logo.dogFaceInner} /> {/* Lighter brown inner face */}
        
        {/* Ears */}
        <Ellipse 
          cx={50} 
          cy={60} 
          rx={30} 
          ry={50} 
          fill={theme.colors.logo.dogEars} 
          transform={`rotate(-30 50 60)`} 
        />
        <Ellipse 
          cx={150} 
          cy={60} 
          rx={30} 
          ry={50} 
          fill={theme.colors.logo.dogEars} 
          transform={`rotate(30 150 60)`} 
        />
        
        {/* Eyes */}
        <Circle cx={80} cy={90} r={10} fill={theme.colors.logo.dogEyes} />
        <Circle cx={120} cy={90} r={10} fill={theme.colors.logo.dogEyes} />
        <Circle cx={83} cy={87} r={3} fill={theme.colors.logo.dogEyesHighlight} /> {/* Eye highlight */}
        <Circle cx={123} cy={87} r={3} fill={theme.colors.logo.dogEyesHighlight} />
        
        {/* 3D Glasses */}
        <Rect 
          x={65} 
          y={80} 
          width={70} 
          height={20} 
          rx={5} 
          fill="none" 
          stroke={theme.colors.logo.glassesFrame} 
          strokeWidth={4} 
        />
        <Rect 
          x={65} 
          y={80} 
          width={35} 
          height={20} 
          fill={theme.colors.logo.glassesRedLens} 
          fillOpacity={0.5} 
        /> {/* Red lens */}
        <Rect 
          x={100} 
          y={80} 
          width={35} 
          height={20} 
          fill={theme.colors.logo.glassesBlueLens} 
          fillOpacity={0.5} 
        /> {/* Blue lens */}
        
        {/* Nose */}
        <Circle cx={100} cy={120} r={10} fill={theme.colors.logo.dogNose} />
        
        {/* Mouth */}
        <Path 
          d="M85 135 Q100 150 115 135" 
          fill="none" 
          stroke={theme.colors.logo.dogMouth} 
          strokeWidth={4} 
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

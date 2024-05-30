import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ExWrapperProps} from './index.type';

const ExWrapper = ({
  edges = ['bottom'],
  style,
  children,
  ...props
}: ExWrapperProps) => {
  return (
    <SafeAreaView style={[styles.wrapper, style]} edges={edges} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 8,
  },
});

export default ExWrapper;
export type {ExWrapperProps};

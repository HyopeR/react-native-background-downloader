import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {ExButton} from '../../components/commons';

export type FooterProps = {
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onClear: () => void;
  onRead: () => void;
  isStarted: boolean;
} & ViewProps;

export const Footer = ({
  onStart,
  onStop,
  onReset,
  onClear,
  onRead,
  isStarted,
  style,
  ...props
}: FooterProps) => {
  return (
    <View style={StyleSheet.compose(styles.wrapper, style)} {...props}>
      {isStarted ? (
        <ExButton title={'Stop'} onPress={onStop} />
      ) : (
        <ExButton title={'Start'} onPress={onStart} />
      )}

      <ExButton title={'Reset'} onPress={onReset} />
      <ExButton title={'Delete files'} onPress={onClear} />
      <ExButton title={'List files'} onPress={onRead} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});

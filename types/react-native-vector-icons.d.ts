declare module 'react-native-vector-icons/Feather' {
  import { Icon } from 'react-native-vector-icons/Icon';
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  export interface FeatherProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Feather extends Component<FeatherProps> {}
}

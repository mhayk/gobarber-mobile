import React from 'react';
import { TextInputProps } from 'react-native';

import { Container, TextInput, Icon } from './styles';

interface InputPros extends TextInputProps {
  name: string;
  icon: string;
}

const Input: React.FC<InputPros> = ({ name, icon, ...rest}) => (
  <Container>
    <Icon name={icon} size={20} color="#666360" />
    <TextInput
      /**
       * dark keyboard style works just to iOS
       */
      keyboardAppearance="dark"
      placeholderTextColor="#666360"
      {...rest}
    />
  </Container>
)

export default Input;

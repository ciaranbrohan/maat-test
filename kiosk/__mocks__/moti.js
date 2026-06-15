const React = require('react');
const { View, Text } = require('react-native');

const MotiView = React.forwardRef(function MotiView({ children, style, ...rest }, ref) {
  return React.createElement(View, { style, ref }, children);
});

function MotiText({ children, style, ...rest }) {
  return React.createElement(Text, { style }, children);
}

module.exports = { MotiView, MotiText };

const React = require('react');
const { Text } = require('react-native');

const Icon = ({ name }) => React.createElement(Text, null, name || '');

module.exports = {
  Ionicons: Icon,
  AntDesign: Icon,
  MaterialIcons: Icon,
  FontAwesome: Icon,
  Feather: Icon,
  Entypo: Icon,
};

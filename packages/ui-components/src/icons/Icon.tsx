import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import CheckCircleFill from 'react-native-bootstrap-icons/icons/check-circle-fill';
import XCircle from 'react-native-bootstrap-icons/icons/x-circle';
import InfoCircle from 'react-native-bootstrap-icons/icons/info-circle';
import ExclamationTriangleFill from 'react-native-bootstrap-icons/icons/exclamation-triangle-fill';
import ChevronRight from 'react-native-bootstrap-icons/icons/chevron-right';
import StarFill from 'react-native-bootstrap-icons/icons/star-fill';
import Bell from 'react-native-bootstrap-icons/icons/bell';
import HeartFill from 'react-native-bootstrap-icons/icons/heart-fill';
import Trash from 'react-native-bootstrap-icons/icons/trash';
import Pencil from 'react-native-bootstrap-icons/icons/pencil';
import Search from 'react-native-bootstrap-icons/icons/search';

type IconMap = {
  'check-circle-fill': typeof CheckCircleFill;
  'x-circle': typeof XCircle;
  'info-circle': typeof InfoCircle;
  'exclamation-triangle-fill': typeof ExclamationTriangleFill;
  'chevron-right': typeof ChevronRight;
  'star-fill': typeof StarFill;
  bell: typeof Bell;
  'heart-fill': typeof HeartFill;
  trash: typeof Trash;
  pencil: typeof Pencil;
  search: typeof Search;
};

const icons: IconMap = {
  'check-circle-fill': CheckCircleFill,
  'x-circle': XCircle,
  'info-circle': InfoCircle,
  'exclamation-triangle-fill': ExclamationTriangleFill,
  'chevron-right': ChevronRight,
  'star-fill': StarFill,
  bell: Bell,
  'heart-fill': HeartFill,
  trash: Trash,
  pencil: Pencil,
  search: Search,
};

export type IconName = keyof IconMap;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  a11yLabel?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  a11yLabel,
}) => {
  const { colors } = useTheme();
  const SvgIcon = icons[name];
  return (
    <SvgIcon
      width={size}
      height={size}
      fill={color ?? colors.foreground}
      accessibilityLabel={a11yLabel}
    />
  );
};

export default Icon;

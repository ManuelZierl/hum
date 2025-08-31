import { create } from 'storybook/theming';
import logo from '../../../imgs/logo-transparent.svg';

export default create({
  base: 'light',
  brandTitle: 'Hum Storybook',
  brandImage: logo,
  brandTarget: '_self',
});

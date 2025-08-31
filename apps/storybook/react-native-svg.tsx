import React from 'react';

export const Svg = ({ children, ...props }: any) => (
  <svg {...props}>{children}</svg>
);

export const Path = (props: any) => <path {...props} />;

export default Svg;

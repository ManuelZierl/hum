import React from 'react';

export const Svg = ({ children, fill, style, ...props }: any) => (
  <svg {...props} style={{ ...(style || {}), fill }}>
    {children}
  </svg>
);

export const Path = (props: any) => <path {...props} />;

export default Svg;

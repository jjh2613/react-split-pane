import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getUnit, convertSizeToCssValue } from './SplitPane';

type Size = string | number

function PaneStyle({ split, initialSize, size, minSize, maxSize, resizersSize }: CommonProperties) {
  const value = size || initialSize;
  const isVertical = split === 'vertical';
  const styleProp = {
    minSize: isVertical ? 'minWidth' : 'minHeight',
    maxSize: isVertical ? 'maxWidth' : 'maxHeight',
    size: isVertical ? 'width' : 'height'
  };

  let style: React.CSSProperties = {
    display: 'flex',
    outline: 'none'
  };

  style[styleProp.minSize] = convertSizeToCssValue(minSize, resizersSize);
  style[styleProp.maxSize] = convertSizeToCssValue(maxSize, resizersSize);
  style.overflow = "auto"

  switch(getUnit(value)) {
    case 'ratio':
      style.flex = value;
      break;
    case '%':
    case 'px':
      style.flexGrow = 0;
      style[styleProp.size] = convertSizeToCssValue(value, resizersSize);
      break;
  }

  return style;
}

interface CommonProperties {
  split?: "vertical" | "horizontal";
  initialSize?: string | number,
  minSize?: string,
  maxSize?: string,
  resizersSize?: Size,
  size?: Size
}

export interface IPaneProps extends CommonProperties {
  index?: number;
  className?: string
}

interface IPaneState extends CommonProperties{
}

// const defaultProps: CommonProperties = {  
//   split: "vertical",
//   initialSize: '1',  
//   minSize: '0',
//   maxSize: '100%'  
// }

export default class Pane extends React.Component<
  IPaneProps,
  IPaneState
> {
  constructor(props: IPaneProps){
    super(props)
  }

  public static defaultProps: Partial<IPaneProps> = {
    split: "vertical",
    initialSize: '1',  
    minSize: '0',
    maxSize: '100%'  
  }

  render() {
    const prefixedStyle = PaneStyle(this.props);

    return (
      <div
        data-type={"Pane"}
        data-split={this.props.split}
        className={this.props.className}
        style={prefixedStyle}
      >
        {this.props.children}
      </div>
    );
  }
}
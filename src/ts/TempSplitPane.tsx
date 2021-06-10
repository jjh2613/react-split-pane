import React, { MouseEvent, TouchEvent } from 'react';
import styled from 'styled-components';
import Resizer from './Resizer';
import Pane from './Pane';
import { IPaneProps } from './Pane';

const DEFAULT_PANE_SIZE = '1';
const DEFAULT_PANE_MIN_SIZE = '0';
const DEFAULT_PANE_MAX_SIZE = '100%';

const SplitPaneStyle = styled.div`
  display: 'flex',
  height: '100%',
  flex: 1,
  outline: 'none',
  overflow: 'hidden',
  userSelect: 'text'
`;

const ColumnStyle = styled(SplitPaneStyle)`
  flexDirection: 'column
`;

const RowStyle = styled(SplitPaneStyle)`
  flexDirection: 'row'
`;

type NonNullChildren = (Pane | SplitPane)[];
// type NonNullChildren = (React.ReactChild | React.ReactFragment | React.ReactPortal)[]

interface CommonProperties {
  split: 'vertical' | 'horizontal',
  resizerSize: number,
  allowResize: boolean
}
export interface ISplitPaneProps extends Partial<CommonProperties> {  
  className?: string;
  style?: React.CSSProperties;
  children: NonNullChildren
  onResizeStart: () => void
  onResizeEnd: (sizes: string[]) => void
  onChange: (size: string) => void
}

export interface ISplitPaneState extends CommonProperties {
  split: 'vertical' | 'horizontal',
  resizerSize: number,
  sizes: string[]
}

const defaultStates: ISplitPaneState  = {
  split: 'vertical',
  resizerSize: 1,
  allowResize: true,
};

export default class SplitPane extends React.Component<ISplitPaneProps, ISplitPaneState> {
  constructor(props: ISplitPaneProps) {
    super(props);

    this.state = {
      split: props.split || defaultStates.split,
      resizerSize: props.resizerSize || defaultStates.resizerSize,
      allowResize: props.allowResize || defaultStates.allowResize
    }
  }

  splitPaneRef = React.createRef<HTMLDivElement>();

  componentWillReceiveProps(nextProps: ISplitPaneProps) {
    const newSizeState = this.getPanePropSize(nextProps);
    if(JSON.stringify(this.sizeState) != JSON.stringify(newSizeState)) {
      this.setState({sizes: newSizeState});
      this.sizeState = newSizeState;
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);

    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onMouseUp);
  }

















  resizerIndex: number | null = null
  dimensionsSnapshot: {
      resizersSize: number,
      paneDimensions: any,
      splitPaneSizePx: number,
      minSizesPx: number[],
      maxSizesPx: number[],
      sizesPx: any
  } | null = null;
  startClientX: number | null = null
  startClientY: number | null = null
  paneElements: any[] = []

  onMouseDown = (event: MouseEvent<HTMLDivElement>, resizerIndex: number) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    this.onDown(resizerIndex, event.clientX, event.clientY);
  }

  onTouchStart = (event: TouchEvent<HTMLDivElement>, resizerIndex: number) => {
    event.preventDefault();

    const {clientX, clientY} = event.touches[0];

    this.onDown(resizerIndex, clientX, clientY);
  }

  onDown = (resizerIndex: number, clientX: number, clientY: number) => {
    const {allowResize, onResizeStart, split} = this.props;

    if (!allowResize) {
      return;
    }

    this.resizerIndex = resizerIndex;
    this.dimensionsSnapshot = this.getDimensionsSnapshot(this.props);
    this.startClientX = clientX;
    this.startClientY = clientY;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onMouseUp);
    document.addEventListener('touchcancel', this.onMouseUp);

    if (onResizeStart) {
      onResizeStart();
    }
  }

  onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    this.onMove(event.clientX, event.clientY);
  }

  onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    event.preventDefault();

    const {clientX, clientY} = event.touches[0];

    this.onMove(clientX, clientY);
  }

  onMouseUp = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);

    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onMouseUp);
    document.addEventListener('touchcancel', this.onMouseUp);

    if (this.props.onResizeEnd) {
      this.props.onResizeEnd(this.state.sizes);
    }
  }

  onMove(clientX: number, clientY: number) {
    const { split, onChange } = this.props;
    const resizerIndex = this.resizerIndex!;
    const {
      sizesPx,
      minSizesPx,
      maxSizesPx,
      splitPaneSizePx,
      paneDimensions
    } = this.dimensionsSnapshot!;

    const sizeDim = split === 'vertical' ? 'width' : 'height';
    const primary = paneDimensions[resizerIndex];
    const secondary = paneDimensions[resizerIndex + 1];
    const maxSize = primary[sizeDim] + secondary[sizeDim];

    const primaryMinSizePx = minSizesPx[resizerIndex];
    const secondaryMinSizePx = minSizesPx[resizerIndex + 1];
    const primaryMaxSizePx = Math.min(maxSizesPx[resizerIndex], maxSize);
    const secondaryMaxSizePx = Math.min(maxSizesPx[resizerIndex + 1], maxSize);

    const moveOffset = split === 'vertical'
      ? this.startClientX! - clientX
      : this.startClientY! - clientY;

    let primarySizePx = primary[sizeDim] - moveOffset;
    let secondarySizePx = secondary[sizeDim] + moveOffset;

    let primaryHasReachedLimit = false;
    let secondaryHasReachedLimit = false;

    if (primarySizePx < primaryMinSizePx) {
      primarySizePx = primaryMinSizePx;
      primaryHasReachedLimit = true;
    } else if (primarySizePx > primaryMaxSizePx){
      primarySizePx = primaryMaxSizePx;
      primaryHasReachedLimit = true;
    }

    if (secondarySizePx < secondaryMinSizePx) {
      secondarySizePx = secondaryMinSizePx;
      secondaryHasReachedLimit = true;
    } else if (secondarySizePx > secondaryMaxSizePx){
      secondarySizePx = secondaryMaxSizePx;
      secondaryHasReachedLimit = true;
    }

    if (primaryHasReachedLimit) {
      secondarySizePx = primary[sizeDim] + secondary[sizeDim] - primarySizePx;
    } else if (secondaryHasReachedLimit) {
      primarySizePx = primary[sizeDim] + secondary[sizeDim] - secondarySizePx;
    }

    sizesPx[resizerIndex] = primarySizePx;
    sizesPx[resizerIndex + 1] = secondarySizePx;

    let sizes = this.getSizes().concat();
    let updateRatio;

    [primarySizePx, secondarySizePx].forEach((paneSize, idx) => {
      const unit = getUnit(sizes[resizerIndex + idx]);
      if (unit !== 'ratio') {
        sizes[resizerIndex + idx] = convertToUnit(paneSize, unit, splitPaneSizePx)!;
      } else {
        updateRatio = true;
      }
    });

    if (updateRatio) {
      let ratioCount = 0;
      let lastRatioIdx: number = 0;
      sizes = sizes.map((size, idx) => {
        if (getUnit(size) === 'ratio') {
          ratioCount++;
          lastRatioIdx = idx;

          return convertToUnit(sizesPx[idx], 'ratio')!;
        }

        return size;
      });

      if (ratioCount === 1) {
        sizes[lastRatioIdx] = '1';
      }
    }

    onChange && onChange(sizes);

    this.setState({
      sizes
    });
  }

  getDimensionsSnapshot(props: ISplitPaneProps) {
    const split = props.split;
    const paneDimensions = this.getPaneDimensions();
    const splitPaneDimensions = this.splitPaneRef.current!.getBoundingClientRect();
    const minSizes = this.getPanePropMinMaxSize(props, 'minSize');
    const maxSizes = this.getPanePropMinMaxSize(props, 'maxSize');

    const resizersSize = this.getResizersSize(props.children);
    const splitPaneSizePx = split === 'vertical'
      ? splitPaneDimensions.width - resizersSize
      : splitPaneDimensions.height - resizersSize;

    const minSizesPx = minSizes.map(s => convert(s, splitPaneSizePx));
    const maxSizesPx = maxSizes.map(s => convert(s, splitPaneSizePx));
    const sizesPx = paneDimensions.map(d => split === 'vertical' ? d.width : d.height);

    return {
      resizersSize,
      paneDimensions,
      splitPaneSizePx,
      minSizesPx,
      maxSizesPx,
      sizesPx
    };
  }

  getPanePropMinMaxSize(props: ISplitPaneProps, key: string) {
    return props.children.map(child => {
      const value = child.props[key];
      if (value === undefined) {
        return key === 'maxSize' ? DEFAULT_PANE_MAX_SIZE : DEFAULT_PANE_MIN_SIZE;
      }
      
      return value;
    });
  }

  getPaneDimensions() {
    return this.paneElements.filter(el => el).map(el => el.getBoundingClientRect());
  }

  getPanePropSize(props: ISplitPaneProps) {
    return props.children.map(child => {
      const value = child.props['size'] || child.props['initialSize'];
      if (value === undefined) {
        return DEFAULT_PANE_SIZE;
      }
      
      return String(value);
    });
  }

  getResizersSize(children: NonNullChildren) {
    return children.length - 1 * this.state.resizerSize
  }

  getSizes() {
    return this.state.sizes;
  }


  public render() {
    const { children, className, style } = this.props;
    const { split } = this.state;

    const resizersSize = this.getResizersSize(children);
    const sizes = this.getSizes();

    const StyleComponent = split === 'vertical' ? RowStyle : ColumnStyle;
    [1, 2, 3].reduce((arr, val,index)=>{return val})

    const elements = children.reduce(
      (acc: any[], child, idx) => {
      let pane;
      const resizerIndex = idx - 1;
      // const isPane = child instanceof Pane;
      const paneProps: IPaneProps = {
        index: idx,        
        split: split,
        // key: `Pane-${idx}`,
        // innerRef: this.setPaneRef,
        resizersSize: resizersSize,
        size: sizes[idx]
      };

      if (child instanceof Pane) {
        pane = React.cloneElement<IPaneProps>(child, paneProps);
      } else {
        pane = <Pane {...paneProps}>{child}</Pane>;
      }

      if (acc.length === 0) {
        return [...acc, pane];
      } else {
        const resizer = (
          <Resizer
            index={resizerIndex}
            key={`Resizer-${resizerIndex}`}
            split={split}
            onMouseDown={ this.onMouseDown}
            onTouchStart={this.onTouchStart}
          />
        );

        return [...acc, resizer, pane];
      }
    }, []);

    return (
      <StyleComponent
        data-attribute={split}
        data-type='SplitPane'        
        className={className}
        style={style}
        ref={this.splitPaneRef}
        >
        
      </StyleComponent>
    );
  }
}


function convert(str: string, size: number) {
  const tokens = str.match(/([0-9]+)([px|%]*)/);
  const value = tokens && parseInt(tokens[1]);
  const unit = tokens ? tokens[2] : undefined;
  return toPx(value!, unit, size);
}

function toPx(value: number, unit = 'px', size: number) {
  switch (unit) {
    case '%': {
      return +(size * value / 100).toFixed(2);
    }
    default: {
      return +value;
    }
  }
}

export function getUnit(size: string) {
  if(size.endsWith('px')) {
    return 'px';
  }

  if(size.endsWith('%')) {
    return '%';
  }

  return 'ratio';
}

export function convertSizeToCssValue(value: string, resizersSize: number) {
  if(getUnit(value) !== '%') {
    return value;
  }

  if (!resizersSize) {
    return value;
  }

  const idx = value.search('%');
  const percent = parseInt(value.slice(0, idx)) / 100;
  if (percent === 0) {
    return value;
  }

  return `calc(${value} - ${resizersSize}px*${percent})`
}

function convertToUnit(size: number, unit: string, containerSize?: number) {
  switch(unit) {
    case '%':
      return `${(size / containerSize! * 100).toFixed(2)}%`;
    case 'px':
      return `${size.toFixed(2)}px`;
    case 'ratio':
      return (size * 100).toFixed(0);
  }
}
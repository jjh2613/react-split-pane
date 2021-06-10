import React, { Component, MouseEvent, TouchEvent } from "react";
import styled from "styled-components";
import { MouseEventHandler } from "react";

const Wrapper = styled.div`
  background: #000;
  opacity: 0.2;
  z-index: 1;
  box-sizing: border-box;
  background-clip: padding-box;

  :hover {
    transition: all 2s ease;
  }
`;

const HorizontalWrapper = styled(Wrapper)`
  height: 11px;
  margin: -5px 0;
  border-top: 5px solid rgba(255, 255, 255, 0);
  border-bottom: 5px solid rgba(255, 255, 255, 0);
  cursor: row-resize;
  width: 100%;

  :hover {
    border-top: 5px solid rgba(0, 0, 0, 0.5);
    border-bottom: 5px solid rgba(0, 0, 0, 0.5);
  }

  .disabled {
    cursor: not-allowed;
  }
  .disabled:hover {
    border-color: transparent;
  }
`;

const VerticalWrapper = styled(Wrapper)`
  width: 11px;
  margin: 0 -5px;
  border-left: 5px solid rgba(255, 255, 255, 0);
  border-right: 5px solid rgba(255, 255, 255, 0);
  cursor: col-resize;

  :hover {
    border-left: 5px solid rgba(0, 0, 0, 0.5);
    border-right: 5px solid rgba(0, 0, 0, 0.5);
  }
  .disabled {
    cursor: not-allowed;
  }
  .disabled:hover {
    border-color: transparent;
  }
`;

interface IResizerProps {
  index: number;
  split: "vertical" | "horizontal";
  onClick: (event: MouseEvent<HTMLDivElement>, index: number) => void;
  onDoubleClick: (event: MouseEvent<HTMLDivElement>, index: number) => void;
  onMouseDown: (event: MouseEvent<HTMLDivElement>, index: number) => void;
  onTouchEnd: (event: TouchEvent<HTMLDivElement>, index: number) => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>, index: number) => void;
}
interface IResizerState {}
export default class Resizer extends React.Component<
  IResizerProps,
  IResizerState
> {
  constructor(props: IResizerProps) {
    super(props);
  }
  public static defaultProps: Partial<IResizerProps> = {
    split: "vertical",
    onClick: () => {},
    onDoubleClick: () => {},
    onMouseDown: () => {},
    onTouchEnd: () => {},
    onTouchStart: () => {},
  };
  render() {
    const {
      index,
      split,
      onClick,
      onDoubleClick,
      onMouseDown,
      onTouchEnd,
      onTouchStart,
    } = this.props;

    const props = {
      // ref: _ => (this.resizer = _),
      "data-split": split,
      "data-type": "Resizer",
      onMouseDown: (event: MouseEvent<HTMLDivElement>) =>
        onMouseDown(event, index),
      onTouchStart: (event: TouchEvent<HTMLDivElement>) => {
        event.preventDefault();
        onTouchStart(event, index);
      },
      onTouchEnd: (event: TouchEvent<HTMLDivElement>) => {
        event.preventDefault();
        onTouchEnd(event, index);
      },
      onClick: (event: MouseEvent<HTMLDivElement>) => {
        if (onClick) {
          event.preventDefault();
          onClick(event, index);
        }
      },
      onDoubleClick: (event: MouseEvent<HTMLDivElement>) => {
        if (onDoubleClick) {
          event.preventDefault();
          onDoubleClick(event, index);
        }
      },
    };

    return split === "vertical" ? (
      <VerticalWrapper {...props} />
    ) : (
      <HorizontalWrapper {...props} />
    );
  }
}

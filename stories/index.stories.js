import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import SplitPane from '../dist/lib/SplitPane';
import Pane from "../dist/lib/Pane";

import { Button, Welcome } from '@storybook/react/demo';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Vertical', module)
  .add('with divs', () =>
    <SplitPane split="vertical">
      <div>This is a div</div>
      <div>This is a div</div>
    </SplitPane>
  )
  .add('with Panes', () =>
    <SplitPane split="vertical">
      <Pane>This is a Pane</Pane>
      <Pane>This is a Pane</Pane>
    </SplitPane>
  ).add('with Multiple Panes', () =>
    <SplitPane split="vertical">
      <Pane>This is a Left Pane</Pane>
      <Pane>This is a Middle Pane</Pane>
      <Pane>This is a Right Pane</Pane>
    </SplitPane>
  ) ;

storiesOf('Horizontal', module)
  .add('with divs', () =>
    <SplitPane split="horizontal">
      <div>This is a div</div>
      <div>This is a div</div>
    </SplitPane>
  )
  .add('with Panes', () =>
    <SplitPane split="horizontal">
      <Pane>This is a Pane</Pane>
      <Pane>This is a Pane</Pane>
    </SplitPane>
  );

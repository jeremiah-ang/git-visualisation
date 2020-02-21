import styled, {keyframes} from 'styled-components';
import React, {Component} from 'react';

export const theme = {
    red: '#F96654',
    yellow: '#FABC55',
    blue: '#4088C7',
    green: '#34B362',
    darkRed: '#C75344',
    darkYellow: '#C79544',
    darkBlue: '#2F6594',
    darkGreen: '#136632',
    grey: '#EEE',
  
    historyHeight: 55,
    historyMarginBottom: 15,
    historyCircleWidth: 20,
    historyCircleBorderLeft: 3,
    historyCircleMarginTop: 5,
    historyControlWidth: 80, 
  
    columnMarginRight: 15,
}
theme['circleColors'] = [theme.blue, theme.green, theme.yellow, theme.red];
theme['circleBorders'] = [theme.darkBlue, theme.darkGreen, theme.darkYellow, theme.darkRed];

export const dimensions = {
  circleOffsetX: theme.historyCircleBorderLeft + theme.historyCircleWidth/2,
  circleOffsetY: theme.historyCircleMarginTop + theme.historyCircleWidth/2,
  circleMarginX: 1.5 * theme.historyCircleWidth + theme.historyCircleBorderLeft + theme.historyControlWidth + theme.columnMarginRight,
  circleMarginY: theme.historyHeight + theme.historyMarginBottom,
  historyMarginY: theme.historyHeight + theme.historyMarginBottom,
}
dimensions['curvePower'] = dimensions.circleMarginX / 1.75;

export const NiceButton = styled.div`
  border: #7986cb solid 1px;
  font-family: sans-serif;
  color: #7986cb;
  border-radius: 100px;
  padding: 3px 10px;
  margin-bottom: 2px;
  cursor: pointer;
  text-align: center;
  text-transform: uppercase;
  font-size: 10px;
  background-color: white;

  &:hover {
    color: #8C5167;
    border: #8C5167 solid 1px;
  }
`;

export const fallDownAnimation = keyframes`
    to {
      transform: translate(0, 0);
    }
`;

export const draw = keyframes`
    to {
        stroke-dashoffset: 0;   
    }
`;

export class ButtonForm extends Component {
  handleClick(e) {
    this.props.onClick();
  }

  render() {
    if (this.props.isHidden) {
      return <div></div>
    }
    return <div>
      <NiceButton onClick={this.handleClick.bind(this)}>{this.buttonName}</NiceButton>
    </div>
  }
};

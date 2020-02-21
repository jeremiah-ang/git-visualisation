import React, {Component} from 'react';
import styled from 'styled-components';

import {dimensions, draw} from './commons'

const ConnectionsElm = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -10;
`;
const AnimatedPath = styled.path`
    stroke-dasharray: 5000;
    stroke-dashoffset: 5000;
    animation: ${draw} 5s linear forwards;
`;

const AnimatedLine = styled.line`
    stroke-dasharray: 500;
    stroke-dashoffset: 500;
    animation: ${draw} .5s linear forwards;
`;

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  curveto(point2) {
    const [p1, p2] = (this.y < point2.y) ? [this, point2] : [point2, this];
    const curve = ((this.x < point2.x) ? 1 : -1) * dimensions.curvePower;
    return [
      p1,
      new Point(p1.x + curve, p1.y),
      new Point(p2.x - curve, p2.y),
      p2,
    ]
  }
}

export class GitConnections extends Component {
    circleToPoint(circle) {
        const x = dimensions.circleOffsetX + circle.column * dimensions.circleMarginX;
        const y = dimensions.circleOffsetY + circle.row * dimensions.circleMarginY;
        return new Point(x, y);
    }

    render() {
        return <ConnectionsElm>
        { this.props.circlePairs.map(circlePair => {
            const [parentCircle, circle] = circlePair;
            if (!parentCircle) return <path key={circle.nodeId}></path>;
            const [parentNodePoint, nodePoint] = circlePair.map(circle => this.circleToPoint(circle));
            const [p1, c1, c2, p2] = parentNodePoint.curveto(nodePoint);
            const key = `${circle.nodeId}->${parentCircle.nodeId}`;
            if (circle.column === parentCircle.column) {
            return <AnimatedLine
                key={key}
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                fill='none'
                stroke='black'
                strokeWidth='1'
            ></AnimatedLine>
            }
            const pathStr = `M${p1.x},${p1.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
            return <AnimatedPath
                key={key}
                d={pathStr}
                fill='none'
                stroke='black'
                strokeWidth='1'
            />
        })
        }
        </ConnectionsElm>
    }
}
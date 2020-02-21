import React, {Component} from 'react';
import ReactDOM from "react-dom";
import styled, {keyframes, ThemeProvider} from 'styled-components';
import shortid from 'shortid';

const RED = '#F96654';
const YELLOW = '#FABC55';
const BLUE = '#4088C7';
const GREEN = '#34B362';
const DARK_GREEN = '#136632';
const DARK_RED = '#C75344';
const DARK_YELLOW = '#C79544';
const DARK_BLUE = '#2F6594';
const CIRCLE_COLORS = [BLUE, GREEN, YELLOW, RED]; 
const CIRCLE_BORDERS = [DARK_BLUE, DARK_GREEN, DARK_YELLOW, DARK_RED]; 

const theme = {
  red: '#F96654',
  yellow: '#FABC55',
  blue: '#4088C7',
  green: '#34B362',
  darkRed: '#C75344',
  darkYellow: '#C79544',
  darkBlue: '#2F6594',
  darkGreen: '#136632',
  grey: '#EEE',

  historyHeight: 50,
  historyMarginBottom: 15,
  historyCircleWidth: 20,
  historyCircleBorderLeft: 3,
  historyCircleMarginTop: 5,
  historyControlWidth: 80, 

  columnMarginRight: 15,
}
theme['circleColors'] = [theme.blue, theme.green, theme.yellow, theme.red];
theme['circleBorders'] = [theme.darkBlue, theme.darkGreen, theme.darkYellow, theme.darkRed];

const dimensions = {
  circleOffsetX: theme.historyCircleBorderLeft + theme.historyCircleWidth/2,
  circleOffsetY: theme.historyCircleMarginTop + theme.historyCircleWidth/2,
  circleMarginX: 1.5 * theme.historyCircleWidth + theme.historyCircleBorderLeft + theme.historyControlWidth + theme.columnMarginRight,
  circleMarginY: theme.historyHeight + theme.historyMarginBottom,
  historyMarginY: theme.historyHeight + theme.historyMarginBottom,
}
dimensions['curvePower'] = dimensions.circleMarginX / 1.75;


const Git = styled.div`
  white-space: nowrap;
  font-family: sans-serif;
  padding: 0px;
  position: absolute;
  top: 0px;
  left: 0px;
`

const Copy = styled.div`
  color: ${props => props.color || 'black'};
  display: inline-block;
  vertical-align:top;
  padding: 0px;
  padding-top: ${props => (props.rowOffset * dimensions.historyMarginY) + 'px'};
  margin-right: ${props => (props.theme.columnMarginRight) + 'px'};
`

const History = styled.div`
  margin-bottom: ${props => (props.theme.historyMarginBottom) + 'px'};
  height: ${props => (props.theme.historyHeight) + 'px'};
  margin-top: ${props => props.rowOffset + 'px' || '0px'};
`

const NiceButton = styled.div`
  border: #7986cb solid 1px;
  font-family: sans-serif;
  color: #7986cb;
  border-radius: 100px;
  padding: 5px 10px;
  cursor: pointer;
  text-align: center;
  text-transform: uppercase;
  font-size: 10px;
  background-color: white;

  &:hover {
    color: #8C5167;
    border: #8C5167 solid 1px;
  }
`

const StageButton = styled(NiceButton)`
  display: inline-block;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  padding: 3px;
  line-height: 9px;
  text-align: center;
  vertical-align: middle;
  border: ${props => props.disabled ? 'none' : (props.color || '#7986cb') + ' solid 1px'};
  color: ${props => props.color || '#7986cb'};
  margin-right: 5px;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'default' : ''};

  &:hover {
    border: ${props => props.disabled ? 'none' : ''};
    color: ${props => props.disabled ? (props.color || '#7986cb') : ''};
  }
`

const StageControls = styled.div`
  text-align: center;
`

const StageControl = styled.div`
  margin: 5px 0;
  display: inline-block;
  width: 50%;
`

const HistoryColumn = styled.div`
  display: inline-block;
  vertical-align:middle;
  margin-right: 5px;
  height: 100%;
`

const fallDownAnimation = keyframes`
    to {
      transform: translate(0, 0);
    }
`;

const HistoryCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-top: ${props => props.theme.historyCircleMarginTop + 'px'};
  background-color: ${props => (props.isCheckout) ? props.theme.grey : props.theme.circleColors[props.columnNth % CIRCLE_COLORS.length]};
  border: ${props => props.isCheckout ? props.theme.circleColors[props.columnNth % CIRCLE_COLORS.length] + ' solid 3px' : ''};
  margin-left: ${props => props.isCheckout ? '' : props.theme.historyCircleBorderLeft + 'px'};
  animation: ${fallDownAnimation} cubic-bezier(0.770, 0.000, 0.175, 1.000) 1s;
  animation-fill-mode: forwards;
  transform: translate(0,-45px);
`

const HistoryControl = styled(HistoryColumn)`
  width: ${props => props.theme.historyControlWidth + 'px'};
`

const ConnectionsElm = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -10;
`;

const ConnectionsContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -10;
`;


const draw = keyframes`
    to {
        stroke-dashoffset: 0;   
    }
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
    const curve = dimensions.curvePower;
    return [
      p1,
      new Point(p1.x + curve, p1.y),
      new Point(p2.x - curve, p2.y),
      p2,
    ]
  }
}

const NodeStateEnum = {
  Created: 1,
  OpenToChanges: 2,
  MakingChanges: 3,
  MadeChanges: 4,
}

class Node {
  constructor(nodeId, parentNodeIds, columnId, pos, rowOffset=0, state=NodeStateEnum.Created) {
    this.nodeId = nodeId;
    this.parentNodeIds = parentNodeIds;
    this.columnId = columnId; 
    this.pos = pos;
    this.rowOffset = rowOffset;
    this.state = state;
  }

  commit() {
    if (this.state !== NodeStateEnum.Created) {
      console.log(`[${this.nodeId}] Cannot Commit! State error: ${this.state}`);
      return this;
    }
    console.log(`[${this.nodeId}] commit, new state = ${NodeStateEnum.OpenToChanges}`);
    return new Node(this.nodeId, this.parentNodeIds, this.columnId, this.pos, this.rowOffset, NodeStateEnum.OpenToChanges);
  }

  checkout() {
    if (this.state !== NodeStateEnum.OpenToChanges) {
      console.log(`[${this.nodeId}] Cannot checkout! State error: ${this.state}`);
      return this;
    }
    console.log(`[${this.nodeId}] checkout, new state = ${NodeStateEnum.MakingChanges}`);
    return new Node(this.nodeId, this.parentNodeIds, this.columnId, this.pos, this.rowOffset, NodeStateEnum.MakingChanges);
  }

  othersCheckout() {
    if (this.state !== NodeStateEnum.MakingChanges) {
      console.log(`[${this.nodeId}] Cannot others checkout! State error: ${this.state}`);
      return this;
    }
    console.log(`[${this.nodeId}] Others checkedout, new state = ${NodeStateEnum.OpenToChanges}`);
    return new Node(this.nodeId, this.parentNodeIds, this.columnId, this.pos, this.rowOffset, NodeStateEnum.OpenToChanges);
  }

  childCommit() {
    if (this.state !== NodeStateEnum.MakingChanges) {
      console.log(`[${this.nodeId}] Cannot make changes! State error: ${this.state}`);
      return this;
    }
    console.log(`[${this.nodeId}] Child Commit, new state = ${NodeStateEnum.MadeChanges}`);
    return new Node(this.nodeId, this.parentNodeIds, this.columnId, this.pos, this.rowOffset, NodeStateEnum.MadeChanges);
  }
}

class Circle {
  constructor(nodeId, dom, row, column) {
    this.nodeId = nodeId;
    this.dom = dom;
    this.row = row;
    this.column = column;
  }
}

class Column {
  constructor(columnId, nodeIds, rowOffset, pos) {
    this.columnId = columnId;
    this.nodeIds = nodeIds || [];
    this.rowOffset = rowOffset;
    this.pos = pos;
  }

  addNode(nodeId) {
    return new Column(this.columnId, [...this.nodeIds, nodeId], this.rowOffset, this.pos);
  }

  pop() {
    const newNodeIds = [...this.nodeIds];
    newNodeIds.pop();
    return new Column(this.columnId, newNodeIds, this.rowOffset, this.pos);
  }
}

class GitVisualisation extends Component {
  state = {
    nodeIds: [],
    columnIds: [], 
  }

  circles = {};

  constructor(props) {
    super(props);

    const columnId = shortid.generate();
    const rootNodeId = shortid.generate();
    const checkoutNodeId = shortid.generate();

    const column = new Column(columnId, [rootNodeId, checkoutNodeId], 0, 0);
    const rootNode = new Node(rootNodeId, {}, columnId, 0).commit().checkout();
    const checkoutNode = new Node(checkoutNodeId, {[columnId]: rootNodeId}, columnId, 1);

    this.state.columnIds.push(columnId);
    this.state[columnId] = column;
    this.state.nodeIds.push(rootNodeId);
    this.state[rootNodeId] = rootNode;
    this.state.nodeIds.push(checkoutNodeId);
    this.state[checkoutNodeId] = checkoutNode;
    this.state.checkout = checkoutNodeId;
  }
  
  commitNode(parentNodeId, columnId) {
    this.setState((state, _) => { 
      const nodeId = shortid.generate();
      const parentPos = this.state[parentNodeId].pos;
      const grandParentNodeId = this.state[parentNodeId].parentNodeIds[columnId];
      const node = new Node(nodeId, {[columnId]: parentNodeId}, columnId, parentPos + 1);

      return this.updateCheckout(state, {
        [grandParentNodeId]: state[grandParentNodeId].childCommit(),
        [parentNodeId]: state[parentNodeId].commit().checkout(),
        [nodeId]: node,
        [columnId]: state[columnId].addNode(nodeId),
        nodeIds: [...state.nodeIds, nodeId],
        checkout: nodeId,
      });
    });
  }
  branchNode(parentNodeId) {
    const parentPos = this.state[parentNodeId].pos;

    const columnId = shortid.generate();
    const branchNodeId = shortid.generate();
    const nodeId = shortid.generate();

    const column = new Column(columnId, [branchNodeId, nodeId], parentPos + 1, this.state.columnIds.length,);
    const branchNode = new Node(branchNodeId, {[columnId]: parentNodeId}, columnId, parentPos + 1).commit().checkout();
    const node = new Node(nodeId, {[columnId]: branchNodeId}, columnId, parentPos + 2);

    this.setState((state, _) => this.updateCheckout(state, {
      [columnId]: column,
      [branchNodeId]: branchNode,
      [nodeId]: node,
      columnIds: [...state.columnIds, columnId],
      nodeIds: [...state.nodeIds, branchNodeId, nodeId],
      checkout: nodeId,
      [state.checkout]: state[state.checkout].othersCheckout(),
    }));
  }
  setCheckout(parentNodeId) {
    this.setState((state, _) => {
      const newNodeId = shortid.generate();
      const parentNode = state[parentNodeId];
      const column = state[parentNode.columnId].addNode(newNodeId);
      const newNode = new Node(newNodeId, {[column.columnId]: parentNodeId}, column.columnId, parentNode.pos + 1);

      return this.updateCheckout(state, {
        checkout: newNodeId,
        nodeIds: [...state.nodeIds, newNodeId],
        [newNodeId]: newNode,
        [column.columnId]: column.addNode(newNodeId),
        [parentNodeId]: parentNode.checkout(),
      })
    });
  }
  updateCheckout(state, updateDict) {    
    const currentCheckoutNode = state[state.checkout];
    const currentCheckoutNodeParent = state[currentCheckoutNode.parentNodeIds[currentCheckoutNode.columnId]];
    const currentCheckoutNodeColumn = state[currentCheckoutNode.columnId];

    if (!(state.checkout in updateDict) || updateDict[state.checkout].state === NodeStateEnum.Created) {
      updateDict[currentCheckoutNodeParent.nodeId] = currentCheckoutNodeParent.othersCheckout();
      updateDict[currentCheckoutNode.nodeId] = undefined;
    }
    updateDict[currentCheckoutNodeColumn.columnId] = currentCheckoutNodeColumn.pop();

    return updateDict;
  } 
  mergeNode(mergeFromNodeId, mergeToNodeId) {
    const parentNodeIds = [mergeFromNodeId, mergeToNodeId]
    const nodeId = shortid.generate();
    const column = this.state[mergeToNodeId];
    const columnId = column.columnId;
    const mergeToNodePos = this.state[mergeToNodeId].pos;
    const pos = Math.max(this.state[mergeFromNodeId].pos, mergeToNodePos) + 1;
    const rowOffset = pos - mergeToNodePos - 1;
    const node = new Node(nodeId, parentNodeIds, columnId, pos, rowOffset);
    this.setState((state, _) => ({
      [nodeId]: node,
      nodeIds: [...state.nodeIds, nodeId],
      [columnId]: state[columnId].addNode(nodeId),
      checkout: nodeId,
    }))
  }
  addNodeCircleDom(nodeId, dom, row, column) {
    this.circles[nodeId] = new Circle(nodeId, dom, row, column);
  }
  connectionsContainerRef(dom) {
    this.connectionsContainer = dom;
  }
  drawConnections() {
    const circlePairs = [];
    Object.keys(this.circles).forEach(nodeId => {
      const node = this.state[nodeId];
      if (!node) return;
      Object.values(node.parentNodeIds).forEach(parentNodeId => 
        circlePairs.push([this.circles[parentNodeId], this.circles[nodeId]])
      );
    });
    const gitConnections = <GitConnections circlePairs={circlePairs}></GitConnections>
    ReactDOM.render(gitConnections, this.connectionsContainer);
  }

  render() {
    const $this = this;
    const state = this.state;
    const copyColumnHistoryNodes = {};
    state.nodeIds.forEach(nodeId => {
      if (!state[nodeId]) return;
      const columnId = state[nodeId].columnId;
      const column = this.state[columnId];
      const node = this.state[nodeId];
      const historyNode = <HistoryNode 
        key={nodeId}
        nodeId={nodeId}
        onBranchNode={function() { $this.branchNode(nodeId); }}
        onCommitNode={function() { $this.commitNode(nodeId, columnId); }}
        onCheckout={function () { $this.setCheckout(nodeId); }}
        historyCircleRef={function (dom) { $this.addNodeCircleDom(nodeId, dom, node.pos, column.pos); }}

        isCheckout={state.checkout === nodeId}
        isBranchable={true}
        nodeState={node.state}

        columnNth={column.pos}
        rowOffset={node.rowOffset}
      ></HistoryNode>;
      if (!(columnId in copyColumnHistoryNodes)) {
        copyColumnHistoryNodes[columnId] = [];
      }
      copyColumnHistoryNodes[columnId].push(historyNode);
    });
    const columns = this.state.columnIds.map(columnId => this.state[columnId]);

    return <Git>
      <ConnectionsContainer ref={this.connectionsContainerRef.bind(this)}></ConnectionsContainer>
      <GitTable copyColumnHistoryNodes={copyColumnHistoryNodes} columns={columns}></GitTable>
    </Git>
  }

  componentDidUpdate() {
    this.drawConnections();
  }

  componentDidMount() {
    this.drawConnections();
  }
}

class GitConnections extends Component {
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


class GitTable extends Component {
  render() {
    const copyColumnHistoryNodes = this.props.copyColumnHistoryNodes;
    const columns = this.props.columns;
    return columns.map((column, index) => {
      const columnId = column.columnId;
      const rowOffset = column.rowOffset;
      return <Copy key={columnId} rowOffset={rowOffset} nth={index}>
        {copyColumnHistoryNodes[columnId]}
      </Copy>
    });
  }
}

class HistoryNode extends Component {
  state = { 
    adds: 0,
    deletes: 0,
  }

  constructor(props) {
    super(props);
    this.onBranch = this.onBranch.bind(this);
    this.onCommit = this.onCommit.bind(this);
    this.onCheckout = this.onCheckout.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onBranch() {
    this.props.onBranchNode();
  }

  onCommit() {
    this.props.onCommitNode();
  }

  onCheckout() {
    this.props.onCheckout();
  }

  onAdd() {
    this.setState((state, _) => ({
      adds: state.adds + 1,
    }));
  }

  onDelete() {
    this.setState((state, _) => ({
      deletes: state.deletes + 1,
    }));
  }

  render() {
    const isClosedForChanges = this.props.nodeState !== NodeStateEnum.Created;
    const commitForm = (!isClosedForChanges && (this.state.adds + this.state.deletes)) ?
      <CommitForm onClick={this.onCommit}></CommitForm> :
      <div></div>

    return <History rowOffset={this.props.rowOffset}>
      <HistoryColumn>
        <HistoryCircle 
          ref={this.props.historyCircleRef} 
          columnNth={this.props.columnNth} 
          isCheckout={this.props.nodeState === NodeStateEnum.Created}
        >
        </HistoryCircle>
      </HistoryColumn>
      <HistoryControl>
        <FileChangesForm 
          isHidden={isClosedForChanges}
          adds={this.state.adds}
          deletes={this.state.deletes}

          onAdd={this.onAdd}
          onDelete={this.onDelete}></FileChangesForm>
        {commitForm}
        <BranchForm onClick={this.onBranch} isHidden={!this.props.isBranchable || this.props.nodeState === NodeStateEnum.Created}></BranchForm>
        <CheckoutForm 
          onClick={this.onCheckout}
          isHidden={this.props.nodeState !== NodeStateEnum.OpenToChanges}></CheckoutForm>
      </HistoryControl>
    </History>;
  }
}

class FileChangesForm extends Component {
  onAdd() {
    if (this.props.isHidden) return;
    this.props.onAdd();
  }
  
  onDelete() {
    if (this.props.isHidden) return;
    this.props.onDelete();
  }
  
  render() {
    const isControlsHidden = this.props.isHidden;
    const changeCount = <StageControls>
      <StageAddForm onClick={this.onAdd.bind(this)} count={this.props.adds} isControlsHidden={isControlsHidden}></StageAddForm>
      <StageDeleteForm onClick={this.onDelete.bind(this)} count={this.props.deletes} isControlsHidden={isControlsHidden}></StageDeleteForm>
    </StageControls>
    
    return <div>
      { changeCount }
    </div>
  }
}

class ButtonForm extends Component {
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
}

class BranchForm extends ButtonForm {
  buttonName = 'Branch';
}

class CommitForm extends ButtonForm {
  buttonName = 'Commit';
}

class CheckoutForm extends ButtonForm {
  buttonName = 'Checkout';
}

class StageForm extends ButtonForm {
  buttonName = '?';
  color = undefined;

  render() {
    if (this.props.isHidden) {
      return <div></div>
    }
    let stageButton = <StageButton onClick={this.props.onClick} color={this.color} disabled>{this.buttonName}</StageButton>;
    if (!this.props.isControlsHidden) {
      stageButton = <StageButton onClick={this.props.onClick} color={this.color}>{this.buttonName}</StageButton>
    }
    return <StageControl>
      {stageButton}
      {this.props.count}
    </StageControl>
  }
}

class StageAddForm extends StageForm {
  buttonName = '+';
  color = 'mediumseagreen';
}

class StageDeleteForm extends StageForm {
  buttonName = '-';
  color = 'palevioletred';
}


class App extends Component {
  render() {
    return <ThemeProvider theme={theme}>
      <GitVisualisation></GitVisualisation>
    </ThemeProvider>
  };
}

export default App;

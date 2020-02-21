import React, {Component} from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import shortid from 'shortid';

import {dimensions, NiceButton, ButtonForm, fallDownAnimation} from './commons';
import {GitConnections} from './Connections';
import {NodeStateEnum, Node, Branch, Circle} from './DataContainer';


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
  margin-top: ${props => (props.rowOffset > 0) ? (props.rowOffset * dimensions.historyMarginY) + props.theme.historyMarginBottom + 'px' : '0px'};
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

const HistoryCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-top: ${props => props.theme.historyCircleMarginTop + 'px'};
  background-color: ${props => (props.isCheckout) ? props.theme.grey : props.theme.circleColors[props.columnNth % props.theme.circleColors.length]};
  border: ${props => props.isCheckout ? props.theme.circleColors[props.columnNth % props.theme.circleColors.length] + ' solid 3px' : ''};
  margin-left: ${props => props.isCheckout ? '' : props.theme.historyCircleBorderLeft + 'px'};
  animation: ${fallDownAnimation} cubic-bezier(0.770, 0.000, 0.175, 1.000) 1s;
  animation-fill-mode: forwards;
  transform: translate(0,-45px);
`

const HistoryControl = styled(HistoryColumn)`
  width: ${props => props.theme.historyControlWidth + 'px'};
`

const ConnectionsContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -10;
`;

export class GitVisualisation extends Component {
  state = {
    nodeIds: [],
    branchIds: [], 
  }

  circles = {};

  constructor(props) {
    super(props);

    const branchId = shortid.generate();
    const rootNodeId = shortid.generate();
    const checkoutNodeId = shortid.generate();

    const branch = new Branch(branchId, [rootNodeId, checkoutNodeId], 0, 0);
    const rootNode = new Node(rootNodeId, {}, branchId, 0).commit().checkout();
    const checkoutNode = new Node(checkoutNodeId, {[branchId]: rootNodeId}, branchId, 1);

    this.state.branchIds.push(branchId);
    this.state[branchId] = branch;
    this.state.nodeIds.push(rootNodeId);
    this.state[rootNodeId] = rootNode;
    this.state.nodeIds.push(checkoutNodeId);
    this.state[checkoutNodeId] = checkoutNode;
    this.state.checkout = checkoutNodeId;
  }
  
  commitNode(parentNodeId, branchId) {
    this.setState((state, _) => { 
      const nodeId = shortid.generate();
      const parentNodeRow = this.state[parentNodeId].row;
      const grandParentNodeId = this.state[parentNodeId].parentNodeIds[branchId];
      const node = new Node(nodeId, {[branchId]: parentNodeId}, branchId, parentNodeRow + 1);

      return this.updateCheckout(state, {
        [grandParentNodeId]: state[grandParentNodeId].childCommit(),
        [parentNodeId]: state[parentNodeId].commit().checkout(),
        [nodeId]: node,
        [branchId]: state[branchId].addNode(nodeId),
        nodeIds: [...state.nodeIds, nodeId],
        checkout: nodeId,
      });
    });
  }
  branchNode(parentNodeId) {
    const parentNode = this.state[parentNodeId];
    const parentNodeRow = parentNode.row;

    const branchId = shortid.generate();
    const branchNodeId = shortid.generate();
    const nodeId = shortid.generate();

    const branch = new Branch(branchId, [branchNodeId, nodeId], parentNodeRow + 1, this.state.branchIds.length,);
    const branchNode = new Node(branchNodeId, {[branchId]: parentNodeId}, branchId, parentNodeRow + 1).commit().checkout();
    const node = new Node(nodeId, {[branchId]: branchNodeId}, branchId, parentNodeRow + 2);

    this.setState((state, _) => this.updateCheckout(state, {
      [parentNodeId]: parentNode.mergeTo(branchNode),
      [branchId]: branch,
      [branchNodeId]: branchNode,
      [nodeId]: node,
      branchIds: [...state.branchIds, branchId],
      nodeIds: [...state.nodeIds, branchNodeId, nodeId],
      checkout: nodeId,
    }));
  }
  setCheckout(parentNodeId) {
    this.setState((state, _) => {
      const newNodeId = shortid.generate();
      const parentNode = state[parentNodeId];
      const branch = state[parentNode.branchId].addNode(newNodeId);
      const newNode = new Node(newNodeId, {[branch.branchId]: parentNodeId}, branch.branchId, parentNode.row + 1);

      return this.updateCheckout(state, {
        checkout: newNodeId,
        nodeIds: [...state.nodeIds, newNodeId],
        [newNodeId]: newNode,
        [branch.branchId]: branch.addNode(newNodeId),
        [parentNodeId]: parentNode.checkout(),
      })
    });
  }
  updateCheckout(state, updateDict) {    
    const currentCheckoutNode = state[state.checkout];
    let currentCheckoutNodeParent = state[currentCheckoutNode.parentNodeIds[currentCheckoutNode.branchId]];
    if (currentCheckoutNodeParent.nodeId in updateDict) {
      currentCheckoutNodeParent = updateDict[currentCheckoutNodeParent.nodeId];
    }
    const currentCheckoutNodeBranch = state[currentCheckoutNode.branchId];

    if (!(state.checkout in updateDict) || updateDict[state.checkout].state === NodeStateEnum.Created) {
      updateDict[currentCheckoutNodeParent.nodeId] = currentCheckoutNodeParent.othersCheckout();
      updateDict[currentCheckoutNode.nodeId] = undefined;
    }
    updateDict[currentCheckoutNodeBranch.branchId] = currentCheckoutNodeBranch.pop();

    return updateDict;
  } 
  mergeNode(mergeFromNodeId, mergeToNodeId) {
    this.setState((state, _) => {       
      const mergeFromNode = state[mergeFromNodeId];
      const mergeToNode = state[mergeToNodeId].merge(mergeFromNode);
      const mergeToBranch = state[mergeToNode.branchId];
      const parentNodeIds = {[mergeToBranch.branchId]: mergeToNodeId}
      const nodeId = shortid.generate();
      const branchId = mergeToBranch.branchId;
      const node = new Node(nodeId, parentNodeIds, branchId, mergeToNode.row + 1);
      return this.updateCheckout(state, {
        [mergeToNodeId]: mergeToNode,
        [mergeFromNodeId]: mergeFromNode.mergeTo(mergeToNode),
        [nodeId]: node,
        nodeIds: [...state.nodeIds, nodeId],
        [branchId]: state[branchId].addNode(nodeId),
        checkout: nodeId,
      });
    });
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
    const copyBranchHistoryNodes = {};
    const checkoutBranchId = state[state.checkout].branchId;
    state.nodeIds.forEach(nodeId => {
      if (!state[nodeId]) return;
      const node = state[nodeId];
      const branchId = node.branchId;
      const branch = state[branchId];
      const parentNode = state[node.parentNodeIds[branchId]];
      const rowOffset = (parentNode) ? node.row - parentNode.row - 1 : 0;
      const historyNode = <HistoryNode 
        key={nodeId}
        nodeId={nodeId}
        onBranchNode={function() { $this.branchNode(nodeId); }}
        onCommitNode={function() { $this.commitNode(nodeId, branchId); }}
        onCheckout={function() { $this.setCheckout(nodeId); }}
        onMerge={function() { $this.mergeNode(nodeId, state.checkout); }}
        historyCircleRef={function (dom) { $this.addNodeCircleDom(nodeId, dom, node.row, branch.column); }}

        isCheckout={state.checkout === nodeId}
        isBranchable={true}
        nodeState={node.state}
        isMergable={!(node.mergedToBranch.has(checkoutBranchId)) && checkoutBranchId !== node.branchId}

        columnNth={branch.column}
        rowOffset={rowOffset}
      ></HistoryNode>;
      if (!(branchId in copyBranchHistoryNodes)) {
        copyBranchHistoryNodes[branchId] = [];
      }
      copyBranchHistoryNodes[branchId].push(historyNode);
    });
    const branches = this.state.branchIds.map(branchId => this.state[branchId]);

    return <Git>
      <ConnectionsContainer ref={this.connectionsContainerRef.bind(this)}></ConnectionsContainer>
      <GitTable copyBranchHistoryNodes={copyBranchHistoryNodes} branches={branches}></GitTable>
    </Git>
  }

  componentDidUpdate() {
    this.drawConnections();
  }

  componentDidMount() {
    this.drawConnections();
  }
}


class GitTable extends Component {
  render() {
    const copyBranchHistoryNodes = this.props.copyBranchHistoryNodes;
    const branches = this.props.branches;
    return branches.map((branches, index) => {
      const branchId = branches.branchId;
      const rowOffset = branches.rowOffset;
      return <Copy key={branchId} rowOffset={rowOffset} nth={index}>
        {copyBranchHistoryNodes[branchId]}
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
    this.onMerge = this.onMerge.bind(this);
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

  onMerge() {
    this.props.onMerge();
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
        <MergeForm onClick={this.onMerge} isHidden={!this.props.isMergable || this.props.nodeState === NodeStateEnum.Created || this.props.nodeState === NodeStateEnum.MakingChanges}></MergeForm>
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

class BranchForm extends ButtonForm {
  buttonName = 'Branch';
}

class CommitForm extends ButtonForm {
  buttonName = 'Commit';
}

class CheckoutForm extends ButtonForm {
  buttonName = 'Checkout';
}

class MergeForm extends ButtonForm {
  buttonName = 'Merge';
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
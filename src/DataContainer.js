export const NodeStateEnum = {
  Created: 1,
  OpenToChanges: 2,
  MakingChanges: 3,
  MadeChanges: 4,
}

export class Node {
    constructor(nodeId, parentNodeIds, branchId, row, mergedToBranch, state=NodeStateEnum.Created) {
        this.nodeId = nodeId;
        this.parentNodeIds = parentNodeIds;
        this.branchId = branchId; 
        this.row = row;
        this.mergedToBranch = mergedToBranch || new Set();
        this.state = state;
    }

    commit() {
        if (this.state !== NodeStateEnum.Created) {
        console.log(`[${this.nodeId}] Cannot Commit! State error: ${this.state}`);
        return this;
        }
        console.log(`[${this.nodeId}] commit, new state = ${NodeStateEnum.OpenToChanges}`);
        return new Node(this.nodeId, this.parentNodeIds, this.branchId, this.row, this.mergedToBranch, NodeStateEnum.OpenToChanges);
    }

    checkout() {
        if (this.state !== NodeStateEnum.OpenToChanges) {
        console.log(`[${this.nodeId}] Cannot checkout! State error: ${this.state}`);
        return this;
        }
        console.log(`[${this.nodeId}] checkout, new state = ${NodeStateEnum.MakingChanges}`);
        return new Node(this.nodeId, this.parentNodeIds, this.branchId, this.row, this.mergedToBranch, NodeStateEnum.MakingChanges);
    }

    othersCheckout() {
        if (this.state !== NodeStateEnum.MakingChanges) {
        console.log(`[${this.nodeId}] Cannot others checkout! State error: ${this.state}`);
        return this;
        }
        console.log(`[${this.nodeId}] Others checkedout, new state = ${NodeStateEnum.OpenToChanges}`);
        return new Node(this.nodeId, this.parentNodeIds, this.branchId, this.row, this.mergedToBranch, NodeStateEnum.OpenToChanges);
    }

    childCommit() {
        if (this.state !== NodeStateEnum.MakingChanges) {
        console.log(`[${this.nodeId}] Cannot make changes! State error: ${this.state}`);
        return this;
        }
        console.log(`[${this.nodeId}] Child Commit, new state = ${NodeStateEnum.MadeChanges}`);
        return new Node(this.nodeId, this.parentNodeIds, this.branchId, this.row, this.mergedToBranch, NodeStateEnum.MadeChanges);
    }

    merge(mergeFromNode) {
        if (this.state !== NodeStateEnum.Created) {
        console.log(`[${this.nodeId}] Cannot merge! State error: ${this.state}`);
        }
        console.log(`[${this.nodeId}] merge, new state = ${NodeStateEnum.MadeChanges}`);
        const row = Math.max(mergeFromNode.row, this.row - 1) + 1;
        return new Node(this.nodeId, {...this.parentNodeIds, [mergeFromNode.branchId]: mergeFromNode.nodeId}, this.branchId, row, this.mergedToBranch, NodeStateEnum.MakingChanges);
    }

    mergeTo(mergeToNode) {
        const mergeToNodeBranchId = mergeToNode.branchId;
        const mergedToBranch = new Set(this.mergedToBranch)
        mergedToBranch.add(mergeToNodeBranchId);
        return new Node(this.nodeId, this.parentNodeIds, this.branchId, this.row, mergedToBranch, this.state);
    }
}


export class Circle {
    constructor(nodeId, dom, row, column) {
        this.nodeId = nodeId;
        this.dom = dom;
        this.row = row;
        this.column = column;
    }
}
  
export class Branch {
    constructor(branchId, nodeIds, rowOffset, column) {
        this.branchId = branchId;
        this.nodeIds = nodeIds || [];
        this.rowOffset = rowOffset;
        this.column = column;
    }

    addNode(nodeId) {
        return new Branch(this.branchId, [...this.nodeIds, nodeId], this.rowOffset, this.column);
    }

    pop() {
        const newNodeIds = [...this.nodeIds];
        newNodeIds.pop();
        return new Branch(this.branchId, newNodeIds, this.rowOffset, this.column);
    }
}

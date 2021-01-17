import { DS } from './DS'
import { Node } from './Node'
import { V2 } from './V2'

export class BST extends DS {
    // iteractables
    public selfBalanced?: Boolean;

    // read-onlys vvv
    public root: Node;
    public nodeCount: number = 1;
    public maxDepth: number = 1;
    public minDepth: number = 1;
    public balanced: Boolean = true;

    // constructor(root: Node, pos: V2, size: V2)
    // constructor(root: Node, pos: V2, size: V2, selfBalanced?: Boolean){
    //     super(pos, size)
    //     this.root = root;
    //     this.selfBalanced = selfBalanced;
    // }


    constructor(arr: number[], pos: V2, size: V2)
    constructor(arr: number[], pos: V2, size: V2, selfBalanced?: Boolean) {
        super(pos, size)
        this.selfBalanced = selfBalanced;
        this.root = new Node(this, arr[0])
        this.init(arr)
    }

    init(arr: number[]) {
        for (let i = 0; i < arr.length; i++) {
            this.create(arr[i])
        }
    }

    create(node: number) {
        if (!this.root) {
            this.root = new Node(this, node)
        } else {
            let current: Node = this.root

            while (true) {
                if (node < current.value) {
                    if (current.left) {
                        current = current.left
                    } else {
                        current.left = new Node(this, node)
                        break
                    }
                } else if (node > current.value) {
                    if (current.right) {
                        current = current.right
                    } else {
                        current.right = new Node(this, node)
                        break
                    }
                } else {
                    break
                }
            }
        }
    }

    // BFT() {
    //     let node: Node = this.root
    //     if (!node) {
    //         return
    //     } else {
    //         let queue: Node[] = [node]
    //         let pointer: number = 0;

    //         while (pointer < queue.length - 1) {
    //             let item: Node = queue[pointer]
    //             let value: number = item.value
    //             console.log(value) // prints BFT value 

    //             if (item.left) {
    //                 queue.push(item.left)
    //             }
    //             if (item.right) {
    //                 queue.push(item.right)
    //             }
    //             pointer++
    //         }
    //     }
    // }

    BFS(callback: (node: Node) => boolean, stopAtFirst?: boolean): Node[] | null {
        const rtn: Node[] = [];
        if (!this.root) {
            return null
        } else {
            let queue: Node[] = [this.root]
            let pointer: number = 0;

            while (pointer < queue.length - 1) {
                let node: Node = queue[pointer]
                let value: number = node.value
                if (callback(node)) {
                    rtn.push(node);
                    if (stopAtFirst) { return rtn; }
                }
                console.log(value) // prints BFT value
                if (node.left) {
                    queue.push(node.left)
                }
                if (node.right) {
                    queue.push(node.right)
                }
                pointer++
            }
            return null
        }
    }

    DFT() {
        let node: Node = this.root
        inOrderTraversal(node)

        function inOrderTraversal(node: Node) {
            if (node) {
                if (node.left) {
                    inOrderTraversal(node.left)
                }
                console.log(node.value)
                if (node.right) {
                    inOrderTraversal(node.right)
                }
            }
        }
    }
}

        
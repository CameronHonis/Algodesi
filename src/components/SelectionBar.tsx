import React, { useState } from 'react'

type MenuState = {
  isOpen: boolean,
  isNodeType: boolean,
  isListType: boolean
}

const initMenuState: MenuState = {
  isOpen: false,
  isNodeType: false,
  isListType: false,
}

const SelectionBar: React.FC = () => {
  const [menu, setMenu] = useState(initMenuState)

  const openDiv = (e: React.MouseEvent) => {
    e.stopPropagation()
    const target = e.target as HTMLDivElement
    console.log(target.id)
    setMenu({
      isOpen: true,
      isNodeType: target.id === 'nodeType' ? true : false,
      isListType: target.id === 'arrayType' ? true : false,
    })
  }

  const closeDiv = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenu(initMenuState)
  }

  if (!menu.isOpen) {
    return (
      <div id='selectionBar'>
        <div
          onClick={e => openDiv(e)}
          id='nodeType'
        >Graph Node</div>
        <div
          onClick={e => openDiv(e)}
          id='arrayType'
        >List item</div>
        <div><p>pencil</p></div>
        <div><p>eraser</p></div>
        <div><p>input</p></div>
      </div>
    )
  } else {
    return (
      <div className='itemMenu'>
        <div onClick={e => closeDiv(e)}>x</div>
        {menu.isNodeType ?
          <>
            <div><p>General Tree</p></div>
            <div><p>Binary Tree</p></div>
            <div><p>Binary Search Tree</p></div>
            <div><p>Trie</p></div>
            <div><p>AVL Tree</p></div>
            <div><p>Red-black tree</p></div>
            <div><p>Splay Tree</p></div>
            <div><p>Treap</p></div>
            <div><p>B-tree</p></div>
            <div><p>Acyclic Graph</p></div> 
            <div><p>Cyclic Graph</p></div> 
            <div><p>Weighted Graph</p></div> 
            <div><p>Unweighted Graph</p></div> 
            <div><p>Undirected Graph</p></div> 
            <div><p>Directed Graph</p></div>
            <div><p>Simple Linked List</p></div>
            <div><p>Doubly Linked List</p></div>
            <div><p>Circular Linked List</p></div>
          </>
          :
          menu.isListType ?
            <>
              <div><p>Array</p></div>
              <div><p>Set</p></div>
              <div><p>Stack</p></div>
              <div><p>Queue</p></div>
            </>
            : null
        }
      </div>
    )
  }
  // return (
  //   <div id='selectionBar'>
  //     {!openMenu ?
  //       <>
  //         <div onClick={e => openDiv(e)}>node</div>
  //         <div onClick={e => openDiv(e)}>list</div>
  //         <div>pensil</div>
  //         <div>eraser</div>
  //         <div>input</div>
  //       </>
  //       :
  //       <>
  //           <div onClick={e => closeDiv(e)}>x</div>
  //           <div>Binary Search Tree</div>
  //           <div>Trie</div>
  //       </>
  //       }
  //       </div> 
  //   )
}

export default SelectionBar
import React, { useState, useEffect, useRef } from 'react'
import { V2 } from '../models/V2'
import ItemSelection from './ItemSelection'

enum GroupSelect {
  NONE,
  LIST,
  NODE,
}

export interface MenuState {
  selected: GroupSelect;
}

export const initMenuState: MenuState = {
  selected: GroupSelect.NONE,
}

export interface MenuItem {
  itemName: string;
  pos: V2;
  svg?: JSX.Element;
  category: Set<GroupSelect>
}

const itemsByGroup: {[index: GroupSelect]: Set<MenuItem>} = {
  [GroupSelect.NONE]: new Set(
    {}
  )
}

const menuItems: MenuItem[] = [];

const nodeMenuItems: { itemName: string, className: string, pos: V2}[] = [
  {
    itemName: 'General Tree',
    className: 'itemSelection'
  },
  {
    itemName: 'Binary Tree',
    className: 'itemSelection'
  },
  {
    itemName: 'Binary Search Tree',
    className: 'itemSelection'
  },
  {
    itemName: 'Trie',
    className: 'itemSelection'
  },
  {
    itemName: 'AVL Tree',
    className: 'itemSelection'
  },
  {
    itemName: 'Red-black tree',
    className: 'itemSelection'
  },
  {
    itemName: 'Splay Tree',
    className: 'itemSelection'
  },
  {
    itemName: 'Treap',
    className: 'itemSelection'
  },
  {
    itemName: 'B-tree',
    className: 'itemSelection'
  },
  {
    itemName: 'Acyclic Graph',
    className: 'itemSelection'
  },
  {
    itemName: 'Cyclic Graph',
    className: 'itemSelection'
  },
  {
    itemName: 'Weighted Graph',
    className: 'itemSelection'
  },
  {
    itemName: 'Unweighted Graph',
    className: 'itemSelection'
  },
  {
    itemName: 'Undirected Graph',
    className: 'itemSelection'
  },
  {
    itemName: 'Directed Graph',
    className: 'itemSelection'
  },
  {
    itemName: 'Simple Linked List',
    className: 'itemSelection'
  },
  {
    itemName: 'Doubly Linked List',
    className: 'itemSelection'
  },
  {
    itemName: 'Circular Linked List',
    className: 'itemSelection'
  },
]

const arrayMenuItems: { itemName: string, className: string }[] = [
  {
    itemName: 'Array',
    className: 'itemSelection'
  },
  {
    itemName: 'Stack',
    className: 'itemSelection'
  },
  {
    itemName: 'Set',
    className: 'itemSelection'
  },
  {
    itemName: 'Queue',
    className: 'itemSelection'
  },
]

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

  // return (
  //   <div className='itemMenu'>
  //     {menu.isNodeType ?
  //       <>
  //         <div onClick={e => closeDiv(e)}>x</div>
  //         <div className='itemSelection'><p>General Tree</p></div>
  //         <div className='itemSelection'><p>Binary Search Tree</p></div>
  //         <div className='itemSelection'><p>Trie</p></div>
  //         <div className='itemSelection'><p>AVL Tree</p></div>
  //         <div className='itemSelection'><p>Splay Tree</p></div>
  //         <div className='itemSelection'><p>Treap</p></div>
  //         <div className='itemSelection'><p>B-tree</p></div>
  //         <div className='itemSelection'><p>Acyclic Graph</p></div>
  //         <div className='itemSelection'><p>Cyclic Graph</p></div>
  //         <div className='itemSelection'><p>Weighted Graph</p></div>
  //         <div className='itemSelection'><p>Unweighted Graph</p></div>
  //         <div className='itemSelection'><p>Undirected Graph</p></div>
  //         <div className='itemSelection'><p>Directed Graph</p></div>
  //         <div className='itemSelection'><p>Simple Linked List</p></div>
  //         <div className='itemSelection'><p>Doubly Linked List</p></div>
  //         <div className='itemSelection'><p>Circular Linked List</p></div>
  //       </>
  //       :
  //       menu.isListType ?
  //         <>
  //           <div onClick={e => closeDiv(e)}>x</div>
  //           <div className='itemSelection'><p>Array</p></div>
  //           <div className='itemSelection'><p>Set</p></div>
  //           <div className='itemSelection'><p>Stack</p></div>
  //           <div className='itemSelection'><p>Queue</p></div>
  //         </>
  //         :
  //         <>
  //           <div
  //             onClick={e => openDiv(e)}
  //             id='nodeType'
  //             className='mainSelection'
  //           >Graph Node</div>
  //           <div
  //             onClick={e => openDiv(e)}
  //             id='arrayType'
  //             className='mainSelection'
  //           >List item</div>
  //           <div className='mainSelection'><p>pencil</p></div>
  //           <div className='mainSelection'><p>eraser</p></div>
  //           <div className='mainSelection'><p>input</p></div>
  //         </>
  //     }
  //   </div>
  // )

  const items: JSX.Element[] = [];
  for (let )

  return (
    <div className='itemMenu'>
      <div onClick={e => closeDiv(e)}>x</div>
      {menu.isNodeType ?
        nodeMenuItems.map(item => {
          return <ItemSelection itemName={item.itemName} className={item.className}/>
        })
        :
        menu.isListType ?
        arrayMenuItems.map(item => {
          return <ItemSelection itemName={item.itemName} className={item.className}/>
        })
          :
          <>
            <div
              onClick={e => openDiv(e)}
              id='nodeType'
              className='mainSelection'
            >Graph Node</div>
            <div
              onClick={e => openDiv(e)}
              id='arrayType'
              className='mainSelection'
            >List item</div>
            <div className='mainSelection'><p>pencil</p></div>
            <div className='mainSelection'><p>eraser</p></div>
            <div className='mainSelection'><p>input</p></div>
          </>
      }
    </div>
  )

}

export default SelectionBar
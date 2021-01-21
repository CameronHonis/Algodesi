import React, { useState, useEffect, useRef } from 'react'
import { V2 } from '../models/V2'
import ItemSelection from './ItemSelection'

enum GroupSelect {
  NONE,
  LIST,
  NODE,
}

type GroupSelectKeys = keyof typeof GroupSelect
export interface MenuItem {
  itemName: string;
  pos: V2;
  svg?: JSX.Element | null;
  category: GroupSelect
}

const itemsByGroup: { [key in GroupSelectKeys]: MenuItem[] } = {
  NONE:
  [
    {
      itemName: 'Graph Node',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NONE,
    },
    {
      itemName: 'List item',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NONE
    },
    {
      itemName: 'Pencil',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NONE
    },
    {
      itemName: 'Eraser',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NONE
    },
    {
      itemName: 'Input',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NONE
    },
  ],
  LIST:
  [
    {
      itemName: 'Array',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.LIST
    },
    {
      itemName: 'Stack',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.LIST
    },
    {
      itemName: 'Set',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.LIST
    },
    {
      itemName: 'Queue',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.LIST
    },
  ],
  NODE:
  [
    {
      itemName: 'General Tree',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Binary Tree',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Binary Search Tree',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Trie',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'AVL Tree',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Red-black tree',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Splay Tree',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Treap',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'B-tree',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Acyclic Graph',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Cyclic Graph',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Weighted Graph',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Unweighted Graph',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Undirected Graph',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Directed Graph',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Simple Linked List',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Doubly Linked List',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
    {
      itemName: 'Circular Linked List',
      pos: new V2(50, 50),
      svg: null,
      category: GroupSelect.NODE
    },
  ]
}
export interface initBarRef {
  size: V2;
  targetSize: V2;
  selected: GroupSelect;
  rendered: MenuItem[];
  isTweeningBar: boolean;
}

export const initBarState: initBarRef = {
  size: new V2(50, 250),
  targetSize: new V2(50, 250),
  selected: GroupSelect.NONE,
  rendered: itemsByGroup.NONE,
  isTweeningBar: false,
}

enum BarRefsAction {
  SET_BAR_SIZE
}


const SelectionBar: React.FC = () => {
  const barSizeRef = React.useRef<HTMLDivElement>(null);

  const refs = React.useRef(initBarState);

  const setBarRefs = (action: BarRefsAction, arg: any): any => {
    if (action === BarRefsAction.SET_BAR_SIZE && arg && arg.size){
      refs.current.size = arg.size
      renderBarSize()
      initBarSizeTween()
    }
  }


  const renderBarSize = (): void => {
    const size: V2 = refs.current.size;
    if (barSizeRef.current) {
      const barSize: V2 = new V2(50, 50);
      barSizeRef.current.style.width = barSize.x + "px";
      barSizeRef.current.style.height = barSize.y + "px";
    }
  }

  const initBarSizeTween = (): void => {
    const barSizeTween = (): void => {
      refs.current.isTweeningBar = true
      const [newSize, sizeMet] = refs.current.size.tween(refs.current.targetSize, .15, .001 * refs.current.targetSize.x);
      setTimeout(() => {
        setBarRefs(BarRefsAction.SET_BAR_SIZE, { size: newSize});
        if (sizeMet) { refs.current.isTweeningBar = false; return; }
        barSizeTween();
      }, 10);
    }
    barSizeTween();
  }

  React.useEffect(() => {
    setBarRefs(BarRefsAction.SET_BAR_SIZE, {size: refs.current.size});
  }, [])

  // for (let i = 0; i < )
  
  return (
    <div className='itemMenu' ref={barSizeRef}>

    </div>
  )
  
}

export default SelectionBar
// return (
//   <div className='itemMenu'>
//     <div onClick={e => closeDiv(e)}>x</div>
//     {menu.isNodeType ?
//       nodeMenuItems.map(item => {
//         return <ItemSelection itemName={item.itemName} className={item.className}/>
//       })
//       :
//       menu.isListType ?
//       arrayMenuItems.map(item => {
//         return <ItemSelection itemName={item.itemName} className={item.className}/>
//       })
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
import React from 'react'
import { V2 } from '../models/V2'
import ItemSelection from './ItemSelection'

enum GroupSelect {
  NONE,
  LIST,
  NODE,
}

type GroupSelectKeys = keyof typeof GroupSelect
export interface MenuItem {
  itemName: string
  pos: V2
  svg?: JSX.Element | null
  category: GroupSelect
}

const itemsByGroup: { [key in GroupSelectKeys]: MenuItem[] } = {
  NONE:
    [
      {
        itemName: 'Graph',
        pos: new V2(50, 50),
        svg: null,
        category: GroupSelect.NONE,
      },
      {
        itemName: 'Array',
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
  selected: GroupSelectKeys;
  rendered: MenuItem[];
  isTweeningBar: boolean;
}

export const initBarState: initBarRef = {
  size: new V2(50, 250),
  targetSize: new V2(50, 250),
  selected: 'NONE',
  rendered: itemsByGroup['NONE'],
  isTweeningBar: false,
}

export enum BarRefsAction {
  SET_BAR_SIZE,
  SET_BAR_TARGET_SIZE
}


const SelectionBar: React.FC = () => {
  const barSizeRef = React.useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = React.useState(itemsByGroup.NONE)

  const refs = React.useRef(initBarState);

  const setBarRefs = (action: BarRefsAction, arg: any): any => {
    if (action === BarRefsAction.SET_BAR_SIZE && arg && arg.size) {
      refs.current.size = arg.size
      renderBarSize()
    } else if (action === BarRefsAction.SET_BAR_TARGET_SIZE && arg && arg.size) {
      refs.current.targetSize = arg.size
      initBarSizeTween()
    }
  }
  // set bar size, get collection
  const renderBarSize = (): void => {
    const size: V2 = refs.current.size;
    const collection = itemsByGroup[refs.current.selected];
    if (barSizeRef.current) {
      const barSize: V2 = new V2(size.x, size.y);
      barSizeRef.current.style.width = barSize.x + "px";
      barSizeRef.current.style.height = barSize.y + "px";
    }
    refs.current.rendered = collection
    setRendered(collection)
  }

  const initBarSizeTween = (): void => {
    const barSizeTween = (): void => {
      refs.current.isTweeningBar = true
      const [newSize, sizeMet] = refs.current.size.tween(refs.current.targetSize, .15, .001 * refs.current.targetSize.x);
      setTimeout(() => {
        setBarRefs(BarRefsAction.SET_BAR_SIZE, { size: newSize });
        if (sizeMet) { refs.current.isTweeningBar = false; return; }
        barSizeTween();
      }, 10);
    }
    if (!refs.current.isTweeningBar) {
      barSizeTween();
    }
  }

  React.useEffect(() => {
    setBarRefs(BarRefsAction.SET_BAR_SIZE, { size: refs.current.size });
  }, [])

  const clickHandler = (e: any) => {
        refs.current.selected = 'NONE'
        const collection = itemsByGroup[refs.current.selected];
        const newX = 50
        const newY = collection.length * 50
        setBarRefs(BarRefsAction.SET_BAR_TARGET_SIZE, { size: new V2(newX, newY) });
    }

  return (
    <div className='itemMenu' ref={barSizeRef}>
      {
        refs.current.selected !== "NONE" ?
          <div id='selectNone' onClick={e => {clickHandler(e)}}>
            <p>X - close this b</p>
          </div>
          : null
      }
      {
        rendered.map(item => {
          return <ItemSelection key={item.itemName} itemName={item.itemName} setBarRefs={setBarRefs} itemsByGroup={itemsByGroup} refs={refs} />
        })
      }
    </div>
  )

}

export default SelectionBar

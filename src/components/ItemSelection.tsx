import React from 'react'
import { V2 } from '../models/V2'
import {BarRefsAction} from './SelectionBar'

type ItemSelectionProps = {
  itemName: string,
  setBarRefs: any,
  itemsByGroup: any,
  refs: any
}

const ItemSelection: React.FC<ItemSelectionProps> = (props) => {
  const { itemName, setBarRefs, itemsByGroup, refs } = props

  const itemSelectRef = React.useRef<HTMLDivElement>(null);

  const clickHandler = (e: any) => {
    if (itemSelectRef && itemSelectRef.current) {
        e.stopPropagation()
        if (e.target.parentElement.id === 'Graph') {
          refs.current.selected = 'NODE'
        } else if (e.target.parentElement.id === 'Array') {
          refs.current.selected = 'LIST'
        }
        const collection = itemsByGroup[refs.current.selected];
        const newX = 200
        const newY = (collection.length * 50) + 25
        setBarRefs(BarRefsAction.SET_BAR_TARGET_SIZE, { size: new V2(newX, newY) });
    }
  }

  return (
    <div className='itemSelection' id={itemName} ref={itemSelectRef} onClick={e => {clickHandler(e)}}>
      <p>{itemName}</p>
    </div>
  )
}

export default ItemSelection